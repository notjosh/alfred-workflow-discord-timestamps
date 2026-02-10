import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { clockIcon, parseQuery } from "./lib.js";

const FIXED_NOW = new Date("2026-02-10T12:00:00Z");

describe("parseQuery", () => {
  it("returns a prompt item for empty input", () => {
    const items = parseQuery("", FIXED_NOW);
    assert.equal(items.length, 1);
    assert.equal(items[0].valid, false);
    assert.match(items[0].title, /type a date/i);
  });

  it("handles <t:1770757200:t> (reverse mode with format code)", () => {
    const items = parseQuery("<t:1770757200:t>", FIXED_NOW);
    assert.equal(items.length, 7);
    // All titles should be formatted dates, not Discord timestamp syntax
    for (const item of items) {
      assert.ok(
        !item.title.startsWith("<t:"),
        `unexpected title: ${item.title}`,
      );
    }
  });

  it("handles <t:1770757200> (reverse mode without format code)", () => {
    const items = parseQuery("<t:1770757200>", FIXED_NOW);
    assert.equal(items.length, 7);
    for (const item of items) {
      assert.ok(
        !item.title.startsWith("<t:"),
        `unexpected title: ${item.title}`,
      );
    }
  });

  it("handles bare timestamp 1770757200 (reverse mode)", () => {
    const items = parseQuery("1770757200", FIXED_NOW);
    assert.equal(items.length, 7);
    for (const item of items) {
      assert.ok(
        !item.title.startsWith("<t:"),
        `unexpected title: ${item.title}`,
      );
    }
  });

  it("does not treat short numbers as timestamps (< 10 digits)", () => {
    const items = parseQuery("12345", FIXED_NOW);
    // Should fall through to chrono, not reverse mode
    // Either chrono parses it or it returns an error item
    if (items.length === 1) {
      // Chrono couldn't parse it
      assert.equal(items[0].valid, false);
    } else {
      // Chrono parsed it — titles should be Discord timestamp syntax
      assert.ok(items[0].title.startsWith("<t:"));
    }
  });

  it("parses 'tomorrow at 3pm' (forward mode)", () => {
    const items = parseQuery("tomorrow at 3pm", FIXED_NOW);
    assert.equal(items.length, 7);
    for (const item of items) {
      assert.match(item.title, /^<t:\d+:[a-zA-Z]>$/);
    }
  });

  it("returns an error item for unparseable input", () => {
    const items = parseQuery("gobbledygook", FIXED_NOW);
    assert.equal(items.length, 1);
    assert.equal(items[0].valid, false);
    assert.match(items[0].title, /couldn't parse/i);
  });
});

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
