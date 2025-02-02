<template>
    <v-container>
      <h1>已上傳模型 (UploadedModelsView)</h1>
      <v-btn color="primary" @click="fetchModels">重新整理</v-btn>
  
      <!-- 上傳檔案區塊 -->
      <v-card class="my-4 pa-4">
        <h2>上傳新模型</h2>
        <v-form ref="uploadForm" @submit.prevent="onUpload">
          <v-text-field
            label="顯示名稱"
            v-model="uploadDisplayName"
            placeholder="請輸入模型名稱 (可選)"
          ></v-text-field>
          <v-file-input
            label="選擇檔案"
            v-model="uploadFileObj"
            accept=".obj, .dwg, .dxf, .step, .stl, .iges, .3ds, .3dm, .skp, ..."
            required
          ></v-file-input>
          <v-btn type="submit" color="primary">上傳</v-btn>
        </v-form>
      </v-card>
  
      <!-- 模型列表 -->
      <v-row>
        <v-col v-for="(m, index) in models" :key="m._id" cols="12" md="4">
          <v-card class="ma-2">
            <!-- 顯示名稱 -->
            <v-card-title>{{ m.displayName }}</v-card-title>
  
            <v-card-text>
              <!-- 狀態, e.g. needConvert / inprogress / downloaded / failed -->
              <div>狀態: {{ m.status }}</div>
              <!-- 若有 forgeUrn，可顯示 -->
              <div v-if="m.forgeUrn">URN: {{ m.forgeUrn }}</div>
              <!-- 若有轉換進度 (例如 APS 回傳的 progress)，也可顯示 -->
              <div v-if="m.progress">進度: {{ m.progress }}</div>
            </v-card-text>
  
            <v-card-actions>
              <!-- 按鈕：開始轉換 (只有狀態 needConvert 時顯示) -->
              <v-btn
                v-if="m.status === 'needConvert'"
                color="orange"
                @click="onStartConvert(m._id)"
              >
                開始轉換
              </v-btn>
  
              <!-- 當狀態為 inprogress 時，顯示更新進度按鈕 -->
              <v-btn                
                color="blue"
                @click="onRefreshProgress(m._id)"
              >
                更新進度
              </v-btn>
  
              <!-- 按鈕：下載檔案 (若狀態為 downloaded 表示本地已有檔案) -->
              <v-btn
                v-if="m.status === 'downloaded'"
                color="green"
                :href="getDownloadLink(m)"
                download
              >
                下載檔案
              </v-btn>
  
              <!-- 示範下載衍生檔 (例如 OBJ) -->
              <v-btn
                v-if="m.status !== 'downloaded'"
                color="primary"
                @click="onDownloadObj(m._id)"
              >
                下載衍生檔
              </v-btn>
  
              <!-- 查看詳細：開啟對話框顯示 ModelDetail.vue -->
              <v-btn text color="primary" @click="viewModelDetail(m)">
                查看
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- 匯入並使用 ModelDetail 組件 -->
      <ModelDetail
        v-model:show="detailDialogShow"
        :model="selectedModel"
        @save="onSaveDetail"
      />
    </v-container>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import ModelDetail from "@/components/ModelDetail.vue";
  import {
    getModels,
    startConvert,
    uploadFile,
    downloadObj,
    updateModel,
    checkProgress,
  } from "@/services/api.js";
  
  const models = ref([]);
  const uploadFileObj = ref(null);
  const uploadDisplayName = ref("");
  const detailDialogShow = ref(false);
  const selectedModel = ref({});
  
  /**
   * 取得所有模型記錄
   */
  async function fetchModels() {
    try {
      const result = await getModels();
      models.value = result.data;
    } catch (err) {
      console.error("取得清單失敗:", err);
    }
  }
  
  /**
   * 上傳檔案
   */
  async function onUpload() {
    if (!uploadFileObj.value) {
      alert("請選擇檔案");
      return;
    }
    try {
      const res = await uploadFile(uploadFileObj.value, uploadDisplayName.value);
      console.log("上傳結果:", res);
      fetchModels();
      uploadFileObj.value = null;
      uploadDisplayName.value = "";
    } catch (err) {
      console.error("上傳失敗:", err);
      alert("上傳失敗: " + err.message);
    }
  }
  
  /**
   * 開始轉換 (當模型狀態為 needConvert)
   */
  async function onStartConvert(recordId) {
    try {
      const result = await startConvert(recordId);
      console.log("開始轉換結果:", result);
      fetchModels();
    } catch (err) {
      console.error("startConvert 失敗:", err);
      alert("開始轉換失敗:" + err.message);
    }
  }
  
  /**
   * 取得下載連結 (僅回傳檔案路徑中的 /upload/ 部分)
   */
  function getDownloadLink(m) {
    if (!m.filePath) return null;
    const idx = m.filePath.indexOf("/upload/");
    if (idx >= 0) {
      return m.filePath.substring(idx);
    }
    return m.filePath;
  }
  
  /**
   * 呼叫後端下載衍生檔 (例如 OBJ)
   */
  async function onDownloadObj(recordId) {
    try {
      const ret = await downloadObj(recordId);
      console.log("下載衍生檔結果:", ret);
      fetchModels();
    } catch (err) {
      console.error("downloadObj 失敗:", err);
      alert("下載衍生檔失敗:" + err.message);
    }
  }
  
  /**
   * 查看模型詳細資料，將該筆資料帶入 ModelDetail 對話框
   */
  function viewModelDetail(m) {
    console.log("查看模型詳情：", m);
    selectedModel.value = { ...m };
    detailDialogShow.value = true;
  }
  
  /**
   * 當 ModelDetail 傳出 save 事件時，呼叫 updateModel API 更新後端
   */
  async function onSaveDetail(edited) {
    try {
      const result = await updateModel(edited._id, {
        displayName: edited.displayName,
        category: edited.category,
        description: edited.description,
        // 根據需求可加入其他欄位
      });
      console.log("更新成功：", result);
      fetchModels();
    } catch (err) {
      console.error("更新失敗：", err);
      alert("更新失敗:" + err.message);
    }
  }
  
  /**
   * 更新轉換進度：呼叫 checkProgress API 更新狀態
   */
  async function onRefreshProgress(recordId) {
    try {
      const ret = await checkProgress(recordId);
      console.log("更新進度結果:", ret);
      fetchModels();
      alert("轉換進度已更新！");
    } catch (err) {
      console.error("更新進度失敗：", err);
      alert("更新進度失敗:" + err.message);
    }
  }
  
  onMounted(() => {
    fetchModels();
  });
  </script>
  