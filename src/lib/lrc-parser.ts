/**
 * Minimal parser for the .lrc lyric format (the same timestamp format used
 * by karaoke apps and most music players): lines look like
 *   [00:12.50]Some lyric line
 * A line can carry multiple time tags (for repeated choruses), and
 * metadata tags like [ti:...] / [ar:...] are ignored since they don't
 * match the numeric time-tag pattern.
 */

export interface LyricLine {
  /** Seconds from the start of the track */
  time: number;
  text: string;
}

const TIME_TAG_3 = /\[(\d{1,2}):(\d{2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
const TIME_TAG_2 = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

export function parseLRC(content: string): LyricLine[] {
  const lines: LyricLine[] = [];

  for (const rawLine of content.split(/\r?\n/)) {
    // Try 3-part timestamp first: [HH:MM:SS] or [HH:MM:SS.fff]
    let tags = [...rawLine.matchAll(TIME_TAG_3)];
    let isThreePart = true;

    if (tags.length === 0) {
      // Fallback to 2-part timestamp: [MM:SS] or [MM:SS.fff]
      tags = [...rawLine.matchAll(TIME_TAG_2)];
      isThreePart = false;
    }

    if (tags.length === 0) continue;

    const tagRegex = isThreePart ? TIME_TAG_3 : TIME_TAG_2;
    const text = rawLine.replace(tagRegex, "").trim();
    if (!text) continue;

    for (const tag of tags) {
      if (isThreePart) {
        const hours = Number(tag[1]);
        const minutes = Number(tag[2]);
        const seconds = Number(tag[3]);
        const fraction = tag[4] ? Number(`0.${tag[4]}`) : 0;
        lines.push({ time: hours * 3600 + minutes * 60 + seconds + fraction, text });
      } else {
        const minutes = Number(tag[1]);
        const seconds = Number(tag[2]);
        const fraction = tag[3] ? Number(`0.${tag[3]}`) : 0;
        lines.push({ time: minutes * 60 + seconds + fraction, text });
      }
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}
