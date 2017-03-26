#! /usr/bin/env node

const fs = require('fs');
const glob = require('glob');

const { printFiles } = require('./src/output');
const { getFileMatches } = require('./src/search');

const args = process.argv.slice(2);
const [moduleName, query] = args;

const globOptions = {
  ignore: ['node_modules/**/*.*'],
};

glob('**/*.?(js|ts|jsx)', globOptions, (err, paths) => {
  if (err) throw new Error(err);

  // Get each file the imports the module
  const files = paths.reduce(
    (memo, path) => {
      const contents = fs.readFileSync(path, 'utf-8');

      const matches = getFileMatches(contents, moduleName, query);
      if (matches) memo.push(Object.assign({ path }, matches));

      return memo;
    },
    []
  );

  printFiles(files);
});
