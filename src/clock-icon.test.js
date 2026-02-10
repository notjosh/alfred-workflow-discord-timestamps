import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { clockIcon } from "./clock-icon.js";

describe("clockIcon", () => {
  it("returns correct path for midnight (0:00)", () => {
    assert.equal(
      clockIcon(new Date("2026-01-01T00:00:00")),
      "icons/clock-00-00.png",
    );
  });

  it("returns correct path for 3:17 (rounds minutes down to 15)", () => {
    assert.equal(
      clockIcon(new Date("2026-01-01T03:17:00")),
      "icons/clock-03-15.png",
    );
  });

  it("returns correct path for 15:45 (wraps to 12h)", () => {
    assert.equal(
      clockIcon(new Date("2026-01-01T15:45:00")),
      "icons/clock-03-45.png",
    );
  });

  it("returns correct path for 12:59 (wraps hour, rounds minutes to 55)", () => {
    assert.equal(
      clockIcon(new Date("2026-01-01T12:59:00")),
      "icons/clock-00-55.png",
    );
  });
});
