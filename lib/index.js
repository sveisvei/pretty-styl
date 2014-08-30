var pathJoin = require('path').join;
var fs = require('vow-fs');

var vow = require('vow');

var getTokens = require('gonzales-pe/lib/css/tokenizer');
var TokenType = require('gonzales-pe/lib/token-types');

var Comb = require('csscomb');

var Processor = function (config, minLength) {
    this._comb = new Comb(config || 'yandex');
    this._minLength = minLength || 2;
};

Processor.prototype.process = function (path) {
    var deferred = vow.defer();

    fs.isDir(path)
        .then(function (isDir) {
            var promise = isDir ?
                this._processDirectory(path) :
                this._processFile(path);

            promise.then(function () {
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });
        }, function (error) {
            deferred.reject('Can\'t read \'' + path + '\': ' + error);
        }, this);

    return deferred.promise();
};

Processor.prototype._processDirectory = function (path) {
    var deferred = vow.defer();

    fs.listDir(path)
        .then(function (list) {
            var promises = [];
            for (var i = 0, length = list.length; i < length; i++) {
                promises.push(this.process(pathJoin(path, list[i])));
            }
            vow.all(promises).then(function () {
                deferred.resolve();
            }, function (error) {
                deferred.reject(error);
            });
        }, function (error) {
            deferred.reject('Can\'t read \'' + path + '\': ' + error);
        }, this);

    return deferred.promise();
};

Processor.prototype._processFile = function (path) {
    var deferred = vow.defer();

    if (path && path.split('.').pop() === 'styl') {
        fs.read(path, {encoding: 'utf8'})
            .then(function (content) {
                this._processString(content)
                    .then(function (content) {
                        fs.write(path, content, {encoding: 'utf8'})
                            .then(function () {
                                deferred.resolve();
                            }, function (error) {
                                deferred.reject('Can\'t write \'' + path + '\': ' + error);
                            });
                    }, function (error) {
                        deferred.reject('Can\'t reformat \'' + path + '\': ' + error);
                    })
            }, function (error) {
                deferred.reject('Can\'t read \'' + path + '\': ' + error);
            }, this);
    } else {
        deferred.resolve();
    }

    return deferred.promise();
};

Processor.prototype._processString = function (str) {
    var tokens = getTokens(str);
    var lines = str.split('\n');

    for (var i = 0, length = lines.length; i < length; i++) {
        lines[i] += '\n';
    }

    var start = 0;
    var offset = 0;
    for (var i = 0, length = tokens.length; i < length; i++) {
        if (tokens[i].type === TokenType.CommentML) {
            var match = tokens[i].value.match(/\n/g);
            if (match) {
                offset += match.length;
            }
        }
        if (tokens[i].type === TokenType.LeftCurlyBracket) {
            if (start) {
                var j = i;
                while (j && tokens[j].type !== TokenType.Semicolon) {
                    j--;
                }
                if (j) {
                    lines = this._format(lines, start + offset, tokens[j].ln + offset);
                    start = tokens[i].ln + 1;
                }
            } else {
                start = tokens[i].ln + 1;
            }
        } else if (tokens[i].type === TokenType.RightCurlyBracket && start) {
            lines = this._format(lines, start + offset, tokens[i].ln - 1 + offset);
            start = 0;
        }
    }
    return vow.fulfill(lines.join(''));
};

Processor.prototype._format = function (lines, start, end) {
    start = start - 1;
    end = end - 1;

    if (end - start >= this._minLength) {
        try {
            var chunk = lines.slice(start, end + 1).join('');
            chunk = this._comb.processString('.class{\n' + chunk + '\n}');
            chunk = chunk.replace(/^\.class\{\n(.*)/, '$1')
                .replace(/(.*)\n\}$/, '$1') + '\n';
        } catch (error) {
            console.log(error.message);
        }
        if (chunk) {
            lines[start] = chunk;
            for (var i = start + 1; i <= end; i++) {
                lines[i] = '';
            }
        }
    }
    return lines;
};

module.exports = Processor;
