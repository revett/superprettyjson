const test = require('ava');
const { getMaxIndexLength, indent } = require("../lib/utils.js")

test("indent: should return empty string", (t) => {
  t.is(indent(0), "")
})

test("indent: should return single space", (t) => {
  t.is(indent(1), " ")
})

test("indent: should return multiple spaces", (t) => {
  t.is(indent(5), "     ")
})

test("indent: should handle negative values", (t) => {
  t.is(indent(-1), "")
})

test("getMaxIndexLength: should return 0 for empty object", (t) => {
  t.is(getMaxIndexLength({}), 0)
})

test("getMaxIndexLength: should return longest key length", (t) => {
  const d = {
    batman: "Bruce Wayne",
    superman: "Clark Kent",
    wonderwoman: "Diana Prince",
  }
  t.is(getMaxIndexLength(d), 11)
})

