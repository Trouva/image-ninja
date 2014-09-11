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

    after(function (done) {
        exec('rm -f /tmp/*.png /tmp/*.jpg', function () {
            done();
        });
    });
});