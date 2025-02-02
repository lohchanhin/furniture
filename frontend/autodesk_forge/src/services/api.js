import axios from "axios";

// 後端基底路徑，請根據您的實際後端位置調整
const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

/**
 * 1. 上傳檔案
 *   - 若為 .obj => 直接本地儲存
 *   - 若非 .obj => 上傳到 Forge, status='needConvert'
 */
export async function uploadFile(file, displayName) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("displayName", displayName || file.name);
  const res = await api.post("/forge/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * 2. 開始轉換 (POST /forge/convert/:id)
 *    僅對狀態為 needConvert 的記錄進行轉換
 */
export async function startConvert(recordId) {
  const res = await api.post(`/forge/convert/${recordId}`);
  return res.data;
}

/**
 * 3. 取得所有模型記錄 (GET /forge/models)
 */
export async function getModels() {
  const res = await api.get("/forge/models");
  return res.data;
}

/**
 * 4. 下載衍生檔 (POST /forge/download-obj/:id)
 */
export async function downloadObj(recordId) {
  const res = await api.post(`/forge/download-obj/${recordId}`);
  return res.data;
}

export async function updateModel(recordId, updateData) {
  const res = await api.put(`/forge/update/${recordId}`, updateData);
  return res.data;
}


/**
 * 取得轉換進度
 * 呼叫 GET /forge/check-status/:id，後端會根據 APS manifest 更新該筆記錄狀態與進度
 */
export async function checkProgress(recordId) {
    const res = await api.get(`/forge/check-status/${recordId}`);
    return res.data;
  }