<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="isOpen" class="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-md" @click="handleDismiss"></div>

        <!-- Dialog Card -->
        <Transition name="dialog-scale">
          <div 
            v-if="isOpen" 
            class="relative bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden border border-slate-100 transition-all transform flex flex-col p-6 gap-6"
          >
            <!-- Content Area -->
            <div class="flex items-start gap-4">
              <!-- Icon Container -->
              <div 
                class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border"
                :class="{
                  'bg-blue-50 border-blue-100 text-blue-600': dialogType === 'confirm',
                  'bg-red-50 border-red-100 text-red-600': dialogType === 'error',
                  'bg-indigo-50 border-indigo-100 text-indigo-600': dialogType === 'info'
                }"
              >
                <!-- Confirm Question Icon -->
                <svg v-if="dialogType === 'confirm'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 010 5.25H12M8.25 9.75L10.5 7.5M8.25 9.75L10.5 12m9-2.25A9 9 0 113 9.75 9 9 0 0119.5 9.75z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17h.008v.008H9.75V17z" />
                </svg>
                <!-- Error Warning Icon -->
                <svg v-else-if="dialogType === 'error'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <!-- Info Icon -->
                <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.028M12 18.75h.007v.008H12v-.008zM12 3a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              </div>

              <!-- Header content -->
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-slate-900 leading-6">
                  {{ title }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-slate-500 whitespace-pre-wrap leading-relaxed">
                    {{ message }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center justify-end gap-3">
              <button
                v-if="isConfirm"
                type="button"
                @click="handleCancel"
                class="px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 active:scale-95 rounded-xl transition-all duration-150 cursor-pointer border border-slate-200"
              >
                Abbrechen
              </button>
              <button
                type="button"
                @click="handleConfirm"
                ref="confirmBtn"
                class="px-5 py-2.5 text-sm font-semibold text-white active:scale-95 rounded-xl transition-all duration-150 cursor-pointer shadow-md"
                :class="{
                  'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-indigo-100': dialogType === 'confirm',
                  'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 hover:shadow-lg hover:shadow-rose-100': dialogType === 'error',
                  'bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black': dialogType === 'info'
                }"
              >
                {{ isConfirm ? 'Bestätigen' : 'OK' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, ref, nextTick, computed } from 'vue';

const { isOpen, title, message, isConfirm, close } = useDialog();

const confirmBtn = ref(null);

const dialogType = computed(() => {
  if (isConfirm.value) return 'confirm';
  const msg = (message.value || '').toLowerCase();
  const t = (title.value || '').toLowerCase();
  if (
    msg.includes('fehler') || 
    msg.includes('fehlgeschlagen') || 
    t.includes('fehler') || 
    t.includes('fehlgeschlagen') ||
    msg.includes('bad request')
  ) {
    return 'error';
  }
  return 'info';
});

watch(isOpen, async (newVal) => {
  if (newVal) {
    await nextTick();
    confirmBtn.value?.focus();
    window.addEventListener('keydown', handleKeyDown);
  } else {
    window.removeEventListener('keydown', handleKeyDown);
  }
});

const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    handleCancel();
  }
};

const handleDismiss = () => {
  if (isConfirm.value) {
    close(false);
  } else {
    close(true);
  }
};

const handleCancel = () => {
  close(false);
};

const handleConfirm = () => {
  close(true);
};
</script>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-scale-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dialog-scale-leave-active {
  transition: all 0.15s ease-in;
}
.dialog-scale-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
.dialog-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}
</style>
