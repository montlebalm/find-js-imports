# find-js-imports

`find-js-imports` is a cli tool for locating files that use a specified module's
exports.

## Usage

To find uses of the `connect` method from `react-redux` module in the
[redux](redux-url) codebase you would run `find-js-imports react-redux connect`.

![example](https://cloud.githubusercontent.com/assets/739390/24316886/f6a41250-10ae-11e7-89ea-8993168b7847.png)

## Installation

```
$ npm install -g find-js-imports
```

To update run:

```
npm update -g find-js-imports
```

## License

MIT

[redux-url]: https://github.com/reactjs/redux
