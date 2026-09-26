// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { Camera } from "../core/Camera";
import { PanController } from "../core/PanController";
function pointer(
  el: HTMLElement,
  type: string,
  id: number,
  x: number,
  y: number,
) {
  const event = new Event(type);
  Object.assign(event, {
    pointerId: id,
    clientX: x,
    clientY: y,
    button: 0,
    pointerType: "mouse",
  });
  el.dispatchEvent(event);
}
it("drags ground with a fixed camera and cancels on blur, lock and second pointer", () => {
  const el = document.createElement("canvas");
  document.body.append(el);
  el.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 1440, height: 900 }) as DOMRect;
  el.setPointerCapture = vi.fn();
  el.releasePointerCapture = vi.fn();
  el.hasPointerCapture = () => true;
  const camera = new Camera(1440, 900).instance;
  camera.updateMatrixWorld(true);
  const before = camera.matrixWorld.clone();
  const emit = vi.fn();
  const pan = new PanController(el, camera, emit);
  pointer(el, "pointerdown", 1, 500, 450);
  pointer(el, "pointermove", 1, 560, 480);
  pan.update(0.016);
  expect(emit).toHaveBeenCalled();
  expect(camera.matrixWorld.equals(before)).toBe(true);
  pointer(el, "pointerdown", 2, 520, 440);
  const count = emit.mock.calls.length;
  pointer(el, "pointermove", 1, 800, 480);
  pan.update(0.016);
  expect(emit.mock.calls.length).toBe(count);
  pointer(el, "pointerup", 1, 800, 480);
  pointer(el, "pointerup", 2, 520, 440);
  pointer(el, "pointerdown", 3, 500, 450);
  pointer(el, "pointermove", 3, 600, 450);
  window.dispatchEvent(new Event("blur"));
  const after = emit.mock.calls.length;
  pan.update(1);
  expect(emit.mock.calls.length).toBe(after);
  pan.setEnabled(false);
  pointer(el, "pointerdown", 4, 500, 450);
  pointer(el, "pointermove", 4, 600, 450);
  expect(emit.mock.calls.length).toBe(after);
  pan.dispose();
  el.remove();
});
it("recovers after interrupted pointers end outside the canvas", () => {
  const el = document.createElement("canvas");
  el.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 1440, height: 900 }) as DOMRect;
  const emit = vi.fn();
  const pan = new PanController(el, new Camera(1440, 900).instance, emit);
  pointer(el, "pointerdown", 1, 500, 450);
  pointer(el, "pointerdown", 2, 520, 450);
  const up = new Event("pointerup");
  Object.assign(up, { pointerId: 1 });
  window.dispatchEvent(up);
  pointer(el, "pointerup", 2, 520, 450);
  pointer(el, "pointerdown", 3, 500, 450);
  pointer(el, "pointermove", 3, 560, 450);
  expect(emit).toHaveBeenCalled();
  pan.dispose();
});
