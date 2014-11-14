var ImageMethods = {
    set: function (key, value) {
        return this.args[key] = value;
    },

    get: function (key) {
        return this.args[key];
    },

    unset: function (key) {
        delete this.args[key];
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
    },

    background: function (color) {
        this.set('-background', color);

        return this;
    },

    gravity: function (gravity) {
        this.set('-gravity', gravity);

        return this;
    },

    fit: function (strategy) {
        if (!strategy) {
            strategy = 'clip';
        }

        switch (strategy) {
            case 'clip':
                this.set('-gravity', this.get('gravity') || 'center');
                this.set('-background', this.get('-background') || 'white');
                this.set('-extent', this.get('-resize'));
                break;

            case 'crop':
                this.set('-gravity', this.get('gravity') || 'center');
                this.set('-extent', this.get('-resize'));
                this.unset('-resize');
                break;

            case 'scale':
                this.force();
                break;
        }

        return this;
    }
};

module.exports = ImageMethods;