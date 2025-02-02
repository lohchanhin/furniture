<template>
    <v-card class="subcategory-list">
      <v-card-title>{{ category.categoryName }} 子項</v-card-title>
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
  }
  .v-list-item.active {
    background-color: #e0e0e0;
  }
  </style>
  