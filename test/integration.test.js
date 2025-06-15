const test = require("ava");
const path = require("node:path");
const { writeFileSync, unlinkSync } = require("node:fs");
const { deepEqualMultiline } = require("./helpers");
const slugify = require("slugify");

const binPath = path.join(__dirname, "../bin/superprettyjson.js");
const data = {
  message: "hello world",
  items: [1, 2, 3],
  nested: {
    number: 37,
    "more-nests": {
      truthy: true,
      falsey: false,
    },
  },
};
const expected = [
  "message: hello world",
  "items: ",
  "  - 1",
  "  - 2",
  "  - 3",
  "nested: ",
  "  number:     37",
  "  more-nests: ",
  "    truthy: true",
  "    falsey: false",
];

test("integration: stream via stdin", async (t) => {
  // Using dynamic import due to CommonJS: https://github.com/sindresorhus/execa/issues/489
  const { execa } = await import("execa");

  try {
    const { stdout: output } = await execa({ input: JSON.stringify(data) })`${binPath} --nocolor=1`;
    deepEqualMultiline(t, output, expected);
  } catch (e) {
    t.fail(e.message);
  }
});

test("integration: file", async (t) => {
  // Using dynamic import due to CommonJS: https://github.com/sindresorhus/execa/issues/489
  const { execa } = await import("execa");

  const testTitle = slugify(t.title, { lower: true, strict: true });
  const fixturePath = path.join(__dirname, `test-fixture_${testTitle}.json`);

  t.notThrows(() => {
    writeFileSync(fixturePath, JSON.stringify(data));
  });

  try {
    const { stdout: output } = await execa`node ${binPath} --nocolor=1 ${fixturePath}`;
    deepEqualMultiline(t, output, expected);
  } catch (e) {
    t.fail(e.message);
  } finally {
    t.notThrows(() => {
      unlinkSync(fixturePath);
    });
  }
});

test("integration: file not found", async (t) => {
  // Using dynamic import due to CommonJS: https://github.com/sindresorhus/execa/issues/489
  const { execa } = await import("execa");

  try {
    await execa`node ${binPath} --nocolor=1 not_found.json`;
  } catch (e) {
    t.is(e.exitCode, 1);
    t.is(e.stderr, "Error: File 'not_found.json' does not exist");
  }
});

test("integration: file with invalid JSON", async (t) => {
  // Using dynamic import due to CommonJS: https://github.com/sindresorhus/execa/issues/489
  const { execa } = await import("execa");
  const invalidJSON = `{"repo":"revett/superprettyjson","keywords":["cli","json",]}`;

  const testTitle = slugify(t.title, { lower: true, strict: true });
  const fixturePath = path.join(__dirname, `test-fixture_${testTitle}.json`);

  t.notThrows(() => {
    writeFileSync(fixturePath, invalidJSON);
  });

  try {
    await execa`node ${binPath} --nocolor=1 ${fixturePath}`;
  } catch (e) {
    t.is(e.exitCode, 1);
    t.is(e.stderr, "Error: Not valid JSON!");
  } finally {
    t.notThrows(() => {
      unlinkSync(fixturePath);
    });
  }
});
