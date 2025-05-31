<script setup lang="ts">
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="app">
    <Navbar />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  background-color: #f5f5f5;
}

body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

button {
  cursor: pointer;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>
