<template>
  <tu-switch v-model:value="value" size="small" />
  <tu-switch v-model:value="value" />
  <tu-switch v-model:value="value" size="large" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const value = ref(false)
</script>
