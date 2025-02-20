<template>
  <div ref="viewerDiv" class="viewer-container"></div>
</template>

<script setup>
import { onMounted, watch, defineProps, defineEmits, defineExpose, ref } from 'vue'
import axios from 'axios'
import * as THREE from 'three'

/** ======================
 *  基礎設定 & 初始化 Viewer
 * ====================== */

const props = defineProps({
  documentId: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['error'])

const viewerDiv = ref(null)
let viewer = null
let mainModel = null
const placedModels = []

function formatUrn(rawUrn) {
  if (!rawUrn) return ''
  const trimmed = rawUrn.trim()
  return trimmed.toLowerCase().startsWith('urn:') ? trimmed : 'urn:' + trimmed
}

onMounted(() => {
  if (!window.Autodesk?.Viewing) {
    const msg = 'Forge Viewer library not loaded.'
    console.error(msg)
    emit('error', msg)
    return
  }

  const options = {
    env: 'AutodeskProduction',
    getAccessToken: async (onTokenReady) => {
      try {
        const response = await axios.get('http://localhost:3001/api/forge/token')
        const { access_token, expires_in } = response.data
        onTokenReady(access_token, expires_in || 3600)
      } catch (error) {
        console.error('Error retrieving token:', error)
        emit('error', 'Failed to retrieve Forge token')
      }
    }
  }

  Autodesk.Viewing.Initializer(options, () => {
    viewer = new Autodesk.Viewing.GuiViewer3D(viewerDiv.value)
    viewer.start()

    // 若 props.documentId 有值，載入環境模型
    if (props.documentId) {
      reloadEnvironment(props.documentId).catch(err => emit('error', err.message))
    }
  })
})

watch(
  () => props.documentId,
  async (newVal, oldVal) => {
    if (newVal && newVal !== oldVal && viewer) {
      try {
        await reloadEnvironment(newVal)
      } catch (err) {
        emit('error', err.message)
      }
    }
  }
)

/** =========================
 *  載入 / 卸載 / 放置模型
 * ========================= */

/** (1) 重新載入主要環境模型（單一場景） */
async function reloadEnvironment(envUrn) {
  if (!viewer) {
    throw new Error('Viewer not initialized.')
  }
  const finalUrn = formatUrn(envUrn)
  if (!finalUrn) {
    throw new Error('Invalid URN for environment.')
  }
  // 卸載所有模型
  const allModels = viewer.getAllModels()
  allModels.forEach(m => viewer.impl.unloadModel(m))
  mainModel = null
  placedModels.length = 0

  // 載入 Document
  const doc = await loadDocument(finalUrn)
  const rootItem = doc.getRoot().getDefaultGeometry()
  if (!rootItem) {
    throw new Error('No geometry found in environment doc.')
  }
  // 載入環境
  mainModel = await viewer.loadDocumentNode(doc, rootItem, {
    keepCurrentModels: false,
    applyRefPoint: true,
    globalOffset: { x: 0, y: 0, z: 0 }
  })
  return mainModel
}

/** (2) 放置(加入)新模型：加法模式，不清除已載入的其他模型 */
async function addModel(objectUrn, placementTransform = null) {
  if (!viewer) {
    throw new Error('Viewer not initialized.')
  }
  if (!mainModel) {
    throw new Error('Main environment not loaded yet.')
  }
  const finalUrn = formatUrn(objectUrn)
  if (!finalUrn) {
    throw new Error('Invalid URN for object.')
  }

  // 載入 Document
  const doc = await loadDocument(finalUrn)
  const rootItem = doc.getRoot().getDefaultGeometry()
  if (!rootItem) {
    throw new Error('No geometry found in object doc.')
  }
  const objectModel = await viewer.loadDocumentNode(doc, rootItem, {
    keepCurrentModels: true,
    applyRefPoint: true,
    globalOffset: { x: 0, y: 0, z: 0 },
    placementTransform
  })
  placedModels.push(objectModel)
  return objectModel
}

/** (3) 刪除已放置的模型：從場景中卸載 */
function removeModel(modelRef) {
  if (!viewer) {
    throw new Error('Viewer not initialized.')
  }
  // 在 placedModels 中找到對應模型並移除
  const idx = placedModels.indexOf(modelRef)
  if (idx >= 0) {
    placedModels.splice(idx, 1)
  }
  // 卸載
  viewer.impl.unloadModel(modelRef)
}

/** =========================
 *   模型互動：移動 / 旋轉 / 縮放
 * ========================= */

/**
 * transformModel：對整個模型進行移動/旋轉/縮放
 * @param modelRef   從 addModel(...) 或 reloadEnvironment(...) 得到的 model 實例
 * @param transform  { position?:THREE.Vector3, rotation?:THREE.Euler, scale?:THREE.Vector3 }
 */
function transformModel(modelRef, transform = {}) {
  if (!viewer) {
    throw new Error('Viewer not initialized.')
  }
  if (!modelRef) {
    throw new Error('Invalid model reference.')
  }

  // 取得當前的 placementTransform
  const currentMatrix = new THREE.Matrix4()
  modelRef.getPlacementTransform(currentMatrix)

  // 分解出平移、旋轉、縮放
  const pos = new THREE.Vector3()
  const rot = new THREE.Quaternion()
  const scale = new THREE.Vector3()
  currentMatrix.decompose(pos, rot, scale)

  // 更新平移
  if (transform.position) {
    pos.copy(transform.position)
  }
  // 更新旋轉 (Euler -> Quaternion)
  if (transform.rotation) {
    const euler = transform.rotation
    const newQ = new THREE.Quaternion().setFromEuler(euler, false)
    rot.copy(newQ)
  }
  // 更新縮放
  if (transform.scale) {
    scale.copy(transform.scale)
  }

  // 重新組合 Matrix4
  const newMatrix = new THREE.Matrix4()
  newMatrix.compose(pos, rot, scale)

  // 套用新的 transform
  modelRef.setPlacementTransform(newMatrix)
  viewer.impl.invalidate(true, true, true)
}

/** =========================
 *   模型互動：更改材質 / 顏色
 * ========================= */

/**
 * changeModelColor：使用「themingColor」方式為整個模型覆蓋顏色
 * @param modelRef   已載入的模型
 * @param color      THREE.Color 或 RGB array，如 new THREE.Color(0xff0000)
 * @param opacity    透明度(0~1)
 */
function changeModelColor(modelRef, color, opacity = 1.0) {
  if (!viewer) {
    throw new Error('Viewer not initialized.')
  }
  if (!modelRef) {
    throw new Error('Invalid model reference.')
  }
  // ThemingColor 僅在 Viewer Session 中覆蓋顯示，不會真正修改材質
  // 先清除其他 themer color
  viewer.clearThemingColors(modelRef)
  // 設定新的 themer color
  const c = color instanceof THREE.Color ? color : new THREE.Color(color)
  const v4color = new THREE.Vector4(c.r, c.g, c.b, opacity)
  // 要將該模型下的所有 dbId 都套用 themer color
  const instanceTree = modelRef.getData().instanceTree
  if (!instanceTree) return

  const rootId = instanceTree.getRootId()
  const dbIds = []
  instanceTree.enumNodeChildren(rootId, (childId) => {
    dbIds.push(childId)
  }, true) // 遞迴列舉

  dbIds.forEach(id => {
    viewer.setThemingColor(id, v4color, modelRef, /*recursive=*/true)
  })
  viewer.impl.invalidate(true, true, true)
}

/**
 * setModelMaterial：以「替換材質」方式改變整個模型材質 (進階)
 *  - 需先 unconsolidate() 才能對 fragment 設定
 *  - 對大模型或大量 fragment，可能影響效能
 * @param modelRef   已載入的模型
 * @param materialOptions  {color, metalness, roughness, map, ...} 依 THREE.js Material 屬性
 */
function setModelMaterial(modelRef, materialOptions = {}) {
  if (!viewer) {
    throw new Error('Viewer not initialized.')
  }
  if (!modelRef) {
    throw new Error('Invalid model reference.')
  }
  const modelData = modelRef.getData()
  if (!modelData) return

  // 1) 取消合併 (consolidation)
  modelRef.unconsolidate && modelRef.unconsolidate()

  // 2) 建立新的 THREE.js 材質
  // 這裡示範 MeshPhongMaterial，可依需求換成其他材質
  const newMat = new THREE.MeshPhongMaterial({
    color: materialOptions.color || 0xffffff,
    transparent: !!materialOptions.transparent,
    opacity: (materialOptions.opacity !== undefined) ? materialOptions.opacity : 1,
    shininess: 60,
    // 可視需求增加貼圖 (map), metalness, roughness 等
  })

  // 3) 對模型的 fragment 逐一應用新的材質
  const frags = modelRef.getFragmentList()
  const fragCount = frags.getCount()
  for (let fragId = 0; fragId < fragCount; fragId++) {
    frags.setMaterial(fragId, newMat)
  }
  viewer.impl.invalidate(true, true, true)
}

/** 
 * 封裝 Document.load 成 Promise 
 */
function loadDocument(urn) {
  return new Promise((resolve, reject) => {
    Autodesk.Viewing.Document.load(
      urn,
      doc => resolve(doc),
      (errCode, errMsg) => {
        reject(new Error(`Document load failed: [${errCode}] ${errMsg}`))
      }
    )
  })
}

/** 
 * 對外暴露所有方法 
 */
defineExpose({
  // 既有的
  addModel,
  reloadEnvironment,
  // 新增的互動方法
  removeModel,
  transformModel,
  changeModelColor,
  setModelMaterial
})
</script>

<style scoped>
.viewer-container {
  width: 100%;
  height: 100%;
}
</style>
