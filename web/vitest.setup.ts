import "@testing-library/jest-dom/vitest";

// jsdom implements no Pointer Events API at all — Radix UI's interactive
// primitives (Select, Slider, and others used across this design system,
// doc 07 §5) call these during pointer interaction, so every test that
// opens one needs them polyfilled. A well-known, standard gap, not
// project-specific behavior — fixed once here rather than per test file.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
