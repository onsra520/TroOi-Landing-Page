// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ dispose: vi.fn() }));
vi.mock("../core/Experience", () => ({
  Experience: class {
    initialize = async () => {};
    start() {}
    dispose = state.dispose;
  },
}));
vi.mock("../world/resources/AssetLibrary", () => ({ AssetLibrary: class {} }));
it("retains the live experience through repeated BFCache navigation and cleans final exit", async () => {
  document.body.innerHTML = '<div id="app"></div>';
  await import("../main");
  await vi.waitFor(() => expect(state.dispose).not.toHaveBeenCalled());
  for (let n = 0; n < 2; n++) {
    window.dispatchEvent(
      new PageTransitionEvent("pagehide", { persisted: true }),
    );
    window.dispatchEvent(
      new PageTransitionEvent("pageshow", { persisted: true }),
    );
    expect(state.dispose).not.toHaveBeenCalled();
  }
  window.dispatchEvent(
    new PageTransitionEvent("pagehide", { persisted: false }),
  );
  expect(state.dispose).toHaveBeenCalledOnce();
});
