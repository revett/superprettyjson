/**
 * Builds a configuration object using the parsed CLI flags (via minimist), and optionally making
 * use of environment variables.
 * @param {object} args - Command line arguments.
 * @param {object} env - Environment variables.
 * @returns {object} Config object.
 */
const parseFlags = (args = {}, env = process.env) => {
  return {
    keysColor: args.keys || env.SUPERPRETTYJSON_KEYS,
    dashColor: args.dash || env.SUPERPRETTYJSON_DASH,
    defaultIndentation: args.indent || env.SUPERPRETTYJSON_INDENT,
    stringColor: args.string || env.SUPERPRETTYJSON_STRING,
    multilineStringColor: args.multiline_string || env.SUPERPRETTYJSON_MULTILINE_STRING,
    numberColor: args.number || env.SUPERPRETTYJSON_NUMBER,
    positiveNumberColor: args.number || env.SUPERPRETTYJSON_NUMBER_POSITIVE,
    negativeNumberColor: args.number || env.SUPERPRETTYJSON_NUMBER_NEGATIVE,
    noColor: args.nocolor || env.SUPERPRETTYJSON_NOCOLOR,
    noAlign: args.noalign || env.SUPERPRETTYJSON_NOALIGN,
    escape: args.escape || env.SUPERPRETTYJSON_ESCAPE,
    inlineArrays: args["inline-arrays"] || env.SUPERPRETTYJSON_INLINE_ARRAYS,
  };
};

module.exports = {
  parseFlags,
};
