const test = require("ava");
const colors = require("@colors/colors/safe");
const { render, renderString } = require("../lib/superprettyjson");

test("render: outputs string same as input", (t) => {
  const input = "This is a string";
  t.is(render(input), input);
});

test("render: outputs string with indentation", (t) => {
  const input = "This is a string";
  const expected = `    ${input}`;
  t.is(render(input, {}, 4), expected);
});

test("render: outputs multiline string with indentation", (t) => {
  const input = "multiple\nlines";
  const expected = `    """\n      multiple\n      lines\n    """`;
  t.is(render(input, {}, 4), expected);
});

test("render: outputs escaped string if have conflict chars", (t) => {
  const input = "#irchannel";
  const cfg = { escape: true };
  const expected = `    "#irchannel"`;
  t.is(render(input, cfg, 4), expected);
});

test("render: outputs array of strings", (t) => {
  const input = ["first string", "second string"];
  const expected = [colors.green("- ") + input[0], colors.green("- ") + input[1]].join("\n");
  t.is(render(input), expected);
});

test("render: outputs function", (t) => {
  const input = ["first string", (a) => a];
  const expected = [`${colors.green("- ")}${input[0]}`, `${colors.green("- ")}function() {}`].join(
    "\n",
  );
  t.is(render(input), expected);
});

// TODO: Migrate other existing tests from test/prettyjson_spec.js for render()

test("renderString: works with valid JSON string", (t) => {
  const input = '{"test": "OK"}';
  const expected = `${colors.green("test: ")}OK`;
  t.is(renderString(input), expected);
});

// TODO: Migrate other existing tests from test/prettyjson_spec.js for renderString()
