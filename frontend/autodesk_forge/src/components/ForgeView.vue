<template>
  <div class="forge-view">
    <!-- 細節面板：當選取子項時顯示 -->
    <div v-if="selectedItem" class="detail-panel">
      <v-subheader>細節 / 放置場景</v-subheader>
      <div class="mb-3">
        <h3>{{ selectedItem.name }}</h3>
        <p>{{ selectedItem.description }}</p>
        <v-btn color="primary" @click="onPlaceItem(selectedItem)">
          放置物件
        </v-btn>
        <v-btn text class="ml-2" @click="onCloseDetail">
          收合細節
        </v-btn>
        <v-btn color="secondary" class="mt-2" @click="onLoadEnvironment(selectedItem)">
          載入場景
        </v-btn>
      </div>
    </div>

    <!-- Forge Viewer 區域 -->
    <div class="viewer-container">
      <!-- 
        傳入 documentId（環境模型 URN），以及取得 ViewerComponent 參考 
        以便呼叫 addModel / reloadEnvironment 等方法 
      -->
      <ViewerComponent 
        ref="viewerRef" 
        :documentId="documentId" 
        @error="onViewerError" 
      />
    </div>

    <!-- 顯示 Viewer 回傳的錯誤訊息（若有） -->
    <div v-if="viewerError" class="error-panel">
      <p>Viewer Error: {{ viewerError }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from "vue";
import ViewerComponent from "@/components/ViewerComponent.vue";
import * as THREE from "three";

// 父層給的 props
const props = defineProps({
  selectedItem: {
    type: Object,
    default: null,
  },
  // 主要環境模型的 URN (如 "urn:xxx...")
  documentId: {
    type: String,
    required: true,
  },
});

// 對外發出事件
const emit = defineEmits(["placeItem", "closeDetail", "loadEnvironment"]);

// 取得 ViewerComponent 的引用，以便調用其方法
const viewerRef = ref(null);

// 用來顯示在本組件的錯誤訊息
const viewerError = ref("");

// 「放置物件」：在現有場景中加入多個模型（不清除）
function onPlaceItem(item) {
  if (viewerRef.value && item?.urn) {
    // 示範簡單的初始平移 (x:10, y:0, z:10)
    const transform = new THREE.Matrix4().makeTranslation(10, 0, 10);
    viewerRef.value.addModel(item.urn, transform)
      .catch(err => {
        console.error("addModel error:", err);
        viewerError.value = err?.message || "Failed to add object.";
      });
  }
  emit("placeItem", item);
}

// 收合細節面板
function onCloseDetail() {
  emit("closeDetail");
}

// 「載入場景」：清除目前場景並載入新的環境
function onLoadEnvironment(item) {
  console.log(item);
  if (viewerRef.value && item?.urn) {
    viewerRef.value.reloadEnvironment(item.urn)
      .catch(err => {
        console.error("reloadEnvironment error:", err);
        viewerError.value = err?.message || "Failed to load environment.";
      });
    emit("loadEnvironment", item);
  }
}

// 接收 ViewerComponent 發出的錯誤訊息
function onViewerError(msg) {
  viewerError.value = msg;
}
</script>

<style scoped>
.forge-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.detail-panel {
  padding: 8px;
  border-bottom: 1px solid #ccc;
}
.viewer-container {
  flex: 1;
  overflow: hidden;
  display: flex;
}
.viewer-container > * {
  flex: 1;
}
.error-panel {
  background: #ffcccc;
  color: #900;
  padding: 8px;
  margin-top: 4px;
  border: 1px solid #f00;
}
</style>
