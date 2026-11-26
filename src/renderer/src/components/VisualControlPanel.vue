<script setup>
import { computed } from 'vue'
import SegmentedControl from './base/SegmentedControl.vue'
import BaseSwitch from './base/Switch.vue'

const plainTextModeOptions = [
  { value: 'auto', label: '自动' },
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'custom', label: '自定' }
]

const props = defineProps({
  merged: { type: Boolean, required: true },
  windowEnabled: { type: Boolean, required: true },
  contentEnabled: { type: Boolean, required: true },
  contentToggleDisabled: { type: Boolean, default: false },
  contentToggleDisabledReason: { type: String, default: '' },
  contentLevel: { type: Number, required: true },
  zoom: { type: Number, required: true },
  wheelSpeed: { type: Number, required: true },
  plainView: { type: Boolean, required: true },
  plainTextMode: { type: String, default: 'auto' },
  plainTextColor: { type: String, default: '#f7f8ff' },
  plainContrastEnabled: { type: Boolean, default: true },
  plainScrimLevel: { type: Number, default: 0.34 },
  hideMedia: { type: Boolean, required: true },
  webControlsVisible: { type: Boolean, default: true },
  embedded: { type: Boolean, default: false }
})

const emit = defineEmits([
  'toggle-transparency',
  'update:contentLevel',
  'update:zoom',
  'update:wheelSpeed',
  'update:plainView',
  'update:plainTextMode',
  'update:plainTextColor',
  'update:plainContrastEnabled',
  'update:plainScrimLevel',
  'reset-visual',
  'update:hideMedia'
])

const plainViewVisible = computed(
  () => !props.merged && props.webControlsVisible && props.windowEnabled
)
const contentLevelPercent = computed(() => `${Math.round(props.contentLevel * 100)}%`)
const plainScrimPercent = computed(() => `${Math.round(props.plainScrimLevel * 100)}%`)
const contentToggleTitle = computed(() => {
  if (!props.contentToggleDisabled) return ''
  return '需先开启背景隐去'
})
</script>

<template>
  <div class="visual-control-panel" :class="{ embedded: props.embedded }">
    <template v-if="props.merged">
      <BaseSwitch
        label="隐身阅读"
        :model-value="props.windowEnabled"
        @update:model-value="emit('toggle-transparency', { kind: 'unified', value: $event })"
      />
    </template>
    <template v-else>
      <BaseSwitch
        label="背景隐去"
        :model-value="props.windowEnabled"
        @update:model-value="emit('toggle-transparency', { kind: 'window', value: $event })"
      />
      <BaseSwitch
        label="界面淡化"
        :model-value="props.contentEnabled"
        :disabled="props.contentToggleDisabled"
        :title="contentToggleTitle"
        @update:model-value="emit('toggle-transparency', { kind: 'content', value: $event })"
      />
    </template>
    <div class="slider-group content-level-group">
      <label class="slider-label">
        <span>工具栏不透明度</span>
        <span class="slider-value">{{ contentLevelPercent }}</span>
      </label>
      <input
        aria-label="工具栏不透明度"
        type="range"
        min="0.6"
        max="1"
        step="0.01"
        :value="props.contentLevel"
        @input="emit('update:contentLevel', parseFloat($event.target.value))"
      />
      <div class="scope-hint">网页正文保持 100% 清晰</div>
    </div>
    <template v-if="props.webControlsVisible">
      <div class="divider"></div>
      <div class="slider-group">
        <label class="slider-label">
          <span>页面缩放</span>
          <span class="slider-value">{{ props.zoom.toFixed(1) }}x</span>
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          :value="props.zoom"
          @input="emit('update:zoom', parseFloat($event.target.value))"
        />
      </div>
      <div class="slider-group">
        <label class="slider-label">
          <span>滚轮速度</span>
          <span class="slider-value">{{ props.wheelSpeed.toFixed(1) }}x</span>
        </label>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          :value="props.wheelSpeed"
          @input="emit('update:wheelSpeed', parseFloat($event.target.value))"
        />
      </div>
      <BaseSwitch
        label="隐藏媒体"
        :model-value="props.hideMedia"
        @update:model-value="emit('update:hideMedia', $event)"
      />
    </template>
    <template v-if="plainViewVisible">
      <div class="divider"></div>
      <BaseSwitch
        label="网页素览"
        :model-value="props.plainView"
        @update:model-value="emit('update:plainView', $event)"
      />
      <template v-if="props.plainView">
        <SegmentedControl
          class="plain-mode-control"
          label="网页文字"
          :options="plainTextModeOptions"
          :model-value="props.plainTextMode"
          @update:model-value="emit('update:plainTextMode', $event)"
        />
        <label v-if="props.plainTextMode === 'custom'" class="plain-color-field">
          <span>自定义颜色</span>
          <span class="plain-color-swatch" :style="{ background: props.plainTextColor }">
            <input
              type="color"
              aria-label="网页自定义文字颜色"
              :value="props.plainTextColor"
              @change="emit('update:plainTextColor', $event.target.value)"
            />
          </span>
        </label>
        <BaseSwitch
          label="文字对比增强"
          :model-value="props.plainContrastEnabled"
          @update:model-value="emit('update:plainContrastEnabled', $event)"
        />
        <div class="slider-group plain-scrim-group">
          <label class="slider-label">
            <span>阅读衬底</span>
            <span class="slider-value">{{ plainScrimPercent }}</span>
          </label>
          <input
            aria-label="阅读衬底"
            type="range"
            min="0"
            max="0.65"
            step="0.01"
            :value="props.plainScrimLevel"
            @input="emit('update:plainScrimLevel', parseFloat($event.target.value))"
          />
        </div>
      </template>
    </template>
    <div class="visual-actions">
      <button type="button" class="visual-action" @click="emit('reset-visual')">
        恢复清晰显示
      </button>
    </div>
  </div>
</template>

<style scoped>
.visual-control-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  margin-bottom: 4px;
  padding: 12px 16px;
  background: var(--panel-bg);
  backdrop-filter: blur(16px);
  border-radius: 8px;
  border: 1px solid var(--toolbar-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 220px;
  z-index: 100;
}

.visual-control-panel.embedded {
  position: static;
  inset: auto;
  margin: 0;
  padding: 0;
  background: transparent;
  backdrop-filter: none;
  border: none;
  box-shadow: none;
  width: 220px;
  z-index: auto;
}

.plain-color-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: var(--text-control-size);
}

.scope-hint {
  margin-top: 6px;
  color: var(--color-text-muted);
  font-size: var(--text-meta-size);
}

.plain-mode-control {
  margin-top: var(--space-lg);
}

.plain-mode-control :deep(.segmented-control) {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-xxs);
}

.plain-mode-control :deep(.segmented-option) {
  min-width: 0;
  padding: 0;
}

.plain-color-swatch {
  position: relative;
  width: var(--hit-min);
  height: var(--hit-min);
  overflow: hidden;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-button);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.24);
}

.plain-color-swatch input[type='color'] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.plain-color-swatch:focus-within {
  outline: var(--focus-ring);
  outline-offset: 2px;
}

.plain-scrim-group {
  margin-top: 10px;
}

.visual-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-lg);
}

.visual-action {
  padding: var(--space-xs) var(--space-xxs);
  color: var(--color-text-secondary);
  background: transparent;
  border: 0;
  border-radius: var(--radius-button);
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: var(--text-meta-size);
  transition:
    background var(--motion-micro) ease,
    color var(--motion-micro) ease;
}

.visual-action:hover {
  background: var(--color-hover-bg);
  color: var(--color-text-primary);
}

.visual-action:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 2px;
}

.slider-group {
  margin-bottom: 12px;
}

.slider-group:last-child {
  margin-bottom: 0;
}

.content-level-group {
  margin-top: var(--space-lg);
  margin-bottom: 0;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-control-size);
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.slider-value {
  font-variant-numeric: tabular-nums;
}

input[type='range'] {
  width: 100%;
}

input[type='range']:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.divider {
  height: 1px;
  background: var(--toolbar-border);
  margin: 12px 0;
}

.visual-control-panel :deep(.switch-field) {
  min-height: 0;
}

.visual-control-panel :deep(.switch-field + .switch-field) {
  margin-top: var(--space-md);
}

.visual-control-panel :deep(.switch-label) {
  font-size: var(--text-control-size);
}
</style>
