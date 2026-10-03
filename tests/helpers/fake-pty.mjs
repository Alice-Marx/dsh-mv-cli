import { win32 } from 'node:path'
import { resolveMvLaunch } from '../../.dsh-plugin/shared/mv-terminal.mjs'

export function fakePty() {
  const spawned = []
  return {
    spawned,
    module: {
      spawn(file, args, options) {
        const proc = { file, args, options, written: [], sizes: [], killed: false, dataListeners: [], exitListeners: [] }
        proc.emit = data => proc.dataListeners.forEach(listener => listener(data))
        proc.exit = (exitCode = 0) => proc.exitListeners.forEach(listener => listener({ exitCode, signal: 0 }))
        spawned.push(proc)
        return {
          pid: 4242,
          onData: listener => { proc.dataListeners.push(listener); return { dispose() {} } },
          onExit: listener => { proc.exitListeners.push(listener); return { dispose() {} } },
          write: data => proc.written.push(data),
          resize: (cols, rows) => proc.sizes.push([cols, rows]),
          kill: () => { proc.killed = true; proc.exit(null) },
        }
      },
    },
  }
}

export function manager(createMvTerminalManager, { files = {}, ...options } = {}) {
  const pty = fakePty()
  const statPath = async path => {
    const kind = files[path]
    if (!kind) throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
    return { isFile: () => kind === 'file', isDirectory: () => kind === 'dir' }
  }
  return { pty, statPath, terminals: createMvTerminalManager({
    loadPty: () => ({ ok: true, pty: pty.module, package: '@lydell/node-pty' }),
    resolveLaunch: launch => resolveMvLaunch(launch, { statPath, joinPath: win32.join, dirnameOf: win32.dirname }),
    environment: () => ({ PATH: '/bin' }),
    setRepeating: () => ({ unref() {} }),
    clearRepeating: () => {},
    ...options,
  }) }
}
