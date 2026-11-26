import { getMainWindow } from './windowManager.js'
import * as preferencesWindow from './preferencesWindow.js'
import { applyContentOpacity } from './webviewManager.js'
import { resolveFramePolicy } from '../shared/framePolicy.js'

const DEFAULT_VIBRANCY = 'under-window'
const DEFAULT_VISUAL_EFFECT_STATE = 'active'

export function resolveCurrentFramePolicy(effectiveOpacity) {
  return resolveFramePolicy({
    effectiveOpacity,
    borderlessActive: false
  })
}

export function applyShadowPolicy(shouldHide) {
  const win = getMainWindow()
  if (!win) return
  win.setHasShadow(!shouldHide)
}

function applyWindowMaterial(win, shellBackgroundHidden) {
  if (typeof win.setVibrancy === 'function') {
    win.setVibrancy(shellBackgroundHidden ? null : DEFAULT_VIBRANCY)
  }
  if (typeof win.setVisualEffectState === 'function') {
    win.setVisualEffectState(shellBackgroundHidden ? 'inactive' : DEFAULT_VISUAL_EFFECT_STATE)
  }
}

export function applyTransparency(effectiveOpacity) {
  const win = getMainWindow()
  const framePolicy = resolveCurrentFramePolicy(effectiveOpacity)
  if (!win || win.isDestroyed?.()) return framePolicy
  const shellBackgroundHidden = effectiveOpacity.shellBackgroundHidden === true
  win.setHasShadow(!framePolicy.shouldHideShadow)
  applyWindowMaterial(win, shellBackgroundHidden)
  win.setOpacity(1)
  // 网页正文与 QuietPane 的工具栏界面分层：用户淡化界面时，正文仍保持 100% 清晰。
  // 老板键/自动隐藏仍可通过 webviewManager 自己的临时 multiplier 隐藏网页内容。
  applyContentOpacity(1)
  return framePolicy
}

export function hideWindow() {
  preferencesWindow.hideForOwnerHide()
  const win = getMainWindow()
  if (!win || win.isDestroyed?.()) return
  win.setOpacity(0)
  win.hide()
}

export function showWindow() {
  const win = getMainWindow()
  if (!win) return
  win.show()
  fadeOpacityTo(1, 200)
}

function fadeOpacityTo(target, durationMs) {
  const win = getMainWindow()
  if (!win) return
  const start = win.getOpacity()
  const startTime = Date.now()
  const tick = () => {
    const elapsed = Date.now() - startTime
    const t = Math.min(1, elapsed / durationMs)
    const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
    win.setOpacity(start + (target - start) * eased)
    if (t < 1) setTimeout(tick, 16)
  }
  tick()
}
