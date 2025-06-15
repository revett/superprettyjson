#!/usr/bin/env node

const fs = require("node:fs");
const argv = require("minimist")(process.argv.slice(2));
const { renderString } = require("../lib/superprettyjson.js");
const { parseFlags } = require("../lib/config.js");
const { formatError } = require("../lib/utils.js");

const renderFile = (filename, cfg) => {
  try {
    const f = fs.readFileSync(filename, "utf8");
    console.log(renderString(f, cfg));
  } catch (e) {
    // Print specific errors for ENOENT and InvalidJSON to avoid breaking changes from v1.2.5
    if (e.code === "ENOENT") {
      console.error(formatError(`File '${filename}' does not exist`, cfg.noColor));
    } else if (e.message === "Not valid JSON!") {
      console.error(formatError("Not valid JSON!", cfg.noColor));
    } else {
      console.error(e);
    }
    process.exit(1);
  }
};

const renderStream = (cfg) => {
  let stream = "";

  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdin.on("data", (chunk) => {
    if (chunk === "\n") {
      console.log(renderString(stream, cfg));
      stream = "";
      return;
    }
    stream += chunk;
  });

  process.stdin.on("end", () => {
    console.log(renderString(stream, cfg));
  });
};

// Parse flags to config object, falling back to environment variables
const cfg = parseFlags(argv, process.env);

// Parsed positional arguments, not flags
const params = argv._;

// Handle routing to correct render function
if (params.length > 0) {
  renderFile(params[0], cfg);
} else {
  renderStream(cfg);
}
