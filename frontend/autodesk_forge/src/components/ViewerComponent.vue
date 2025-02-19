<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineProps } from 'vue'
import axios from 'axios'
import * as THREE from 'three'

const props = defineProps({
  documentId: {
    type: String,
    required: true
  }
})

const viewerContainer = ref(null)
let viewer = null

async function getForgeToken() {
  try {
    const response = await axios.get('http://localhost:3001/api/forge/token')
    const tokenData = response.data
    console.log("token:", tokenData.access_token)
    return { token: tokenData.access_token, expiry: tokenData.expiry || 3600 }
  } catch (error) {
    console.error('Error fetching Forge token:', error)
    throw error
  }
}

/** 載入環境文件 (主要場景) */
function loadDocument(urn) {
  Autodesk.Viewing.Document.load(urn, onDocumentLoadSuccess, onDocumentLoadFailure)
}

function reloadEnvironment() {
  if (props.documentId && viewer) {
    // 先將目前場景中的所有模型移除
    const models = viewer.getVisibleModels();
    models.forEach((model) => {
      viewer.impl.unloadModel(model);
    });
    // 清除後再載入新的環境文件
    loadDocument(props.documentId);
  }
}


function onDocumentLoadSuccess(viewerDocument) {
  console.log('Document loaded successfully:', viewerDocument)
  const root = viewerDocument.getRoot()
  if (!root) {
    console.error('Manifest does not contain a valid root. Model may not have been translated successfully.')
    return
  }
  const defaultModel = root.getDefaultGeometry()
  if (defaultModel) {
    viewer.loadDocumentNode(viewerDocument, defaultModel)
      .then(() => {
        console.log('Environment model loaded successfully.')
      })
      .catch((err) => {
        console.error('Error loading model:', err)
      })
  } else {
    console.error('Default geometry not found in the document.')
  }
}

function onDocumentLoadFailure(errorCode, errorMsg) {
  console.error('Failed to load document:', errorMsg)
}

/** 加載額外物件（例如家具）到同一場景 */
function addModel(urn, placementTransform = null) {
  const options = {}
  if (placementTransform) {
    options.placementTransform = placementTransform
  }
  viewer.loadModel(urn, options)
    .then(model => {
      console.log('Additional model loaded:', model)
    })
    .catch(err => {
      console.error('Error loading additional model:', err)
    })
}

onMounted(async () => {
  try {
    const { token, expiry } = await getForgeToken()
    const options = {
      env: "AutodeskProduction",
      api: "derivativeV2",
      getAccessToken: (onTokenReady) => {
        onTokenReady(token, expiry)
      },
    }

    Autodesk.Viewing.Initializer(options, () => {
      viewer = new Autodesk.Viewing.GuiViewer3D(viewerContainer.value)
      const startedCode = viewer.start()
      if (startedCode > 0) {
        console.error('Failed to create a Viewer: WebGL not supported.')
        return
      }
      console.log('Forge Viewer 已初始化。')
      // 初始載入環境模型（從 props 傳入）
      if (props.documentId) {
        loadDocument(props.documentId)
      }
    })
  } catch (error) {
    console.error('Viewer initialization error:', error)
  }
})

// 當 documentId 改變時重新載入環境
watch(() => props.documentId, (newUrn, oldUrn) => {
  if (newUrn !== oldUrn && viewer) {
    console.log(`Loading new environment model: ${newUrn}`)
    loadDocument(newUrn)
  }
})

onBeforeUnmount(() => {
  if (viewer) {
    viewer.finish()
    viewer = null
  }
})

// 將 addModel 與 reloadEnvironment 方法公開給父層調用
defineExpose({
  addModel,
  reloadEnvironment
})
</script>

<style scoped>
.viewer-container {
  width: 100%;
  height: 100%;
}
</style>
