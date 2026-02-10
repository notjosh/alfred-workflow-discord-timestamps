import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseQuery } from "./parse-query.js";

const FIXED_NOW = new Date("2026-02-10T12:00:00Z");
const OPTS = { locale: "en-US" };

describe("parseQuery", () => {
  it("returns a prompt item for empty input", () => {
    const items = parseQuery("", FIXED_NOW, OPTS);
    assert.equal(items.length, 1);
    assert.equal(items[0].valid, false);
    assert.match(items[0].title, /type a date/i);
  });

  it("handles <t:1770757200:t> (reverse mode with format code)", () => {
    const items = parseQuery("<t:1770757200:t>", FIXED_NOW, OPTS);
    assert.equal(items.length, 7);
    for (const item of items) {
      assert.ok(
        !item.title.startsWith("<t:"),
        `unexpected title: ${item.title}`,
      );
    }
  });

  it("respects locale in reverse mode (de-DE)", () => {
    const items = parseQuery("<t:1770757200:t>", FIXED_NOW, {
      locale: "de-DE",
    });
    const fullDateTime = items.find((i) => i.subtitle === "Full Date/Time");
    assert.ok(
      fullDateTime.title.includes("Dienstag"),
      `expected German day name, got: ${fullDateTime.title}`,
    );
  });

  it("handles <t:1770757200> (reverse mode without format code)", () => {
    const items = parseQuery("<t:1770757200>", FIXED_NOW, OPTS);
    assert.equal(items.length, 7);
    for (const item of items) {
      assert.ok(
        !item.title.startsWith("<t:"),
        `unexpected title: ${item.title}`,
      );
    }
  });

  it("handles bare timestamp 1770757200 (reverse mode)", () => {
    const items = parseQuery("1770757200", FIXED_NOW, OPTS);
    assert.equal(items.length, 7);
    for (const item of items) {
      assert.ok(
        !item.title.startsWith("<t:"),
        `unexpected title: ${item.title}`,
      );
    }
  });

  it("does not treat short numbers as timestamps (< 10 digits)", () => {
    const items = parseQuery("12345", FIXED_NOW, OPTS);
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
    const items = parseQuery("tomorrow at 3pm", FIXED_NOW, OPTS);
    assert.equal(items.length, 7);
    for (const item of items) {
      assert.match(item.title, /^<t:\d+:[a-zA-Z]>$/);
    }
  });

  it("returns an error item for unparseable input", () => {
    const items = parseQuery("gobbledygook", FIXED_NOW, OPTS);
    assert.equal(items.length, 1);
    assert.equal(items[0].valid, false);
    assert.match(items[0].title, /couldn't parse/i);
  });
});
