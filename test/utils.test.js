const test = require("ava");
const { getMaxIndexLength, indent } = require("../lib/utils.js");

test.todo("addColorToData: TODO");

test.todo("colorMultilineString: TODO");

test("getMaxIndexLength: should return 0 for empty object", (t) => {
  t.is(getMaxIndexLength({}), 0);
});

test("getMaxIndexLength: should return longest key length", (t) => {
  const d = {
    batman: "Bruce Wayne",
    superman: "Clark Kent",
    wonderwoman: "Diana Prince",
  };
  t.is(getMaxIndexLength(d), 11);
});

test("getMaxIndexLength: skips undefined values", (t) => {
  const d = {
    batman: "Bruce Wayne",
    wonderwoman: undefined,
  };
  t.is(getMaxIndexLength(d), 6);
});

test("getMaxIndexLength: handles mixed value types", (t) => {
  const d = {
    number: 42,
    boolean: true,
    array: [1, 2, 3],
    object: { nested: true },
    string: "string",
  };
  t.is(getMaxIndexLength(d), 7);
});

test("indent: should return empty string", (t) => {
  t.is(indent(0), "");
});

test("indent: should return single space", (t) => {
  t.is(indent(1), " ");
});

test("indent: should return multiple spaces", (t) => {
  t.is(indent(5), "     ");
});

test("indent: should handle negative values", (t) => {
  t.is(indent(-1), "");
});

test.todo("indentLines: TODO");

test.todo("isPrintable: TODO");

test.todo("isSerializable: TODO");

test.todo("renderToArray: TODO");
