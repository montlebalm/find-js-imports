# find-js-imports

`find-js-imports` is a cli tool for locating files that use a specified module's
exports.

## Usage

To find uses of the `connect` method from `react-redux` module in the
[redux](redux-url) codebase you would run `find-js-imports react-redux connect`.

![example](https://cloud.githubusercontent.com/assets/739390/24313599/b9e9f62c-109a-11e7-9760-3c7ec69221c8.png)

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
