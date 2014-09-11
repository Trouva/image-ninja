var Promise = require('bluebird');
var exec = require('child_process').exec;

var Image = function (path) {
    this.path = path;
    this.config = {};
    this.args = {};

    this.tmpPath = function () {
        var extension = this.config.format || /\.[a-z]+$/i.exec(this.path)[0].replace('.', '');
        var filename = Math.random().toString(36).substring(7);

        return '/tmp/' + filename + '.' + extension;
    };

    this.set = function (key, value) {
        this.args[key] = value;
    };

    this.get = function (key) {
        return this.args[key];
    };

    this.format = function (format) {
        this.config.format = format;

        return this;
    };

    this.force = function () {
        this.config.force = true;

        var resize = this.get('-resize');

        if (resize) {
            this.set('-resize', resize + '!');
        }

        return this;
    };

    this.width = function (width) {
        var height = this.config.height || '';

        this.set('-resize', width + 'x' + height);
        this.config.width = width;

        if (this.config.force) {
            this.force();
        }

        return this;
    };

    this.height = function (height) {
        var width = this.config.width || '';

        this.set('-resize', width + 'x' + height);
        this.config.height = height;

        if (this.config.force) {
            this.force();
        }

        return this;
    };

    this.resize = function (width, height) {
        this.width(width);
        this.height(height);

        return this;
    };

    this.save = function (destPath) {
        var sourcePath;

        var self = this;

        sourcePath = this.path;
        destPath = destPath || this.tmpPath();

        var args = [sourcePath];

        Object.keys(this.args).forEach(function (key) {
            var value = self.args[key];

            args.push(key + ' ' + value);
        });

        args.push(destPath);

        return convert(args).then(function () {
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