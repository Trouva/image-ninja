var Promise = require('bluebird');
var chai = require('chai');
var should = chai.should();
var exec = require('child_process').exec;

var Image = require('../');

var testImage = {
    path: __dirname + '/fixtures/image.jpg',
    meta: null
};

describe ('ImageNinja', function () {
    before (function (done) {
        var image = new Image(testImage.path);
        image.name.should.equal('image.jpg');
        Image.identify(image).then(function (meta) {
            testImage.meta = meta;
            done();
        }).catch(done);
    });

    describe ('Convert', function () {
        it ('should convert image and save it to a temporary file', function (done) {
            var image = new Image(testImage.path);
            image.format('png')
                .save()
                .then(function (convertedImage) {
                    convertedImage.path.should.match(/^\/tmp\//);

                    return Image.identify(convertedImage).then(function (meta) {
                        meta.width.should.equal(testImage.meta.width);
                        meta.height.should.equal(testImage.meta.height);
                        meta.format.should.equal('PNG');
                        meta.size.should.be.above(0);

                        done();
                    });
                })
                .catch(done);
        });

        it ('should convert image and save it to a specified path', function (done) {
            var image = new Image(testImage.path);
            image.format('png')
                .save('/tmp/image.png')
                .then(function (convertedImage) {
                    convertedImage.path.should.equal('/tmp/image.png');
                    convertedImage.name.should.equal('image.png');

                    return Image.identify(convertedImage).then(function (meta) {
                        meta.width.should.equal(testImage.meta.width);
                        meta.height.should.equal(testImage.meta.height);
                        meta.format.should.equal('PNG');
                        meta.size.should.be.above(0);

                        done();
                    });
                })
                .catch(done);
        });
    });

    describe ('Resize', function () {
        it ('should resize image to a specified width', function (done) {
            var image = new Image(testImage.path);
            image.width(300)
                .save()
                .then(function (resizedImage) {
                    return Image.identify(resizedImage).then(function (meta) {
                        meta.width.should.equal(300);
                        meta.format.should.equal('JPEG');
                        meta.size.should.be.above(0);

                        done();
                    });
                })
                .catch(done);
        });

        it ('should resize image to a specified height', function (done) {
            var image = new Image(testImage.path);
            image.height(300)
                .save()
                .then(function (resizedImage) {
                    return Image.identify(resizedImage).then(function (meta) {
                        meta.height.should.equal(300);
                        meta.format.should.equal('JPEG');
                        meta.size.should.be.above(0);

                        done();
                    });
                })
                .catch(done);
        });

        it ('should resize image to a specified width & height while preserving aspect ratio', function (done) {
            var image = new Image(testImage.path);
            image.width(300)
                .height(300)
                .save()
                .then(function (resizedImage) {
                    return Image.identify(resizedImage).then(function (meta) {
                        meta.width.should.equal(300);
                        meta.format.should.equal('JPEG');
                        meta.size.should.be.above(0);

                        done();
                    });
                })
                .catch(done);
        });

        it ('should resize image to a specified width & height while preserving aspect ratio and fitting into boundaries using clip strategy', function (done) {
            var image = new Image(testImage.path);
            image.width(300)
                .height(250)
                .fit('clip')
                .save()
                .then(function (resizedImage) {
                    return Image.identify(resizedImage).then(function (meta) {
                        meta.width.should.equal(300);
                        meta.height.should.equal(250);
                        meta.format.should.equal('JPEG');
                        meta.size.should.be.above(0);

                        done();
                    });
                }).catch(done);
        });

        it ('should resize image to a specified width & height while preserving aspect ratio and fitting into boundaries using crop strategy', function (done) {
            var image = new Image(testImage.path);
            image.width(300)
                .height(250)
                .fit('crop')
                .save()
                .then(function (resizedImage) {
                    return Image.identify(resizedImage).then(function (meta) {
                        meta.width.should.equal(300);
                        meta.height.should.equal(250);
                        meta.format.should.equal('JPEG');
                        meta.size.should.be.above(0);

                        done();
                    });
                })
                .catch(done);
        });

        it ('should resize image to a specified width & height without preserving aspect ratio', function (done) {
            var image = new Image(testImage.path);
            image.width(300)
                .height(300)
                .force()
                .save()
                .then(function (resizedImage) {
                    return Image.identify(resizedImage).then(function (meta) {
                        meta.width.should.equal(300);
                        meta.height.should.equal(300);
                        meta.format.should.equal('JPEG');
                        meta.size.should.be.above(0);

                        done();
                    });
                })
                .catch(done);
        });

        it ('should resize image to a specified width & height using a resize method while preserving aspect ratio', function (done) {
            var image = new Image(testImage.path);
            image.resize(300, 300)
                .save()
                .then(function (resizedImage) {
                    return Image.identify(resizedImage).then(function (meta) {
                        meta.width.should.equal(300);
                        meta.format.should.equal('JPEG');
                        meta.size.should.be.above(0);

                        done();
                    });
                })
                .catch(done);
        });

        it ('should resize image to a specified width & height using a resize method without preserving aspect ratio', function (done) {
            var image = new Image(testImage.path);
            image.resize(300, 300)
                .force()
                .save()
                .then(function (resizedImage) {
                    return Image.identify(resizedImage).then(function (meta) {
                        meta.width.should.equal(300);
                        meta.height.should.equal(300);
                        meta.format.should.equal('JPEG');
                        meta.size.should.be.above(0);

                        done();
                    });
                })
                .catch(done);
        });
    });

    describe ('Crop', function () {
        it ('should crop an image', function (done) {
            var image = new Image(testImage.path);
            image.crop(5, 5, 50, 50)
                .save()
                .then(function (croppedImage) {
                    return Image.identify(croppedImage).then(function (meta) {
                        meta.width.should.equal(50);
                        meta.height.should.equal(50);
                        meta.format.should.equal('JPEG');

                        done();
                    });
                })
                .catch(done);
        });
    });

    describe ('Presets', function () {
        var mobilePreset;

        it ('should define a preset', function () {
            mobilePreset = Image.preset('mobile');
            mobilePreset.width(500)
                        .height(350)
                        .force()
                        .crop(5, 5, 100, 100)
                        .format('png');

            mobilePreset.config.width.should.equal(500);
            mobilePreset.config.height.should.equal(350);
            mobilePreset.config.force.should.equal(true);
            mobilePreset.config.crop[0].should.equal(5);
            mobilePreset.config.crop[1].should.equal(5);
            mobilePreset.config.crop[2].should.equal(100);
            mobilePreset.config.crop[3].should.equal(100);
            mobilePreset.config.format.should.equal('png');

            mobilePreset.args['-resize'].should.equal('500x350!');
            mobilePreset.args['-crop'].should.equal('100x100+5+5');

            mobilePreset.resize(200, 250);

            mobilePreset.config.width.should.equal(200);
            mobilePreset.config.height.should.equal(250);
            mobilePreset.config.force.should.equal(true);

            mobilePreset.args['-resize'].should.equal('200x250!');
            mobilePreset.args['-crop'].should.equal('100x100+5+5');
        });

        it ('should use a preset', function () {
            var image = new Image(testImage.path);
            image.width(300)
                .height(300);

            image.config.width.should.equal(300);
            image.config.height.should.equal(300);

            image.args['-resize'].should.equal('300x300');

            image.use(mobilePreset);

            image.config.width.should.equal(200);
            image.config.height.should.equal(250);
            image.config.force.should.equal(true);
            image.config.crop[0].should.equal(5);
            image.config.crop[1].should.equal(5);
            image.config.crop[2].should.equal(100);
            image.config.crop[3].should.equal(100);
            image.config.format.should.equal('png');

            image.args['-resize'].should.equal('200x250!');
            image.args['-crop'].should.equal('100x100+5+5');
        });

        it ('should save a preset', function () {
            mobilePreset.save();

            should.exist(Image.presets['mobile']);
        });
    });

    describe ('Filters', function () {
        var monoFilter;

        it ('should define a filter', function () {
            monoFilter = Image.filter('mono');
            monoFilter.exec(function () {
                var image = new Image(this.path);
                image.set('-type', 'Grayscale');
                return image.save();
            });

            monoFilter.name.should.equal('mono');
            monoFilter.handler.should.be.instanceof(Function);
        });

        it ('should use a filter', function (done) {
            var image = new Image(testImage.path);
            image.use(monoFilter)
                .save()
                .then(function (monoImage) {
                    return Image.identify(monoImage).then(function (meta) {
                        meta.width.should.equal(testImage.meta.width);
                        meta.height.should.equal(testImage.meta.height);
                        meta.format.should.equal(testImage.meta.format);
                        meta.size.should.be.above(0);

                        done();
                    });
                })
                .catch(done);
        });

        it ('should save a filter', function () {
            monoFilter.save();

            should.exist(Image.filters['mono']);
        });
    });

    describe ('Utilities', function () {
        it ('should download a source image if a URL is provided', function (done) {
            this.timeout(20000);

            var image = new Image('http://www.mixmag.net/sites/default/files/imagecache/article/images/620x413-swedish-house-mafia1.jpg');
            image.name.should.equal('620x413-swedish-house-mafia1.jpg');
            image.save()
                .then(function (downloadedImage) {
                    return Promise.props({
                        original: Image.identify(testImage.path),
                        downloaded: Image.identify(downloadedImage)
                    }).then(function (results) {
                        var original = results.original;
                        var downloaded = results.downloaded;

                        downloaded.width.should.equal(original.width);
                        downloaded.height.should.equal(original.height);
                        downloaded.format.should.equal(original.format);
                        downloaded.size.should.be.above(0);

                        done();
                    });
                })
                .catch(done);
        });
    });

    after(function (done) {
        exec('rm -f /tmp/*.png /tmp/*.jpg', function () {
            done();
        });
    });
});