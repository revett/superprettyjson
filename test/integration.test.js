const test = require("ava");
const { spawn } = require("node:child_process");
const path = require("node:path");
const { deepEqualMultiline } = require("./helpers");

test("cli: formats JSON from stdin", async (t) => {
  const cli = spawn("node", [path.join(__dirname, "../bin/superprettyjson"), "--nocolor"]);
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

  cli.stdin.write(JSON.stringify(data));
  cli.stdin.end();

  const output = await new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    cli.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    cli.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    cli.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`cli exited with code ${code}. stderr: ${stderr}`));
      }
    });
  });

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
  deepEqualMultiline(t, output, expected);
});
