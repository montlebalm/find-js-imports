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

function printOccurrencesInFile({ path, occurrences, query, fileQuery, isLastFile }) {
  console.log(chalk.green(path));

  const highestLineNr = occurrences.reduce(
    (memo, occurrence) => {
      const { i } = occurrence;
      return i > memo ? i : memo;
    },
    0
  );
  const digits = highestLineNr.toString().length;

  occurrences.forEach(occurrence => {
    const { i, line } = occurrence;

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
    const { path, occurrences, query, fileQuery } = file;
    const isLastFile = i === files.length;
    printOccurrencesInFile({ path, occurrences, query, fileQuery, isLastFile });
  });
}
