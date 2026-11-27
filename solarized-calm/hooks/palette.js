// Solarized's neutrals, re-hued. Solarized is defined in CIELAB: each base tone has
// a fixed lightness, and that lightness is what keeps contrast low. So the whole
// ground can turn to any hue in CIE LCh while keeping each tone's lightness and
// chroma. HUE is the LCh hue angle; null keeps Solarized's own blue-teal (~237).
// Set from Claude's terracotta below.
export const HUE = hueOf('#d97757') // Claude's terracotta, ~44

// Hue-only rotation in CIE LCh(ab), D65. Lightness and chroma stay put.
function hexToLab(hex) {
  const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const [r, g, b] = [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16) / 255))
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
  const f = t => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116)
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

function labToHex([L, a, b]) {
  const fy = (L + 16) / 116
  const fx = fy + a / 500
  const fz = fy - b / 200
  const inv = t => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27))
  const x = inv(fx) * 0.95047
  const y = inv(fy)
  const z = inv(fz) * 1.08883
  const gam = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
  return '#' + [
    3.2406 * x - 1.5372 * y - 0.4986 * z,
    -0.9689 * x + 1.8758 * y + 0.0415 * z,
    0.0557 * x - 0.204 * y + 1.057 * z,
  ].map(c => Math.round(Math.min(1, Math.max(0, gam(c))) * 255).toString(16).padStart(2, '0')).join('')
}

export function hueOf(hex) {
  const [, a, b] = hexToLab(hex)
  return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360
}

export function rehue(hex, hue = HUE) {
  if (hue === null) return hex
  const [L, a, b] = hexToLab(hex)
  const C = Math.hypot(a, b)
  const h = (hue * Math.PI) / 180
  return labToHex([L, C * Math.cos(h), C * Math.sin(h)])
}

const shift = anchors => Object.fromEntries(Object.entries(anchors).map(([k, v]) => [k, rehue(v)]))

export const PALETTE = {
  label: 'Solarized calm',
  // Accents keep their meaning (red stays red), so they aren't re-hued.
  roles: { accent: '#268bd2', danger: '#dc322f', success: '#859900', warning: '#b58900', pro: '#6c71c4' },
  light: {
    gray: {
      anchors: shift({
        'surface-0': '#eee8d5',
        'surface-1': '#f4eedb',
        'surface-2': '#fdf6e3',
        'text-primary': '#073642',
        'text-secondary': '#405a62',
        'text-muted': '#586e75',
      }),
    },
  },
  dark: {
    gray: {
      anchors: shift({
        'surface-0': '#00252f',
        'surface-1': '#002b36',
        'surface-2': '#073642',
        'surface-3': '#073642', // = surface-2: keeps highlight chips over 3:1 at warm hues
        'text-primary': '#cad3d1',
        'text-secondary': '#93a1a1',
        'text-muted': '#839496',
      }),
    },
  },
}

// Chat prose, softer than UI chrome; re-hued with the rest.
export const MESSAGE_TEXT = {
  dark: { assistant: rehue('#9fadad'), user: rehue('#a7b4b3') },
  light: { assistant: rehue('#3b525a'), user: rehue('#2f474f') },
}
