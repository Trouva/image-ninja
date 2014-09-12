var ImageMethods = require('./methods');
var extend = require('./util').extend;

var Preset = function (name) {
    this.name = name;
    this.config = {};
    this.args = {};

    extend(this, ImageMethods);

    this.save = function (name) {
        name = this.name || name;

        var Image = require('./image');
        Image.presets[name] = this;
    };
};

module.exports = Preset;