import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatRelative } from "./format-relative.js";

const FIXED_NOW = new Date("2026-02-10T12:00:00Z");

describe("formatRelative", () => {
  /** @param {number} ms */
  const future = (ms) => new Date(FIXED_NOW.getTime() + ms);
  /** @param {number} ms */
  const past = (ms) => new Date(FIXED_NOW.getTime() - ms);

  it("formats seconds", () => {
    assert.equal(
      formatRelative(future(30_000), FIXED_NOW, "en-US"),
      "in 30 seconds",
    );
    assert.equal(
      formatRelative(past(5_000), FIXED_NOW, "en-US"),
      "5 seconds ago",
    );
  });

  it("switches from seconds to minutes at 60s", () => {
    assert.equal(
      formatRelative(future(59_000), FIXED_NOW, "en-US"),
      "in 59 seconds",
    );
    assert.equal(
      formatRelative(future(61_000), FIXED_NOW, "en-US"),
      "in 1 minute",
    );
    assert.equal(
      formatRelative(past(59_000), FIXED_NOW, "en-US"),
      "59 seconds ago",
    );
    assert.equal(
      formatRelative(past(61_000), FIXED_NOW, "en-US"),
      "1 minute ago",
    );
  });

  it("formats minutes", () => {
    assert.equal(
      formatRelative(future(5 * 60_000), FIXED_NOW, "en-US"),
      "in 5 minutes",
    );
    assert.equal(
      formatRelative(past(90_000), FIXED_NOW, "en-US"),
      "1 minute ago",
    );
  });

  it("switches from minutes to hours at 60m", () => {
    assert.equal(
      formatRelative(future(59 * 60_000), FIXED_NOW, "en-US"),
      "in 59 minutes",
    );
    assert.equal(
      formatRelative(future(61 * 60_000), FIXED_NOW, "en-US"),
      "in 1 hour",
    );
    assert.equal(
      formatRelative(past(59 * 60_000), FIXED_NOW, "en-US"),
      "59 minutes ago",
    );
    assert.equal(
      formatRelative(past(61 * 60_000), FIXED_NOW, "en-US"),
      "1 hour ago",
    );
  });

  it("formats hours", () => {
    assert.equal(
      formatRelative(future(3 * 3_600_000), FIXED_NOW, "en-US"),
      "in 3 hours",
    );
    assert.equal(
      formatRelative(past(7_200_000), FIXED_NOW, "en-US"),
      "2 hours ago",
    );
  });

  it("switches from hours to days at 24h", () => {
    assert.equal(
      formatRelative(future(23 * 3_600_000), FIXED_NOW, "en-US"),
      "in 23 hours",
    );
    assert.equal(
      formatRelative(future(25 * 3_600_000), FIXED_NOW, "en-US"),
      "tomorrow",
    );
    assert.equal(
      formatRelative(past(23 * 3_600_000), FIXED_NOW, "en-US"),
      "23 hours ago",
    );
    assert.equal(
      formatRelative(past(25 * 3_600_000), FIXED_NOW, "en-US"),
      "yesterday",
    );
  });

  it("formats days", () => {
    assert.equal(
      formatRelative(future(2 * 86_400_000), FIXED_NOW, "en-US"),
      "in 2 days",
    );
    assert.equal(
      formatRelative(past(86_400_000), FIXED_NOW, "en-US"),
      "yesterday",
    );
  });

  it("formats months", () => {
    assert.equal(
      formatRelative(future(60 * 86_400_000), FIXED_NOW, "en-US"),
      "in 2 months",
    );
    assert.equal(
      formatRelative(past(45 * 86_400_000), FIXED_NOW, "en-US"),
      "last month",
    );
  });

  it("formats years", () => {
    assert.equal(
      formatRelative(future(400 * 86_400_000), FIXED_NOW, "en-US"),
      "next year",
    );
    assert.equal(
      formatRelative(past(730 * 86_400_000), FIXED_NOW, "en-US"),
      "2 years ago",
    );
  });

  it("respects locale", () => {
    assert.equal(
      formatRelative(future(3_600_000), FIXED_NOW, "de-DE"),
      "in 1 Stunde",
    );
  });
});
