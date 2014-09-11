var chai = require('chai');
var should = chai.should();
var exec = require('child_process').exec;

var Image = require('../');

var testImage = __dirname + '/fixtures/image.jpg';

describe ('ImageNinja', function () {
    describe ('Convert', function () {
        it ('should convert image and save it to a temporary file', function (done) {
            var image = new Image(testImage);
            image.format('png')
                .save()
                .then(function (convertedImage) {
                    convertedImage.path.should.match(/^\/tmp\//);

                    Image.identify(convertedImage).then(function (output) {
                        output.should.match(/PNG/);
                        done();
                    });
                });
        });

        it ('should convert image and save it to a specified path', function (done) {
            var image = new Image(testImage);
            image.format('png')
                .save('/tmp/image.png')
                .then(function (convertedImage) {
                    convertedImage.path.should.equal('/tmp/image.png');

                    Image.identify(convertedImage).then(function (output) {
                        output.should.match(/PNG/);
                        done();
                    });
                });
        });
    });

    describe ('Resize', function () {
        it ('should resize image to a specified width', function (done) {
            var image = new Image(testImage);
            image.width(300)
                .save()
                .then(function (resizedImage) {
                    Image.identify(resizedImage).then(function (output) {
                        output.should.match(/JPEG/);
                        output.should.match(/300x[0-9]+/);

                        done();
                    });
                });
        });

        it ('should resize image to a specified height', function (done) {
            var image = new Image(testImage);
            image.height(300)
                .save()
                .then(function (resizedImage) {
                    Image.identify(resizedImage).then(function (output) {
                        output.should.match(/JPEG/);
                        output.should.match(/[0-9]+x300/);

                        done();
                    });
                });
        });

        it ('should resize image to a specified width & height while preserving aspect ratio', function (done) {
            var image = new Image(testImage);
            image.width(300)
                .height(300)
                .save()
                .then(function (resizedImage) {
                    Image.identify(resizedImage).then(function (output) {
                        output.should.match(/JPEG/);
                        output.should.match(/300x[0-9]+/);

                        done();
                    });
                });
        });

        it ('should resize image to a specified width & height without preserving aspect ratio', function (done) {
            var image = new Image(testImage);
            image.width(300)
                .height(300)
                .force()
                .save()
                .then(function (resizedImage) {
                    Image.identify(resizedImage).then(function (output) {
                        output.should.match(/JPEG/);
                        output.should.match(/300x300/);

                        done();
                    });
                });
        });

        it ('should resize image to a specified width & height using a resize method while preserving aspect ratio', function (done) {
            var image = new Image(testImage);
            image.resize(300, 300)
                .save()
                .then(function (resizedImage) {
                    Image.identify(resizedImage).then(function (output) {
                        output.should.match(/JPEG/);
                        output.should.match(/300x[0-9]+/);

                        done();
                    });
                });
        });

        it ('should resize image to a specified width & height using a resize method without preserving aspect ratio', function (done) {
            var image = new Image(testImage);
            image.resize(300, 300)
                .force()
                .save()
                .then(function (resizedImage) {
                    Image.identify(resizedImage).then(function (output) {
                        output.should.match(/JPEG/);
                        output.should.match(/300x300/);

                        done();
                    });
                });
        });
    });

    describe ('Crop', function () {
        it ('should crop an image', function (done) {
            var image = new Image(testImage);
            image.crop(5, 5, 50, 50)
                .save()
                .then(function (croppedImage) {
                    Image.identify(croppedImage).then(function (output) {
                        output.should.match(/JPEG/);
                        output.should.match(/50x50/);

                        done();
                    });
                });
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
            var image = new Image(testImage);
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

    after(function (done) {
        exec('rm -f /tmp/*.png /tmp/*.jpg', function () {
            done();
        });
    });
});