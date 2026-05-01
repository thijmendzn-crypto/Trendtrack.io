const placeholderFragments = ["vul_hier", "jouw-", "jouw_", "example", "placeholder"];

export function hasRealEnvValue(value: string | undefined, prefixes: string[] = []) {
  const trimmed = value?.trim();
  if (!trimmed) return false;

  const normalized = trimmed.toLowerCase();
  if (placeholderFragments.some((fragment) => normalized.includes(fragment))) return false;

  return prefixes.length === 0 || prefixes.some((prefix) => trimmed.startsWith(prefix));
}

export function hasRealClerkKeys() {
  return (
    hasRealEnvValue(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, ["pk_test_", "pk_live_"]) &&
    hasRealEnvValue(process.env.CLERK_SECRET_KEY, ["sk_test_", "sk_live_"])
  );
}
