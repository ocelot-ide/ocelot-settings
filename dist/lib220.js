function lib220(getRunner, stopifyArray, stopifyObjectArrayRecur) {
    function hexColorChannel(n) {
        let v = (Math.floor(n * 255)).toString(16);
        if (v.length < 2) {
            v = '0' + v;
        }
        return v;
    }
    function rgbToHex(rgb) {
        let hex = '#';
        for (let i = 0; i < 3; ++i) {
            hex += hexColorChannel(rgb[i]);
        }
        return hex;
    }
    function argCheck(func, p, paramTypes) {
        try {
            const n = paramTypes.length;
            if (p.length !== n) {
                throw new TypeError(`Invalid call to ${func}: ${n} arguments required but ${p.length} given`);
            }
            for (let i = 0; i < n; ++i) {
                const t = typeof (p[i]);
                if (t !== paramTypes[i]) {
                    throw new TypeError(`Invalid call to ${func}: argument ${i} expected ${paramTypes[i]} but ${t} given`);
                }
            }
        }
        catch (e) {
            if (e.toString().includes(`Invalid call to ${func}:`)) {
                throw (e);
            }
            else {
                throw new Error(`Invalid call to ${func}: ${e}`);
            }
        }
    }
    function validateColor(col) {
        try {
            if (col.length !== 3 ||
                typeof (col[0]) !== 'number' ||
                typeof (col[1]) !== 'number' ||
                typeof (col[2]) !== 'number') {
                throw new TypeError(`Invalid color value`);
            }
        }
        catch (e) {
            throw new TypeError(`Invalid color value`);
        }
    }
    class Point {
        constructor(x, y) {
            argCheck('Point constructor', arguments, ['number', 'number']);
            this.x = x;
            this.y = y;
        }
    }
    class Line {
        constructor(p1, p2) {
            argCheck('Line constructor', arguments, ['object', 'object']);
            this.p1 = p1;
            this.p2 = p2;
        }
    }
    function checkIfPoint(p) {
        if (typeof (p) !== 'object' ||
            typeof (p.x) !== 'number' ||
            typeof (p.y) !== 'number') {
            throw new TypeError(`Invalid Point`);
        }
    }
    function checkIfLine(l) {
        checkIfPoint(l.p1);
        checkIfPoint(l.p2);
    }
    function perp(l) {
        return new Point(l.p1.y - l.p2.y, l.p2.x - l.p1.x);
    }
    function dot(p1, p2) {
        return p1.x * p2.x + p1.y * p2.y;
    }
    function minus(p1, p2) {
        return new Point(p1.x - p2.x, p1.y - p2.y);
    }
    function distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    }
    function pointOnLine(p, line) {
        const d = distance(line.p1, line.p2);
        if (d > 0) {
            const dir = minus(line.p1, line.p2), prp = new Point(dir.y, -dir.x), projection = dot(minus(p, line.p2), dir) / d, collinear = dot(minus(p, line.p2), prp) === 0;
            return collinear && projection > 0 && projection < d;
        }
        else {
            return p.x === line.p1.x && p.y === line.p2.y;
        }
    }
    class DrawingCanvas {
        constructor(w, h) {
            this.width = 1;
            this.height = 1;
            this.ctx = undefined;
            argCheck('DrawingCanvas constructor', arguments, ['number', 'number']);
            this.width = w;
            this.height = h;
            if (typeof document === 'undefined') {
                return;
            }
            const canvases = document.getElementById('canvases'), canvas = document.createElement('canvas');
            canvas.setAttribute('width', this.width.toString());
            canvas.setAttribute('height', this.height.toString());
            this.ctx = canvas.getContext('2d');
            canvas.style.paddingBottom = '5px';
            canvas.style.display = 'block';
            canvases.appendChild(canvas);
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        drawLine(x1, y1, x2, y2, col) {
            argCheck('drawLine', arguments, ['number', 'number', 'number', 'number', 'object']);
            validateColor(col);
            if (this.ctx === undefined) {
                return;
            }
            this.ctx.strokeStyle = rgbToHex(col);
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
        drawArc(x, y, r, a0, a1, col) {
            argCheck('drawArc', arguments, ['number', 'number', 'number', 'number', 'number', 'object']);
            validateColor(col);
            if (this.ctx === undefined) {
                return;
            }
            this.ctx.strokeStyle = rgbToHex(col);
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, a0, a1);
            this.ctx.stroke();
        }
        drawCircle(x, y, r, col) {
            argCheck('drawCircle', arguments, ['number', 'number', 'number', 'object']);
            validateColor(col);
            this.drawArc(x, y, r, 0, 2 * Math.PI, col);
        }
        drawFilledCircle(x, y, r, col) {
            argCheck('drawCircle', arguments, ['number', 'number', 'number', 'object']);
            validateColor(col);
            if (this.ctx === undefined) {
                return;
            }
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, 2 * Math.PI);
            this.ctx.fillStyle = rgbToHex(col);
            this.ctx.fill();
        }
        clear() {
            argCheck('clear', arguments, []);
            if (this.ctx === undefined) {
                return;
            }
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    class FudgedImageData {
        constructor(width, height) {
            this.width = 1;
            this.height = 1;
            this.data = new Uint8ClampedArray(4);
            if (arguments.length !== 2) {
                throw new TypeError(`Failed to construct Node 'ImageData': 2 arguments required but ${arguments.length} given`);
            }
            if ((typeof width !== 'number' || width === 0)) {
                throw new Error('Failed to construct \'ImageData\': width is zero or not a number.');
            }
            if ((typeof height !== 'number' || height === 0)) {
                throw new Error('Failed to construct \'ImageData\': width is zero or not a number.');
            }
            this.width = width;
            this.height = height;
            this.data = new Uint8ClampedArray(4 * this.width * this.height);
        }
    }
    function createImageData(w, h) {
        return (typeof ImageData !== 'undefined') ?
            new ImageData(w, h) : new FudgedImageData(w, h);
    }
    function assertValidPixel(pixel) {
        if (pixel.length !== 3) {
            throw new Error(`A pixel value must be a 3-element array`);
        }
        for (let i = 0; i < 3; i++) {
            if (typeof pixel[i] !== 'number') {
                throw new Error(`Pixel channel value must be a number`);
            }
            if (pixel[i] < 0.0 || pixel[i] > 1.0) {
                throw new Error(`Pixel channel value ${pixel[i]} is invalid`);
            }
        }
    }
    function EncapsulatedImage(imageData) {
        const data = imageData.data, w = imageData.width, h = imageData.height;
        function assertValidCoordinate(x, y) {
            if (x < 0 || y < 0 || x >= w || y >= h) {
                throw new Error(`Pixel coordinate (${x}, ${y}) is invalid. The image has height ${h} and width ${w}.`);
            }
        }
        return Object.freeze({
            width: w,
            height: h,
            copy: function () {
                const copiedImage = EncapsulatedImage(createImageData(w, h));
                let pixel;
                for (let i = 0; i < w; i++) {
                    for (let j = 0; j < h; j++) {
                        pixel = this.getPixel(i, j);
                        copiedImage.setPixel(i, j, pixel);
                    }
                }
                return copiedImage;
            },
            show: function () {
                if (typeof document === 'undefined') {
                    return;
                }
                const canvases = document.getElementById('canvases'), canvas = document.createElement('canvas');
                canvas.setAttribute('width', w);
                canvas.setAttribute('height', h);
                const ctx = canvas.getContext('2d');
                ctx.putImageData(imageData, 0, 0);
                canvas.style.display = 'block';
                canvas.style.paddingBottom = '5px';
                canvases.appendChild(canvas);
            },
            setPixel: function (x, y, c) {
                if (arguments.length !== 3) {
                    throw new Error(`.setPixel expects 3 arguments, received ${arguments.length}`);
                }
                assertValidCoordinate(x, y);
                assertValidPixel(c);
                const index = 4 * (y * w + x);
                data[index] = Math.round(c[0] * 255);
                data[index + 1] = Math.round(c[1] * 255);
                data[index + 2] = Math.round(c[2] * 255);
                data[index + 3] = 255;
            },
            getPixel: function (x, y) {
                if (arguments.length !== 2) {
                    throw new Error(`.getPixel expects 2 arguments, received ${arguments.length}`);
                }
                assertValidCoordinate(x, y);
                const index = 4 * (y * w + x), p = stopifyArray([
                    data[index] / 255.0,
                    data[index + 1] / 255.0,
                    data[index + 2] / 255.0
                ]);
                return p;
            }
        });
    }
    function loadURLHandler(defaultOutput, loadFunction) {
        return function (url) {
            if (typeof document === 'undefined') {
                return defaultOutput;
            }
            const runnerResult = getRunner();
            if (runnerResult.kind === 'error') {
                throw new Error('Program is not running');
            }
            const runner = runnerResult.value.runner;
            return runner.pauseImmediate(() => {
                const userEmail = localStorage.getItem('userEmail'), sessionId = localStorage.getItem('sessionId');
                if (userEmail === null || sessionId === null) {
                    if (runnerResult.value.isRunning) {
                        runner.continueImmediate({
                            type: 'exception',
                            stack: [],
                            value: new Error(`User is not logged in`)
                        });
                    }
                    else {
                        runnerResult.value.onStopped();
                    }
                }
                const encodedURL = encodeURIComponent(url), baseUrl = (window.location.hostname === 'www.ocelot-ide.org') ?
                    'https://us-central1-arjunguha-research-group.cloudfunctions.net/paws/' :
                    'https://us-central1-arjunguha-research-group.cloudfunctions.net/ocelot-beta/', getUrlLink = `${baseUrl}geturl?`, queryURL = `${getUrlLink}url=${encodedURL}&user=${userEmail}&session=${sessionId}`;
                fetch(queryURL).then(response => {
                    if (!response.ok) {
                        if (runnerResult.value.isRunning) {
                            runner.continueImmediate({
                                type: 'exception',
                                stack: [],
                                value: new Error(`Could not load from URL, URL may be invalid or redirected`),
                            });
                        }
                        else {
                            runnerResult.value.onStopped();
                        }
                    }
                    return response;
                }).then(response => {
                    loadFunction(runnerResult.value, response);
                }).catch(err => {
                    if (runnerResult.value.isRunning) {
                        runner.continueImmediate({
                            type: 'exception',
                            stack: [],
                            value: new Error(`Could not load from URL`),
                        });
                    }
                    else {
                        runnerResult.value.onStopped();
                    }
                });
            });
        };
    }
    return {
        Point, Line,
        newPoint: function (x, y) {
            argCheck('Point constructor', arguments, ['number', 'number']);
            return new Point(x, y);
        },
        newLine: function (p1, p2) {
            argCheck('Line constructor', arguments, ['object', 'object']);
            checkIfPoint(p1);
            checkIfPoint(p2);
            return new Line(p1, p2);
        },
        intersects: function (l1, l2) {
            argCheck('intersects', arguments, ['object', 'object']);
            checkIfLine(l1);
            checkIfLine(l2);
            if (distance(l1.p1, l1.p2) === 0) {
                return pointOnLine(l1.p1, l2);
            }
            else if (distance(l2.p1, l2.p2) === 0) {
                return pointOnLine(l2.p1, l1);
            }
            const n1 = perp(l1), n2 = perp(l2), d1 = dot(n1, minus(l2.p1, l1.p1)), d2 = dot(n1, minus(l2.p2, l1.p1)), d3 = dot(n2, minus(l1.p1, l2.p1)), d4 = dot(n2, minus(l1.p2, l2.p1));
            let numZeros = 0;
            if (d1 === 0) {
                numZeros += 1;
            }
            if (d2 === 0) {
                numZeros += 1;
            }
            if (d3 === 0) {
                numZeros += 1;
            }
            if (d4 === 0) {
                numZeros += 1;
            }
            if (numZeros <= 1) {
                const intersects1 = d1 * d2 < 0, intersects2 = d3 * d4 < 0;
                return intersects1 && intersects2;
            }
            else if (numZeros === 2) {
                return true;
            }
            else {
                return pointOnLine(l1.p1, l2) || pointOnLine(l1.p2, l2) ||
                    pointOnLine(l2.p1, l1) || pointOnLine(l2.p2, l1);
            }
        },
        DrawingCanvas,
        newCanvas: function (w, h) {
            argCheck('newCanvas', arguments, ['number', 'number']);
            return new DrawingCanvas(w, h);
        },
        loadImageFromURL: loadURLHandler(EncapsulatedImage(createImageData(50, 50)), (runner, response) => {
            const stopifyRunner = runner.runner, img = new Image();
            img.setAttribute('crossOrigin', 'Anonymous');
            img.onerror = () => {
                if (runner.isRunning) {
                    stopifyRunner.continueImmediate({
                        type: 'exception',
                        stack: [],
                        value: new Error(`Image could not be loaded`)
                    });
                }
                else {
                    runner.onStopped();
                }
            };
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.setAttribute('height', String(img.height));
                canvas.setAttribute('width', String(img.width));
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                if (runner.isRunning) {
                    stopifyRunner.continueImmediate({
                        type: 'normal',
                        value: EncapsulatedImage(imageData)
                    });
                }
                else {
                    runner.onStopped();
                }
            };
            response.blob().then((blob) => {
                img.src = URL.createObjectURL(blob);
            }).catch(() => {
                if (runner.isRunning) {
                    stopifyRunner.continueImmediate({
                        type: 'exception',
                        stack: [],
                        value: new Error(`Image URL could not be loaded`)
                    });
                }
                else {
                    stopifyRunner.pause(() => { });
                }
            });
        }),
        createImage: function (width, height, fill) {
            argCheck('createImage', arguments, ['number', 'number', 'object']);
            if (arguments.length !== 3) {
                throw new Error(`createImage expects 3 arguments, received ${arguments.length}`);
            }
            const img = EncapsulatedImage(createImageData(width, height));
            assertValidPixel(fill);
            for (let i = 0; i < width; i++) {
                for (let j = 0; j < height; j++) {
                    img.setPixel(i, j, fill);
                }
            }
            return img;
        },
        getProperty: function (o, key) {
            argCheck('getProperty', arguments, ['object', 'string']);
            return o.hasOwnProperty(key) ? { found: true, value: o[key] } : { found: false };
        },
        setProperty: function (o, key, value) {
            if (arguments.length !== 3) {
                throw new Error(`setProperty expects 3 arguments, received ${arguments.length}`);
            }
            argCheck('setProperty', [o, key], ['object', 'string']);
            o[key] = value;
        },
        loadJSONFromURL: loadURLHandler([{
                "name": "Back-Health Chiropractic",
                "city": "Phoenix",
                "state": "AZ",
                "stars": 5,
                "review_count": 19,
                "attributes": {
                    "AcceptsInsurance": true,
                    "ByAppointmentOnly": true,
                    "BusinessAcceptsCreditCards": true
                },
                "categories": [
                    "Chiropractors",
                    "Health & Medical"
                ]
            }, {
                "name": "TRUmatch",
                "city": "Scottsdale",
                "state": "AZ",
                "stars": 3,
                "review_count": 3,
                "attributes": {},
                "categories": [
                    "Professional Services",
                    "Matchmakers"
                ]
            }], (runner, response) => {
            response.json().then((jsonObj) => {
                runner.runner.continueImmediate({
                    type: 'normal',
                    value: stopifyObjectArrayRecur(jsonObj)
                });
            }).catch(() => {
                runner.isRunning ?
                    runner.runner.continueImmediate({
                        type: 'exception',
                        stack: [],
                        value: new Error(`JSON file could not be loaded`)
                    }) :
                    runner.runner.pause(() => { });
            });
        }),
        sleep: function (milliseconds) {
            argCheck('sleep', arguments, ['number']);
            if (typeof document === 'undefined') {
                return;
            }
            const runnerResult = getRunner();
            if (runnerResult.kind === 'error') {
                throw new Error('Program is not running');
            }
            const runner = runnerResult.value, stopifyRunner = runner.runner;
            return stopifyRunner.pauseImmediate(() => {
                window.setTimeout(() => {
                    if (runner.isRunning) {
                        stopifyRunner.continueImmediate({ type: 'normal', value: undefined });
                    }
                    else {
                        runner.onStopped();
                    }
                }, milliseconds);
            });
        },
        input: function (message) {
            argCheck('input', arguments, ['string']);
            if (typeof document === 'undefined') {
                return 'user input is disabled';
            }
            const runnerResult = getRunner();
            if (runnerResult.kind === 'error') {
                throw new Error('Program is not running');
            }
            const runner = runnerResult.value, stopifyRunner = runner.runner;
            return stopifyRunner.pauseImmediate(() => {
                const userInput = prompt(message);
                if (userInput === null) {
                    if (runner.isRunning) {
                        stopifyRunner.continueImmediate({
                            type: 'normal',
                            value: ''
                        });
                    }
                    else {
                        runner.onStopped();
                    }
                }
                if (runner.isRunning) {
                    stopifyRunner.continueImmediate({
                        type: 'normal',
                        value: userInput
                    });
                }
                else {
                    runner.onStopped();
                }
            });
        }
    };
}