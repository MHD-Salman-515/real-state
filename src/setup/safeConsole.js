// src/setup/safeConsole.js
function safeStringify(obj) {
  try {
    if (typeof obj === "string") return obj;
    if (obj instanceof Error) return obj.stack || obj.message || String(obj);
    return JSON.stringify(obj, getCircularReplacer(), 2);
  } catch {
    try { return String(obj); } catch { return "[Unserializable]"; }
  }
}
function getCircularReplacer() {
  const seen = new WeakSet();
  return (_, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    return value;
  };
}
["error","warn"].forEach((method) => {
  const orig = console[method];
  console[method] = (...args) => {
    const safeArgs = args.map(a => {
      try {
        if (a && typeof a === "object" && a.nativeEvent) return "[SyntheticEvent]";
        return typeof a === "object" ? safeStringify(a) : a;
      } catch {
        return "[Unserializable]";
      }
    });
    orig(...safeArgs);
  };
});
