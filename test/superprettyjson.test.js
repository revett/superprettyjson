const test = require("ava");
const colors = require("@colors/colors/safe");
const { render, renderString } = require("../lib/superprettyjson");
const { deepEqualMultiline } = require("./helpers");

test("render: outputs string same as input", (t) => {
  const input = "This is a string";
  const expected = [input];
  deepEqualMultiline(t, render(input), expected);
});

test("render: outputs string with indentation", (t) => {
  const input = "This is a string";
  const expected = [`    ${input}`];
  deepEqualMultiline(t, render(input, {}, 4), expected);
});

test("render: outputs multiline string with indentation", (t) => {
  const input = "multiple\nlines";
  const expected = [`    """`, "      multiple", "      lines", `    """`];
  deepEqualMultiline(t, render(input, {}, 4), expected);
});

test("render: outputs escaped string if have conflict chars", (t) => {
  const input = "#irchannel";
  const cfg = { escape: true };
  const expected = [`    "#irchannel"`];
  deepEqualMultiline(t, render(input, cfg, 4), expected);
});

test("render: outputs array of strings", (t) => {
  const input = ["first string", "second string"];
  const expected = [`${colors.green("- ")}${input[0]}`, `${colors.green("- ")}${input[1]}`];
  deepEqualMultiline(t, render(input), expected);
});

test("render: outputs function", (t) => {
  const input = ["first string", (a) => a];
  const expected = [`${colors.green("- ")}${input[0]}`, `${colors.green("- ")}function() {}`];
  deepEqualMultiline(t, render(input), expected);
});

test("render: outputs array of arrays", (t) => {
  const input = ["first string", ["nested 1", "nested 2"], "second string"];
  const expected = [
    `${colors.green("- ")}${input[0]}`,
    `${colors.green("- ")}`,
    `  ${colors.green("- ")}${input[1][0]}`,
    `  ${colors.green("- ")}${input[1][1]}`,
    `${colors.green("- ")}${input[2]}`,
  ];
  deepEqualMultiline(t, render(input), expected);
});

test("render: outputs hash of strings", (t) => {
  const input = { param1: "first string", param2: "second string" };
  const expected = [
    `${colors.green("param1: ")}${input.param1}`,
    `${colors.green("param2: ")}${input.param2}`,
  ];
  deepEqualMultiline(t, render(input), expected);
});

test("render: outputs hash of hashes", (t) => {
  const input = {
    firstParam: { subparam: "first string", subparam2: "another string" },
    secondParam: "second string",
  };
  const expected = [
    `${colors.green("firstParam: ")}`,
    `  ${colors.green("subparam: ")} first string`,
    `  ${colors.green("subparam2: ")}another string`,
    `${colors.green("secondParam: ")}second string`,
  ];
  deepEqualMultiline(t, render(input), expected);
});

test("render: outputs hash of strings with large keys", (t) => {
  const input = { veryLargeParam: "first string", param: "second string" };
  const expected = [
    `${colors.green("veryLargeParam: ")}first string`,
    `${colors.green("param: ")}         second string`,
  ];
  deepEqualMultiline(t, render(input), expected);
});

test("render: outputs hash of strings with noAlign", (t) => {
  const input = { veryLargeParam: "first string", param: "second string" };
  const expected = [
    `${colors.green("veryLargeParam: ")}first string`,
    `${colors.green("param: ")}second string`,
  ];
  deepEqualMultiline(t, render(input, { noAlign: true }), expected);
});

test("render: outputs really nested object", (t) => {
  const input = {
    firstParam: {
      subparam: "first string",
      subparam2: "another string",
      subparam3: ["different", "values", "in an array"],
    },
    secondParam: "second string",
    anArray: [{ param3: "value", param10: "other value" }],
    emptyArray: [],
  };
  const expected = [
    `${colors.green("firstParam: ")}`,
    `  ${colors.green("subparam: ")} first string`,
    `  ${colors.green("subparam2: ")}another string`,
    `  ${colors.green("subparam3: ")}`,
    `    ${colors.green("- ")}different`,
    `    ${colors.green("- ")}values`,
    `    ${colors.green("- ")}in an array`,
    `${colors.green("secondParam: ")}second string`,
    `${colors.green("anArray: ")}`,
    `  ${colors.green("- ")}`,
    `    ${colors.green("param3: ")} value`,
    `    ${colors.green("param10: ")}other value`,
    `${colors.green("emptyArray: ")}`,
    "  (empty array)",
  ];
  deepEqualMultiline(t, render(input), expected);
});

test("render: outputs hash of strings with keysColor", (t) => {
  const input = { param1: "first string", param2: "second string" };
  const expected = [
    `${colors.blue("param1: ")}first string`,
    `${colors.blue("param2: ")}second string`,
  ];
  deepEqualMultiline(t, render(input, { keysColor: "blue" }), expected);
});

test("render: outputs hash of strings with numberColor", (t) => {
  const input = { param1: 17, param2: 22.3 };
  const expected = [
    `${colors.green("param1: ")}${colors.red("17")}`,
    `${colors.green("param2: ")}${colors.red("22.3")}`,
  ];
  deepEqualMultiline(t, render(input, { numberColor: "red" }), expected);
});

test("render: outputs hash of strings with positiveNumberColor", (t) => {
  const input = { param1: 17, param2: -22.3 };
  const expected = [
    `${colors.green("param1: ")}${colors.red("17")}`,
    `${colors.green("param2: ")}${colors.blue("-22.3")}`,
  ];
  deepEqualMultiline(t, render(input, { positiveNumberColor: "red" }), expected);
});

test("render: outputs hash of strings with negativeNumberColor", (t) => {
  const input = { param1: 17, param2: -22.3 };
  const expected = [
    `${colors.green("param1: ")}${colors.blue("17")}`,
    `${colors.green("param2: ")}${colors.red("-22.3")}`,
  ];
  deepEqualMultiline(t, render(input, { negativeNumberColor: "red" }), expected);
});

test("render: outputs hash of strings with rainbow keys", (t) => {
  const input = { paramLong: "first string", param2: "second string" };
  const expected = [
    `${colors.rainbow("paramLong: ")}first string`,
    `${colors.rainbow("param2: ")}   second string`,
  ];
  deepEqualMultiline(t, render(input, { keysColor: "rainbow" }), expected);
});

test("render: outputs hash of strings with defaultIndentation", (t) => {
  const input = { param: ["first string", "second string"] };
  const expected = [
    `${colors.green("param: ")}`,
    `    ${colors.green("- ")}first string`,
    `    ${colors.green("- ")}second string`,
  ];
  deepEqualMultiline(t, render(input, { defaultIndentation: 4 }), expected);
});

test("render: outputs empty array with emptyArrayMsg", (t) => {
  const input = [];
  const expected = ["(empty)"];
  deepEqualMultiline(t, render(input, { emptyArrayMsg: "(empty)" }), expected);
});

test("render: outputs hash of strings with stringColor", (t) => {
  const input = { param1: "first string", param2: "second string" };
  const expected = [
    `${colors.blue("param1: ")}${colors.red("first string")}`,
    `${colors.blue("param2: ")}${colors.red("second string")}`,
  ];
  deepEqualMultiline(t, render(input, { keysColor: "blue", stringColor: "red" }), expected);
});

test("render: outputs multiline string with multilineStringColor", (t) => {
  const input = "first line string\nsecond line string";
  const expected = [
    `${colors.red('"""')}`,
    `  ${colors.red("first line string")}`,
    `  ${colors.red("second line string")}`,
    `${colors.red('"""')}`,
  ];
  deepEqualMultiline(t, render(input, { multilineStringColor: "red" }), expected);
});

test("render: outputs hash of strings with noColor", (t) => {
  const input = { param1: "first string", param2: "second string" };
  const expected = ["param1: first string", "param2: second string"];
  deepEqualMultiline(t, render(input, { noColor: true }), expected);
});

test("render: outputs hash of simple array with inlineArrays", (t) => {
  const input = { installs: ["first string", "second string", false, 13] };
  const expected = [`${colors.green("installs: ")}first string, second string, false, 13`];
  deepEqualMultiline(t, render(input, { inlineArrays: true }), expected);
});

test("render: outputs hash of complex array with inlineArrays", (t) => {
  const input = { installs: [["first string", "second string"], "third string"] };
  const expected = [
    `${colors.green("installs: ")}`,
    `  ${colors.green("- ")}first string, second string`,
    `  ${colors.green("- ")}third string`,
  ];
  deepEqualMultiline(t, render(input, { inlineArrays: true }), expected);
});

test("render: does not print an object prototype", (t) => {
  const Input = function () {
    this.param1 = "first string";
    this.param2 = "second string";
  };
  Input.prototype = { randomProperty: "idontcare" };
  const expected = [
    `${colors.green("param1: ")}first string`,
    `${colors.green("param2: ")}second string`,
  ];
  deepEqualMultiline(t, render(new Input()), expected);
});

// TODO: Migrate other existing tests from test/prettyjson_spec.js for render()

test("renderString: works with valid JSON string", (t) => {
  const input = '{"test": "OK"}';
  const expected = [`${colors.green("test: ")}OK`];
  deepEqualMultiline(t, renderString(input), expected);
});

// TODO: Migrate other existing tests from test/prettyjson_spec.js for renderString()
