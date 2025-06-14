const test = require("ava");
const colors = require("@colors/colors/safe");
const { render, renderString } = require("../lib/superprettyjson");
const { deepEqualMultiline } = require("./helpers");

test("render: string", (t) => {
  const input = "This is a string";
  const expected = [input];
  deepEqualMultiline(t, render(input), expected);
});

test("render: string with indentation", (t) => {
  const input = "This is a string";
  const expected = [`    ${input}`];
  deepEqualMultiline(t, render(input, {}, 4), expected);
});

test("render: multiline string with indentation", (t) => {
  const input = "multiple\nlines";
  const expected = [`    """`, "      multiple", "      lines", `    """`];
  deepEqualMultiline(t, render(input, {}, 4), expected);
});

test("render: handles escaped string with conflict chars", (t) => {
  const input = "#irchannel";
  const cfg = { escape: true };
  const expected = [`    "#irchannel"`];
  deepEqualMultiline(t, render(input, cfg, 4), expected);
});

test("render: array", (t) => {
  const input = ["first string", "second string"];
  const expected = [`${colors.green("- ")}${input[0]}`, `${colors.green("- ")}${input[1]}`];
  deepEqualMultiline(t, render(input), expected);
});

test("render: function", (t) => {
  const input = ["first string", (a) => a];
  const expected = [`${colors.green("- ")}${input[0]}`, `${colors.green("- ")}function() {}`];
  deepEqualMultiline(t, render(input), expected);
});

test("render: nested array", (t) => {
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

test("render: object", (t) => {
  const input = { param1: "first string", param2: "second string" };
  const expected = [
    `${colors.green("param1: ")}${input.param1}`,
    `${colors.green("param2: ")}${input.param2}`,
  ];
  deepEqualMultiline(t, render(input), expected);
});

test("render: nested object", (t) => {
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

test("render: aligns largs object keys", (t) => {
  const input = { veryLargeParam: "first string", param: "second string" };
  const expected = [
    `${colors.green("veryLargeParam: ")}first string`,
    `${colors.green("param: ")}         second string`,
  ];
  deepEqualMultiline(t, render(input), expected);
});

test("render: respects noAlign", (t) => {
  const input = { veryLargeParam: "first string", param: "second string" };
  const expected = [
    `${colors.green("veryLargeParam: ")}first string`,
    `${colors.green("param: ")}second string`,
  ];
  deepEqualMultiline(t, render(input, { noAlign: true }), expected);
});

test("render: complex nested object", (t) => {
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

test("render: respects keysColor", (t) => {
  const input = { param1: "first string", param2: "second string" };
  const expected = [
    `${colors.blue("param1: ")}first string`,
    `${colors.blue("param2: ")}second string`,
  ];
  deepEqualMultiline(t, render(input, { keysColor: "blue" }), expected);
});

test("render: respects numberColor", (t) => {
  const input = { param1: 17, param2: 22.3 };
  const expected = [
    `${colors.green("param1: ")}${colors.red("17")}`,
    `${colors.green("param2: ")}${colors.red("22.3")}`,
  ];
  deepEqualMultiline(t, render(input, { numberColor: "red" }), expected);
});

test("render: respects positiveNumberColor", (t) => {
  const input = { param1: 17, param2: -22.3 };
  const expected = [
    `${colors.green("param1: ")}${colors.red("17")}`,
    `${colors.green("param2: ")}${colors.blue("-22.3")}`,
  ];
  deepEqualMultiline(t, render(input, { positiveNumberColor: "red" }), expected);
});

test("render: respects negativeNumberColor", (t) => {
  const input = { param1: 17, param2: -22.3 };
  const expected = [
    `${colors.green("param1: ")}${colors.blue("17")}`,
    `${colors.green("param2: ")}${colors.red("-22.3")}`,
  ];
  deepEqualMultiline(t, render(input, { negativeNumberColor: "red" }), expected);
});

test("render: outputs using rainbow keys color pattern", (t) => {
  const input = { paramLong: "first string", param2: "second string" };
  const expected = [
    `${colors.rainbow("paramLong: ")}first string`,
    `${colors.rainbow("param2: ")}   second string`,
  ];
  deepEqualMultiline(t, render(input, { keysColor: "rainbow" }), expected);
});

test("render: respects defaultIndentation", (t) => {
  const input = { param: ["first string", "second string"] };
  const expected = [
    `${colors.green("param: ")}`,
    `    ${colors.green("- ")}first string`,
    `    ${colors.green("- ")}second string`,
  ];
  deepEqualMultiline(t, render(input, { defaultIndentation: 4 }), expected);
});

test("render: respects emptyArrayMsg", (t) => {
  const input = [];
  const expected = ["(empty)"];
  deepEqualMultiline(t, render(input, { emptyArrayMsg: "(empty)" }), expected);
});

test("render: respects stringColor", (t) => {
  const input = { param1: "first string", param2: "second string" };
  const expected = [
    `${colors.green("param1: ")}${colors.red("first string")}`,
    `${colors.green("param2: ")}${colors.red("second string")}`,
  ];
  deepEqualMultiline(t, render(input, { stringColor: "red" }), expected);
});

test("render: respects multilineStringColor", (t) => {
  const input = "first line string\nsecond line string";
  const expected = [
    `${colors.red('"""')}`,
    `  ${colors.red("first line string")}`,
    `  ${colors.red("second line string")}`,
    `${colors.red('"""')}`,
  ];
  deepEqualMultiline(t, render(input, { multilineStringColor: "red" }), expected);
});

test("render: respects noColor", (t) => {
  const input = { param1: "first string", param2: "second string" };
  const expected = ["param1: first string", "param2: second string"];
  deepEqualMultiline(t, render(input, { noColor: true }), expected);
});

test("render: uses inlineArrays to output simple array", (t) => {
  const input = { installs: ["first string", "second string", false, 13] };
  const expected = [`${colors.green("installs: ")}first string, second string, false, 13`];
  deepEqualMultiline(t, render(input, { inlineArrays: true }), expected);
});

test("render: uses inlineArrays to output complex nested arrays", (t) => {
  const input = { installs: [["first string", "second string"], "third string"] };
  const expected = [
    `${colors.green("installs: ")}`,
    `  ${colors.green("- ")}first string, second string`,
    `  ${colors.green("- ")}third string`,
  ];
  deepEqualMultiline(t, render(input, { inlineArrays: true }), expected);
});

test("render: ignores object prototype", (t) => {
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

test("render: outputs number", (t) => {
  const input = 12345;
  const expected = [colors.blue("12345")];
  deepEqualMultiline(t, render(input), expected);
});

test("render: outputs truthy boolean", (t) => {
  const input = true;
  const expected = [colors.green("true")];
  deepEqualMultiline(t, render(input), expected);
});

test("render: falsy boolean", (t) => {
  const input = false;
  const expected = [colors.red("false")];
  deepEqualMultiline(t, render(input), expected);
});

test("render: null object", (t) => {
  const input = null;
  const expected = [colors.grey("null")];
  deepEqualMultiline(t, render(input), expected);
});

test("render: ignores undefined value", (t) => {
  deepEqualMultiline(t, render(undefined), []);
});

test("render: config.renderUndefined with standalone value", (t) => {
  const expected = [colors.grey("undefined")];
  deepEqualMultiline(t, render(undefined, { renderUndefined: true }), expected);
});

test("render: ignores undefined values within object", (t) => {
  const input = {
    foo: undefined,
    bar: [1, undefined, 2],
  };
  const expected = [
    `${colors.green("bar: ")}`,
    `  ${colors.green("- ")}${colors.blue(1)}`,
    `  ${colors.green("- ")}${colors.blue(2)}`,
  ];
  deepEqualMultiline(t, render(input), expected);
});

test("render: config.renderUndefined with object", (t) => {
  const input = {
    foo: undefined,
    bar: [1, undefined, 2],
  };
  const expected = [
    `${colors.green("foo: ")}${colors.grey("undefined")}`,
    `${colors.green("bar: ")}`,
    `  ${colors.green("- ")}${colors.blue(1)}`,
    `  ${colors.green("- ")}${colors.grey("undefined")}`,
    `  ${colors.green("- ")}${colors.blue(2)}`,
  ];
  deepEqualMultiline(t, render(input, { renderUndefined: true }), expected);
});

test("render: Error", (t) => {
  Error.stackTraceLimit = 1;
  const input = new Error("foo");
  const stack = input.stack.split("\n");
  const expected = [
    `${colors.green("message: ")}foo`,
    `${colors.green("stack: ")}`,
    `  ${colors.green("- ")}${stack[0]}`,
    `  ${colors.green("- ")}${stack[1]}`,
  ];
  deepEqualMultiline(t, render(input, { noEscape: true }), expected);
});

test("render: serializable items in an array inline", (t) => {
  const now = new Date();
  const input = ["a", 3, null, true, undefined, false, now];
  const expected = [
    `${colors.green("- ")}a`,
    `${colors.green("- ")}${colors.blue("3")}`,
    `${colors.green("- ")}${colors.grey("null")}`,
    `${colors.green("- ")}${colors.green("true")}`,
    `${colors.green("- ")}${colors.red("false")}`,
    `${colors.green("- ")}${now}`,
  ];
  deepEqualMultiline(t, render(input), expected);
});

test("render: date", (t) => {
  const input = new Date();
  const expected = [input.toString()];
  deepEqualMultiline(t, render(input), expected);
});

test("render: dates in object", (t) => {
  const today = new Date();
  const tomorrow = new Date();
  const input = { today, tomorrow };
  const expected = [
    `${colors.green("today: ")}   ${today.toString()}`,
    `${colors.green("tomorrow: ")}${tomorrow.toString()}`,
  ];
  deepEqualMultiline(t, render(input), expected);
});

// TODO: Go over test titles
// TODO: Group tests together that make sense
// TODO: Make input data within all tests consistent
// TODO: Move to table tests?

test("renderString: valid JSON string", (t) => {
  const input = '{"test": "OK"}';
  const expected = [`${colors.green("test: ")}OK`];
  deepEqualMultiline(t, renderString(input), expected);
});

// TODO: Migrate other existing tests from test/prettyjson_spec.js for renderString()
