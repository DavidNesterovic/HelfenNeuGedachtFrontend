<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="handleClose"
      >
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="modelValue"
            :class="['bg-white rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col', maxWidthClasses[maxWidth] ?? maxWidthClasses.lg, heightClass]"
          >
            <!-- Header -->
            <slot name="header">
              <div :class="['px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0', headerBg]">
                <div>
                  <h2 class="text-xl font-bold text-slate-900">{{ title }}</h2>
                  <p v-if="subtitle" class="text-sm text-slate-500 mt-0.5">{{ subtitle }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <slot name="header-actions" />
                  <button @click="handleClose" class="text-slate-400 hover:text-slate-600 transition-colors ml-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </slot>

            <!-- Body -->
            <div :class="['flex-1 overflow-y-auto', noPadding ? '' : 'p-6']">
              <slot />
            </div>

            <!-- Footer -->
            <slot name="footer">
              <div v-if="$slots['footer-content']" class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3 shrink-0">
                <slot name="footer-content" />
              </div>
            </slot>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title:      { type: String, default: '' },
  subtitle:   { type: String, default: '' },
  maxWidth:   { type: String, default: 'lg' },
  height:     { type: String, default: '' },
  noPadding:  { type: Boolean, default: false },
  headerBg:   { type: String, default: 'bg-slate-50' },
})

const emit = defineEmits(['update:modelValue', 'close'])

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const maxWidthClasses = {
  sm:  'max-w-sm',
  md:  'max-w-md',
  lg:  'max-w-lg',
  xl:  'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '5xl': 'max-w-5xl',
}

const heightClass = computed(() => props.height ? `h-[${props.height}]` : '')
</script>
