const test = require("ava");
const { parseFlags } = require("../lib/config.js");

test("parseFlags: returns default object with empty args", (t) => {
  const result = parseFlags({}, {});

  const expected = {
    keysColor: undefined,
    dashColor: undefined,
    defaultIndentation: undefined,
    stringColor: undefined,
    multilineStringColor: undefined,
    numberColor: undefined,
    positiveNumberColor: undefined,
    negativeNumberColor: undefined,
    noColor: undefined,
    noAlign: undefined,
    escape: undefined,
    inlineArrays: undefined,
  };

  t.deepEqual(result, expected);
});

test("parseFlags: uses flags over environment variables", (t) => {
  const args = {
    keys: "blue",
    dash: "red",
    indent: 4,
    string: "cyan",
    nocolor: true,
  };

  const env = {
    SUPERPRETTYJSON_KEYS: "green",
    SUPERPRETTYJSON_DASH: "yellow",
    SUPERPRETTYJSON_INDENT: 2,
  };

  const result = parseFlags(args, env);

  t.is(result.keysColor, "blue");
  t.is(result.dashColor, "red");
  t.is(result.defaultIndentation, 4);
});

test("parseFlags: uses environment variables when flags are empty", (t) => {
  const env = {
    SUPERPRETTYJSON_KEYS: "magenta",
    SUPERPRETTYJSON_DASH: "yellow",
    SUPERPRETTYJSON_INDENT: 6,
  };

  const result = parseFlags({}, env);

  t.is(result.keysColor, "magenta");
  t.is(result.dashColor, "yellow");
  t.is(result.defaultIndentation, 6);
});

test("parseFlags: handles a mix of flags and environment variables", (t) => {
  const args = {
    keys: "rainbow",
    indent: 8,
  };

  const env = {
    SUPERPRETTYJSON_DASH: "magenta",
    SUPERPRETTYJSON_ESCAPE: true,
  };

  const result = parseFlags(args, env);

  // Flags
  t.is(result.keysColor, "rainbow");
  t.is(result.defaultIndentation, 8);

  // Environment variables
  t.is(result.dashColor, "magenta");
  t.is(result.escape, true);

  // Missing values are undefined
  t.is(result.multilineStringColor, undefined);
  t.is(result.noAlign, undefined);
});
