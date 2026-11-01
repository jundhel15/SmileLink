<template>
  <!-- DIVIDER: dalawang guhit + diamond sa gitna -->
  <svg class="divider" viewBox="0 0 220 20" aria-hidden="true">
    <defs>
      <linearGradient id="sn-divider-left" x1="0" x2="1">
        <stop offset="0" stop-color="#e9c48f" stop-opacity="0" />
        <stop offset="1" stop-color="#e9c48f" />
      </linearGradient>
      <linearGradient id="sn-divider-right" x1="0" x2="1">
        <stop offset="0" stop-color="#e9c48f" />
        <stop offset="1" stop-color="#e9c48f" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path d="M6 10h84" stroke="url(#sn-divider-left)" stroke-width="1" />
    <path d="M130 10h84" stroke="url(#sn-divider-right)" stroke-width="1" />
    <circle cx="94" cy="10" r="1.4" fill="#e9c48f" />
    <circle cx="126" cy="10" r="1.4" fill="#e9c48f" />
    <path d="M110 2 117 10 110 18 103 10Z" fill="none" stroke="#f1d3a6" stroke-width="1.1" />
    <path d="M110 6.5 113.5 10 110 13.5 106.5 10Z" fill="#f4bcd6" />
  </svg>
</template>

<style scoped>
.divider {
  display: block;
  width: 200px;
  height: 18px;
  filter: drop-shadow(0 0 6px rgb(241 211 166 / 0.4));
}
</style>
