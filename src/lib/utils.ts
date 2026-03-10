export type ClassValue =
  | string
  | number
  | null
  | undefined
  | boolean
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

function flatten(input: ClassValue, out: string[]) {
  if (!input) return;

  if (typeof input === "string" || typeof input === "number") {
    out.push(String(input));
    return;
  }

  if (Array.isArray(input)) {
    for (const item of input) flatten(item, out);
    return;
  }

  if (typeof input === "object") {
    for (const key of Object.keys(input)) {
      if ((input as Record<string, boolean | null | undefined>)[key]) out.push(key);
    }
  }
}

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) flatten(input, out);
  return out.join(" ");
}
