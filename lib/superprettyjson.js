const colors = require("@colors/colors/safe");
const { renderToArray } = require("./utils");

/**
 * Render any Javascipt value into a formatted and colorized string.
 * @param {*} data - Value to render
 * @param {*} config - Configuration object
 * @param {*} indentation - Base indentation of the parsed output
 * @returns {string} The rendered string
 */
const render = function render(data, config = {}, indentation = 0) {
  const cfg = {
    ...config,
  };

  // Default values
  cfg.emptyArrayMsg = config.emptyArrayMsg || "(empty array)";
  cfg.keysColor = config.keysColor || "green";
  cfg.dashColor = config.dashColor || "green";
  cfg.numberColor = config.numberColor || "blue";
  cfg.positiveNumberColor = config.positiveNumberColor || cfg.numberColor;
  cfg.negativeNumberColor = config.negativeNumberColor || cfg.numberColor;
  cfg.defaultIndentation = config.defaultIndentation || 2;
  cfg.noColor = !!config.noColor;
  cfg.noAlign = !!config.noAlign;
  cfg.escape = !!config.escape;
  cfg.renderUndefined = !!config.renderUndefined;
  cfg.stringColor = config.stringColor || null;
  cfg.multilineStringColor = config.multilineStringColor || null;

  return renderToArray(data, cfg, indentation).join("\n");
};

/**
 * Parses a given JSON string, and renders it as a formatted and colorized string.
 * @param {string} json - JSON string to render
 * @param {Object} cfg - Configuration object
 * @param {number} indentation - Base indentation of the parsed output
 * @returns {string} The rendered string
 */
const renderString = function renderString(json, cfg, indentation) {
  let data = json;
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
  output += render(parsedData, cfg, indentation);
  return output;
};

module.exports = {
  render,
  renderString,
  version: require("../package.json").version,
};
