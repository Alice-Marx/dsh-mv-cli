/**
 * IndexedDB store for the user's own media choices (the last audio File, lyric
 * and spectrum files). Files stay on this computer inside Harness's profile;
 * nothing is uploaded to the Host.
 */
const DB = 'dsh-mv'
const STORE = 'media'
const VERSION = 1

function request(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB 请求失败'))
  })
}

export function openMediaStore(idb = globalThis.indexedDB) {
  if (!idb) return Promise.resolve(null)
  const req = idb.open(DB, VERSION)
  req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE) }
  return request(req).catch(() => null)
}

async function tx(db, mode, fn) {
  if (!db) return undefined
  const store = db.transaction(STORE, mode).objectStore(STORE)
  return request(fn(store))
}

/** Remember a Blob/File (or a plain record) under a slot: 'audio' | 'lyrics' | 'spectrum'. */
export async function putMedia(db, slot, record) {
  try { await tx(db, 'readwrite', store => store.put({ ...record, savedAt: Date.now() }, slot)) } catch { /* quota: just not remembered */ }
}

export async function getMedia(db, slot) {
  try { return (await tx(db, 'readonly', store => store.get(slot))) ?? null } catch { return null }
}

export async function deleteMedia(db, slot) {
  try { await tx(db, 'readwrite', store => store.delete(slot)) } catch { /* ignore */ }
}
