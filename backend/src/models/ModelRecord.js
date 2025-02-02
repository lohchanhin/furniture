/*************************************
 * models/ModelRecord.js
 *************************************/
const mongoose = require('mongoose')

const modelRecordSchema = new mongoose.Schema({
  displayName: String,      // 前端顯示的名稱
  code: String,             // 唯一碼 (ex: uuid)
  filePath: String,         // 本地檔案路徑 (若是 .obj => '/upload/xxx.obj')
  isObj: Boolean,           // 是否原始檔案就是 .obj
  status: {
    type: String,
    default: 'pending'      // ex: 'local','needConvert','inprogress','downloaded','failed'...
  },
  forgeUrn: String,         // Base64 URN (轉換後記錄)
  forgeObjectId: String,    // 'urn:adsk.objects:os.object:bucketName/xxx'
  
  // 進一步欄位 (可自行取捨)
  derivativeUrn: String,    // 若需要儲存 role="OBJ" 的子URN (下載用)
  errorMessage: String,     // 若轉換/下載失敗，可紀錄錯誤原因
  convertedAt: Date,        // 轉換完成時間
  downloadedAt: Date,       // 下載衍生檔完成時間

  category: String,
  description:String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('ModelRecord', modelRecordSchema)
