<template>
    <div class="scene-edit-page">
      <!-- 左側：大分類區 -->
      <div 
        class="left-panel" 
        :class="{ expanded: leftExpanded }"
        @mouseenter="expandLeft"
        @mouseleave="expandLeft"
      >
        <CategoryList 
          :categories="categories" 
          :selectedCategory="selectedCategory"
          v-model:selectedCategory="selectedCategory"
        />
        <!-- 收縮按鈕 (僅在展開狀態下顯示) -->
        <v-btn 
          v-if="leftExpanded" 
          icon 
          class="collapse-btn" 
          @click="collapseLeft" 
          title="收合大分類">
          <v-icon>mdi-arrow-collapse-left</v-icon>
        </v-btn>
      </div>
  
      <!-- 中側：子項區 (僅在選取大分類時出現) -->
      <div 
        class="middle-panel" 
        v-if="selectedCategory" 
        :class="{ expanded: middleExpanded }"
        @mouseenter="expandMiddle"
        @mouseleave="expandMiddle"
      >
        <SubCategoryList 
          :category="selectedCategory" 
          :selectedItem="selectedItem"
          v-model:selectedItem="selectedItem"
        />
        <!-- 收縮按鈕 (僅在展開狀態下顯示) -->
        <v-btn 
          v-if="middleExpanded" 
          icon 
          class="collapse-btn" 
          @click="collapseMiddle" 
          title="收合子項">
          <v-icon>mdi-arrow-collapse-left</v-icon>
        </v-btn>
      </div>
  
      <!-- 右側：Forge Viewer 與細節面板 -->
      <div class="right-panel">
        <ForgeView 
          :selectedItem="selectedItem"
          @placeItem="placeItem"
          @closeDetail="selectedItem = null"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import CategoryList from '@/components/CategoryList.vue'
  import SubCategoryList from '@/components/SubCategoryList.vue'
  import ForgeView from '@/components/ForgeView.vue'
  import { getModels } from '@/services/api.js'
  
  const categories = ref([])  
  const selectedCategory = ref(null)
  const selectedItem = ref(null)
  
  // 控制左側與中側的展開狀態
  const leftExpanded = ref(false)
  const middleExpanded = ref(false)
  
  async function fetchDataFromServer() {
    try {
      const result = await getModels() // 後端 API：GET /forge/models
      const list = result.data
      categories.value = groupByCategory(list)
    } catch (err) {
      console.error('取得資料失敗:', err)
    }
  }
  
  /** 將後端資料依 category 分組，形成：
   * [ { categoryName: 'Chair', items: [ { id, name, description }, ... ] }, ... ]
   */
  function groupByCategory(records) {
    const map = {}
    for (let r of records) {
      const catKey = r.category || '未分類'
      if (!map[catKey]) {
        map[catKey] = []
      }
      map[catKey].push(r)
    }
    const grouped = []
    for (let catName of Object.keys(map)) {
      const items = map[catName].map(m => ({
        id: m._id,
        name: m.displayName,
        description: m.description || '無描述'
      }))
      grouped.push({
        categoryName: catName,
        items
      })
    }
    return grouped
  }
  
  /** 滑鼠移入左側時自動展開 */
  function expandLeft() {
    leftExpanded.value = !leftExpanded.value 
  }
  
  /** 點選左側收縮按鈕 */
  function collapseLeft() {
    leftExpanded.value = false
  }
  
  /** 滑鼠移入中側時自動展開 */
  function expandMiddle() {
    middleExpanded.value = !middleExpanded.value
  }
  
  /** 點選中側收縮按鈕 */
  function collapseMiddle() {
    middleExpanded.value = false
  }
  
  /** 放置子項到場景 (依需求處理) */
  function placeItem(item) {
    console.log('【放置到場景】選擇家具:', item)
  }
  
  onMounted(() => {
    fetchDataFromServer()
  })
  </script>
  
  <style scoped>
  .scene-edit-page {
    display: flex;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    position: relative;
  }
  
  /* 左側區塊：預設收縮時 40px 寬，展開後 15% */
  .left-panel {
    position: relative;
    width: 20px;
    transition: width 0.3s ease;
    overflow: hidden;
    border-right: 1px solid #ddd;
  }
  .left-panel.expanded {
    width: 15%;
  }
  
  /* 中側區塊：僅當有大分類選取時出現，
     收縮狀態下寬度 0，展開後 15% */
  .middle-panel {
    position: relative;
    width: 20px;
    transition: width 0.3s ease;
    overflow: hidden;
    border-right: 1px solid #ddd;
  }
  .middle-panel.expanded {
    width: 15%;
  }
  
  /* 右側區塊：佔用剩餘空間 */
  .right-panel {
    flex: 1;
    overflow: hidden;
  }
  
  /* 收縮按鈕，置於區塊右上角 */
  .collapse-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 10;
  }
  </style>
  