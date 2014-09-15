var Promise = require('bluebird');
var exec = require('child_process').exec;
var fs = require('fs');

Promise.promisifyAll(fs);

function convert (args) {
    return run('convert', args);
}

function identify(args) {
    return run('identify', args).then(function (output) {
        var result = /(.+) ([A-Z]{3,4}) ([0-9]+)x([0-9]+)/.exec(output);

        var path = args.path || args;

        return fs.statAsync(path).then(function (stat) {
            return {
                path: result[1],
                format: result[2],
                width: +result[3],
                height: +result[4],
                size: stat.size,
                formattedSize: formatSize(stat.size)
            };
        });
    });
}

function run (command, args) {
    if (args instanceof Array) {
        args = args.join(' ');
    }

    var Image = require('./image');

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

/**
 * [formatSize converts size to human-readable format]
 * @copyright Uli Köhler http://techoverflow.net/blog/2012/09/16/automatically-format-size-string-in-node-js/
 * @param  {Number} size [file size]
 * @return {String}      [formatted size]
 */
function formatSize (size) {
    if (size > 1000000000) {
        return (size / 1000000000.0).toPrecision(3) + ' gigabytes';
    } else if (size > 1000000) {
        return (size / 1000000.0).toPrecision(3) + ' megabytes';
    } else if (size > 1000) {
        return (size / 1000.0).toPrecision(3) + ' kilobytes';
    } else {
        return size + ' bytes';
    }
}

module.exports = {
    convert: convert,
    identify: identify,
    run: run,
    extend: extend
};