/**
 * Client side of the Host remote: unwrap results and detect a Host that still
 * runs older plugin code (Harness serves the new client.js right away, but a
 * running Host keeps its imported modules until a full restart).
 */
/* global __DSH_MV_CLIENT_VERSION__ */
export const CLIENT_VERSION = typeof __DSH_MV_CLIENT_VERSION__ === 'string' ? __DSH_MV_CLIENT_VERSION__ : ''

export const STALE_HOST_MESSAGE = 'MV 插件后台版本与界面不一致，请完全退出并重启 Harness（包括托盘图标）后再使用 MV 终端。'

export function isMissingRemoteMethod(message) {
  const value = String(message ?? '')
  return /transport failure for [^:]+: HTTP 404\b/.test(value) || /Remote method \S+ is no longer mounted/.test(value)
}

export function remoteErrorText(message, fallback = '') {
  if (isMissingRemoteMethod(message)) return STALE_HOST_MESSAGE
  return String(message ?? '').trim() || fallback
}

const text = value => typeof value === 'string' ? value.trim() : ''

/**
 * The Host service answers `{ ok, value | error }` (remote-service.mjs
 * `settled`), and the Typert gateway wraps that again, so a success arrives as
 * `{ ok: true, value: { ok: true, value: result } }`.
 */
export function unwrapRemote(response, fallback) {
  if (!response?.ok) throw new Error(remoteErrorText(text(response?.error?.message) || text(response?.error), fallback))
  const inner = response.value
  if (inner && typeof inner === 'object' && typeof inner.ok === 'boolean') {
    if (!inner.ok) throw new Error(remoteErrorText(text(inner.error?.message) || text(inner.error), fallback))
    return inner.value
  }
  return inner
}

/** Banner text when Host and client versions differ ('' when they match). */
export function versionNotice({ hostVersion, clientVersion = CLIENT_VERSION, loaded = true } = {}) {
  if (!loaded || !clientVersion) return ''
  if (typeof hostVersion !== 'string' || !hostVersion) return `${STALE_HOST_MESSAGE}（界面 ${clientVersion}，后台未报告版本）`
  if (hostVersion !== clientVersion) return `${STALE_HOST_MESSAGE}（界面 ${clientVersion}，后台 ${hostVersion}）`
  return ''
}
