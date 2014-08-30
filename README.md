#pretty-styl

pretty-styl is a simple coding style formatter for [stylus](http://learnboost.github.io/stylus/). You can easily write your own configuration to make your style sheets beautiful and consistent.

## 1. Install

Global installation (for use as a command-line tool):

```bash
npm install pretty-styl -g
```

Local installation (for use as a command-line tool within current directory):

```bash
npm install pretty-styl
```

To install as a project dependency (the package will appear in your dependencies):

```bash
npm install pretty-styl --save
```

To install as a dev dependency (the package will appear in your devDependencies):

```bash
npm install pretty-styl --save-dev
```

## 2. Use

### Command Line

```bash
pretty-styl --path assets/css
```

### [Node.js module](doc/usage-node.md)

```js
var Formatter = require('pretty-styl');
var formatter = new Formatter('zen');
formatter.process('assets/css');
```

## License

This software is released under the terms of the
[MIT license](https://github.com/alt-j/pretty-styl/blob/master/LICENSE).

## Other projects
* https://github.com/csscomb/csscomb.js
* https://github.com/senchalabs/cssbeautify
* https://github.com/css/gonzales
* https://github.com/tonyganch/gonzales-pe
* https://github.com/css/csso
* https://github.com/nzakas/parser-lib