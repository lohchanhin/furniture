<template>
    <v-card>
      <v-card-title>上傳檔案 (UploadFile)</v-card-title>
      <v-card-text>
        <v-file-input
          v-model="file"
          label="選擇檔案"
          accept=".obj,.dwg,.rvt"
        />
        <v-btn class="mt-4" color="primary" @click="handleUpload">上傳</v-btn>
      </v-card-text>
    </v-card>
  </template>
  
  <script setup>
  import { ref, defineEmits } from 'vue'
  const emit = defineEmits(['start-upload'])
  
  // 用來綁定檔案
  const file = ref(null)
  
  function handleUpload() {
    // 此階段先不做後端呼叫
    // 先 emit 出去，父層可 console.log 觀察
    emit('start-upload', file.value)
  }
  </script>
  
  <style scoped>
  </style>
  