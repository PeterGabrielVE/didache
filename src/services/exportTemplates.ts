import { COLORS } from '../constants/theme';
import { DYNAMIC_CATEGORIES } from '../data/dynamics';
import { PRAYER_CATEGORIES } from '../data/prayers';
import type { GroupDynamic, Prayer, Song } from '../types/resources';
import { parseChordLine, transposeChord } from '../utils/chords';

// Plantillas HTML para exportar recursos a PDF (expo-print)

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Párrafos separados por línea en blanco; saltos simples dentro del párrafo
function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function page(title: string, subtitle: string | null, body: string) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @page { margin: 24mm 18mm; }
  body { font-family: -apple-system, Roboto, 'Segoe UI', Arial, sans-serif; color: ${COLORS.TEXT}; font-size: 14px; line-height: 1.55; }
  .tag { color: ${COLORS.PRIMARY}; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  h1 { color: ${COLORS.HEADING}; font-size: 24px; margin: 4px 0 20px; }
  h2 { color: ${COLORS.HEADING}; font-size: 15px; margin: 20px 0 6px; }
  p { margin: 0 0 12px; }
  ol, ul { margin: 0 0 12px; padding-left: 20px; }
  li { margin-bottom: 4px; }
  .meta { display: flex; gap: 24px; margin-bottom: 8px; }
  .meta b { display: block; color: ${COLORS.HEADING}; }
  .box { background: ${COLORS.SECONDARY}; border-left: 3px solid ${COLORS.PRIMARY}; padding: 10px 14px; }
  .line { margin: 0; white-space: pre-wrap; }
  .gap { height: 14px; }
  .seg { display: inline-flex; flex-direction: column; vertical-align: bottom; }
  .chord { color: ${COLORS.PRIMARY}; font-weight: 700; font-size: 12px; min-height: 16px; padding-right: 4px; }
  .lyric { white-space: pre; }
  footer { margin-top: 32px; color: ${COLORS.MUTED}; font-size: 10px; text-align: center; }
</style></head>
<body>
  ${subtitle ? `<div class="tag">${escapeHtml(subtitle)}</div>` : ''}
  <h1>${escapeHtml(title)}</h1>
  ${body}
  <footer>Didaché · recursos para catequistas</footer>
</body></html>`;
}

export function prayerHtml(prayer: Prayer) {
  return page(prayer.title, PRAYER_CATEGORIES[prayer.category], paragraphs(prayer.text));
}

export function dynamicHtml(d: GroupDynamic) {
  const list = (items: string[], tag: 'ol' | 'ul') =>
    `<${tag}>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</${tag}>`;
  const body = `
    <p>${escapeHtml(d.summary)}</p>
    <div class="meta">
      <div><b>Duración</b>${escapeHtml(d.duration)}</div>
      <div><b>Participantes</b>${escapeHtml(d.groupSize)}</div>
    </div>
    <h2>Objetivo</h2>${paragraphs(d.objective)}
    ${d.materials.length ? `<h2>Materiales</h2>${list(d.materials, 'ul')}` : ''}
    <h2>Desarrollo</h2>${list(d.steps, 'ol')}
    ${d.reflection ? `<h2>Para reflexionar</h2><div class="box">${paragraphs(d.reflection)}</div>` : ''}`;
  return page(d.title, DYNAMIC_CATEGORIES[d.category], body);
}

// Exporta con el mismo tono y la misma opción de acordes que se ven en pantalla
export function songHtml(song: Song, semitones: number, showChords: boolean) {
  const lines = song.lyrics.split('\n').map((line) => {
    if (!line.trim()) return '<div class="gap"></div>';
    const segments = parseChordLine(line);
    if (!showChords || segments.every((s) => s.chord === null)) {
      return `<p class="line">${escapeHtml(segments.map((s) => s.text).join(''))}</p>`;
    }
    const html = segments
      .map(
        (s) =>
          `<span class="seg"><span class="chord">${
            s.chord ? escapeHtml(transposeChord(s.chord, semitones)) : '&nbsp;'
          }</span><span class="lyric">${escapeHtml(s.text) || '&nbsp;'}</span></span>`,
      )
      .join('');
    return `<div class="line">${html}</div>`;
  });
  const key = song.songKey ? `Tono: ${transposeChord(song.songKey, semitones)}` : null;
  const subtitle = [song.author, key].filter(Boolean).join(' · ') || 'Cancionero';
  return page(song.title, subtitle, lines.join(''));
}
