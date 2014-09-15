var Promise = require('bluebird');
var request = require('request');
var exec = require('child_process').exec;
var fs = require('fs');

var ImageMethods = require('./methods');
var Preset = require('./preset');
var Filter = require('./filter');
var util = require('./util');

var convert = util.convert;
var extend = util.extend;

var Image = function (path) {
    this.path = path;
    this.config = {};
    this.args = {};
    this.filters = [];

    var parts = path.split('/');
    this.name = parts[parts.length ? parts.length - 1 : 0];

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

    this.meta = function () {
        
    };
};

Image.presets = {};
Image.preset = function (name) {
    return new Preset(name);
};

Image.filters = {};
Image.filter = function (name) {
    return new Filter(name);
};

Image.convert = util.convert;
Image.identify = util.identify;

module.exports = Image;