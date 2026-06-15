// Teilen & Sichern ohne Server: Daten in einen kompakten Link oder eine Datei
// packen und wieder einlesen. Nutzt die Compression Streams API (gzip), wenn
// verfügbar (kürzere Links), sonst unkomprimiert. Funktioniert auf GitHub Pages.

function bytesToB64url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToBytes(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

// Objekt -> kompakter String (mit 1-Zeichen-Präfix: 'g' = gzip, 'r' = roh).
export async function encodeShare(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  if (typeof CompressionStream !== 'undefined') {
    const cs = new CompressionStream('gzip');
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    return 'g' + bytesToB64url(new Uint8Array(buf));
  }
  return 'r' + bytesToB64url(bytes);
}

// String -> Objekt.
export async function decodeShare(payload) {
  const tag = payload[0];
  const bytes = b64urlToBytes(payload.slice(1));
  if (tag === 'g') {
    if (typeof DecompressionStream === 'undefined') throw new Error('Dekomprimierung nicht unterstützt.');
    const ds = new DecompressionStream('gzip');
    const writer = ds.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const buf = await new Response(ds.readable).arrayBuffer();
    return JSON.parse(new TextDecoder().decode(buf));
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
