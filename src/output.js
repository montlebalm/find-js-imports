const chalk = require('chalk');

module.exports = {
  printFiles,
};

function rightPad(num, width) {
  let output = num.toString();
  while (output.length < width) {
    output += ' ';
  }
  return output;
}

function printFileMatches({ path, matches, query, fileQuery, isLastFile }) {
  const lineNrs = matches.map(match => match.i);
  const highestLineNr = Math.max.apply(null, lineNrs);
  const digits = highestLineNr.toString().length;

  console.log(chalk.green(path));

  matches.forEach(match => {
    const { i, line } = match;

    let formattedLine = line.replace(fileQuery, chalk.black.bgYellow(fileQuery));

    // Dim the aliased text
    if (query !== fileQuery) {
      formattedLine = formattedLine.replace(query, chalk.dim(query));
    }

    const lineNr = rightPad(i + 1, digits);

    console.log(`${lineNr}: ${formattedLine}`);
  });

  if (!isLastFile) console.log('');
}

function printFiles(files) {
  if (!files || !files.length) return;

  console.log('');

  files.forEach((file, i) => {
    const { path, matches, query, fileQuery } = file;
    const isLastFile = i === files.length;
    printFileMatches({ path, matches, query, fileQuery, isLastFile });
  });
}
