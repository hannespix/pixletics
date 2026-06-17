// Gemeinsame Helfer für die experimentellen neuronalen Stimmen (Kokoro & MMS).
// Vereinheitlicht die Fortschrittsanzeige beim Modell-Download (transformers.js
// progress_callback) für eine konsistente UI.

export const mb = (b) => (b / 1048576).toFixed(1);
export const shortFile = (f) => String(f).split('/').pop();

// Erzeugt einen transformers.js-kompatiblen progress_callback.
//   say(text)   – Textstatus für die UI
//   prog(pct)   – Gesamtfortschritt 0..100 (oder null = unbestimmt)
//   label       – Kopfzeile, z. B. "2/2 · Lade Sprachmodell …"
export function makeProgressCallback(say, prog, label) {
  const files = {};
  return (p) => {
    if (!p) return;
    if (p.file && typeof p.loaded === 'number') {
      files[p.file] = { loaded: p.loaded, total: p.total || 0 };
    } else if (p.status === 'done' && p.file && files[p.file]) {
      files[p.file].loaded = files[p.file].total || files[p.file].loaded;
    }
    let loaded = 0, total = 0;
    for (const k in files) { loaded += files[k].loaded; total += files[k].total; }
    const pct = total ? Math.min(100, Math.round((loaded / total) * 100)) : null;
    prog(pct);
    const cur = p.file ? shortFile(p.file) : '';
    say(
      `${label}\n↓ ${mb(loaded)} / ${total ? mb(total) : '?'} MB${pct != null ? ` · ${pct}%` : ''}` +
      (cur ? `\nDatei: ${cur}` : '')
    );
  };
}
