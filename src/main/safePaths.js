import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'

function ensurePrivateDirectory(name) {
  const directory = join(app.getPath('userData'), name)
  mkdirSync(directory, { recursive: true })
  return directory
}

export function getBooksDirectory() {
  return ensurePrivateDirectory('Books')
}

export function getSettingsDirectory() {
  return ensurePrivateDirectory('Settings')
}
