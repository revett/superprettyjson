const test = require("ava");
const slugify = require("slugify");
const { readFileSync, writeFileSync } = require("node:fs");
const path = require("node:path");
const OpenAI = require("openai");

const lastCommitBeforeFork = "a5945763d02d57697163b716530c331dd5afac95";
const repoForkURI = `https://raw.githubusercontent.com/rafeca/prettyjson/${lastCommitBeforeFork}`;

const outputFileBlock = (project, path, content, language) => {
  return `\`\`\`${language}
// Project: ${project}
// File: ${path}

${content}
\`\`\``;
};

test("compatibility: check against rafeca/prettyjson@v1.2.5", async (t) => {
  // Increase test timeout from 10 seconds as we are calling OpenAI
  t.timeout(30000);

  const originalPaths = ["bin/prettyjson", "lib/prettyjson.js", "lib/utils.js", "package.json"];

  const originalFiles = await Promise.all(
    originalPaths.map(async (p) => {
      try {
        const response = await fetch(`${repoForkURI}/${p}`);
        if (!response.ok) {
          t.fail(`Failed to fetch file from GitHub: ${url}`);
        }

        const content = await response.text();
        const ext = path.extname(p) || ".js";

        return { path: p, content: content.trim(), language: ext.slice(1) };
      } catch (e) {
        t.fail(e);
      }
    }),
  );

  const originalFileBlocks = originalFiles.map(({ path, content, language }) =>
    outputFileBlock("rafeca/prettyjson@v1.2.5", path, content, language),
  );

  const forkPaths = [
    "bin/superprettyjson.js",
    "lib/config.js",
    "lib/constants.js",
    "lib/superprettyjson.js",
    "lib/utils.js",
    "package.json",
  ];

  const forkFiles = await Promise.all(
    forkPaths.map(async (p) => {
      try {
        const content = readFileSync(path.join(__dirname, "..", p), "utf8");
        const ext = path.extname(p) || ".js";
        return { path: p, content: content.trim(), language: ext.slice(1) };
      } catch (e) {
        t.fail(e);
      }
    }),
  );

  const forkFileBlocks = forkFiles.map(({ path, content, language }) =>
    outputFileBlock("revett/superprettyjson", path, content, language),
  );

  const prompt = `# Prompt

You are a code reviewer, with the task of ensuring that the codebase of the project
"revett/superprettyjson" is compatible with the codebase it forked from "rafeca/prettyjson".

The original project ("rafeca/prettyjson") is no longer active, and the forked project
("revett/superprettyjson") is the active project. This task is to ensure that users migrating from
the original project to the forked project will not experience any issues.

## Files

### Inactive Original Project: rafeca/prettyjson

${originalFileBlocks.join("\n\n")}

### Active Forked Project: revett/superprettyjson

${forkFileBlocks.join("\n\n")}

## Task

Above, you have been provided with the relevant files from the original project and the forked
project. Your task is to review the forked project and identify any and all compatibility issues for
users migrating from the "rafeca/prettyjson" project to the "revett/superprettyjson" project.

You will return a list of compatibility issues, with a detailed technical description of the issue
(under 400 characters). Your aim is to list all issues, not just the most important ones, so please
return up to 10 issues, and order them by severity.

If there are no compatibility issues, you will return "OK".

### Ignore

Always ignore the following issues, and never return them within your report:

1. Environment variable prefix has changed from "PRETTYJSON_" to "SUPERPRETTYJSON_"
2. Node version has changed to v18 or higher
3. Name of the binary has changed from "prettyjson" to "superprettyjson"
4. @colors/colors dependency has been updated
5. Updating the binary name to "superprettyjson.js"
6. The moving of functions to different files within "lib/" directory
7. Error messages now respecting the "noColor" flag and the introduction of "formatError()"
8. "renderString()" now throws an error for invalid JSON, instead of returning a string
9. Using "node:" prefix within imports
10. Using "const" and "let" instead of "var"
11. Use of template literals for string concatenation
12. The "bin" entrypoints within "package.json" changing
13. The supporting of CLI flags with a dash (e.g. "keys-color"), instead of "keysColor"

### Example

- The "renderString()" function has been renamed to "renderAsJSON()", see \`lib/superprettyjson.js\`
- The invalid JSON error message has been changed from "Not valid JSON!" to "Invalid JSON!"
`;

  const testTitle = slugify(t.title, { lower: true, strict: true });
  const promptPath = path.join(__dirname, `fixtures/${testTitle}.md`);

  t.notThrows(() => {
    writeFileSync(promptPath, prompt);
  });

  if (!process.env.OPENAI_API_KEY) {
    console.log(`  - [skip] OPENAI_API_KEY not set, skipping "${t.title}"`);
    t.pass();
    return;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1",
      temperature: 0.2,
      input: prompt,
    });

    console.log(response);

    if (response.status !== "completed") {
      t.fail(`OpenAI response status is not completed: ${response.status}`);
    }

    if (response.error) {
      t.fail(`OpenAI response error: ${response.error}`);
    }

    const report = response.output_text;

    if (report === "OK") {
      t.pass();
    } else {
      const issues = report.split("\n");
      for (const issue of issues) {
        console.log(issue);
      }
      t.fail();
    }
  } catch (e) {
    t.fail(e);
  }
});
