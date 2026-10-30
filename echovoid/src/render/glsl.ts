import common from './shaders/common.glsl?raw';

export { common };

/** Parte un archivo .glsl en secciones marcadas con «//@nombre». */
export function sections(src: string): Record<string, string> {
  const out: Record<string, string> = {};
  let name = '';
  for (const line of src.split('\n')) {
    const m = /^\/\/@(\w+)/.exec(line);
    if (m) {
      name = m[1];
      out[name] = '';
    } else if (name) out[name] += line + '\n';
  }
  return out;
}
