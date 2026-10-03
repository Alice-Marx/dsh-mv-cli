/**
 * Keeps the panel scrollable inside the Harness frame (0.8.1). The centre column that hosts plugin panels is
 * `display:flex; flex-direction:column; overflow:hidden`, so the panel root must be its own scroll container.
 * mv.css does that with flex + height:100% + overflow-y:auto; this covers hosts that wrap the panel in an
 * unsized block (pin the root to the clipping ancestor) and undoes programmatic scrolls of that ancestor.
 */
/** First ancestor that clips or scrolls vertically (null = the page scrolls). */
export function clippingAncestor(el, style = node => getComputedStyle(node)) {
  for (let node = el?.parentElement; node && node !== node.ownerDocument?.documentElement && node !== node.ownerDocument?.body; node = node.parentElement) {
    const overflow = style(node).overflowY
    if (overflow !== 'visible') return { node, overflow }
  }
  return null
}
/** Height (px string or '') the root needs so it fits inside a clipping (overflow:hidden) host. */
export function hostHeight({ overflow, room, rootHeight, pinned }) {
  if (overflow !== 'hidden' && overflow !== 'clip') return ''
  if (!(room > 120)) return pinned
  return !pinned && Math.abs(rootHeight - room) <= 1 ? '' : `${Math.floor(room)}px`
}
export function fitToHost(el) {
  if (!el || typeof ResizeObserver === 'undefined') return undefined
  let raf = 0
  const clip = clippingAncestor(el)
  const fit = () => {
    raf = 0
    if (clip) {
      if ((clip.overflow === 'hidden' || clip.overflow === 'clip') && clip.node.scrollTop) clip.node.scrollTop = 0
      const room = clip.node.getBoundingClientRect().bottom - el.getBoundingClientRect().top
      const height = hostHeight({ overflow: clip.overflow, room, rootHeight: el.offsetHeight, pinned: el.style.height })
      if (el.style.height !== height) el.style.height = height
    }
    el.style.setProperty('--mv-view-h', `${el.clientHeight}px`)
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(fit) }
  fit()
  const observer = new ResizeObserver(schedule)
  observer.observe(el)
  if (clip) observer.observe(clip.node)
  const onHostScroll = () => { if (clip.node.scrollTop) schedule() }
  clip?.node.addEventListener('scroll', onHostScroll, { passive: true })
  globalThis.addEventListener('resize', schedule)
  return () => { cancelAnimationFrame(raf); observer.disconnect(); clip?.node.removeEventListener('scroll', onHostScroll); globalThis.removeEventListener('resize', schedule) }
}
