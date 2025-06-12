# superprettyjson

Format JSON data in a colored YAML-style, perfect for CLI output.

## Install

Just install it via NPM:

```bash
npm install -g superprettyjson
```

This will install `superprettyjson` globally, so it will be added automatically to your `PATH`.

## Usage (CLI)

This package installs a command line interface to render JSON data in a more convenient way. You can
use the CLI in three different ways:

**Decode a JSON file:** If you want to see the contents of a JSON file, just pass it as the first
argument to the CLI:

```bash
superprettyjson package.json
```

![Example 1](https://raw.github.com/rafeca/prettyjson/master/images/example3.png)

**Decode the stdin:** You can also pipe the result of a command (for example an HTTP request) to the
CLI to see the JSON result in a clearer way:

```bash
curl https://api.github.com/users/rafeca | superprettyjson
```

![Example 2](https://raw.github.com/rafeca/prettyjson/master/images/example4.png)

**Decode random strings:** if you call the CLI with no arguments, you'll get a prompt where you can
pass JSON strings and they'll be automatically displayed in a clearer way:

![Example 3](https://raw.github.com/rafeca/prettyjson/master/images/example5.png)

### Options (CLI)

It's possible to customize the output through some command line options:

```bash
# Change colors
superprettyjson --string=red --multiline_string=cyan --keys=blue --dash=yellow --number=green package.json

# Do not use colors
superprettyjson --nocolor=1 package.json

# Change indentation
superprettyjson --indent=4 package.json

# Render arrays elements in a single line
superprettyjson --inline-arrays=1 package.json

# Escape conflictive strings
superprettyjson --escape=1 package.json
```

## Usage (Node)

It's pretty easy to use it. You just have to include it in your script and call the `render()`
method:

```js
const spj = require('superprettyjson');

const data = {
  username: 'revett',
  url: 'https://github.com/revett',
  x_account: 'https://c.com/revcd',
  projects: ['hops', 'superprettyjson']
};

const options = {
  noColor: true
};

console.log(
  spj.render(data, options)
);
```

Will output:

![Example 4](https://raw.github.com/rafeca/prettyjson/master/images/example1.png)

You can also configure the colors of the hash keys and array dashes (using
[colors.js](https://github.com/Marak/colors.js) colors syntax):

```javascript
const spj = require('superprettyjson');

const data = {
  username: 'revett',
  url: 'https://github.com/revett',
  x_account: 'https://c.com/revcd',
  projects: ['hops', 'superprettyjson']
};

console.log(
  spj.render(data, {
    keysColor: 'rainbow',
    dashColor: 'magenta',
    stringColor: 'white',
    multilineStringColor: 'cyan'
  })
);
```

Will output something like:

![Example 5](https://raw.github.com/rafeca/prettyjson/master/images/example2.png)

## Credits

- This is an actively maintained fork of [rafeca/prettyjson](https://github.com/rafeca/prettyjson)
- Original work by [@rafeca](https://github.com/rafeca), up until February 2022
- Fork maintained by [@revett](https://github.com/revett) since v1.3.0, in June 2025
