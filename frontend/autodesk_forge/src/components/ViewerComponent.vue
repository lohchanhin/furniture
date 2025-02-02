<template>
  <!-- Viewer 容器 -->
  <div ref="viewerContainer" class="viewer-container" id="forgeViewer"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'

// 取得 DOM 參考
const viewerContainer = ref(null)
let viewer = null

const DOCUMENT_ID = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6d2lubmllL2JiZGQwYzI2LTNmN2UtNDNmZC04NmI4LWRmMjBkOGQ0YWFhNC5vYmo'

async function getForgeToken() {
  try {
    const response = await axios.get('http://localhost:3001/api/forge/token')
    const tokenData = response.data
    console.log("token:", tokenData.access_token)
    return { token: tokenData.access_token, expiry: tokenData.expiry || 3600 }
  } catch (error) {
    console.error('Error fetching Forge token:', error)
    throw error
  }
}

onMounted(async () => {
  try {
    const { token, expiry } = await getForgeToken()
    const options = {
      env: "AutodeskProduction",
      api: "derivativeV2", // 加入此屬性
      getAccessToken: (onTokenReady) => {
        onTokenReady(token, expiry);
      },
    };

    Autodesk.Viewing.Initializer(options, () => {
      viewer = new Autodesk.Viewing.GuiViewer3D(viewerContainer.value);
      const startedCode = viewer.start();
      if (startedCode > 0) {
        console.error('Failed to create a Viewer: WebGL not supported.');
        return;
      }
      console.log('Forge Viewer 已初始化。');
      
      if (DOCUMENT_ID) {
        Autodesk.Viewing.Document.load(DOCUMENT_ID, onDocumentLoadSuccess, onDocumentLoadFailure);
      }
    });
  } catch (error) {
    console.error('Viewer initialization error:', error);
  }
});

function onDocumentLoadSuccess(viewerDocument) {
  console.log('Document loaded successfully:', viewerDocument);
  const root = viewerDocument.getRoot();
  if (!root) {
    console.error('Manifest does not contain a valid root. Model may not have been translated successfully.');
    return;
  }
  const defaultModel = root.getDefaultGeometry();
  if (defaultModel) {
    viewer.loadDocumentNode(viewerDocument, defaultModel)
      .then(() => {
        console.log('Model loaded successfully.');
      })
      .catch((err) => {
        console.error('Error loading model:', err);
      });
  } else {
    console.error('Default geometry not found in the document.');
  }
}

function onDocumentLoadFailure(errorCode, errorMsg) {
  console.error('Failed to load document:', errorMsg);
}

onBeforeUnmount(() => {
  if (viewer) {
    viewer.finish();
    viewer = null;
  }
});
</script>


<style scoped>
.viewer-container {
  width: 100%;
  height: 100%;
}
</style>
