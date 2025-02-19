<template>
  <v-card class="subcategory-list">
    <v-card-title class="card-title">{{ category.categoryName }} 子項</v-card-title>
    <v-list dense>
      <v-list-item 
        v-for="(item, index) in category.items" 
        :key="item.id"
        @click="selectItem(item)"
        :class="{ active: selectedItem && selectedItem.id === item.id }"
      >
        <v-list-item-title>{{ item.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  selectedItem: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['update:selectedItem'])
function selectItem(item) {
  emit('update:selectedItem', item)
}
</script>

<style scoped>
.subcategory-list {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-title {
  background-color: #1976d2;
  color: #fff;
  font-weight: 600;
  padding: 12px;
}

.v-list-item {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.v-list-item:hover {
  background-color: #f5f5f5;
}

.v-list-item.active {
  background-color: #e3f2fd;
  border-left: 4px solid #1976d2;
}
</style>
