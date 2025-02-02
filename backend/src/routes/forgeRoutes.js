const express = require("express");
const router = express.Router();
const multer = require("multer");
const forgeController = require("../controllers/forgeController");
const forgeService = require("../services/forgeService");

// 使用 multer 儲存在 /uploads (暫存)
const upload = multer({ dest: "uploads/" });

// 1. 上傳檔案 (判斷 .obj 或 非 .obj)
//    - obj => 本地 /upload + DB: status='local'
//    - 非 obj => 上傳到 Forge + DB: status='needConvert'
router.post("/upload", upload.single("file"), forgeController.uploadFile);

// 2. 使用者點「開始轉換」(若紀錄 status='needConvert') => APS translateToObj => DB: status='inprogress'
router.post("/convert/:id", forgeController.startConvert);

// 3. 查看紀錄清單(可包含輪詢狀態)
router.get("/models", forgeController.getModels);

// (可依需求再添加「下載 OBJ」或「fetch derivativeUrn」等路由)
router.post("/download-obj/:id", forgeController.downloadObj);

// 5. 更新模型資料 (檢視/編輯)
router.put("/update/:id", forgeController.updateModel);

// 6. 取得 Forge 憑證相關資料 (例如 clientId 與 bucketName)
router.get("/credentials", (req, res) => {
  res.json({
    clientId: process.env.FORGE_CLIENT_ID,
    bucketName: process.env.FORGE_BUCKET_NAME,
  });
});

// 7. 取得 2-legged Access Token
router.get("/token", async (req, res) => {
  console.log("執行getToken");
  try {
    const token = await forgeService.getToken();
    res.json({ access_token: token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. 檢查轉換進度：取得 manifest 並更新資料庫狀態
router.get("/check-status/:id", forgeController.checkTranslationStatus);

module.exports = router;
