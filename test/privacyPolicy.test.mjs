import test from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { installSessionPolicy } from '../src/main/permissionPolicyCore.mjs'

const require = createRequire(import.meta.url)
const PRIVACY_USAGE_KEYS = require('../build/privacyUsageKeys.cjs')

function createFakeSession() {
  const handlers = {}

  return {
    handlers,
    setPermissionCheckHandler(handler) {
      handlers.permissionCheck = handler
    },
    setPermissionRequestHandler(handler) {
      handlers.permissionRequest = handler
    },
    setDevicePermissionHandler(handler) {
      handlers.devicePermission = handler
    },
    on(eventName, handler) {
      handlers[eventName] = handler
    }
  }
}

test('installs a default-deny policy for checks, requests, devices, and downloads', () => {
  const targetSession = createFakeSession()
  installSessionPolicy(targetSession)

  assert.equal(targetSession.handlers.permissionCheck(), false)
  assert.equal(targetSession.handlers.devicePermission(), false)

  let permissionDecision = null
  targetSession.handlers.permissionRequest({}, 'media', (decision) => {
    permissionDecision = decision
  })
  assert.equal(permissionDecision, false)

  let downloadPrevented = false
  targetSession.handlers['will-download']({
    preventDefault() {
      downloadPrevented = true
    }
  })
  assert.equal(downloadPrevented, true)
})

test('works on Electron versions without a device permission handler', () => {
  const targetSession = createFakeSession()
  delete targetSession.setDevicePermissionHandler

  assert.doesNotThrow(() => installSessionPolicy(targetSession))
  assert.equal(targetSession.handlers.permissionCheck(), false)
})

test('fails closed when no Electron session is supplied', () => {
  assert.throws(() => installSessionPolicy(), /target Electron session/)
})

test('tracks every forbidden macOS privacy usage description exactly once', () => {
  const requiredKeys = [
    'NSAudioCaptureUsageDescription',
    'NSBluetoothAlwaysUsageDescription',
    'NSBluetoothPeripheralUsageDescription',
    'NSCameraUsageDescription',
    'NSDesktopFolderUsageDescription',
    'NSDocumentsFolderUsageDescription',
    'NSDownloadsFolderUsageDescription',
    'NSMicrophoneUsageDescription'
  ]

  assert.deepEqual([...PRIVACY_USAGE_KEYS].sort(), requiredKeys.sort())
  assert.equal(new Set(PRIVACY_USAGE_KEYS).size, PRIVACY_USAGE_KEYS.length)
})
