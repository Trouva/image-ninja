var Promise = require('bluebird');
var request = require('request');
var exec = require('child_process').exec;
var util = require('util');
var fs = require('fs');

var ImageMethods = {
    set: function (key, value) {
        return this.args[key] = value;
    },

    get: function (key) {
        return this.args[key];
    },

    format: function (format) {
        this.config.format = format;

        return this;
    },

    force: function () {
        this.config.force = true;

        var resize = this.get('-resize');

        if (resize) {
            this.set('-resize', resize + '!');
        }

        return this;
    },

    width: function (width) {
        var height = this.config.height || '';

        this.set('-resize', width + 'x' + height);
        this.config.width = width;

        if (this.config.force) {
            this.force();
        }

        return this;
    },

    height: function (height) {
        var width = this.config.width || '';

        this.set('-resize', width + 'x' + height);
        this.config.height = height;

        if (this.config.force) {
            this.force();
        }

        return this;
    },

    resize: function (width, height) {
        this.width(width);
        this.height(height);

        return this;
    },

    crop: function (x, y, width, height) {
        this.set('-crop', width + 'x' + height + '+' + x + '+' + y);
        this.config.crop = [x, y, width, height];

        return this;
    }
};

var Image = function (path) {
    this.path = path;
    this.config = {};
    this.args = {};
    this.filters = [];

    extend(this, ImageMethods);

    this.tmpPath = function () {
        var extension = this.config.format || /\.[a-z]+$/i.exec(this.path)[0].replace('.', '');
        var filename = Math.random().toString(36).substring(7);

        return '/tmp/' + filename + '.' + extension;
    };

    this.use = function (name) {
        var middleware;

        if (typeof name === 'string') {
            middleware = Image.presets[name] || Image.filters[name];
        } else {
            middleware = name;
        }

        if (!middleware) {
            throw new Error('Preset or filter with name "' + name + '" does not exist.');
        }

        if (middleware instanceof Preset) {
            var preset = middleware;
            extend(this.config, preset.config);
            extend(this.args, preset.args);
        } else if (middleware instanceof Filter) {
            var filter = middleware;
            this.filters.push(filter);
        }

        return this;
    };

    this.download = function (destPath) {
        var sourcePath;

        var self = this;

        sourcePath = this.path;
        destPath = destPath || this.tmpPath();

        var image = new Image(destPath);

        return new Promise(function (resolve, reject) {
            if (!/^http/.test(sourcePath)) {
                return resolve(self);
            }

            var file = fs.createWriteStream(destPath);
            file.on('finish', function () {
                self.path = destPath;

                image.args = self.args;
                image.config = self.config;
                image.filters = self.filters;

                resolve(image);
            });

            request.get(sourcePath).pipe(file);
        });
    };

    this.executeFilters = function (image) {
        var filters = image.filters;

        if (!filters.length) return image;

        var promise = Promise.resolve(image);

        filters.forEach(function (filter) {
            promise = promise.then(function (image) {
                return filter.handler.call(image);
            });
        });

        return promise;
    };

    this.save = function (destPath) {
        return this.download().then(this.executeFilters).then(function (image) {
            var sourcePath;

            sourcePath = image.path;
            destPath = destPath || image.tmpPath();

            var args = [sourcePath];

            Object.keys(image.args).forEach(function (key) {
                var value = image.args[key];

                args.push(key + ' ' + value);
            });

            args.push(destPath);

            return convert(args).then(function () {
                return new Image(destPath);
            });
        });
    };
};

Image.presets = {};
Image.preset = function (name) {
    return new Preset(name);
};

var Preset = function (name) {
    this.name = name;
    this.config = {};
    this.args = {};

    extend(this, ImageMethods);

    this.save = function (name) {
        name = this.name || name;

        Image.presets[name] = this;
    };
};

Image.filters = {};
Image.filter = function (name) {
    return new Filter(name);
};

var Filter = function (name) {
    this.name = name;
    this.handler;

    this.exec = function (handler) {
        this.handler = handler;
    };

    this.save = function (name) {
        name = this.name || name;

        Image.filters[name] = this;
    };
};

function convert (args) {
    return run('convert', args);
}

function identify(args) {
    return run('identify', args).then(function (output) {
        var result = /(.+) ([A-Z]{3,4}) ([0-9]+)x([0-9]+) .+ ([0-9.]+)([A-Z]{2})/.exec(output);

        return {
            path: result[1],
            format: result[2],
            width: +result[3],
            height: +result[4],
            size: result[5] + result[6]
        };
    });
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

function extend (dest, src) {
    Object.keys(src).forEach(function (key) {
        dest[key] = src[key];
    });

    return dest;
};

Image.convert = convert;
Image.identify = identify;

module.exports = Image;