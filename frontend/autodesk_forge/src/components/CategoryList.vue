<template>
    <v-card class="category-list">
      <v-card-title>大分類</v-card-title>
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
  }
  .v-list-item.active {
    background-color: #e0e0e0;
  }
  </style>
  