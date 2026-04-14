<template>
  <aside class="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50">
    <div class="px-6 py-5 flex items-center gap-3 border-b border-gray-200">
      <div class="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
        H
      </div>
      <span class="text-[15px] font-semibold text-gray-900 leading-tight">Helfen neu<br>gedacht</span>
    </div>

    <nav class="px-3 py-5 flex flex-col gap-1 flex-1">
      <NuxtLink
        to="/organization/dashboard"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        exact-active-class="!bg-blue-600 !text-white hover:!bg-blue-700 hover:!text-white"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Dashboard
      </NuxtLink>

      <NuxtLink
        to="/organization/events"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        exact-active-class="!bg-blue-600 !text-white hover:!bg-blue-700 hover:!text-white"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Veranstaltungen
      </NuxtLink>

      <NuxtLink
        to="/organization/shifts"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        exact-active-class="!bg-blue-600 !text-white hover:!bg-blue-700 hover:!text-white"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Dienste
      </NuxtLink>

      <NuxtLink
        to="/organization"
        class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        exact-active-class="!bg-blue-600 !text-white hover:!bg-blue-700 hover:!text-white"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Organisation
      </NuxtLink>
    </nav>

    <div class="px-3 pb-5">
      <button
        @click="logout"
        class="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Abmelden
      </button>
    </div>
  </aside>
</template>

<script setup>
import { logout } from '../assets/utils/auth';
</script>
