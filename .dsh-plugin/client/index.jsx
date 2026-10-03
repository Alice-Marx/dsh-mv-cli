/**
 * Desktop client entry of @ljwei-stak/dsh-mv-cli: mounts the Typert remote
 * contribution and registers the "MV 放映室" workbench panel.
 */
import React from 'react'
import { MvPanel } from './mv-panel.jsx'
import { MV_CLIENT_REMOTE, MV_REMOTE_NAMESPACE, MV_REMOTE_PACKAGE } from '../shared/mv-remote.mjs'

export const PLUGIN_NAME = 'dsh-mv'
export const PANEL = 'dsh-mv.main'
export const inject = ['remote']

function MvIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" />
      <path d="M4 6l2 2-2 2M7.5 10.5H11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Methods the panel calls; each returns the double-wrapped remote result. */
export function panelApi(remote) {
  const service = remote[MV_REMOTE_NAMESPACE]
  return {
    info: () => service.info(),
    packLoad: request => service.packLoad(request),
    packRead: request => service.packRead(request),
    packTemplate: request => service.packTemplate(request),
    audioRead: request => service.audioRead(request),
    ffmpegInfo: request => service.ffmpegInfo(request),
    audioConvert: request => service.audioConvert(request),
    aiPackCreate: request => service.aiPackCreate(request),
    packUploadBegin: request => service.packUploadBegin(request),
    packUploadWrite: request => service.packUploadWrite(request),
    packUploadFinish: request => service.packUploadFinish(request),
    lyricsLookup: request => service.lyricsLookup(request),
    engineInfo: request => service.engineInfo(request),
    engineProbe: request => service.engineProbe(request),
    engineInstall: request => service.engineInstall(request),
    engineModel: request => service.engineModel(request),
    engineTranscribe: request => service.engineTranscribe(request),
    jobRead: request => service.jobRead(request),
    jobCancel: request => service.jobCancel(request),
    packWriteText: request => service.packWriteText(request),
    analysisRead: request => service.analysisRead(request),
    dshpvAsset: request => service.dshpvAsset(request),
    workshopIndex: request => service.workshopIndex(request),
    workshopCover: request => service.workshopCover(request),
    workshopInstall: request => service.workshopInstall(request),
    workshopUninstall: request => service.workshopUninstall(request),
    workshopInstalled: request => service.workshopInstalled(request),
    workshopPublish: request => service.workshopPublish(request),
  }
}

/**
 * Optional Harness client services for "用 AI 制作新 MV", looked up lazily
 * when the user acts (workspaces, sessions, uiWorkspace, remote.session).
 * Missing services make the dialog fall back to copy & paste.
 */
export function harnessServices(ctx) {
  return Object.freeze({
    get(name) {
      if (!['workspaces', 'sessions', 'uiWorkspace', 'remote', 'layout'].includes(name)) return undefined
      try { return typeof ctx?.get === 'function' ? ctx.get(name) : undefined } catch { return undefined }
    },
  })
}

const OPEN_BUTTON = Object.freeze({ border: '1px solid #ffaf5f', background: 'transparent', color: 'inherit', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', font: 'inherit', fontSize: 12 })

function OpenMvPanel({ subject, openPanel }) {
  if (subject?.kind !== 'bundle' || subject.pkg?.name !== MV_REMOTE_PACKAGE) return null
  return <button type="button" style={OPEN_BUTTON} onClick={openPanel}>打开 MV 放映室</button>
}

const UI_INJECT = ['slots', 'remote', `remote.${MV_REMOTE_NAMESPACE}`, 'layout']

/**
 * Registers the panel, sidebar entry and open action for as long as this client runs.
 *
 * Not gated on `configForms.whileServed`: the Host's settings describe only lists
 * entries whose Config declares `.volatile()` fields, and dsh-mv's Config has none,
 * so a `whileServed(['dsh-mv'])` gate never fired and nothing was registered (0.1.1).
 * The client half already lives and dies with this bundle, which is the gate we need.
 */
export function registerUi(ctx) {
  const api = Object.freeze(panelApi(ctx.remote))
  const harness = harnessServices(ctx)
  const served = (slot, item, component, label) => ctx.effect(
    () => ctx.slots.inject(slot, () => ctx.slots.register(item, component)), `dsh-mv: ${label}`)
  served('main', { name: 'main', key: PANEL, inject: () => ({ api, harness }) }, MvPanel, 'main workspace')
  served('sidebar.panellist', { name: 'sidebar.panellist', id: PANEL, order: 60, label: 'MV 放映室' }, MvIcon, 'sidebar entry')
  served('plugins.detail.actions', {
    name: 'plugins.detail.actions', id: 'dsh-mv-open-panel', order: 40,
    inject: () => ({ openPanel: () => ctx.layout.selectPanel(PANEL) }),
  }, OpenMvPanel, 'bundle open action')
}

export async function apply(ctx) {
  // Mount first; the namespace becomes injectable only after its descriptors are registered.
  const disposeRemote = await ctx.remote.$mount(MV_CLIENT_REMOTE)
  const ui = ctx.inject(UI_INJECT, registerUi)
  try {
    await ui
  } catch (error) {
    await ui.dispose?.()
    await disposeRemote?.()
    throw error
  }
  return async () => {
    await ui.dispose?.()
    await disposeRemote?.()
  }
}
