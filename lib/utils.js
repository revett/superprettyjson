// Given an object, returns the length of the longest top-level key
const getMaxIndexLength = (input) => {
  let maxLength = 0;

  for (const key of Object.getOwnPropertyNames(input)) {
    // Skip undefined values.
    if (input[key] === undefined) {
      continue
    }

    maxLength = Math.max(maxLength, key.length);
  }

  return maxLength;
};

// Returns a string with the same length as `spaces` parameter
const indent = (spaces) => {
  return new Array(spaces + 1).join(" ");
};

module.exports = {
  indent,
  getMaxIndexLength,
};
