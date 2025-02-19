<template>
  <v-card class="category-list">
    <v-card-title class="card-title">大分類</v-card-title>
    <v-list dense>
      <v-list-item 
        v-for="(cat, index) in categories" 
        :key="index"
        @click="selectCategory(cat)"
        :class="{ active: selectedCategory && selectedCategory.categoryName === cat.categoryName }"
      >
        <v-list-item-title>{{ cat.categoryName }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['update:selectedCategory'])
function selectCategory(cat) {
  emit('update:selectedCategory', cat)
}
</script>

<style scoped>
.category-list {
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
