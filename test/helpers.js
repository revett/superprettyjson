/**
 * Compare the CLI output of superprettyjson against an expected array of strings, where each
 * element is an expected line of output.
 * @param {import("ava").Test} t - Ava test instance.
 * @param {string} output - CLI output to test.
 * @param {string[]} expected - Expected lines of output.
 */
const deepEqualMultiline = (t, output, expected) => {
  const outputLines = output.split("\n");

  const lastLine = outputLines[outputLines.length - 1];
  if (lastLine === "" && output.length > 1) {
    outputLines.pop();
  }

  t.deepEqual(outputLines, expected);
};

/**
 * Shell out to the CLI programatically within a test, handling if the CLI returns a non-zero exit
 * code.
 * @param {import("ava").Test} t - Ava test instance.
 * @param {string} binPath - Path to the CLI binary.
 * @param {object} options - Execa options to pass to the CLI.
 * @param {string} args - Arguments to pass to the CLI.
 * @returns {string} - Output (stdout) from the CLI.
 */
const runCLI = async (t, binPath, options, args) => {
  // Using dynamic import due to CommonJS: https://github.com/sindresorhus/execa/issues/489
  const { execa } = await import("execa");

  try {
    const { stdout: output } = await execa(options)`${binPath} ${args}`;
    return output;
  } catch (e) {
    t.fail(e.message);
  }
};

module.exports = {
  deepEqualMultiline,
  runCLI,
};
