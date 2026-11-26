export function installSessionPolicy(targetSession) {
  if (!targetSession) throw new TypeError('A target Electron session is required')

  targetSession.setPermissionCheckHandler(() => false)
  targetSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false)
  })

  targetSession.setDevicePermissionHandler?.(() => false)

  targetSession.on('will-download', (event) => {
    event.preventDefault()
  })
}
