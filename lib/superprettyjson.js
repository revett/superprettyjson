const colors = require("@colors/colors/safe");
const utils = require("./utils");

const conflictChars = /[^\w\s\n\r\v\t\.,]/i;

exports.version = require("../package.json").version;

// Helper function to detect if an object should be printed or ignored
const isPrintable = (input, options) => input !== undefined || options.renderUndefined;

// Helper function to detect if an object can be directly serializable
const isSerializable = (input, onlyPrimitives, options) => {
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

  if (options.inlineArrays && !onlyPrimitives) {
    if (Array.isArray(input) && isSerializable(input[0], true, options)) {
      return true;
    }
  }

  return false;
};

const addColorToData = (input, options) => {
  if (options.noColor) {
    return input;
  }

  if (typeof input === "string") {
    // Print strings in regular terminal color
    return options.stringColor ? colors[options.stringColor](input) : input;
  }

  const sInput = `${input}`;

  if (input === true) {
    return colors.green(sInput);
  }
  if (input === false) {
    return colors.red(sInput);
  }
  if (input === null || input === undefined) {
    return colors.grey(sInput);
  }
  if (typeof input === "number") {
    if (input >= 0) {
      return colors[options.positiveNumberColor](sInput);
    }
    return colors[options.negativeNumberColor](sInput);
  }
  if (typeof input === "function") {
    return "function() {}";
  }

  if (Array.isArray(input)) {
    return input.join(", ");
  }

  return sInput;
};

const colorMultilineString = (options, line) => {
  if (options.multilineStringColor === null || options.noColor) {
    return line;
  }
  return colors[options.multilineStringColor](line);
};

const indentLines = (string, spaces, options) => {
  let lines = string.split("\n");
  lines = lines.map((line) => utils.indent(spaces) + colorMultilineString(options, line));
  return lines.join("\n");
};

const renderToArray = (d, options, indentation) => {
  let data = d;

  if (typeof data === "string" && data.match(conflictChars) && options.escape) {
    data = JSON.stringify(data);
  }

  if (!isPrintable(data, options)) {
    return [];
  }

  if (isSerializable(data, false, options)) {
    return [utils.indent(indentation) + addColorToData(data, options)];
  }

  // Unserializable string means it's multiline
  if (typeof data === "string") {
    return [
      utils.indent(indentation) + colorMultilineString(options, '"""'),
      indentLines(data, indentation + options.defaultIndentation, options),
      utils.indent(indentation) + colorMultilineString(options, '"""'),
    ];
  }

  if (Array.isArray(data)) {
    // If the array is empty, render the `emptyArrayMsg`
    if (data.length === 0) {
      return [utils.indent(indentation) + options.emptyArrayMsg];
    }

    const outputArray = [];

    for (const element of data) {
      if (!isPrintable(element, options)) {
        return;
      }

      // Prepend the dash at the begining of each array's element line
      let line = "- ";
      if (!options.noColor) {
        line = colors[options.dashColor](line);
      }
      line = utils.indent(indentation) + line;

      // If the element of the array is a string, bool, number, or null
      // render it in the same line
      if (isSerializable(element, false, options)) {
        line += renderToArray(element, options, 0)[0];
        outputArray.push(line);

        // If the element is an array or object, render it in next line
      } else {
        outputArray.push(line);
        outputArray.push.apply(
          outputArray,
          renderToArray(element, options, indentation + options.defaultIndentation),
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
      options,
      indentation,
    );
  }

  // If values alignment is enabled, get the size of the longest index
  // to align all the values
  const maxIndexLength = options.noAlign ? 0 : utils.getMaxIndexLength(data);
  let key;
  const output = [];

  for (const i of Object.getOwnPropertyNames(data)) {
    if (!isPrintable(data[i], options)) {
      return;
    }

    // Prepend the index at the beginning of the line
    key = `${i}: `;
    if (!options.noColor) {
      key = colors[options.keysColor](key);
    }
    key = utils.indent(indentation) + key;

    // If the value is serializable, render it in the same line
    if (isSerializable(data[i], false, options)) {
      const nextIndentation = options.noAlign ? 0 : maxIndexLength - i.length;
      key += renderToArray(data[i], options, nextIndentation)[0];
      output.push(key);

      // If the index is an array or object, render it in next line
    } else {
      output.push(key);
      output.push.apply(
        output,
        renderToArray(data[i], options, indentation + options.defaultIndentation),
      );
    }
  }

  return output;
};

// ### Render function
// *Parameters:*
//
// * **`data`**: Data to render
// * **`options`**: Hash with different options to configure the parser
// * **`indentation`**: Base indentation of the parsed output
//
// *Example of options hash:*
//
//     {
//       emptyArrayMsg: '(empty)',    // Rendered message on empty strings
//       keysColor: 'blue',           // Color for keys in hashes
//       dashColor: 'red',            // Color for the dashes in arrays
//       stringColor: 'grey',         // Color for strings
//       multilineStringColor: 'cyan' // Color for multiline strings
//       defaultIndentation: 2        // Indentation on nested objects
//     }
exports.render = function render(data, options = {}, indentation = 0) {
  // Default values
  options.emptyArrayMsg = options.emptyArrayMsg || "(empty array)";
  options.keysColor = options.keysColor || "green";
  options.dashColor = options.dashColor || "green";
  options.numberColor = options.numberColor || "blue";
  options.positiveNumberColor = options.positiveNumberColor || options.numberColor;
  options.negativeNumberColor = options.negativeNumberColor || options.numberColor;
  options.defaultIndentation = options.defaultIndentation || 2;
  options.noColor = !!options.noColor;
  options.noAlign = !!options.noAlign;
  options.escape = !!options.escape;
  options.renderUndefined = !!options.renderUndefined;

  options.stringColor = options.stringColor || null;
  options.multilineStringColor = options.multilineStringColor || null;

  return renderToArray(data, options, indentation).join("\n");
};

// ### Render from string function
// *Parameters:*
//
// * **`data`**: Data to render as a string
// * **`options`**: Hash with different options to configure the parser
// * **`indentation`**: Base indentation of the parsed output
//
// *Example of options hash:*
//
//     {
//       emptyArrayMsg: '(empty)', // Rendered message on empty strings
//       keysColor: 'blue',        // Color for keys in hashes
//       dashColor: 'red',         // Color for the dashes in arrays
//       defaultIndentation: 2     // Indentation on nested objects
//     }
exports.renderString = function renderString(d, options, indentation) {
  let data = d;
  let output = "";
  let parsedData;
  // If the input is not a string or if it's empty, just return an empty string
  if (typeof data !== "string" || data === "") {
    return "";
  }

  // Remove non-JSON characters from the beginning string
  if (data[0] !== "{" && data[0] !== "[") {
    let beginingOfJson;
    if (data.indexOf("{") === -1) {
      beginingOfJson = data.indexOf("[");
    } else if (data.indexOf("[") === -1) {
      beginingOfJson = data.indexOf("{");
    } else if (data.indexOf("{") < data.indexOf("[")) {
      beginingOfJson = data.indexOf("{");
    } else {
      beginingOfJson = data.indexOf("[");
    }
    output += `${data.substr(0, beginingOfJson)}\n`;
    data = data.substr(beginingOfJson);
  }

  try {
    parsedData = JSON.parse(data);
  } catch (e) {
    // Return an error in case of an invalid JSON
    return `${colors.red("Error:")} Not valid JSON!`;
  }

  // Call the real render() method
  output += exports.render(parsedData, options, indentation);
  return output;
};
