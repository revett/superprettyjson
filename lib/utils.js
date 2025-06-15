const colors = require("@colors/colors/safe");
const { conflictChars } = require("./constants");

/**
 * Formats the input value with color based on type and configuration.
 * @param {*} input - Value to add color to.
 * @param {object} cfg - Config object.
 * @returns {string} Value with color added.
 */
const addColorToData = (input, cfg) => {
  if (cfg.noColor) {
    return input;
  }

  // Strings → Use configured color if set, if not return unchanged
  if (typeof input === "string") {
    return cfg.stringColor ? colors[cfg.stringColor](input) : input;
  }

  const strInput = `${input}`;

  // Booleans → Use green for true and red for false
  if (input === true) {
    return colors.green(strInput);
  }
  if (input === false) {
    return colors.red(strInput);
  }

  // Null/undefined → Use grey
  if (input === null || input === undefined) {
    return colors.grey(strInput);
  }

  // Numbers → Use positive/negative configured colors
  if (typeof input === "number") {
    if (input >= 0) {
      return colors[cfg.positiveNumberColor](strInput);
    }
    return colors[cfg.negativeNumberColor](strInput);
  }

  // Functions → Return a simple function representation
  if (typeof input === "function") {
    return "function() {}";
  }

  // Arrays → Join elements with commas
  if (Array.isArray(input)) {
    return input.join(", ");
  }

  return strInput;
};

/**
 * Adds color to a multiline string based on configuration.
 * @param {string} line - The line to add color to.
 * @param {string} multilineStringColor - Config value for the color.
 * @param {boolean} isNoColor - Config value for whether to disable color.
 * @returns {string} The line with color added.
 */
const colorMultilineString = (line, multilineStringColor, isNoColor) => {
  if (multilineStringColor === null || isNoColor) {
    return line;
  }

  return colors[multilineStringColor](line);
};

/**
 * Formats an error message for console output, respecting the noColor flag.
 * @param {string} err - Error message to format.
 * @param {boolean} isNoColor - Config value for whether to disable color.
 * @returns {string} Formatted error message.
 */
const formatError = (err, isNoColor) => {
  const prefix = isNoColor ? "Error:" : colors.red("Error:");
  return `${prefix} ${err}`;
};

/**
 * Given an object, returns the length of the longest top-level key.
 * @param {object} input - The object to get the max index length of.
 * @returns {number} The length of the longest top-level key.
 */
const getMaxIndexLength = (input) => {
  let maxLength = 0;

  for (const key of Object.getOwnPropertyNames(input)) {
    if (input[key] === undefined) {
      continue;
    }

    maxLength = Math.max(maxLength, key.length);
  }

  return maxLength;
};

/**
 * Returns a string with the same length as `spaces` parameter.
 * @param {number} spaces - The number of spaces to indent.
 * @returns {string} A string with the same length as `spaces` parameter.
 */
const indent = (spaces) => {
  return new Array(spaces + 1).join(" ");
};

/**
 * Indents each line of a string based on the number of spaces and configuration.
 * @param {string} string - The string to indent.
 * @param {number} spaces - The number of spaces to indent.
 * @param {object} cfg - Config object.
 * @returns {string} The indented string.
 */
const indentLines = (string, spaces, cfg) => {
  let lines = string.split("\n");

  lines = lines.map((line) => {
    return indent(spaces) + colorMultilineString(line, cfg.multilineStringColor, cfg.noColor);
  });

  return lines.join("\n");
};

/**
 * Detect if a value should be printed or ignored, which can be overridden by the `renderUndefined`
 * option.
 * @param {*} input - The value to check.
 * @param {boolean} shouldRenderUndefined - Config value for whether to render undefined values.
 * @returns {boolean} True if the object should be printed, false otherwise.
 */
const isPrintable = (input, shouldRenderUndefined) => {
  return input !== undefined || shouldRenderUndefined;
};

/**
 * Detect if a value can be directly serialized.
 * @param {*} input - The value to check.
 * @param {boolean} onlyPrimitives - Whether to only check for primitive values.
 * @param {boolean} shouldInlineArrays - Config value for whether to render inline arrays.
 * @returns {boolean} True if the value can be directly serialized, false otherwise.
 */
const isSerializable = (input, onlyPrimitives, shouldInlineArrays) => {
  if (
    typeof input === "boolean" ||
    typeof input === "number" ||
    typeof input === "function" ||
    input === null ||
    input === undefined ||
    input instanceof Date
  ) {
    return true;
  }
  if (typeof input === "string" && input.indexOf("\n") === -1) {
    return true;
  }

  if (shouldInlineArrays && !onlyPrimitives) {
    if (Array.isArray(input) && isSerializable(input[0], true, shouldInlineArrays)) {
      return true;
    }
  }

  return false;
};

/**
 * Core rendering logic that converts any Javascript value into a formatted and colorized array of
 * strings.
 * @param {*} d - The data to render.
 * @param {object} cfg - Config object.
 * @param {number} indentation - The indentation level.
 * @returns {string[]} The rendered array.
 */
const renderToArray = (d, cfg, indentation) => {
  let data = d;

  if (typeof data === "string" && data.match(conflictChars) && cfg.escape) {
    data = JSON.stringify(data);
  }

  if (!isPrintable(data, cfg.renderUndefined)) {
    return [];
  }

  if (isSerializable(data, false, cfg.inlineArrays)) {
    return [indent(indentation) + addColorToData(data, cfg)];
  }

  // Unserializable string means it's multiline
  if (typeof data === "string") {
    return [
      indent(indentation) + colorMultilineString('"""', cfg.multilineStringColor, cfg.noColor),
      indentLines(data, indentation + cfg.defaultIndentation, cfg),
      indent(indentation) + colorMultilineString('"""', cfg.multilineStringColor, cfg.noColor),
    ];
  }

  if (Array.isArray(data)) {
    // If the array is empty, render the `emptyArrayMsg`
    if (data.length === 0) {
      return [indent(indentation) + cfg.emptyArrayMsg];
    }

    const outputArray = [];

    for (const element of data) {
      if (!isPrintable(element, cfg.renderUndefined)) {
        continue;
      }

      // Prepend the dash at the begining of each array's element line
      let line = "- ";
      if (!cfg.noColor) {
        line = colors[cfg.dashColor](line);
      }
      line = indent(indentation) + line;

      // If the element of the array is a string, bool, number, or null render it in the same line
      if (isSerializable(element, false, cfg.inlineArrays)) {
        line += renderToArray(element, cfg, 0)[0];
        outputArray.push(line);

        // If the element is an array or object, render it in next line
      } else {
        outputArray.push(line);
        outputArray.push.apply(
          outputArray,
          renderToArray(element, cfg, indentation + cfg.defaultIndentation),
        );
      }
    }

    return outputArray;
  }

  if (data instanceof Error) {
    return renderToArray(
      {
        message: data.message,
        stack: data.stack.split("\n"),
      },
      cfg,
      indentation,
    );
  }

  // If values alignment is enabled, get the size of the longest index to align all the values
  const maxIndexLength = cfg.noAlign ? 0 : getMaxIndexLength(data);
  let key;
  const output = [];

  for (const i of Object.getOwnPropertyNames(data)) {
    if (!isPrintable(data[i], cfg.renderUndefined)) {
      continue;
    }

    // Prepend the index at the beginning of the line
    key = `${i}: `;
    if (!cfg.noColor) {
      key = colors[cfg.keysColor](key);
    }
    key = indent(indentation) + key;

    // If the value is serializable, render it in the same line
    if (isSerializable(data[i], false, cfg.inlineArrays)) {
      const nextIndentation = cfg.noAlign ? 0 : maxIndexLength - i.length;
      key += renderToArray(data[i], cfg, nextIndentation)[0];
      output.push(key);

      // If the index is an array or object, render it in next line
    } else {
      output.push(key);
      output.push.apply(output, renderToArray(data[i], cfg, indentation + cfg.defaultIndentation));
    }
  }

  return output;
};

// All functions are exported as may be unit tested, however renderToArray is the core function
module.exports = {
  addColorToData,
  colorMultilineString,
  formatError,
  getMaxIndexLength,
  indent,
  indentLines,
  isPrintable,
  isSerializable,
  renderToArray,
};
