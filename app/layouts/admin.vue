<template>
  <div class="min-h-screen bg-slate-50">
    <header class="bg-white border-b border-slate-200">
      <div class="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
            H
          </div>
          <span class="text-[15px] font-semibold text-slate-900 truncate">Helfen neu gedacht</span>
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 rounded-md px-2 py-0.5">Admin</span>
        </div>

        <button
          type="button"
          class="flex items-center gap-2 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          @click="logout"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Abmelden
        </button>
      </div>
    </header>

    <slot />
  </div>
</template>

<script setup>
import { logout } from '~/assets/utils/auth'
</script>
