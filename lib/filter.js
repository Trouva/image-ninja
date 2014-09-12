var Filter = function (name) {
    this.name = name;
    this.handler;

    this.exec = function (handler) {
        this.handler = handler;
    };

    this.save = function (name) {
        name = this.name || name;

        var Image = require('./image');
        Image.filters[name] = this;
    };
};

module.exports = Filter;