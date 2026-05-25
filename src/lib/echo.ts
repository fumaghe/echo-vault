import { challenges, FINAL_CODE } from "@/data/workshop";

export function normalizeAnswer(value: string): string {
  let v = (value ?? "").toLowerCase().trim();
  v = v.replace(/\s+/g, " ");
  v = v.replace(/_/g, "-");
  // edge03 -> edge-03
  v = v.replace(/\bedge0?(\d{1,2})\b/g, (_, n) => `edge-${n.padStart(2, "0")}`);
  v = v.replace(/\bedge-?(\d{1,2})\b/g, (_, n) => `edge-${n.padStart(2, "0")}`);
  // bb042 -> bb-042
  v = v.replace(/\bbb-?(\d{3})\b/g, (_, n) => `bb-${n}`);
  // inc4721 -> inc-4721
  v = v.replace(/\binc-?(\d{4})\b/g, (_, n) => `inc-${n}`);
  return v;
}

export function normalizeFragment(value: string): string {
  return (value ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

export function answerMatches(input: string, expected: string[]): boolean {
  const n = normalizeAnswer(input);
  if (!n) return false;
  const norm = expected.map((e) => normalizeAnswer(e));
  // tolerant: accept if every expected token is contained, or any single match
  if (norm.includes(n)) return true;
  // Multi-answer (e.g. contains both INC and BB)
  return norm.every((e) => n.includes(e)) && norm.length > 1
    ? norm.every((e) => n.includes(e))
    : false;
}

export function singleAnswerMatch(input: string, expected: string[]): boolean {
  const n = normalizeAnswer(input);
  if (!n) return false;
  return expected.some((e) => {
    const ne = normalizeAnswer(e);
    return n === ne || n.includes(ne);
  });
}

export function fragmentMatches(input: string, expected: string): boolean {
  return normalizeFragment(input) === normalizeFragment(expected);
}

export function finalCodeMatches(input: string): boolean {
  return normalizeFragment(input).replace(/-/g, "") === FINAL_CODE.replace(/-/g, "");
}

export function challengeById(id: string) {
  return challenges.find((c) => c.id === id);
}
