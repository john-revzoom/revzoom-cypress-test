export function toKeyValue(value: string) {
  const lines = value.split("\n");
  const map: Map<string, string> = new Map();
  for (let i = 0; i < lines.length; i++) {
    const string = lines[i];
    if (string) {
      const words = string.trim().split(":");
      map.set(words[0].trim(), words[1].trim());
    }
  }
  return map;
}
