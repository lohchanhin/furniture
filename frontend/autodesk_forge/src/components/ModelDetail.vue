<template>
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h6">模型詳細資訊</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <!-- 顯示名稱：可編輯 -->
            <v-text-field
              label="顯示名稱"
              v-model="editedModel.displayName"
            ></v-text-field>
            
            <!-- 分類：可編輯 -->
            <v-text-field
              label="分類"
              v-model="editedModel.category"
            ></v-text-field>
            
            <!-- 描述：可編輯 -->
            <v-text-field
              label="描述"
              v-model="editedModel.description"
            ></v-text-field>

            <!-- 狀態：唯讀 -->
            <v-text-field
              label="狀態"
              v-model="editedModel.status"
              readonly
            ></v-text-field>
  
            <!-- Forge URN：唯讀 (若有) -->
            <v-text-field
              v-if="editedModel.forgeUrn"
              label="Forge URN"
              v-model="editedModel.forgeUrn"
              readonly
            ></v-text-field>
  
            <!-- 其他欄位 (例如錯誤訊息、轉換完成時間) 依需求加入 -->
            <v-text-field
              v-if="editedModel.errorMessage"
              label="錯誤訊息"
              v-model="editedModel.errorMessage"
              readonly
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="onClose">關閉</v-btn>
          <v-btn text color="primary" @click="onSave">儲存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { ref, watch, defineProps, defineEmits } from 'vue'
  
  /**
   * Props 說明：
   * - model：待檢視/編輯的模型記錄物件
   * - show：用來控制對話框是否顯示
   */
  const props = defineProps({
    model: {
      type: Object,
      default: () => ({})
    },
    show: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['update:show', 'save'])
  
  const dialog = ref(props.show)
  
  // 建立本地編輯用的模型複本
  const editedModel = ref({ ...props.model })
  
  // 當傳入的 show 或 model 變化時，同步更新本地變數
  watch(
    () => props.show,
    (val) => {
      dialog.value = val
    }
  )
  watch(
    () => props.model,
    (val) => {
      editedModel.value = { ...val }
    }
  )
  
  function onClose() {
    dialog.value = false
    emit('update:show', false)
  }
  
  function onSave() {
    // emit save 事件，並傳出編輯後的模型資料
    emit('save', editedModel.value)
    onClose()
  }
  </script>
  