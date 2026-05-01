const placeholderFragments = ["vul_hier", "jouw-", "jouw_", "example", "placeholder"];

export function hasRealEnvValue(value: string | undefined, prefixes: string[] = []) {
  const trimmed = value?.trim();
  if (!trimmed) return false;

  const normalized = trimmed.toLowerCase();
  if (placeholderFragments.some((fragment) => normalized.includes(fragment))) return false;

  return prefixes.length === 0 || prefixes.some((prefix) => trimmed.startsWith(prefix));
}
