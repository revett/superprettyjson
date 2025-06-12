require("should");
var prettyjson = process.env.EXPRESS_COV
  ? require("../lib-cov/prettyjson")
  : require("../lib/prettyjson");

var colors = require("@colors/colors/safe");

describe("prettyjson general tests", () => {
  it("should output a string exactly equal as the input", () => {
    var input = "This is a string";
    var output = prettyjson.render(input);

    output.should.equal(input);
  });

  it("should output a string with indentation", () => {
    var input = "This is a string";
    var output = prettyjson.render(input, {}, 4);

    output.should.equal("    " + input);
  });

  it("should output a multiline string with indentation", () => {
    var input = "multiple\nlines";
    var output = prettyjson.render(input, {}, 4);

    output.should.equal('    """\n      multiple\n      lines\n    """');
  });

  it("should output a escaped string if have conflict chars", () => {
    var input = "#irchannel";
    var output = prettyjson.render(
      input,
      {
        escape: true,
      },
      4,
    );

    output.should.equal('    "#irchannel"');
  });

  it("should output an array of strings", () => {
    var input = ["first string", "second string"];
    var output = prettyjson.render(input);

    output.should.equal([colors.green("- ") + input[0], colors.green("- ") + input[1]].join("\n"));
  });

  it("should output a function", () => {
    var input = ["first string", (a) => a];
    var output = prettyjson.render(input);

    output.should.equal(
      [colors.green("- ") + input[0], colors.green("- ") + "function() {}"].join("\n"),
    );
  });

  it("should output an array of arrays", () => {
    var input = ["first string", ["nested 1", "nested 2"], "second string"];
    var output = prettyjson.render(input);

    output.should.equal(
      [
        colors.green("- ") + input[0],
        colors.green("- "),
        "  " + colors.green("- ") + input[1][0],
        "  " + colors.green("- ") + input[1][1],
        colors.green("- ") + input[2],
      ].join("\n"),
    );
  });

  it("should output a hash of strings", () => {
    var input = { param1: "first string", param2: "second string" };
    var output = prettyjson.render(input);

    output.should.equal(
      [colors.green("param1: ") + "first string", colors.green("param2: ") + "second string"].join(
        "\n",
      ),
    );
  });

  it("should output a hash of hashes", () => {
    var input = {
      firstParam: { subparam: "first string", subparam2: "another string" },
      secondParam: "second string",
    };
    var output = prettyjson.render(input);

    output.should.equal(
      [
        colors.green("firstParam: "),
        "  " + colors.green("subparam: ") + " first string",
        "  " + colors.green("subparam2: ") + "another string",
        colors.green("secondParam: ") + "second string",
      ].join("\n"),
    );
  });

  it("should indent correctly the hashes keys", () => {
    var input = { veryLargeParam: "first string", param: "second string" };
    var output = prettyjson.render(input);

    output.should.equal(
      [
        colors.green("veryLargeParam: ") + "first string",
        colors.green("param: ") + "         second string",
      ].join("\n"),
    );
  });

  it("should allow to disable values aligning with longest index", () => {
    var input = { veryLargeParam: "first string", param: "second string" };
    var output = prettyjson.render(input, { noAlign: true });

    output.should.equal(
      [
        colors.green("veryLargeParam: ") + "first string",
        colors.green("param: ") + "second string",
      ].join("\n"),
    );
  });

  it("should output a really nested object", () => {
    var input = {
      firstParam: {
        subparam: "first string",
        subparam2: "another string",
        subparam3: ["different", "values", "in an array"],
      },
      secondParam: "second string",
      anArray: [
        {
          param3: "value",
          param10: "other value",
        },
      ],
      emptyArray: [],
    };

    var output = prettyjson.render(input);

    output.should.equal(
      [
        colors.green("firstParam: "),
        "  " + colors.green("subparam: ") + " first string",
        "  " + colors.green("subparam2: ") + "another string",
        "  " + colors.green("subparam3: "),
        "    " + colors.green("- ") + "different",
        "    " + colors.green("- ") + "values",
        "    " + colors.green("- ") + "in an array",
        colors.green("secondParam: ") + "second string",
        colors.green("anArray: "),
        "  " + colors.green("- "),
        "    " + colors.green("param3: ") + " value",
        "    " + colors.green("param10: ") + "other value",
        colors.green("emptyArray: "),
        "  (empty array)",
      ].join("\n"),
    );
  });

  it("should allow to configure colors for hash keys", () => {
    var input = { param1: "first string", param2: "second string" };
    var output = prettyjson.render(input, { keysColor: "blue" });

    output.should.equal(
      [colors.blue("param1: ") + "first string", colors.blue("param2: ") + "second string"].join(
        "\n",
      ),
    );
  });

  it("should allow to configure colors for numbers", () => {
    var input = { param1: 17, param2: 22.3 };
    var output = prettyjson.render(input, { numberColor: "red" });

    output.should.equal(
      [
        colors.green("param1: ") + colors.red("17"),
        colors.green("param2: ") + colors.red("22.3"),
      ].join("\n"),
    );
  });

  it("should allow to configure colors for positive numbers", () => {
    var input = { param1: 17, param2: -22.3 };
    var output = prettyjson.render(input, { positiveNumberColor: "red" });

    output.should.equal(
      [
        colors.green("param1: ") + colors.red("17"),
        colors.green("param2: ") + colors.blue("-22.3"),
      ].join("\n"),
    );
  });

  it("should allow to configure colors for negative numbers", () => {
    var input = { param1: 17, param2: -22.3 };
    var output = prettyjson.render(input, { negativeNumberColor: "red" });

    output.should.equal(
      [
        colors.green("param1: ") + colors.blue("17"),
        colors.green("param2: ") + colors.red("-22.3"),
      ].join("\n"),
    );
  });

  it("should allow to configure rainbow as color", () => {
    var input = { paramLong: "first string", param2: "second string" };
    var output = prettyjson.render(input, { keysColor: "rainbow" });

    output.should.equal(
      [
        colors.rainbow("paramLong: ") + "first string",
        colors.rainbow("param2: ") + "   second string",
      ].join("\n"),
    );
  });

  it("should allow to configure the default indentation", () => {
    var input = { param: ["first string", "second string"] };
    var output = prettyjson.render(input, { defaultIndentation: 4 });

    output.should.equal(
      [
        colors.green("param: "),
        "    " + colors.green("- ") + "first string",
        "    " + colors.green("- ") + "second string",
      ].join("\n"),
    );
  });

  it("should allow to configure the empty message for arrays", () => {
    var input = [];
    var output = prettyjson.render(input, { emptyArrayMsg: "(empty)" });

    output.should.equal(["(empty)"].join("\n"));
  });

  it("should allow to configure colors for strings", () => {
    var input = { param1: "first string", param2: "second string" };
    var output = prettyjson.render(input, {
      keysColor: "blue",
      stringColor: "red",
    });

    output.should.equal(
      [
        colors.blue("param1: ") + colors.red("first string"),
        colors.blue("param2: ") + colors.red("second string"),
      ].join("\n"),
    );
  });

  it("should allow to configure colors for multiline strings", () => {
    var input = "first line string\nsecond line string";
    var output = prettyjson.render(input, { multilineStringColor: "red" });
    output.should.equal(
      [
        colors.red('"""'),
        "  " + colors.red("first line string"),
        "  " + colors.red("second line string"),
        colors.red('"""'),
      ].join("\n"),
    );
  });

  it("should allow to not use colors", () => {
    var input = { param1: "first string", param2: ["second string"] };
    var output = prettyjson.render(input, { noColor: true });

    output.should.equal(["param1: first string", "param2: ", "  - second string"].join("\n"));
  });

  it("should allow to print simple arrays inline", () => {
    var input = { installs: ["first string", "second string", false, 13] };
    var output = prettyjson.render(input, { inlineArrays: true });

    output.should.equal(colors.green("installs: ") + "first string, second string, false, 13");

    input = { installs: [["first string", "second string"], "third string"] };
    output = prettyjson.render(input, { inlineArrays: true });

    output.should.equal(
      [
        colors.green("installs: "),
        "  " + colors.green("- ") + "first string, second string",
        "  " + colors.green("- ") + "third string",
      ].join("\n"),
    );
  });

  it("should not print an object prototype", () => {
    var Input = function () {
      this.param1 = "first string";
      this.param2 = "second string";
    };
    Input.prototype = { randomProperty: "idontcare" };

    var output = prettyjson.render(new Input());

    output.should.equal(
      [colors.green("param1: ") + "first string", colors.green("param2: ") + "second string"].join(
        "\n",
      ),
    );
  });
});

describe("Printing numbers, booleans and other objects", () => {
  it("should print numbers correctly ", () => {
    var input = 12345;
    var output = prettyjson.render(input, {}, 4);

    output.should.equal("    " + colors.blue("12345"));
  });

  it("should print booleans correctly ", () => {
    var input = true;
    var output = prettyjson.render(input, {}, 4);

    output.should.equal("    " + colors.green("true"));

    input = false;
    output = prettyjson.render(input, {}, 4);

    output.should.equal("    " + colors.red("false"));
  });

  it("should print a null object correctly ", () => {
    var input = null;
    var output = prettyjson.render(input, {}, 4);

    output.should.equal("    " + colors.grey("null"));
  });

  it("should ignore undefined input ", () => {
    var output = prettyjson.render(undefined, {}, 4);

    output.should.equal("");
  });

  it("should print undefined with renderUndefined option  ", () => {
    var output = prettyjson.render(undefined, { renderUndefined: true }, 4);

    output.should.equal("    " + colors.grey("undefined"));
  });

  it("should ignore undefined values ", () => {
    var input = {
      foo: undefined,
      bar: [1, undefined, 2],
    };
    var output = prettyjson.render(input, {}, 4);

    output.should.equal(
      [
        "    " + colors.green("bar: "),
        "      " + colors.green("- ") + colors.blue(1),
        "      " + colors.green("- ") + colors.blue(2),
      ].join("\n"),
    );
  });

  it("should print undefined keys with renderUndefined option ", () => {
    var input = {
      foo: undefined,
      bar: [1, undefined, 2],
    };
    var output = prettyjson.render(input, { renderUndefined: true }, 4);

    output.should.equal(
      [
        "    " + colors.green("foo: ") + colors.grey("undefined"),
        "    " + colors.green("bar: "),
        "      " + colors.green("- ") + colors.blue(1),
        "      " + colors.green("- ") + colors.grey("undefined"),
        "      " + colors.green("- ") + colors.blue(2),
      ].join("\n"),
    );
  });

  it("should print an Error correctly ", () => {
    Error.stackTraceLimit = 1;
    var input = new Error("foo");
    var stack = input.stack.split("\n");
    var output = prettyjson.render(
      input,
      {
        noEscape: true,
      },
      4,
    );

    output.should.equal(
      [
        "    " + colors.green("message: ") + "foo",
        "    " + colors.green("stack: "),
        "      " + colors.green("- ") + stack[0],
        "      " + colors.green("- ") + stack[1],
      ].join("\n"),
    );
  });

  it("should print serializable items in an array inline", () => {
    var dt = new Date();
    var output = prettyjson.render(["a", 3, null, true, false, dt]);

    output.should.equal(
      [
        colors.green("- ") + "a",
        colors.green("- ") + colors.blue("3"),
        colors.green("- ") + colors.grey("null"),
        colors.green("- ") + colors.green("true"),
        colors.green("- ") + colors.red("false"),
        colors.green("- ") + dt,
      ].join("\n"),
    );
  });

  it("should print dates correctly", () => {
    var input = new Date();
    var expected = input.toString();
    var output = prettyjson.render(input, {}, 4);

    output.should.equal("    " + expected);
  });

  it("should print dates in objects correctly", () => {
    var dt1 = new Date();
    var dt2 = new Date();

    var input = {
      dt1: dt2,
      dt2: dt2,
    };

    var output = prettyjson.render(input, {}, 4);

    output.should.equal(
      [
        "    " + colors.green("dt1: ") + dt1.toString(),
        "    " + colors.green("dt2: ") + dt2.toString(),
      ].join("\n"),
    );
  });
});

describe("prettyjson.renderString() method", () => {
  it("should return an empty string if input is empty", () => {
    var input = "";

    var output = prettyjson.renderString(input);

    output.should.equal("");
  });

  it("should return an empty string if input is not a string", () => {
    var output = prettyjson.renderString({});
    output.should.equal("");
  });

  it("should return an error message if the input is an invalid JSON string", () => {
    var output = prettyjson.renderString("not valid!!");
    output.should.equal(colors.red("Error:") + " Not valid JSON!");
  });

  it("should return the prettyfied string if it is a valid JSON string", () => {
    var output = prettyjson.renderString('{"test": "OK"}');
    output.should.equal(colors.green("test: ") + "OK");
  });

  it("should dismiss trailing characters which are not JSON", () => {
    var output = prettyjson.renderString('characters that are not JSON at all... {"test": "OK"}');
    output.should.equal(
      "characters that are not JSON at all... \n" + colors.green("test: ") + "OK",
    );
  });

  it("should dismiss trailing characters which are not JSON with an array", () => {
    var output = prettyjson.renderString('characters that are not JSON at all... ["test"]');
    output.should.equal("characters that are not JSON at all... \n" + colors.green("- ") + "test");
  });

  it("should be able to accept the options parameter", () => {
    var output = prettyjson.renderString('{"test": "OK"}', {
      stringColor: "red",
    });
    output.should.equal(colors.green("test: ") + colors.red("OK"));
  });
});
