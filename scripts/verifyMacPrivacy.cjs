const { execFileSync } = require('node:child_process')
const { existsSync } = require('node:fs')
const { join, resolve } = require('node:path')
const PRIVACY_USAGE_KEYS = require('../build/privacyUsageKeys.cjs')

function resolveInfoPlist(inputPath) {
  const resolved = resolve(inputPath)
  return resolved.endsWith('.app') ? join(resolved, 'Contents', 'Info.plist') : resolved
}

const inputPath = process.argv[2] || 'dist/mac-arm64/QuietPane.app'
const infoPlist = resolveInfoPlist(inputPath)

if (!existsSync(infoPlist)) {
  console.error(`QuietPane privacy check failed: Info.plist not found at ${infoPlist}`)
  process.exit(1)
}

const plistText = execFileSync('/usr/bin/plutil', ['-p', infoPlist], { encoding: 'utf8' })
const forbiddenKeys = PRIVACY_USAGE_KEYS.filter((key) => plistText.includes(`"${key}" =>`))

if (forbiddenKeys.length > 0) {
  console.error('QuietPane privacy check failed. Forbidden usage descriptions:')
  for (const key of forbiddenKeys) console.error(`- ${key}`)
  process.exit(1)
}

console.log(`QuietPane privacy check passed: ${infoPlist}`)
