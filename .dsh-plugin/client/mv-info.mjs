/** Host status for the panel and the error text shown for failed remote calls. */
import { remoteErrorText, unwrapRemote } from './remote-state.mjs'

const text = value => typeof value === 'string' ? value.trim() : ''

export async function loadInfo(api) {
  const info = unwrapRemote(await api.info(), '无法读取 MV 插件状态。')
  if (!info || typeof info !== 'object') throw new Error('MV 插件状态格式无效。')
  return info
}

export const errorText = (error, fallback) => remoteErrorText(text(error?.message), fallback)
