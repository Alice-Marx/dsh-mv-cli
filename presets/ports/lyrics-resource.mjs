// Separate terms for song text: never imply that the visual code's MIT licenses Mili lyrics.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseLyrics, parseLyricsJson } from '../../.dsh-plugin/shared/mv-lyrics.mjs'
import { lyricsTiming } from '../../.dsh-plugin/shared/mv-workshop-host.mjs'

export const MILI_TERMS = 'https://projectmili.com/copyright-guidelines'
export const MILI_LYRICS_LICENSE = 'LicenseRef-Mili-NonCommercial-FanWork'

/** Existing source literals only. No JS evaluation, imports or translation generation. */
export function includeLyrics({ source, out, kind = 'js', duration, credit }) {
  const text = readFileSync(source, 'utf8')
  let cues
  if (kind === 'wallpaper') {
    const marker = 'window.LYRIC_LINES'
    const at = text.indexOf('=', text.indexOf(marker))
    if (!text.includes(marker) || at < 0) throw new Error('Unexpected wallpaper lyric data declaration')
    // Upstream stores a strict JSON array; reject expressions rather than executing the file.
    const data = JSON.parse(text.slice(at + 1).trim().replace(/;\s*$/, ''))
    if (!Array.isArray(data)) throw new Error('Expected wallpaper lyric rows')
    cues = parseLyricsJson(data.map(row => ({ time: row.start, end: row.end, en: row.en, zh: row.zh })), { duration })
  } else cues = parseLyrics(source, text, { duration })
  if (!cues.length) throw new Error('No timed lyric rows in upstream source')
  writeFileSync(join(out, 'lyrics.json'), JSON.stringify(cues, null, 2) + '\n')
  writeFileSync(join(out, 'lyrics.timing.json'), JSON.stringify(lyricsTiming(cues), null, 2) + '\n')
  writeFileSync(join(out, 'LYRICS-NOTICE.md'), `# Lyrics / translation terms\n\nSong text: Mili, world.execute(me);. ${credit}\n\nUse basis: ${MILI_TERMS} (checked 2026-10-06). This is an unofficial, free, non-commercial fan MV adaptation. The official guidelines permit non-profit / non-commercial personal derivative works; this package makes no commercial-use grant and is not an official Mili product. Music recordings and official artwork are not included.\n\nLyrics are static caption data integrated with this adaptation. The code's MIT license does not apply to Mili song text. Any commercial or broader use must follow the rights holders' own terms. Chinese caption text is retained from the credited upstream adaptation; it was not newly generated.\n`)
  return {
    lyrics: { file: 'lyrics.json', offset: 0 },
    workshop: { lyricsLicense: MILI_LYRICS_LICENSE, lyricsCredit: `Mili (song text); ${credit}`, lyricsSource: MILI_TERMS, lyricsTiming: 'lyrics.timing.json' },
    provenance: { source: source.split(/[\\/]/).pop(), sourceSha256: createHash('sha256').update(text).digest('hex'), cueCount: cues.length, terms: MILI_TERMS, usage: 'non-commercial unofficial fan MV captions', credit },
  }
}
