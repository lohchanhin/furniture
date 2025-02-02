/*************************************
 * src/controllers/forgeController.js
 *************************************/

const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const ModelRecord = require("../models/ModelRecord");
const forgeService = require("../services/forgeService");

/**
 * 1. 上傳檔案
 *    - 所有格式皆上傳到 Forge，並記錄狀態為 'needConvert'
 */
exports.uploadFile = async (req, res) => {
  console.log("收到開始處理上傳");
  try {
    const file = req.file;
    const originalName = file.originalname;
    const displayName = req.body.displayName || originalName;
    const ext = path.extname(originalName).toLowerCase();

    const code = uuidv4();
    const localFileName = code + ext;
    const localPath = path.join(__dirname, "../../uploads", localFileName);

    // 若有需要，您可在這裡保留原始檔（例如存檔備份）
    // 先將暫存檔移至 uploads 目錄
    fs.renameSync(file.path, localPath);

    // 上傳到 Forge（所有格式皆上傳並進行轉換）
    const finalizeResp = await forgeService.uploadFileThroughSignedURL(
      localPath,
      process.env.FORGE_BUCKET_NAME,
      code + ext
    );
    // 上傳成功後刪除本地暫存檔，避免重複儲存
    fs.unlinkSync(localPath);

    const record = await ModelRecord.create({
      displayName,
      code,
      // 此時的 forgeObjectId 為 Forge 回傳的物件 ID (URN 格式)
      forgeObjectId: finalizeResp.objectId,
      status: "needConvert",
      // 其他欄位視需要補充
      category: req.body.category || "暫無分類",
      description: req.body.description || "暫無"
    });
    return res.json({
      success: true,
      message: "上傳至 Forge 成功，尚未轉換",
      record,
    });
  } catch (err) {
    console.error("uploadFile error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 2. 啟動轉換工作
 *    - 僅當 record.status === 'needConvert' 時執行
 *    - 轉換要求產生供 Forge Viewer 使用的 SVF 與（若來源格式支援）OBJ 衍生檔
 */
exports.startConvert = async (req, res) => {
  try {
    const recordId = req.params.id;
    const record = await ModelRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    if (record.status !== "needConvert") {
      return res.status(400).json({ error: "Record status not allow convert" });
    }

    // forgeObjectId 格式例如："urn:adsk.objects:os.object:bucket/xx"
    // 轉成 Base64 URN 作為轉換參數
    const base64Urn = Buffer.from(record.forgeObjectId).toString("base64");
    await forgeService.translateObject(base64Urn);

    record.forgeUrn = base64Urn;
    record.status = "inprogress";
    await record.save();

    return res.json({
      success: true,
      message: "已開始轉換，請稍後查詢進度",
      record,
    });
  } catch (err) {
    console.error("startConvert error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 3. 查詢所有紀錄 (前端顯示列表)
 */
exports.getModels = async (req, res) => {
  try {
    const list = await ModelRecord.find().sort({ createdAt: -1 });
    return res.json({ data: list });
  } catch (err) {
    console.error("getModels error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * 4. 下載 OBJ 衍生檔 (示例)
 *    - 先從 manifest 中找出 OBJ 衍生檔的 urn (若有)
 *    - 取得下載所需的 signed cookies 與 download URL
 *    - 下載到本地並更新狀態為 'downloaded'
 *
 * 注意：若來源檔案格式不支援轉換成 OBJ，此流程將找不到相應 derivative
 */
exports.downloadObj = async (req, res) => {
  try {
    const recordId = req.params.id;
    const record = await ModelRecord.findById(recordId);
    if (!record) return res.status(404).json({ error: "Record not found" });
    if (!record.forgeUrn) {
      return res.status(400).json({ error: "No forgeUrn => cannot find derivative" });
    }

    // 1) 取得 OBJ 衍生檔的 derivativeUrn
    const derivativeUrn = await forgeService.getObjDerivativeUrn(record.forgeUrn);
    if (!derivativeUrn) {
      return res.status(400).json({ error: "OBJ derivative not found or conversion not supported" });
    }

    // 2) 取得 signed cookies 與 download URL
    const { cookies, downloadUrl } = await forgeService.getSignedCookieForDerivative(record.forgeUrn, derivativeUrn);

    // 3) 下載檔案到本地 (存放於 /upload/<code>.obj)
    const localFileName = record.code + ".obj";
    const localPath = path.join(__dirname, "../../upload", localFileName);
    await forgeService.downloadDerivativeObj(downloadUrl, cookies, localPath);

    // 4) 更新 DB：下載完成後更新 filePath 與 status
    record.filePath = localPath;
    record.status = "downloaded";
    await record.save();

    return res.json({
      success: true,
      message: "OBJ 衍生檔已下載到本地!",
      record,
    });
  } catch (err) {
    console.error("downloadObj error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 5. 更新模型資料 (檢視/編輯)
 */
exports.updateModel = async (req, res) => {
  try {
    const recordId = req.params.id;
    const updateData = {
      displayName: req.body.displayName,
      category: req.body.category,
      description: req.body.description,
    };

    const updatedRecord = await ModelRecord.findByIdAndUpdate(recordId, updateData, { new: true });
    if (!updatedRecord) {
      return res.status(404).json({ error: "Record not found" });
    }
    return res.json({
      success: true,
      message: "更新成功",
      record: updatedRecord,
    });
  } catch (err) {
    console.error("updateModel error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 6. 檢查轉換進度
 *    - 取得 APS manifest 並根據 manifest.status 更新 DB 中記錄狀態
 */
exports.checkTranslationStatus = async (req, res) => {
    try {
      const recordId = req.params.id;
      const record = await ModelRecord.findById(recordId);
      if (!record) {
        return res.status(404).json({ error: "Record not found" });
      }
      if (!record.forgeUrn) {
        return res.status(400).json({ error: "Record does not have a forgeUrn" });
      }
      // 使用存入資料庫的 Base64 URN
      const base64Urn = record.forgeUrn;
  
      // 呼叫 APS API 取得 manifest
      const manifest = await forgeService.getManifest(base64Urn);
      console.log("取得 manifest:", manifest);
      
      // 根據 manifest.status 更新 DB 狀態
      // 可依據 APS 文檔，manifest.status 可能為 "pending"、"inprogress"、"success"、"failed"、"timeout"
      record.status = manifest.status;
      // 若 APS 回傳 progress 內容，可存入記錄 (例如 record.progress)
      if (manifest.progress) {
        record.progress = manifest.progress; // 若 ModelRecord 模型有定義 progress 欄位
      }
      await record.save();
  
      return res.json({
        success: true,
        message: "轉換進度已更新",
        record,
        manifest,
      });
    } catch (err) {
      console.error("checkTranslationStatus error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  };