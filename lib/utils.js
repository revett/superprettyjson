/**
 * Creates a string with the same length as `numSpaces` parameter
 **/
exports.indent = function indent(numSpaces) {
  return new Array(numSpaces + 1).join(" ");
};

/**
 * Gets the string length of the longer index in a hash
 **/
exports.getMaxIndexLength = (input) => {
  let maxWidth = 0;

  for (const key of Object.getOwnPropertyNames(input)) {
    // Skip undefined values.
    if (input[key] === undefined) {
      return;
    }

    maxWidth = Math.max(maxWidth, key.length);
  }

  return maxWidth;
};
