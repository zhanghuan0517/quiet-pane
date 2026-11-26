const { execFileSync } = require('node:child_process')
const { join } = require('node:path')
const PRIVACY_USAGE_KEYS = require('./privacyUsageKeys.cjs')

module.exports = async function removeUnusedPrivacyUsageDescriptions(context) {
  if (context.electronPlatformName !== 'darwin') return

  const appName = `${context.packager.appInfo.productFilename}.app`
  const infoPlist = join(context.appOutDir, appName, 'Contents', 'Info.plist')

  for (const key of PRIVACY_USAGE_KEYS) {
    try {
      execFileSync('/usr/bin/plutil', ['-remove', key, infoPlist], { stdio: 'ignore' })
    } catch {
      // Electron 版本不同，默认 Info.plist 可能没有对应键；缺失即满足目标。
    }
  }
}
