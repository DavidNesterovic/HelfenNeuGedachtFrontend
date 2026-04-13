<template>
  <div class="loading-screen">
    <div class="loading-logo">H</div>
    <h1>Helfen neu gedacht</h1>
    <p class="loading-text">Einen Moment bitte...</p>
    <div class="loading-spinner"></div>
  </div>
</template>

<script setup>
onMounted(() => {
  setTimeout(() => {
    const authenticated = localStorage.getItem('token')

    if (authenticated) {
      navigateTo('/dashboard')
    } else {
      navigateTo('/login')
    }
  }, 500)
})
</script>