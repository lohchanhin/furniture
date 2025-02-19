/*************************************
 * src/services/forgeService.js
 *************************************/
const axios = require('axios')
const fs = require('fs')
require('dotenv').config()

/**
 * 1. 取得 2-Legged Token
 */
async function getToken() {
  const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = process.env
  const params = new URLSearchParams()
  params.append('client_id', FORGE_CLIENT_ID)
  params.append('client_secret', FORGE_CLIENT_SECRET)
  params.append('grant_type', 'client_credentials')
  params.append('scope', 'data:read data:write data:create bucket:create bucket:read')

  const resp = await axios.post(
    'https://developer.api.autodesk.com/authentication/v2/token',
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )
  console.log(resp.data);
  return resp.data.access_token
}

/**
 * 2. 建立 Bucket (若不存在)
 */
async function createBucketIfNotExist(bucketKey, region = 'US') {
  const token = await getToken()
  const urlCheck = `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/details`
  try {
    await axios.get(urlCheck, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-ads-region': region
      }
    })
    console.log(`Bucket [${bucketKey}] already exists. region=[${region}]`)
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.log(`Bucket [${bucketKey}] not found, creating...`)
      const payload = {
        bucketKey: bucketKey,
        access: 'full',
        policyKey: 'transient'
      }
      const createUrl = 'https://developer.api.autodesk.com/oss/v2/buckets'
      const resp = await axios.post(createUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-ads-region': region
        }
      })
      console.log('Bucket created:', resp.data)
    } else {
      throw err
    }
  }
}

/**
 * 3. 取得 Signed URL (用於上傳檔案)
 */
async function getSignedUrl(bucketKey, objectKey, minutes = 10, region = 'US') {
  const token = await getToken()
  const url = `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload?minutesExpiration=${minutes}`
  const resp = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-ads-region': region
    }
  })
  return resp.data // { uploadKey, urls:[], location,... }
}

/**
 * 4. 使用 Signed URL 上傳檔案
 */
async function putFileToSignedUrl(signedUrl, filePath) {
  const fileData = fs.readFileSync(filePath)
  await axios.put(signedUrl, fileData, {
    headers: { 'Content-Type': 'application/octet-stream' }
  })
}

/**
 * 5. Finalize 上傳
 */
async function finalizeUpload(bucketKey, objectKey, uploadKey, region = 'US') {
  const token = await getToken()
  const url = `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload`
  const payload = {
    ossbucketKey: bucketKey,
    ossSourceFileObjectKey: objectKey,
    access: 'full',
    uploadKey: uploadKey
  }
  const resp = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-ads-region': region
    }
  })
  return resp.data // { objectId, location, size, ... }
}

/**
 * 6. 整合流程: 建 Bucket → 取得 Signed URL → 上傳檔案 → Finalize
 */
async function uploadFileThroughSignedURL(localFilePath, bucketKey, objectKey, region = 'US') {
  // (A) 建 Bucket (若需要)
  await createBucketIfNotExist(bucketKey, region)
  // (B) 取得 Signed URL
  const signData = await getSignedUrl(bucketKey, objectKey, 10, region)
  console.log('SignedS3Upload info:', signData)
  // (C) 上傳檔案
  await putFileToSignedUrl(signData.urls[0], localFilePath)
  // (D) Finalize
  const finalizeResp = await finalizeUpload(bucketKey, objectKey, signData.uploadKey, region)
  return finalizeResp // 回傳 { objectId, location, size, ... }
}

/**
 * 7. 啟動 Model Derivative 轉換
 *    僅要求產生供 Forge Viewer 使用的 SVF（或 SVF2）輸出（2D、3D）
 */
async function translateObject(objectIdBase64) {
  const token = await getToken();
  const url = 'https://developer.api.autodesk.com/modelderivative/v2/designdata/job';
  const payload = {
    input: {
      urn: objectIdBase64
    },
    output: {
      // 僅要求產生 SVF 或 SVF2 衍生檔，2D 與 3D 皆支援
      formats: [
        {
          type: 'svf', // 如果需要 SVF2，可改為 'svf2'
          views: ['2d', '3d']
        }
      ]
    }
  };
  const resp = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return resp.data;
}


/**
 * 8. 從 manifest 中查詢 OBJ 衍生檔的 derivativeUrn
 */
async function getObjDerivativeUrn(base64Urn) {
  const token = await getToken()
  const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${base64Urn}/manifest`
  const resp = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const derivatives = resp.data.derivatives || []
  for (let d of derivatives) {
    if (d.outputType === 'obj' && d.status === 'success' && d.children) {
      for (let c of d.children) {
        if (c.role === 'OBJ' && c.status === 'success') {
          return c.urn // 回傳 OBJ 衍生檔的子 URN
        }
      }
    }
  }
  return null
}

/**
 * 9. 取得下載 OBJ 衍生檔所需的 signed cookies 與 download URL
 */
async function getSignedCookieForDerivative(base64Urn, derivativeUrn) {
  const token = await getToken()
  const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${base64Urn}/manifest/${derivativeUrn}/signedcookies`
  const resp = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return {
    cookies: resp.headers['set-cookie'] || [],
    downloadUrl: resp.data.url
  }
}

/**
 * 10. 下載衍生檔 (OBJ) 並儲存到本地
 */
async function downloadDerivativeObj(downloadUrl, cookiesArray, localPath) {
  const cookieString = cookiesArray.join('; ')
  const resp = await axios.get(downloadUrl, {
    headers: { Cookie: cookieString },
    responseType: 'arraybuffer'
  })
  fs.writeFileSync(localPath, resp.data)
}

/**
 * 11. 取得 manifest (用以檢查轉換進度)
 */
async function getManifest(base64Urn) {
    const token = await getToken();
    const url = `https://developer.api.autodesk.com/modelderivative/v2/designdata/${base64Urn}/manifest`;
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return resp.data;
  }

module.exports = {
  getToken,
  createBucketIfNotExist,
  getSignedUrl,
  putFileToSignedUrl,
  finalizeUpload,
  uploadFileThroughSignedURL,
  translateObject,
  getObjDerivativeUrn,
  getSignedCookieForDerivative,
  downloadDerivativeObj,
  getManifest,
}
