<template>
    <v-container fluid>
      <h1>Dashboard (HomeView)</h1>
      <v-row>
        <!-- Card 1：上傳統計/最新上傳檔案數 -->
        <v-col cols="6" md="3">
          <v-card class="ma-2">
            <v-card-title class="text-h6">最新上傳檔案數</v-card-title>
            <v-card-text>
              <div class="text-subtitle-1">
                {{ latestUploadCount }} 件
              </div>
            </v-card-text>
          </v-card>
        </v-col>
  
        <!-- Card 2：場景數量/場景列表連結 -->
        <v-col cols="6" md="3">
          <v-card class="ma-2">
            <v-card-title class="text-h6">場景總數</v-card-title>
            <v-card-text>
              <div class="text-subtitle-1">
                {{ totalScenes }} 個
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="primary" :to="{ name: 'SceneEdit' }">
                前往場景編輯
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
  
        <!-- Card 3：模型庫連結 / 新頁面入口 -->
        <v-col cols="6" md="3">
          <v-card class="ma-2">
            <v-card-title class="text-h6">查看已上傳模型</v-card-title>
            <v-card-text>
              <div>前往查看轉換完成之模型</div>
            </v-card-text>
            <v-card-actions>
              <!-- 假設我們稍後會新增「UploadedModelsView」頁面 -->
              <v-btn text color="primary" :to="{ name: 'UploadedModels' }">
                查看模型
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
  
        <!-- 你可再依需求加更多 Card，如系統訊息、公佈欄等 -->
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  // 此階段先用假資料
  const latestUploadCount = ref(3)
  const totalScenes = ref(2)
  </script>
  