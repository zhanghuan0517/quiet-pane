import { session } from 'electron'
import { installSessionPolicy } from './permissionPolicyCore.mjs'

export function installDefaultSessionPolicy(targetSession = session.defaultSession) {
  installSessionPolicy(targetSession)
}

export { installSessionPolicy }
