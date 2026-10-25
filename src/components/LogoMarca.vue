<template>
  <svg :width="size" :height="size" viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <path
      d="M24 18c-10 6-14 16-12 26 2 8 8 12 16 12"
      stroke="#313945"
      stroke-width="7"
      stroke-linecap="round"
    />
    <path d="M18 16l8 2-2 8" stroke="#313945" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    <path
      d="M56 62c10-6 14-16 12-26-2-8-8-12-16-12"
      stroke="#2D52A8"
      stroke-width="7"
      stroke-linecap="round"
    />
    <path d="M62 64l-8-2 2-8" stroke="#2D52A8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
    <path
      d="M30 28c8-8 20-6 26 2"
      stroke="#7B8FD4"
      stroke-width="6"
      stroke-linecap="round"
    />
    <path d="M50 52c-8 8-20 6-26-2" stroke="#8EA0C8" stroke-width="6" stroke-linecap="round" />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 88 },
})
</script>
