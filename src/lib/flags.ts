// Feature flags parsed from query params once at startup.
//
// ?minimal=1      Static "ECHO OK" page — bypasses React entirely.
//                 Use to verify the HTML/CSS shell loads without any component code.
//
// ?noMotion=1     Disable motion/react AnimatePresence and wrappers in the main
//                 route; inner motion.* components still exist but are already
//                 instant via MotionConfig reducedMotion="always".
//                 Use to isolate whether the motion engine is the freeze cause.
//
// ?noImages=1     Skip EvidenceArtifact <img> loading.
//
// ?noHeader=1     Skip HeaderNoc rendering.
//
// ?noDashboard=1  After login, show only plain navigation buttons — no Dashboard,
//                 VaultCard, FragmentChain components.
//
// ?noVault=1      Prevent VaultDetail from opening.
//
// ?debugPerf=1    Show the DOM-based stage panel (echoBoot div at the top).
//                 Last render checkpoint is always visible, even if React is hung.
//
// ?fastIntro=1    Instant TerminalPanel — skip typewriter, show all lines at once.
//
// ?effects=1      Re-enable CSS effects (backdrop-filter, glitch, pulse-cyan) and
//                 motion animations (disables safe-render and reducedMotion).

function q(name: string): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(name) === "1";
}

export const flags = {
  minimal: q("minimal"),
  noMotion: q("noMotion"),
  noImages: q("noImages"),
  noHeader: q("noHeader"),
  noDashboard: q("noDashboard"),
  noVault: q("noVault"),
  debugPerf: q("debugPerf"),
  fastIntro: q("fastIntro"),
  effects: q("effects"),
} as const;
