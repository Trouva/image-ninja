var Promise = require('bluebird');
var exec = require('child_process').exec;
var util = require('util');

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

    extend(this, ImageMethods);

    this.tmpPath = function () {
        var extension = this.config.format || /\.[a-z]+$/i.exec(this.path)[0].replace('.', '');
        var filename = Math.random().toString(36).substring(7);

        return '/tmp/' + filename + '.' + extension;
    };

    this.use = function (preset) {
        if (typeof preset === 'string') {
            preset = Image.presets[preset];
        }

        if (!preset) {
            throw new Error('Preset "' + presetName + '" does not exist.');
        }

        extend(this.config, preset.config);
        extend(this.args, preset.args);

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

function extend (dest, src) {
    Object.keys(src).forEach(function (key) {
        dest[key] = src[key];
    });

    return dest;
};

Image.convert = convert;
Image.identify = identify;

module.exports = Image;