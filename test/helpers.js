/**
 * Compare the CLI output of superprettyjson against an expected array of strings, where each
 * element is an expected line of output.
 * @param {import("ava").Test} t - Ava test instance
 * @param {string} output - CLI output to test
 * @param {string[]} expected - Expected lines of output
 */
const deepEqualMultiline = (t, output, expected) => {
  const outputLines = output.split("\n");

  const lastLine = outputLines[outputLines.length - 1];
  if (lastLine === "") {
    outputLines.pop();
  }

  t.deepEqual(outputLines, expected);
};

module.exports = {
  deepEqualMultiline,
};
