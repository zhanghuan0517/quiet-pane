import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createPlainViewCss,
  normalizePlainViewStyle,
  resolvePlainViewPalette
} from '../src/shared/plainViewStyle.js'
import {
  normalizeTransparencyPrefs,
  resolveEffectiveOpacity
} from '../src/shared/transparencyPrefs.js'
import { normalizeWebPrefs, sanitizeWebPrefsPatch } from '../src/main/webPrefs.js'
import { validatePopoverAction, validatePopoverSnapshot } from '../src/shared/popoverProtocol.js'

test('旧版过低的界面不透明度会迁移到 60% 安全下限', () => {
  const prefs = normalizeTransparencyPrefs({
    windowEnabled: true,
    contentEnabled: true,
    contentLevel: 0.32
  })

  assert.equal(prefs.contentLevel, 0.6)
  assert.equal(resolveEffectiveOpacity(prefs).interfaceOpacity, 0.6)
  assert.equal(normalizeTransparencyPrefs({ contentLevel: 1 }).contentLevel, 1)
})

test('网页素览视觉设置会被规范化并进入网页偏好', () => {
  const patch = sanitizeWebPrefsPatch({
    plainTextMode: 'custom',
    plainTextColor: '#AABBCC',
    plainContrastEnabled: false,
    plainScrimLevel: 0.9
  })
  const prefs = normalizeWebPrefs(patch, { platform: 'darwin' })

  assert.equal(prefs.plainTextMode, 'custom')
  assert.equal(prefs.plainTextColor, '#aabbcc')
  assert.equal(prefs.plainContrastEnabled, false)
  assert.equal(prefs.plainScrimLevel, 0.65)
})

test('自动高对比素览同时提供文字颜色、描边和阅读衬底', () => {
  const css = createPlainViewCss({ plainTextMode: 'auto', plainScrimLevel: 0.34 })

  assert.match(css, /color: #ffffff !important/)
  assert.match(css, /background-color: rgba\(8, 10, 18, 0\.34\) !important/)
  assert.match(css, /text-shadow:/)
  assert.doesNotMatch(css, /desktopCapturer|getDisplayMedia|screenCapture/i)
})

test('深色文字使用浅色衬底，自定义设置可关闭对比描边', () => {
  const darkPalette = resolvePlainViewPalette({ plainTextMode: 'dark' })
  const custom = normalizePlainViewStyle({
    plainTextMode: 'custom',
    plainTextColor: '#123456',
    plainContrastEnabled: false
  })
  const customCss = createPlainViewCss(custom)

  assert.equal(darkPalette.textColor, '#17191f')
  assert.match(darkPalette.scrimColor, /^rgba\(255, 255, 255,/)
  assert.match(customCss, /color: #123456 !important/)
  assert.match(customCss, /text-shadow: none !important/)
})

test('视觉弹窗协议接受新增控制项和一键恢复动作', () => {
  const snapshot = {
    id: 'visual',
    merged: false,
    windowEnabled: true,
    contentEnabled: true,
    contentToggleDisabled: false,
    contentLevel: 0.85,
    zoom: 1,
    wheelSpeed: 1,
    plainView: true,
    plainTextMode: 'auto',
    plainTextColor: '#f7f8ff',
    plainContrastEnabled: true,
    plainScrimLevel: 0.34,
    hideMedia: false,
    theme: {
      isDark: true,
      cssVars: {
        panelBg: '#111111',
        toolbarBorder: '#333333',
        textPrimary: '#ffffff',
        textSecondary: '#bbbbbb'
      }
    }
  }

  assert.deepEqual(validatePopoverSnapshot(snapshot), { ok: true })
  assert.deepEqual(validatePopoverAction({ id: 'visual', action: 'reset-visual' }), {
    ok: true
  })
  assert.deepEqual(
    validatePopoverAction({ id: 'visual', action: 'set-content-level', value: 0.2 }),
    { ok: false, reason: 'invalid-content-level' }
  )
})
