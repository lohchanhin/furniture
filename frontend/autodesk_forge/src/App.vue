<template>
  <v-app>
    <!-- 頂部工具列 -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawerOpen = !drawerOpen" />

      <!-- 新增 Icon：mdi-cube，放在標題前面 -->
      <v-icon class="mr-2">mdi-cube</v-icon>

      <v-toolbar-title>Forge Viewer Demo</v-toolbar-title>
    </v-app-bar>

    <!-- 側邊導覽列 (Navigation Drawer) -->
    <v-navigation-drawer
      v-model="drawerOpen"
      app
      color="grey lighten-4"
    >
      <v-list>
        <!-- 使用 router-link 或 to 屬性導向路由 -->
        <v-list-item
          v-for="link in navLinks"
          :key="link.name"
          :to="link.path"
          link
          @click="drawerOpen = false"
        >
          <v-list-item-title>{{ link.label }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- 主要內容區 -->
    <v-main>
      <!-- router-view 負責切換 HomeView, SceneEditView, UploadView 等頁面 -->
      <router-view></router-view>
    </v-main>

    <!-- (可選) 底部Footer -->
    <!--
    <v-footer app color="primary" dark>
      <v-col class="text-center">
        © 2025 My Forge Project
      </v-col>
    </v-footer>
    -->
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

// 控制抽屜開關
const drawerOpen = ref(false)

// 側邊欄連結 (對應路由)
const navLinks = [
  { name: 'Home', label: '首頁', path: '/' },
  { name: 'SceneEdit', label: '場景編輯', path: '/scene-edit' },
  { name: 'Upload', label: '上傳模型', path: '/upload' },
  { name: 'UploadedModels', label: '查看模型', path: '/uploaded-models' },
]
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
