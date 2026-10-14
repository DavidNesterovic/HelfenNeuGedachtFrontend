<template>
  <div ref="root" class="relative">
    <div v-if="label" class="flex items-center justify-between mb-1.5">
      <label :for="inputId" class="block text-sm font-medium text-slate-700">
        {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
      </label>
    </div>

    <div class="relative">
      <input
        :id="inputId"
        ref="input"
        :value="modelValue"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="listId"
        :aria-activedescendant="activeIndex >= 0 ? optionId(activeIndex) : undefined"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        class="w-full border border-slate-200 rounded-lg pl-3 pr-9 py-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="onBlur"
      >
      <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <span v-if="loading" class="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin motion-reduce:animate-none" aria-hidden="true" />
        <svg v-else-if="coordinates" class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      </span>
    </div>

    <ul
      v-show="open"
      :id="listId"
      role="listbox"
      class="absolute z-30 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
    >
      <li
        v-for="(place, i) in results"
        :id="optionId(i)"
        :key="`${place.latitude},${place.longitude},${i}`"
        role="option"
        :aria-selected="i === activeIndex ? 'true' : 'false'"
        class="cursor-pointer px-3 py-2 text-sm"
        :class="i === activeIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'"
        @mousedown.prevent="select(place)"
        @mouseenter="activeIndex = i"
      >
        {{ place.label }}
      </li>
      <li v-if="!loading && results.length === 0" class="px-3 py-2 text-sm text-slate-500" role="presentation">
        {{ error ? 'Die Ortssuche ist gerade nicht erreichbar. Bitte versuche es später erneut.' : 'Kein Ort gefunden. Versuche es mit PLZ oder Ortsname.' }}
      </li>
    </ul>

    <p v-if="hint" class="mt-1 text-xs text-slate-400">{{ hint }}</p>

    <button
      v-if="allowCurrentLocation"
      type="button"
      class="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
      :disabled="locating || disabled"
      @click="useCurrentLocation"
    >
      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 2v3m0 14v3m10-10h-3M5 12H2m15 0a5 5 0 11-10 0 5 5 0 0110 0z" />
      </svg>
      {{ locating ? 'Standort wird ermittelt…' : 'Aktuellen Standort verwenden' }}
    </button>
  </div>
</template>

<script setup>
import { CURRENT_LOCATION_LABEL, GEO_MIN_QUERY_LENGTH, useGeoSearch } from '~/composables/useGeoSearch'

const props = defineProps({
  // Angezeigter Ortstext
  modelValue: { type: String, default: '' },
  // { latitude, longitude } des gewählten Treffers, null bei Freitext
  coordinates: { type: Object, default: null },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Ort oder PLZ eingeben' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  allowCurrentLocation: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'update:coordinates', 'select'])

const { show: showSnackbar } = useSnackbar()
const { results, loading, error, search, clear } = useGeoSearch()

const inputId = useId()
const listId = `${inputId}-list`
const optionId = i => `${inputId}-option-${i}`

const open = ref(false)
const activeIndex = ref(-1)
const locating = ref(false)

const onInput = (e) => {
  const text = e.target.value
  emit('update:modelValue', text)
  // Getippter Text passt nicht mehr zum gewählten Treffer
  if (props.coordinates) emit('update:coordinates', null)
  activeIndex.value = -1
  search(text)
  open.value = text.trim().length >= GEO_MIN_QUERY_LENGTH
}

const onFocus = () => {
  if (results.value.length > 0 && !props.coordinates) open.value = true
}

const onBlur = () => {
  open.value = false
  activeIndex.value = -1
}

const select = (place) => {
  emit('update:modelValue', place.label)
  emit('update:coordinates', { latitude: place.latitude, longitude: place.longitude })
  emit('select', place)
  open.value = false
  activeIndex.value = -1
  clear()
}

const onKeydown = (e) => {
  if (e.key === 'Escape') {
    if (open.value) e.preventDefault()
    open.value = false
    activeIndex.value = -1
    return
  }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (results.value.length === 0) return
    e.preventDefault()
    open.value = true
    const step = e.key === 'ArrowDown' ? 1 : -1
    const count = results.value.length
    activeIndex.value = (activeIndex.value + step + count) % count
    return
  }
  if (e.key === 'Enter' && open.value && activeIndex.value >= 0) {
    e.preventDefault()
    select(results.value[activeIndex.value])
  }
}

const useCurrentLocation = () => {
  if (!import.meta.client || !navigator.geolocation) {
    showSnackbar('Dein Browser unterstützt keine Standortabfrage. Gib bitte einen Ort ein.', { type: 'error' })
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      locating.value = false
      select({
        label: CURRENT_LOCATION_LABEL,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    },
    (err) => {
      locating.value = false
      const message = err?.code === 1
        ? 'Standortzugriff wurde nicht erlaubt. Gib bitte einen Ort ein oder erlaube den Zugriff im Browser.'
        : 'Dein Standort konnte nicht ermittelt werden. Gib bitte einen Ort ein.'
      showSnackbar(message, { type: 'error', duration: 5000 })
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
  )
}
</script>
