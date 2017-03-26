#! /usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const readline = require('readline');

const { printFiles } = require('./src/output');

const args = process.argv.slice(2);
const [moduleName, query] = args;

// https://gist.github.com/manekinekko/7e58a17bc62a9be47172
const IMPORT_RX = /import (?:["'\s]*([\w*{}\n, ]+) from\s*)?["'\s]*([.@\w\/_-]+)["'\s]*;?/g;

const globOptions = {
  ignore: ['node_modules/**/*.*'],
};

glob('**/*.?(js|ts|jsx)', globOptions, (err, paths) => {
  if (err) throw new Error(err);

  // Get each file the imports the module
  const files = paths.reduce(
    (memo, path) => {
      const data = fs.readFileSync(path, 'utf-8');

      // Get the relevant imports
      const match = getImports(data).find(info => info.name === moduleName);
      if (!match) return memo;

      // Get the alias aware query for this file
      const fileQuery = match.args[query];
      if (!fileQuery) return memo;

      // Find everywhere the query is used
      const occurrences = getOccurrencesInFile(data, fileQuery);
      if (!occurrences.length) return memo;

      memo.push({ path, occurrences, query, fileQuery });

      return memo;
    },
    []
  );

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

  return args.reduce(
    (memo, arg) => {
      const parts = arg.split(/\s+as\s+/);
      const [name, alias] = parts;
      memo[name] = alias || name;
      return memo;
    },
    {}
  );
}

function containsImport(imports, name) {
  return imports.some(data => data.name === name);
}

function getOccurrencesInFile(contents, query) {
  const lines = contents.split(/\n/);

  return lines.reduce(
    (memo, line, i) => {
      if (line.includes(query)) memo.push({ i, line });
      return memo;
    },
    []
  );
}
