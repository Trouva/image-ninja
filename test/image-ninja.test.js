var chai = require('chai');
var should = chai.should();
var exec = require('child_process').exec;

var Image = require('../');

var testImage = __dirname + '/fixtures/image.jpg';

describe ('ImageNinja', function () {
    describe ('Convert', function () {
        it ('should convert the image and save it to a temporary file', function (done) {
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

        it ('should convert the image and save it to a specified path', function (done) {
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

        after(function (done) {
            exec('rm -f /tmp/image*', function () {
                done();
            });
        });
    });
});