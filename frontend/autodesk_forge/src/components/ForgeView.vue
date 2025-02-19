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
        <v-btn text class="ml-2" @click="onCloseDetail"> 收合細節 </v-btn>
        <!-- 工具列：提供載入場景按鈕 -->
        <!-- <div class="toolbar"> -->
        <v-btn color="secondary" @click="onLoadEnvironment"> 載入場景 </v-btn>
        <!-- </div> -->
      </div>
    </div>
    <!-- Forge Viewer 區域 -->
    <div class="viewer-container">
      <!-- 傳入 documentId，同時用 ref 引用 ViewerComponent -->
      <ViewerComponent ref="viewerRef" :documentId="documentId" />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from "vue";
import ViewerComponent from "@/components/ViewerComponent.vue";
import * as THREE from "three";

const props = defineProps({
  selectedItem: {
    type: Object,
    default: null,
  },
  // 主要環境模型的 URN
  documentId: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(["placeItem", "closeDetail", "loadEnvironment"]);

// 取得 ViewerComponent 的引用，以便調用其方法
const viewerRef = ref(null);

function onPlaceItem(item) {
  if (viewerRef.value && item.urn) {
    // 設定物件的初始放置位置，例如平移 (x:10, y:0, z:10)
    const placementTransform = new THREE.Matrix4().makeTranslation(10, 0, 10);
    viewerRef.value.addModel(item.urn, placementTransform);
  }
  emit("placeItem", item);
}

function onCloseDetail() {
  emit("closeDetail");
}

function onLoadEnvironment() {
  if (viewerRef.value) {
    viewerRef.value.reloadEnvironment();
    emit("loadEnvironment");
  }
}
</script>

<style scoped>
.forge-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.toolbar {
  padding: 8px;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
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
</style>
