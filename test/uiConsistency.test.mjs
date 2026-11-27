import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const preferencesSource = readFileSync(
  new URL('../src/renderer/preferences/src/components/WebPrefsSection.vue', import.meta.url),
  'utf8'
)
const visualPanelSource = readFileSync(
  new URL('../src/renderer/src/components/VisualControlPanel.vue', import.meta.url),
  'utf8'
)

test('web preferences reuse the existing custom select', () => {
  assert.match(preferencesSource, /import PrefsSelect from/)
  assert.match(preferencesSource, /<PrefsSelect\b/)
  assert.doesNotMatch(preferencesSource, /<select\b/)
})

test('visual popover reuses segmented control instead of a native select', () => {
  assert.match(visualPanelSource, /import SegmentedControl from/)
  assert.match(visualPanelSource, /<SegmentedControl\b/)
  assert.doesNotMatch(visualPanelSource, /<select\b/)
})

test('visual reset is a lightweight action rather than a full-width outlined button', () => {
  assert.doesNotMatch(visualPanelSource, /reset-visual-button/)
  assert.match(visualPanelSource, /class="visual-action"/)
  assert.match(visualPanelSource, /\.visual-action\s*\{[\s\S]*?border:\s*0;/)
})

test('custom web text colors reuse the existing swatch language', () => {
  assert.match(preferencesSource, /class="prefs-swatch"/)
  assert.match(visualPanelSource, /class="plain-color-swatch"/)
  assert.match(visualPanelSource, /\.plain-color-swatch input\[type='color'\]/)
})
