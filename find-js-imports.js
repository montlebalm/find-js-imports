#! /usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const readline = require('readline');

const args = process.argv.slice(2);
const [ moduleName, query ] = args;

// https://gist.github.com/manekinekko/7e58a17bc62a9be47172
const IMPORT_RX = /import (?:["'\s]*([\w*{}\n, ]+) from\s*)?["'\s]*([.@\w\/_-]+)["'\s]*;?/g;

const globOptions = {
  ignore: ['node_modules/**/*.*'],
};

glob('**/*.?(js|ts|jsx)', globOptions, (err, paths) => {
  if (err) throw new Error(err);

  // Get each file the imports the module
  const files = paths.reduce((memo, path) => {
    const data = fs.readFileSync(path, 'utf-8');

    // Get the relevant imports
    const match = getImports(data).find(info => info.name === moduleName);
    if (!match) return memo;

    // Get the alias aware query for this file
    const fileQuery = match.args[query];
    if (!fileQuery) return memo;

    // Find everywhere the query is used
    const occurrences = getOccurrencesInFile(data, fileQuery, 1);
    if (!occurrences.length) return memo;

    memo.push({ path, occurrences, query, fileQuery });

    return memo;
  }, []);

  printFiles(files);
});

function getImports(contents) {
  const matches = [];
  contents.replace(IMPORT_RX, (match, argString, name) => {
    const args = splitImportedArgs(argString);
    if (!args) return;
    matches.push({ name, args });
  });
  return matches;
}

function splitImportedArgs(argString) {
  /*
   * This can happen when importing css
   * e.g., import 'style.css'
   */
  if (!argString) return;

  const args = argString
    .replace(/^{\s*/, '')
    .replace(/\s*}$/, '')
    .split(/\s*,\s*/);

  return args.reduce((memo, arg) => {
    const parts = arg.split(/\s+as\s+/);
    const [ name, alias ] = parts;
    memo[name] = alias || name;
    return memo;
  }, {});
}

function containsImport(imports, name) {
  return imports.some(data => {
    return data.name === name;
  });
}

function getOccurrencesInFile(contents, query, bufferLines) {
  const allLines = contents.split(/\n/);

  const matchingLines = allLines.reduce((memo, line, i) => {
    if (line.includes(query)) {
      const lines = [];

      // Add preceding lines
      if (i > 0) {
        lines.unshift({
          i: i - 1,
          line: allLines[i - 1],
        });
      }

      // Add the matching line
      memo.push({ i, line });

      // Add succeeding lines
      if (i < allLines.length) {
        lines.push({
          i: i + 1,
          line: allLines[i + 1],
        });
      }
    }
    return memo;
  }, []);

  return matchingLines;
}

function rightPad(num, width) {
  let output = num.toString();
  while (output.length < width) {
    output += ' ';
  }
  return output;
}

function printOccurrences({ path, occurrences, query, fileQuery, isLastFile }) {
  console.log(colorFile(path));

  const highestLineNr = occurrences.reduce((memo, occurrence) => {
    const { i } = occurrence;
    return (i > memo) ? i : memo;
  }, 0);
  const digits = highestLineNr.toString().length;

  occurrences.forEach(occurrence => {
    const { i, line } = occurrence;

    let formattedLine = line.replace(fileQuery, colorHighlight(fileQuery))

    // Dim the aliased text
    if (query !== fileQuery) {
      formattedLine = formattedLine.replace(query, colorLowlight(query));
    }

    const lineNr = rightPad(i + 1, digits);

    console.log(`${lineNr}: ${formattedLine}`);
  });

  if (!isLastFile) console.log('');
}

function printFiles(files) {
  if (!files.length) return;

  console.log('');

  files.forEach((file, i) => {
    const { path, occurrences, query, fileQuery } = file;
    const isLastFile = (i === files.length);
    printOccurrences({ path, occurrences, query, fileQuery, isLastFile });
  });
}

const COLORS = {
  bg_yellow: '\x1b[43m',
  fg_black: '\x1b[30m',
  fg_green: '\x1b[32m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  none: '\x1b[0m',
};

function colorFile(text) {
  return `${COLORS.fg_green}${text}${COLORS.none}`;
}

function colorHighlight(text) {
  return `${COLORS.fg_black}${COLORS.bg_yellow}${text}${COLORS.none}`;
}

function colorLowlight(text) {
  return `${COLORS.dim}${text}${COLORS.none}`;
}
