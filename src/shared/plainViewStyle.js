export const PLAIN_TEXT_MODES = Object.freeze(['auto', 'light', 'dark', 'custom'])

export const DEFAULT_PLAIN_VIEW_STYLE = Object.freeze({
  plainTextMode: 'auto',
  plainTextColor: '#f7f8ff',
  plainContrastEnabled: true,
  plainScrimLevel: 0.34
})

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function normalizeHexColor(value, fallback = DEFAULT_PLAIN_VIEW_STYLE.plainTextColor) {
  if (typeof value !== 'string') return fallback
  const normalized = value.trim().toLowerCase()
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : fallback
}

function relativeLuminance(hex) {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
  )
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  )
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}

export function sanitizePlainViewStylePatch(patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return {}
  const out = {}
  if ('plainTextMode' in patch && PLAIN_TEXT_MODES.includes(patch.plainTextMode)) {
    out.plainTextMode = patch.plainTextMode
  }
  if ('plainTextColor' in patch) {
    const normalized = normalizeHexColor(patch.plainTextColor, null)
    if (normalized) out.plainTextColor = normalized
  }
  if ('plainContrastEnabled' in patch && typeof patch.plainContrastEnabled === 'boolean') {
    out.plainContrastEnabled = patch.plainContrastEnabled
  }
  if (
    'plainScrimLevel' in patch &&
    typeof patch.plainScrimLevel === 'number' &&
    Number.isFinite(patch.plainScrimLevel)
  ) {
    out.plainScrimLevel = clamp(patch.plainScrimLevel, 0, 0.65)
  }
  return out
}

export function normalizePlainViewStyle(value) {
  return {
    ...DEFAULT_PLAIN_VIEW_STYLE,
    ...sanitizePlainViewStylePatch(value)
  }
}

export function resolvePlainViewPalette(value) {
  const prefs = normalizePlainViewStyle(value)
  const textColor =
    prefs.plainTextMode === 'dark'
      ? '#17191f'
      : prefs.plainTextMode === 'custom'
        ? prefs.plainTextColor
        : prefs.plainTextMode === 'light'
          ? '#f7f8ff'
          : '#ffffff'
  const isDarkText = relativeLuminance(textColor) < 0.45
  return {
    ...prefs,
    textColor,
    linkColor: isDarkText ? '#005fba' : '#8fd0ff',
    outlineColor: isDarkText ? 'rgba(255, 255, 255, 0.92)' : 'rgba(0, 0, 0, 0.92)',
    scrimColor: isDarkText
      ? `rgba(255, 255, 255, ${prefs.plainScrimLevel})`
      : `rgba(8, 10, 18, ${prefs.plainScrimLevel})`
  }
}

export function createPlainViewCss(value) {
  const palette = resolvePlainViewPalette(value)
  const contrastCss = palette.plainContrastEnabled
    ? `
  text-shadow:
    -1px -1px 0 ${palette.outlineColor},
    1px -1px 0 ${palette.outlineColor},
    -1px 1px 0 ${palette.outlineColor},
    1px 1px 0 ${palette.outlineColor},
    0 1px 2px ${palette.outlineColor} !important;`
    : '\n  text-shadow: none !important;'

  return `
html,
body,
body *,
html::before,
html::after,
body::before,
body::after,
body *::before,
body *::after {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
}

html,
body {
  color: ${palette.textColor} !important;
  background-color: ${palette.scrimColor} !important;
}

body,
body p,
body div,
body span,
body section,
body article,
body main,
body header,
body footer,
body h1,
body h2,
body h3,
body h4,
body h5,
body h6,
body li,
body dt,
body dd,
body td,
body th,
body label,
body small,
body strong,
body em,
body b,
body i,
body blockquote,
body button,
body input,
body textarea,
body select,
body option {
  color: ${palette.textColor} !important;${contrastCss}
}

body a,
body a * {
  color: ${palette.linkColor} !important;
}

body input::placeholder,
body textarea::placeholder {
  color: ${palette.textColor} !important;
  opacity: 0.72 !important;
}
`.trim()
}
