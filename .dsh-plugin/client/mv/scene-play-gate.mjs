/** Queue transport until resource loading / bounded preparation has finished.
 * Cancelling or switching owners makes an older play request inert. */
export class ScenePlayGate {
  constructor() { this.sequence = 0; this.pending = false }
  cancel() { this.sequence++; this.pending = false }
  async play(load, isCurrent, start) {
    const id = ++this.sequence
    this.pending = true
    try {
      await load
      if (id !== this.sequence || !isCurrent()) return false
      await start()
      return id === this.sequence && isCurrent()
    } finally { if (id === this.sequence) this.pending = false }
  }
}
