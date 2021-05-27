import Color from 'color';

export function getNameColor(name) {
  const code = hashCode(name);
  const hex = intToHex(code);
  let col = Color(`#${hex}`);
  if (col.isDark()) {
    col = col.lighten(0.8);
  }
  return col.hex();
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToHex(i) {
  const c = (i & 0x00ffffff).toString(16).toUpperCase();
  return '00000'.substring(0, 6 - c.length) + c;
}
