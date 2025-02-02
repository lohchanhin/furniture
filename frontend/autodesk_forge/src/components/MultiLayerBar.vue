<template>
    <div class="multi-layer-bar">
      <!-- 左欄：大分類 -->
      <div 
        class="col-left"
        :class="{ expanded: colLeftHover || selectedCategory }"
        @mouseenter="onLeftEnter"
        @mouseleave="onLeftLeave"
      >
        <template v-if="colLeftHover || selectedCategory">
          <v-subheader class="d-flex align-center justify-space-between">
            <span>大分類</span>
            <!-- 收回按鈕 -->
            <v-btn icon @click.stop="resetAll" :title="'收回'">
              <v-icon>mdi-arrow-collapse-left</v-icon>
            </v-btn>
          </v-subheader>
          <v-list dense>
            <v-list-item
              v-for="(cat, index) in categories"
              :key="index"
              @click="selectCategory(cat)"
            >
              <v-list-item-title>{{ cat.categoryName }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </template>
        <template v-else>
          <!-- 收合時只顯示 Logo -->
          <div class="logo-container">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2938/2938028.png"
              alt="Logo"
              class="logo-img"
            />
          </div>
        </template>
      </div>
  
      <!-- 中欄：子項列表 (僅當已選擇大分類) -->
      <div 
        class="col-middle"
        v-if="selectedCategory"
        :class="{ expanded: colMiddleHover || selectedCategory || selectedItem }"
        @mouseenter="onMiddleEnter"
        @mouseleave="onMiddleLeave"
      >
        <v-subheader class="d-flex align-center justify-space-between">
          <span>{{ selectedCategory.categoryName }} 子項</span>
          <!-- 返回大分類 -->
          <v-btn icon @click.stop="resetCategory" :title="'返回大分類'">
            <v-icon>mdi-arrow-collapse-left</v-icon>
          </v-btn>
        </v-subheader>
        <v-list dense>
          <v-list-item
            v-for="(item, index) in selectedCategory.items"
            :key="item.id"
            @click="selectItem(item)"
          >
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue'
  
  const props = defineProps({
    categories: {
      type: Array,
      default: () => []
    },
    selectedCategory: {
      type: Object,
      default: null
    },
    selectedItem: {
      type: Object,
      default: null
    }
  })
  
  const emit = defineEmits(['update:selectedCategory', 'update:selectedItem', 'resetAll', 'resetCategory'])
  
  const colLeftHover = ref(false)
  const colMiddleHover = ref(false)
  
  function onLeftEnter() {
    colLeftHover.value = true
  }
  function onLeftLeave() {
    if (!props.selectedCategory) {
      colLeftHover.value = false
    }
  }
  function onMiddleEnter() {
    colMiddleHover.value = true
  }
  function onMiddleLeave() {
    if (!props.selectedItem) {
      colMiddleHover.value = false
    }
  }
  
  function selectCategory(cat) {
    emit('update:selectedCategory', cat)
    emit('update:selectedItem', null)
  }
  
  function selectItem(item) {
    emit('update:selectedItem', item)
  }
  
  function resetAll() {
    emit('resetAll')
    colLeftHover.value = false
    colMiddleHover.value = false
  }
  
  function resetCategory() {
    emit('resetCategory')
    colMiddleHover.value = false
  }
  </script>
  
  <style scoped>
  .multi-layer-bar {
    display: flex;
    flex-direction: row;
    /* 預設佔 10% 寬度 */
    width: 10%;
    min-width: 40px;
  }
  
  /* 左欄 */
  .col-left {
    background-color: #f8f9fa;
    border-right: 1px solid #ddd;
    transition: width 0.3s ease, position 0.3s ease;
    width: 100%;
    /* 當未展開時，父層 MultiLayerBar 已限定寬度 */
  }
  
  /* 當展開時，固定定位並擴大寬度 (15% 視需求調整) */
  .col-left.expanded {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 15%;
    z-index: 1000;
  }
  
  /* Logo 區 */
  .logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  .logo-img {
    width: 32px;
    height: 32px;
  }
  
  /* 中欄：子項列表，當展開時，採一般流動定位 */
  .col-middle {
    background-color: #fcfcfc;
    border-right: 1px solid #ddd;
    overflow-y: auto;
    transition: width 0.3s ease;
    width: 0;
  }
  .col-middle.expanded {
    width: 15%;
  }
  </style>
  