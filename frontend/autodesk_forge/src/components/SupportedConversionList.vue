<template>
    <v-card class="mb-4">
      <v-card-title>支持轉換的格式列表</v-card-title>
      <v-card-text>
        <v-data-table :headers="headers" :items="supportedFormats" class="elevation-1" dense>
          <!-- 自定義顯示衍生格式欄位：以逗號分隔 -->
          <template v-slot:item.derivativeFormats="{ item }">
            <div>
              <span v-for="(format, index) in item.derivativeFormats" :key="index">
                {{ format }}<span v-if="index < item.derivativeFormats.length - 1">, </span>
              </span>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const headers = [
    { text: 'Source Format', value: 'sourceFormat' },
    { text: 'Derivative Formats', value: 'derivativeFormats' }
  ]
  
  const supportedFormats = ref([
    { sourceFormat: '3DM', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: '3DS', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'A', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'ASM (Creo assembly files)', derivativeFormats: ['OBJ', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'ASM (Solid Edge assembly files)', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'ASM.d+$', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'BRD', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'CATPART', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'CATPRODUCT', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'CGR', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'COLLABORATION', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'DAE', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'DGN', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'DLV3', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'DWF', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'DWFX', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'DWG', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'DWT', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'DXF', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'EMODE', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'EXP', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'F2D', derivativeFormats: ['DWG', 'F3D', 'DWG', 'FBX', 'IGES', 'OBJ', 'STEP', 'STL', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'FBX', derivativeFormats: ['IGES', 'OBJ', 'STEP', 'STL', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'G', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'GBXML', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'GLB', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'GLTF', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'IAM', derivativeFormats: ['IGES', 'OBJ', 'STEP', 'STL', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'IDW', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'IFC', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'IGE', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'IGES', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'IGS', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'IPT', derivativeFormats: ['IGES', 'OBJ', 'STEP', 'STL', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'IWM', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'JT', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'MAX', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'MODEL', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'MPF', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'MSR', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'NEU', derivativeFormats: ['OBJ', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'NEU.\\d+$', derivativeFormats: ['OBJ', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'NWC', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'NWD', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'OBJ', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'PAR', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'PDF', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'PMLPRJ', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'PMLPRJZ', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'PRT (Creo part files)', derivativeFormats: ['OBJ', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'PRT.\\d+$', derivativeFormats: ['OBJ', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'PSM', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'PSMODEL', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'RVM', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'RVT', derivativeFormats: ['DWG', 'IFC', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'SAB', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'SAT', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'SCH', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'SESSION', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'SKP', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'SLDASM', derivativeFormats: ['OBJ', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'SLDDRW', derivativeFormats: ['DWG'] },
    { sourceFormat: 'SLDPRT', derivativeFormats: ['OBJ', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'STE', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'STEP', derivativeFormats: ['OBJ', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'STL', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'STLA', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'STLB', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'STP', derivativeFormats: ['OBJ', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'STPZ', derivativeFormats: ['OBJ', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'VUE', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'WIRE', derivativeFormats: ['IGES', 'OBJ', 'STEP', 'STL', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'X_B', derivativeFormats: ['OBJ', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'X_T', derivativeFormats: ['OBJ', 'SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'XAS', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'XPR', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] },
    { sourceFormat: 'ZIP', derivativeFormats: ['SVF', 'SVF2', 'Thumbnail'] }
  ])
  </script>
  
  <style scoped>
  /* 根據需要調整樣式 */
  </style>
  