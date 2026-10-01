<template>
  <div>
    <div v-if="label || $slots['label-end']" class="flex items-center justify-between mb-1.5">
      <label :for="fieldId" class="block text-sm font-medium text-slate-700">
        {{ label }}<span v-if="required" class="text-red-500 ml-0.5">*</span>
        <span v-if="optional" class="text-slate-400 font-normal ml-1">(optional)</span>
      </label>
      <slot name="label-end" />
    </div>

    <textarea
      v-if="type === 'textarea'"
      :id="fieldId"
      v-bind="$attrs"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
      @input="onInput"
    />

    <select
      v-else-if="type === 'select'"
      :id="fieldId"
      v-bind="$attrs"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
      @change="onSelectChange"
    >
      <slot />
    </select>

    <input
      v-else
      :id="fieldId"
      v-bind="$attrs"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
      @input="onInput"
    />

    <p v-if="hint" class="mt-1 text-xs text-slate-400">{{ hint }}</p>
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue:  { default: '' },
  type:        { type: String, default: 'text' },
  label:       { type: String, default: '' },
  placeholder: { type: String, default: '' },
  hint:        { type: String, default: '' },
  required:    { type: Boolean, default: false },
  optional:    { type: Boolean, default: false },
  disabled:    { type: Boolean, default: false },
  rows:        { type: Number, default: 3 },
})

const emit = defineEmits(['update:modelValue'])

const fieldId = useId()

const onInput = (e) => {
  const val = e.target.value
  emit('update:modelValue', props.type === 'number' ? (val === '' ? '' : Number(val)) : val)
}

const onSelectChange = (e) => {
  const val = e.target.value
  // Preserve numeric type if current modelValue is a number
  emit('update:modelValue', typeof props.modelValue === 'number' ? (val === '' ? '' : Number(val)) : val)
}
</script>
