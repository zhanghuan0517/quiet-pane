const { app, BrowserWindow } = require('electron')
const { readFileSync, writeFileSync } = require('node:fs')
const { join } = require('node:path')

const projectRoot = join(__dirname, '..')
const resourcesDir = join(projectRoot, 'resources')
const source = readFileSync(join(resourcesDir, 'tray-icon-source.svg'), 'utf8')
const targets = [
  { size: 18, filename: 'tray-icon.png' },
  { size: 36, filename: 'tray-icon@2x.png' },
  { size: 54, filename: 'tray-icon@3x.png' }
]

app.whenReady().then(async () => {
  try {
    const renderSize = Math.max(...targets.map((target) => target.size))
    const svg = source.replace(
      'width="18" height="18"',
      `width="${renderSize}" height="${renderSize}"`
    )
    const html = `<style>html,body{margin:0;background:transparent;overflow:hidden}</style>${svg}`
    const win = new BrowserWindow({
      width: renderSize,
      height: renderSize,
      show: false,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      webPreferences: { offscreen: true }
    })
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
    const rendered = await win.webContents.capturePage()
    for (const target of targets) {
      const image = rendered.resize({
        width: target.size,
        height: target.size,
        quality: 'best'
      })
      if (image.isEmpty()) throw new Error(`无法渲染 ${target.filename}`)
      writeFileSync(join(resourcesDir, target.filename), image.toPNG())
    }
    win.destroy()
    app.quit()
  } catch (error) {
    console.error(error)
    app.exit(1)
  }
})
