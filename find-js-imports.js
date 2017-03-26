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
      const contents = fs.readFileSync(path, 'utf-8');

      const matches = getFileMatches(contents);
      if (matches) memo.push(Object.assign({ path }, matches));

      return memo;
    },
    []
  );

  printFiles(files);
});

function getFileMatches(contents) {
  // Get the relevant imports
  const imports = getImports(contents);
  const matchingImport = imports.find(info => info.name === moduleName);
  if (!matchingImport) return;

  // Get the alias aware query for this file
  const fileQuery = matchingImport.args[query];
  if (!fileQuery) return;

  // Find everywhere the query is used
  const matches = getMatchesInFile(contents, fileQuery);
  if (!matches.length) return;

  return { matches, query, fileQuery };
}

function getImports(contents) {
  const imports = [];
  contents.replace(IMPORT_RX, (match, argString, name) => {
    const args = splitImportedArgs(argString);
    if (!args) return;
    imports.push({ name, args });
  });
  return imports;
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

function getMatchesInFile(contents, query) {
  const lines = contents.split(/\n/);

  return lines.reduce(
    (memo, line, i) => {
      if (line.includes(query)) memo.push({ i, line });
      return memo;
    },
    []
  );
}
