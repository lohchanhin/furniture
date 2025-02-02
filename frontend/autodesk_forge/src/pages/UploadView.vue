<template>
    <v-container>
      <h1>上傳模型 (UploadView)</h1>
  
      <!-- 假設裡面有上傳功能的子元件 -->
      <UploadFile @start-upload="onStartUpload" />
    </v-container>
  </template>
  
  <script setup>
  import UploadFile from '@/components/upload/UploadFile.vue'
  // 新的前端API
  import { uploadFile, startConvert } from '@/services/api.js'
  
  async function onStartUpload(file) {
    console.log('準備上傳檔案:', file)
    if (!file) return
  
    try {
      // 1. 呼叫 uploadFile() => 後端 /forge/upload
      const result = await uploadFile(file)
  
      console.log('上傳結果:', result)
      // result.record => DB 紀錄 { status:'local' | 'needConvert' ... }
  
      // 2. 若後端回傳 record.status='needConvert' => 是否要立即開始轉換?
      if (result.record && result.record.status === 'needConvert') {
        // 可以選擇立即開始轉換，也可讓使用者自行操作
        const recordId = result.record._id
        const convertRes = await startConvert(recordId) 
        console.log('開始轉換 =>', convertRes)
      }
  
      // 3. 最後可跳轉到 "查看模型" 頁面 or 顯示成功訊息
      // this.$router.push('/uploaded-models') 
      // (視你的路由而定)
  
    } catch (err) {
      console.error('上傳失敗:', err)
      alert('上傳失敗: ' + err.message)
    }
  }
  </script>
  