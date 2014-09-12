# Image Ninja

Simple & extendable image processing library.

#### Requirements

- node --version >= 0.10.x

## Installation

```
npm install image-ninja
```

## Getting Started

Simplest example of using Image Ninja:

```
var Image = require('image-ninja');

var image = new Image('/path/to/image.jpg');
image.format('jpg')
     .width(500)
     .height(300)
     .save()
     .then(function (newImage) {
         // newImage is an Image instance, which points to a newly created image
     });
```

## Features

1. Conversion from/to different formats
2. Resizing
3. Cropping
4. Defining and executing custom processing on given image (filters)
5. Ability to set a URL as a source image and it should detect this and automatically download it
6. Defining presets

## Guide

Assuming the beginning of all code listings is:

```
var Image = require('image-ninja');
```

#### Conversion from/to different formats

```
var image = new Image('/tmp/image.png');
image.format('jpg')
     .save()
     .then(function (convertedImage) {
        // convertedImage is an Image instance that points to a converted image
        // allows further processing without the need to create a new Image
     });
```

Alternative way:

```
var image = new Image('/tmp/image.png');
image.save('/tmp/output.jpg')
     .then(function (convertedImage) {
        // convertedImage is an Image instance that points to a converted image
        // allows further processing without the need to create a new Image
     });
```

#### Resizing

```
var image = new Image('/tmp/image.png');
image.width(500)
     .height(300)
     .save('/tmp/resized.png')
     .then(function (resizedImage) {
        // resizedImage is an Image instance that points to a resized image
        // allows further processing without the need to create a new Image
     });
```

Alternative way:

```
var image = new Image('/tmp/image.png');
image.resize(500, 300)
     .save('/tmp/resized.png')
     .then(function (resizedImage) {
         // resizedImage is an Image instance that points to a resized image
        // allows further processing without the need to create a new Image
     });
```

#### Cropping

```
var image = new Image('/tmp/image.png');
image.crop(5, 5, 50, 50) // x, y, width, height
     .save()
     .then(function (croppedImage) {
        // croppedImage is an Image instance that points to a resized image
        // allows further processing without the need to create a new Image
     });
```

#### Defining custom processing

```
Image.filter('trimWhitespace')
     .exec(function () {
        var image = this; // context is a source Image
        return image.add('-trim')
                    .save();
     })
     .save();

var image = new Image('/tmp/image.png');
image.use('trimWhitespace')
     .save('/tmp/output.png')
     .then(function (cleanImage) {
        // done
     });
```

If you don't want to register a filter and make a temporary one:

```
var filter = Image.filter()
filter.exec(function () {
    var image = this;
    return image.add('-trim')
                .save();
    });

var image = new Image('/tmp/image.png');
image.use(filter)
     .save('/tmp/output.png')
     .then(function (cleanImage) {
        // done
     });
```

#### Ability to set a URL as a source

```
var image = new Image('http://example.com/image.png');
image.format('jpg')
     .save()
     .then(function (downloadedImage) {
        // done
     });
```

#### Defining presets

Presets stop repetition and provide a fast way to use all the needed methods and filters on different Image instances using one line:

```
Image.preset('mobile')
     .width(300)
     .height(240)
     .save();

var image = new Image('/tmp/image.png');
image.use('mobile')
     .save()
     .then(function (mobileImage) {
        // done
     });
```

## License

The MIT License (MIT)
Copyright © 2014 StreetHub <hello@streethub.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.