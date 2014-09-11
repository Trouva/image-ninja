var Promise = require('bluebird');
var exec = require('child_process').exec;

var Image = function (path) {
    this.path = path;
    this.config = {};

    this.tmpPath = function () {
        var extension = this.config.format || /\.[a-z]+$/i.exec(this.path)[0].replace('.', '');
        var filename = Math.random().toString(36).substring(7);

        return '/tmp/' + filename + '.' + extension;
    };

    this.format = function (format) {
        this.config.format = format;

        return this;
    };

    this.save = function (destPath) {
        destPath = destPath || this.tmpPath();

        return convert([this.path, destPath]).then(function () {
            return new Image(destPath);
        });
    };
};

function convert (args) {
    return run('convert', args);
}

function identify(args) {
    return run('identify', args);
}

function run (command, args) {
    if (args instanceof Array) {
        args = args.join(' ');
    }

    if (args instanceof Image) {
        args = args.path;
    }

    return new Promise(function (resolve, reject) {
        exec(command + ' ' + args, function (err, stdout) {
            if (err) {
                return reject(err);
            }

            resolve(stdout);
        });
    });
}

Image.convert = convert;
Image.identify = identify;

module.exports = Image;