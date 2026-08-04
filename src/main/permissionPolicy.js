import { session } from 'electron'

export function installDefaultSessionPolicy(targetSession = session.defaultSession) {
  targetSession.setPermissionCheckHandler(() => false)
  targetSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false)
  })

  targetSession.setDevicePermissionHandler?.(() => false)

  targetSession.on('will-download', (event) => {
    event.preventDefault()
  })
}
