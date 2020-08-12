const map = Object.create(null);

export function kebabCase(name) {
  if (name in map) {
    return map[name];
  }
  const result = name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
  map[name] = result;
  return result;
}