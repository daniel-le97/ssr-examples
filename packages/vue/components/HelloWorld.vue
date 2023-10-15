<script setup>
import { ref } from 'vue'

const msg = ref('Hello World!')
</script>

<template>
  <h1 class="green">{{ msg }}</h1>
  <input v-model="msg">
</template>
<style scoped>
.green{
border: 1px;
color: blue;
}
</style>