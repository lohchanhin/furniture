<template>
    <div class="forge-view">
      <!-- 細節面板：當選取子項時顯示 -->
      <div v-if="selectedItem" class="detail-panel">
        <v-subheader>細節 / 放置場景</v-subheader>
        <div class="mb-3">
          <h3>{{ selectedItem.name }}</h3>
          <p>{{ selectedItem.description }}</p>
          <v-btn color="primary" @click="onPlaceItem(selectedItem)">
            放置到場景
          </v-btn>
          <v-btn text class="ml-2" @click="onCloseDetail">
            收合細節
          </v-btn>
        </div>
      </div>
      <!-- Forge Viewer 區域 -->
      <div class="viewer-container">
        <ViewerComponent />
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  import ViewerComponent from '@/components/ViewerComponent.vue'
  
  const props = defineProps({
    selectedItem: {
      type: Object,
      default: null
    }
  })
  const emit = defineEmits(['placeItem', 'closeDetail'])
  
  function onPlaceItem(item) {
    emit('placeItem', item)
  }
  function onCloseDetail() {
    emit('closeDetail')
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
  </style>
  