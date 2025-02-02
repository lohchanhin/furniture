// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
// 待會我們會建立對應的檔案
import HomeView from '../pages/HomeView.vue'
import SceneEditView from '../pages/SceneEditView.vue'
import UploadView from '../pages/UploadView.vue'
import UploadModelsView from '@/pages/UploadModelsView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/scene-edit',
    name: 'SceneEdit',
    component: SceneEditView
  },
  {
    path: '/upload',
    name: 'Upload',
    component: UploadView
  },
  {
    path: '/uploaded-models',
    name: 'UploadedModels',
    component: UploadModelsView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
