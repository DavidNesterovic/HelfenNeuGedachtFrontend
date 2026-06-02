<template>
  <div>
    <!-- Custom trigger (e.g. profile avatar button) -->
    <slot name="trigger" :open="openFilePicker" />

    <!-- Default dashed picker, shown only when no trigger slot is provided -->
    <div v-if="!hasCustomTrigger"
      class="relative cursor-pointer group"
      :style="{ height }"
      @click="openFilePicker"
    >
      <div class="absolute inset-0 rounded-lg border-2 overflow-hidden flex items-center justify-center bg-gray-50 transition-colors"
        :class="displayUrl
          ? 'border-gray-200 group-hover:border-blue-400'
          : 'border-dashed border-gray-200 group-hover:border-blue-400'"
      >
        <img v-if="displayUrl" :src="displayUrl" class="w-full h-full object-cover" />
        <div v-else class="flex flex-col items-center gap-2 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span class="text-sm font-medium">Klicken zum Hochladen</span>
          <span class="text-xs">JPG, PNG oder WEBP</span>
        </div>
        <div v-if="displayUrl" class="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors pointer-events-none">
          <span class="opacity-0 group-hover:opacity-100 text-white text-sm font-semibold transition-opacity drop-shadow">Bild ersetzen</span>
        </div>
      </div>
      <!-- Clear button — only shown for a freshly picked image, not the persisted currentUrl -->
      <button v-if="croppedPreviewUrl" type="button"
        class="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition z-10"
        @click.stop="clearImage"
      >
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Hidden file input -->
    <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onFileSelect" />

    <!-- Crop modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="cropVisible" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="font-bold text-gray-900">Bild zuschneiden</h3>
              <button type="button" class="text-gray-400 hover:text-gray-600 transition" @click="cancelCrop">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="bg-gray-950 flex items-center justify-center" style="height: 380px">
              <ClientOnly>
                <component
                  v-if="CropperComp && rawSrcUrl"
                  :is="CropperComp"
                  :src="rawSrcUrl"
                  :stencil-component="activeStencil"
                  :stencil-props="stencilProps"
                  class="h-[380px] w-full"
                  @change="onCropChange"
                />
                <template #fallback>
                  <div class="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                </template>
              </ClientOnly>
            </div>

            <div class="flex gap-3 px-5 py-4 border-t border-gray-100">
              <button type="button"
                class="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                @click="cancelCrop"
              >
                Abbrechen
              </button>
              <button type="button"
                class="flex-1 bg-blue-600 rounded-xl py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40"
                :disabled="!pendingCanvas"
                @click="confirmCrop"
              >
                Übernehmen
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
const props = defineProps({
  currentUrl: { type: String, default: null },
  aspectRatio: { type: Number, default: null },
  circular: { type: Boolean, default: false },
  height: { type: String, default: '11rem' },
})

const emit = defineEmits(['change', 'clear'])
const slots = useSlots()
const hasCustomTrigger = computed(() => !!slots.trigger)

// Lazy-loaded cropper components (client-only, avoids SSR issues)
const CropperComp = shallowRef(null)
const CircleStencilComp = shallowRef(null)
const RectStencilComp = shallowRef(null)

onMounted(async () => {
  const mod = await import('vue-advanced-cropper')
  await import('vue-advanced-cropper/dist/style.css')
  CropperComp.value = mod.Cropper
  CircleStencilComp.value = mod.CircleStencil
  RectStencilComp.value = mod.RectangleStencil
})

const fileInput = ref(null)
const cropVisible = ref(false)
const rawSrcUrl = ref(null)
const croppedPreviewUrl = ref(null)
const pendingCanvas = ref(null)

const displayUrl = computed(() => croppedPreviewUrl.value || props.currentUrl)
const activeStencil = computed(() => props.circular ? CircleStencilComp.value : RectStencilComp.value)
const stencilProps = computed(() => props.aspectRatio ? { aspectRatio: props.aspectRatio } : {})

// When parent swaps the currentUrl (e.g. opening a different edit form) reset local state
watch(() => props.currentUrl, () => {
  if (croppedPreviewUrl.value) URL.revokeObjectURL(croppedPreviewUrl.value)
  croppedPreviewUrl.value = null
})

const openFilePicker = () => fileInput.value?.click()

const onFileSelect = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (rawSrcUrl.value) URL.revokeObjectURL(rawSrcUrl.value)
  rawSrcUrl.value = URL.createObjectURL(file)
  cropVisible.value = true
  e.target.value = ''
}

const onCropChange = ({ canvas }) => {
  pendingCanvas.value = canvas
}

const confirmCrop = () => {
  if (!pendingCanvas.value) return
  pendingCanvas.value.toBlob((blob) => {
    if (!blob) return
    if (croppedPreviewUrl.value) URL.revokeObjectURL(croppedPreviewUrl.value)
    croppedPreviewUrl.value = URL.createObjectURL(blob)
    URL.revokeObjectURL(rawSrcUrl.value)
    rawSrcUrl.value = null
    cropVisible.value = false
    pendingCanvas.value = null
    emit('change', new File([blob], 'image.jpg', { type: 'image/jpeg' }))
  }, 'image/jpeg', 0.92)
}

const cancelCrop = () => {
  if (rawSrcUrl.value) URL.revokeObjectURL(rawSrcUrl.value)
  rawSrcUrl.value = null
  cropVisible.value = false
  pendingCanvas.value = null
}

const clearImage = () => {
  if (croppedPreviewUrl.value) URL.revokeObjectURL(croppedPreviewUrl.value)
  croppedPreviewUrl.value = null
  emit('clear')
}
</script>
