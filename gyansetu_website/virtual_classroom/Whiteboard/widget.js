
'use strict';

(function() {

    var is = {
        isLine: false,
        isArrow: false,
        isArc: false,
        isDragLastPath: false,
        isDragAllPaths: false,
        isRectangle: false,
        isQuadraticCurve: false,
        isBezierCurve: false,
        isPencil: false,
        isMarker: true,
        isEraser: false,
        isText: false,
        isImage: false,
        isPdf: false,

        set: function(shape) {
            var cache = this;

            cache.isLine = cache.isArrow = cache.isArc = cache.isDragLastPath = cache.isDragAllPaths = cache.isRectangle = cache.isQuadraticCurve = cache.isBezierCurve = cache.isPencil = cache.isMarker = cache.isEraser = cache.isText = cache.isImage = cache.isPdf = false;
            cache['is' + shape] = true;
        }
    };

    function addEvent(element, eventType, callback) {
        if (eventType.split(' ').length > 1) {
            var events = eventType.split(' ');
            for (var i = 0; i < events.length; i++) {
                addEvent(element, events[i], callback);
            }
            return;
        }

        if (element.addEventListener) {
            element.addEventListener(eventType, callback, !1);
            return true;
        } else if (element.attachEvent) {
            return element.attachEvent('on' + eventType, callback);
        } else {
            element['on' + eventType] = callback;
        }
        return this;
    }
   

    function find(selector) {
        return document.getElementById(selector);
    }

    

    var points = [],
        textarea = find('code-text'),
        lineWidth = 2,
        strokeStyle = '#6c96c8',
        fillStyle = 'rgba(0,0,0,0)',
        globalAlpha = 1,
        globalCompositeOperation = 'source-over',
        lineCap = 'round',
        font = '15px "Arial"',
        lineJoin = 'round';

    function getContext(id) {
        var canv = find(id),
            ctx = canv.getContext('2d');

        canv.setAttribute('width', innerWidth);
        canv.setAttribute('height', innerHeight);

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.fillStyle = fillStyle;
        ctx.font = font;

        return ctx;
    }

    var context = getContext('main-canvas'),
        tempContext = getContext('temp-canvas');

    var common = {
        updateTextArea: function() {
            var c = common,
                toFixed = c.toFixed,
                getPoint = c.getPoint,

                isAbsolutePoints = find('is-absolute-points').checked,
                isShortenCode = find('is-shorten-code').checked;

            if (isAbsolutePoints && isShortenCode) c.absoluteShortened();
            if (isAbsolutePoints && !isShortenCode) c.absoluteNOTShortened(toFixed);
            if (!isAbsolutePoints && isShortenCode) c.relativeShortened(toFixed, getPoint);
            if (!isAbsolutePoints && !isShortenCode) c.relativeNOTShortened(toFixed, getPoint);
        },
        toFixed: function(input) {
            return Number(input).toFixed(1);
        },
        getPoint: function(pointToCompare, compareWith, prefix) {
            if (pointToCompare > compareWith) pointToCompare = prefix + ' + ' + (pointToCompare - compareWith);
            else if (pointToCompare < compareWith) pointToCompare = prefix + ' - ' + (compareWith - pointToCompare);
            else pointToCompare = prefix;

            return pointToCompare;
        },
        absoluteShortened: function() {
            var output = '',
                length = points.length,
                i = 0,
                point;
            for (i; i < length; i++) {
                point = points[i];
                output += this.shortenHelper(point[0], point[1], point[2]);
            }

            output = output.substr(0, output.length - 2);
            textarea.value = 'var points = [' + output + '], length = points.length, point, p, i = 0;\n\n' + drawArrow.toString() + '\n\n' + this.forLoop;

            this.prevProps = null;
        },
        absoluteNOTShortened: function(toFixed) {
            var tempArray = [],
                i, point, p;

            for (i = 0; i < points.length; i++) {
                p = points[i];
                point = p[1];

                if (p[0] === 'pencil') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'marker') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'eraser') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'line') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'pencil') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.lineTo(' + point[2] + ', ' + point[3] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'text') {
                    tempArray[i] = [this.strokeOrFill(p[2]) + '\ncontext.fillText(' + point[0] + ', ' + point[1] + ', ' + point[2] + ');'];
                }

                if (p[0] === 'arrow') {
                    tempArray[i] = ['drawArrow(' + point[0] + ', ' + point[1] + ', ' + point[2] + ', ' + point[3] + ', \'' + p[2].join('\',\'') + '\');'];
                }

                if (p[0] === 'arc') {
                    tempArray[i] = ['context.beginPath(); \n' + 'context.arc(' + toFixed(point[0]) + ',' + toFixed(point[1]) + ',' + toFixed(point[2]) + ',' + toFixed(point[3]) + ', 0,' + point[4] + '); \n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'rect') {
                    tempArray[i] = [this.strokeOrFill(p[2]) + '\n' + 'context.strokeRect(' + point[0] + ', ' + point[1] + ',' + point[2] + ',' + point[3] + ');\n' + 'context.fillRect(' + point[0] + ', ' + point[1] + ',' + point[2] + ',' + point[3] + ');'];
                }

                if (p[0] === 'quadratic') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.quadraticCurveTo(' + point[2] + ', ' + point[3] + ', ' + point[4] + ', ' + point[5] + ');\n' + this.strokeOrFill(p[2])];
                }

                if (p[0] === 'bezier') {
                    tempArray[i] = ['context.beginPath();\n' + 'context.moveTo(' + point[0] + ', ' + point[1] + ');\n' + 'context.bezierCurveTo(' + point[2] + ', ' + point[3] + ', ' + point[4] + ', ' + point[5] + ', ' + point[6] + ', ' + point[7] + ');\n' + this.strokeOrFill(p[2])];
                }

            }
            textarea.value = tempArray.join('\n\n') + this.strokeFillText + '\n\n' + drawArrow.toString();

            this.prevProps = null;
        },
        relativeShortened: function(toFixed, getPoint) {
            var i = 0,
                point, p, length = points.length,
                output = '',
                x = 0,
                y = 0;

            for (i; i < length; i++) {
                p = points[i];
                point = p[1];

                if (i === 0) {
                    x = point[0];
                    y = point[1];
                }

                if (p[0] === 'text') {
                    x = point[1];
                    y = point[2];
                }

                if (p[0] === 'pencil') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'marker') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'eraser') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'line') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'pencil') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'arrow') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'text') {
                    output += this.shortenHelper(p[0], [
                        point[0],
                        getPoint(point[1], x, 'x'),
                        getPoint(point[2], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'arc') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        point[2],
                        point[3],
                        point[4]
                    ], p[2]);
                }

                if (p[0] === 'rect') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'quadratic') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y'),
                        getPoint(point[4], x, 'x'),
                        getPoint(point[5], y, 'y')
                    ], p[2]);
                }

                if (p[0] === 'bezier') {
                    output += this.shortenHelper(p[0], [
                        getPoint(point[0], x, 'x'),
                        getPoint(point[1], y, 'y'),
                        getPoint(point[2], x, 'x'),
                        getPoint(point[3], y, 'y'),
                        getPoint(point[4], x, 'x'),
                        getPoint(point[5], y, 'y'),
                        getPoint(point[6], x, 'x'),
                        getPoint(point[7], y, 'y')
                    ], p[2]);
                }
            }

            output = output.substr(0, output.length - 2);
            textarea.value = 'var x = ' + x + ', y = ' + y + ', points = [' + output + '], length = points.length, point, p, i = 0;\n\n' + drawArrow.toString() + '\n\n' + this.forLoop;

            this.prevProps = null;
        },
        relativeNOTShortened: function(toFixed, getPoint) {
            var i, point, p, length = points.length,
                output = '',
                x = 0,
                y = 0;

            for (i = 0; i < length; i++) {
                p = points[i];
                point = p[1];

                if (i === 0) {
                    x = point[0];
                    y = point[1];

                    if (p[0] === 'text') {
                        x = point[1];
                        y = point[2];
                    }

                    output = 'var x = ' + x + ', y = ' + y + ';\n\n';
                }

                if (p[0] === 'arc') {
                    output += 'context.beginPath();\n' + 'context.arc(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + point[2] + ', ' + point[3] + ', 0, ' + point[4] + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'pencil') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'marker') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'eraser') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'line') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n' + this.strokeOrFill(p[2]);
                }

                if (p[0] === 'pencil') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.lineTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n' + this.strokeOrFill(p[2]);
                }

                if (p[0] === 'arrow') {
                    output += 'drawArrow(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', \'' + p[2].join('\',\'') + '\');\n';
                }

                if (p[0] === 'text') {
                    output += this.strokeOrFill(p[2]) + '\n' + 'context.fillText(' + point[0] + ', ' + getPoint(point[1], x, 'x') + ', ' + getPoint(point[2], y, 'y') + ');';
                }

                if (p[0] === 'rect') {
                    output += this.strokeOrFill(p[2]) + '\n' + 'context.strokeRect(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');\n' + 'context.fillRect(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ', ' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ');';
                }

                if (p[0] === 'quadratic') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.quadraticCurveTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', ' + getPoint(point[4], x, 'x') + ', ' + getPoint(point[5], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (p[0] === 'bezier') {
                    output += 'context.beginPath();\n' + 'context.moveTo(' + getPoint(point[0], x, 'x') + ', ' + getPoint(point[1], y, 'y') + ');\n' + 'context.bezierCurveTo(' + getPoint(point[2], x, 'x') + ', ' + getPoint(point[3], y, 'y') + ', ' + getPoint(point[4], x, 'x') + ', ' + getPoint(point[5], y, 'y') + ', ' + getPoint(point[6], x, 'x') + ', ' + getPoint(point[7], y, 'y') + ');\n'

                        +
                        this.strokeOrFill(p[2]);
                }

                if (i !== length - 1) output += '\n\n';
            }
            textarea.value = output + this.strokeFillText + '\n\n' + drawArrow.toString();

            this.prevProps = null;
        },
        forLoop: 'for(i; i < length; i++) {\n' + '    p = points[i];\n' + '    point = p[1];\n' + '    context.beginPath();\n\n'

            // globals
            +
            '    if(p[2]) { \n' + '\tcontext.lineWidth = p[2][0];\n' + '\tcontext.strokeStyle = p[2][1];\n' + '\tcontext.fillStyle = p[2][2];\n'

            +
            '\tcontext.globalAlpha = p[2][3];\n' + '\tcontext.globalCompositeOperation = p[2][4];\n' + '\tcontext.lineCap = p[2][5];\n' + '\tcontext.lineJoin = p[2][6];\n' + '\tcontext.font = p[2][7];\n' + '    }\n\n'

            // line

            +
            '    if(p[0] === "line") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'

            // arrow

            +
            '    if(p[0] === "arrow") { \n' + '\tdrawArrow(point[0], point[1], point[2], point[3], p[2]);\n' + '    }\n\n'

            // pencil

            +
            '    if(p[0] === "pencil") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'

            // marker

            +
            '    if(p[0] === "marker") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'


            // text

            +
            '    if(p[0] === "text") { \n' + '\tcontext.fillText(point[0], point[1], point[2]);\n' + '    }\n\n'

            // eraser

            +
            '    if(p[0] === "eraser") { \n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.lineTo(point[2], point[3]);\n' + '    }\n\n'

            // arc

            +
            '    if(p[0] === "arc") context.arc(point[0], point[1], point[2], point[3], 0, point[4]); \n\n'

            // rect

            +
            '    if(p[0] === "rect") {\n' + '\tcontext.strokeRect(point[0], point[1], point[2], point[3]);\n' + '\tcontext.fillRect(point[0], point[1], point[2], point[3]);\n'

            +
            '    }\n\n'

            // quadratic

            +
            '    if(p[0] === "quadratic") {\n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.quadraticCurveTo(point[2], point[3], point[4], point[5]);\n' + '    }\n\n'

            // bezier

            +
            '    if(p[0] === "bezier") {\n' + '\tcontext.moveTo(point[0], point[1]);\n' + '\tcontext.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);\n' + '    }\n\n'

            // end-fill

            +
            '    context.stroke();\n' + '    context.fill();\n'

            +
            '}',

        strokeFillText: '\n\nfunction strokeOrFill(lineWidth, strokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin, font) { \n' + '    if(lineWidth) { \n' + '\tcontext.globalAlpha = globalAlpha;\n' + '\tcontext.globalCompositeOperation = globalCompositeOperation;\n' + '\tcontext.lineCap = lineCap;\n' + '\tcontext.lineJoin = lineJoin;\n'

            +
            '\tcontext.lineWidth = lineWidth;\n' + '\tcontext.strokeStyle = strokeStyle;\n' + '\tcontext.fillStyle = fillStyle;\n' + '\tcontext.font = font;\n' + '    } \n\n'

            +
            '    context.stroke();\n' + '    context.fill();\n'

            +
            '}',
        strokeOrFill: function(p) {
            if (!this.prevProps || this.prevProps !== p.join(',')) {
                this.prevProps = p.join(',');

                return 'strokeOrFill(\'' + p.join('\', \'') + '\');';
            }

            return 'strokeOrFill();';
        },
        prevProps: null,
        shortenHelper: function(name, p1, p2) {
            var result = '[\'' + name + '\', [' + p1.join(', ') + ']';

            if (!this.prevProps || this.prevProps !== p2.join(',')) {
                this.prevProps = p2.join(',');
                result += ', [\'' + p2.join('\', \'') + '\']';
            }

            return result + '], ';
        }
    };

    function drawArrow(mx, my, lx, ly, options) {
        function getOptions(opt) {
            opt = opt || {};

            return [
                opt.lineWidth || 2,
                opt.strokeStyle || '#6c96c8',
                opt.fillStyle || 'rgba(0,0,0,0)',
                opt.globalAlpha || 1,
                opt.globalCompositeOperation || 'source-over',
                opt.lineCap || 'round',
                opt.lineJoin || 'round',
                opt.font || '15px "Arial"'
            ];
        }

        function handleOptions(opt, isNoFillStroke) {
            opt = opt || getOptions();

            context.globalAlpha = opt[3];
            context.globalCompositeOperation = opt[4];

            context.lineCap = opt[5];
            context.lineJoin = opt[6];
            context.lineWidth = opt[0];

            context.strokeStyle = opt[1];
            context.fillStyle = opt[2];

            context.font = opt[7];

            if (!isNoFillStroke) {
                context.stroke();
                context.fill();
            }
        }

        var arrowSize = 10;
        var angle = Math.atan2(ly - my, lx - mx);

        context.beginPath();
        context.moveTo(mx, my);
        context.lineTo(lx, ly);

        handleOptions();

        context.beginPath();
        context.moveTo(lx, ly);
        context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));
        context.lineTo(lx - arrowSize * Math.cos(angle + Math.PI / 7), ly - arrowSize * Math.sin(angle + Math.PI / 7));
        context.lineTo(lx, ly);
        context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));

        handleOptions();
    }

    function endLastPath() {
        var cache = is;

        if (cache.isArc) arcHandler.end();
        else if (cache.isQuadraticCurve) quadraticHandler.end();
        else if (cache.isBezierCurve) bezierHandler.end();

        drawHelper.redraw();

        if (textHandler.text && textHandler.text.length) {
            textHandler.appendPoints();
            textHandler.onShapeUnSelected();
        }
        textHandler.showOrHideTextTools('hide');
    }

    var copiedStuff = [],
        isControlKeyPressed;

    function copy() {
        endLastPath();

        dragHelper.global.startingIndex = 0;

        if (find('copy-last').checked) {
            copiedStuff = points[points.length - 1];
            setSelection(find('drag-last-path'), 'DragLastPath');
        } else {
            copiedStuff = points;
            setSelection(find('drag-all-paths'), 'DragAllPaths');
        }
    }

    function paste() {
        endLastPath();

        dragHelper.global.startingIndex = 0;

        if (find('copy-last').checked) {
            points[points.length] = copiedStuff;

            dragHelper.global = {
                prevX: 0,
                prevY: 0,
                startingIndex: points.length - 1
            };

            dragHelper.dragAllPaths(0, 0);
            setSelection(find('drag-last-path'), 'DragLastPath');
        } else {

            dragHelper.global.startingIndex = points.length;
            points = points.concat(copiedStuff);
            setSelection(find('drag-all-paths'), 'DragAllPaths');
        }
    }
    
    
    // marker + pencil
    function hexToR(h) {
        return parseInt((cutHex(h)).substring(0, 2), 16)
    }

    function hexToG(h) {
        return parseInt((cutHex(h)).substring(2, 4), 16)
    }

    function hexToB(h) {
        return parseInt((cutHex(h)).substring(4, 6), 16)
    }

    function cutHex(h) {
        return (h.charAt(0) == "#") ? h.substring(1, 7) : h
    }

    function clone(obj) {
        if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
            return obj;

        if (obj instanceof Date)
            var temp = new obj.constructor(); //or new Date(obj);
        else
            var temp = obj.constructor();

        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                obj['isActiveClone'] = null;
                temp[key] = clone(obj[key]);
                delete obj['isActiveClone'];
            }
        }

        return temp;
    }

    function hexToRGB(h) {
        return [
            hexToR(h),
            hexToG(h),
            hexToB(h)
        ]
    }

    var drawHelper = {
        redraw: function() {
            tempContext.clearRect(0, 0, innerWidth, innerHeight);
            context.clearRect(0, 0, innerWidth, innerHeight);

            var i, point, length = points.length;
            for (i = 0; i < length; i++) {
                point = points[i];
                // point[0] != 'pdf' && 
                if (point && point.length && this[point[0]]) {
                    this[point[0]](context, point[1], point[2]);
                }
                // else warn
            }
        },
        getOptions: function(opt) {
            opt = opt || {};
            return [
                opt.lineWidth || lineWidth,
                opt.strokeStyle || strokeStyle,
                opt.fillStyle || fillStyle,
                opt.globalAlpha || globalAlpha,
                opt.globalCompositeOperation || globalCompositeOperation,
                opt.lineCap || lineCap,
                opt.lineJoin || lineJoin,
                opt.font || font
            ];
        },
        handleOptions: function(context, opt, isNoFillStroke) {
            opt = opt || this.getOptions();

            context.globalAlpha = opt[3];
            context.globalCompositeOperation = opt[4];

            context.lineCap = opt[5];
            context.lineJoin = opt[6];
            context.lineWidth = opt[0];

            context.strokeStyle = opt[1];
            context.fillStyle = opt[2];

            context.font = opt[7];

            if (!isNoFillStroke) {
                context.stroke();
                context.fill();
            }
        },
        line: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.lineTo(point[2], point[3]);

            this.handleOptions(context, options);
        },
        pencil: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.lineTo(point[2], point[3]);

            this.handleOptions(context, options);
        },
        marker: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.lineTo(point[2], point[3]);

            this.handleOptions(context, options);
        },
        arrow: function(context, point, options) {
            var mx = point[0];
            var my = point[1];

            var lx = point[2];
            var ly = point[3];

            var arrowSize = arrowHandler.arrowSize;

            if (arrowSize == 10) {
                arrowSize = (options ? options[0] : lineWidth) * 5;
            }

            var angle = Math.atan2(ly - my, lx - mx);

            context.beginPath();
            context.moveTo(mx, my);
            context.lineTo(lx, ly);

            this.handleOptions(context, options);

            context.beginPath();
            context.moveTo(lx, ly);
            context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));
            context.lineTo(lx - arrowSize * Math.cos(angle + Math.PI / 7), ly - arrowSize * Math.sin(angle + Math.PI / 7));
            context.lineTo(lx, ly);
            context.lineTo(lx - arrowSize * Math.cos(angle - Math.PI / 7), ly - arrowSize * Math.sin(angle - Math.PI / 7));

            this.handleOptions(context, options);
        },
        text: function(context, point, options) {
            this.handleOptions(context, options);
            context.fillStyle = textHandler.getFillColor(options[2]);
            context.fillText(point[0].substr(1, point[0].length - 2), point[1], point[2]);
        },
        arc: function(context, point, options) {
            context.beginPath();
            context.arc(point[0], point[1], point[2], point[3], 0, point[4]);

            this.handleOptions(context, options);
        },
        rect: function(context, point, options) {
            this.handleOptions(context, options, true);

            context.strokeRect(point[0], point[1], point[2], point[3]);
            context.fillRect(point[0], point[1], point[2], point[3]);
        },
        image: function(context, point, options) {
            this.handleOptions(context, options, true);

            var image = imageHandler.images[point[5]];
            if (!image) {
                var image = new Image();
                image.onload = function() {
                    var index = imageHandler.images.length;

                    imageHandler.lastImageURL = image.src;
                    imageHandler.lastImageIndex = index;

                    imageHandler.images.push(image);
                    context.drawImage(image, point[1], point[2], point[3], point[4]);
                };
                image.src = point[0];
                return;
            }

            context.drawImage(image, point[1], point[2], point[3], point[4]);
        },
        pdf: function(context, point, options) {
            this.handleOptions(context, options, true);

            var image = pdfHandler.images[point[5]];
            if (!image) {
                var image = new Image();
                image.onload = function() {
                    var index = imageHandler.images.length;

                    pdfHandler.lastPage = image.src;
                    pdfHandler.lastIndex = index;

                    pdfHandler.images.push(image);
                    context.drawImage(image, point[1], point[2], point[3], point[4]);
                };
                image.src = point[0];
                return;
            }

            context.drawImage(image, point[1], point[2], point[3], point[4]);
            pdfHandler.reset_pos(point[1], point[2]);
        },
        quadratic: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.quadraticCurveTo(point[2], point[3], point[4], point[5]);

            this.handleOptions(context, options);
        },
        bezier: function(context, point, options) {
            context.beginPath();
            context.moveTo(point[0], point[1]);
            context.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);

            this.handleOptions(context, options);
        }
    };

    var dragHelper = {
        global: {
            prevX: 0,
            prevY: 0,
            ismousedown: false,
            pointsToMove: 'all',
            startingIndex: 0
        },
        mousedown: function(e) {
            if (isControlKeyPressed) {
                copy();
                paste();
                isControlKeyPressed = false;
            }

            var dHelper = dragHelper,
                g = dHelper.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            g.prevX = x;
            g.prevY = y;

            g.pointsToMove = 'all';

            if (points.length) {
                var p = points[points.length - 1],
                    point = p[1];

                if (p[0] === 'line') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'head';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = 'tail';
                    }
                }

                if (p[0] === 'pencil') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'head';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = 'tail';
                    }
                }

                if (p[0] === 'arrow') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'head';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = 'tail';
                    }
                }

                if (p[0] === 'rect') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'stretch-first';
                    }

                    if (dHelper.isPointInPath(x, y, point[0] + point[2], point[1])) {
                        g.pointsToMove = 'stretch-second';
                    }

                    if (dHelper.isPointInPath(x, y, point[0], point[1] + point[3])) {
                        g.pointsToMove = 'stretch-third';
                    }

                    if (dHelper.isPointInPath(x, y, point[0] + point[2], point[1] + point[3])) {
                        g.pointsToMove = 'stretch-last';
                    }
                }

                if (p[0] === 'image') {

                    if (dHelper.isPointInPath(x, y, point[1], point[2])) {
                        g.pointsToMove = 'stretch-first';
                    }

                    if (dHelper.isPointInPath(x, y, point[1] + point[3], point[2])) {
                        g.pointsToMove = 'stretch-second';
                    }

                    if (dHelper.isPointInPath(x, y, point[1], point[2] + point[4])) {
                        g.pointsToMove = 'stretch-third';
                    }

                    if (dHelper.isPointInPath(x, y, point[1] + point[3], point[2] + point[4])) {
                        g.pointsToMove = 'stretch-last';
                    }
                }

                if (p[0] === 'pdf') {

                    if (dHelper.isPointInPath(x, y, point[1], point[2])) {
                        g.pointsToMove = 'stretch-first';
                    }

                    if (dHelper.isPointInPath(x, y, point[1] + point[3], point[2])) {
                        g.pointsToMove = 'stretch-second';
                    }

                    if (dHelper.isPointInPath(x, y, point[1], point[2] + point[4])) {
                        g.pointsToMove = 'stretch-third';
                    }

                    if (dHelper.isPointInPath(x, y, point[1] + point[3], point[2] + point[4])) {
                        g.pointsToMove = 'stretch-last';
                    }
                }

                if (p[0] === 'quadratic') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'starting-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = 'control-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[4], point[5])) {
                        g.pointsToMove = 'ending-points';
                    }
                }

                if (p[0] === 'bezier') {

                    if (dHelper.isPointInPath(x, y, point[0], point[1])) {
                        g.pointsToMove = 'starting-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[2], point[3])) {
                        g.pointsToMove = '1st-control-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[4], point[5])) {
                        g.pointsToMove = '2nd-control-points';
                    }

                    if (dHelper.isPointInPath(x, y, point[6], point[7])) {
                        g.pointsToMove = 'ending-points';
                    }
                }
            }

            g.ismousedown = true;
        },
        mouseup: function() {
            var g = this.global;

            if (is.isDragLastPath) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);
                context.clearRect(0, 0, innerWidth, innerHeight);
                this.end();
            }

            g.ismousedown = false;
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop,
                g = this.global;

            drawHelper.redraw();

            if (g.ismousedown) {
                this.dragShape(x, y);
            }

            if (is.isDragLastPath) this.init();
        },
        init: function() {
            if (!points.length) return;

            var p = points[points.length - 1],
                point = p[1],
                g = this.global;

            if (g.ismousedown) tempContext.fillStyle = 'rgba(255,85 ,154,.9)';
            else tempContext.fillStyle = 'rgba(255,85 ,154,.4)';

            if (p[0] === 'quadratic') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[4], point[5], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'bezier') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[4], point[5], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[6], point[7], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'line') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'pencil') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'arrow') {

                tempContext.beginPath();

                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.arc(point[2], point[3], 10, Math.PI * 2, 0, !1);

                tempContext.fill();
            }

            if (p[0] === 'text') {
                tempContext.font = "15px Verdana";
                tempContext.fillText(point[0], point[1], point[2]);
            }

            if (p[0] === 'rect') {

                tempContext.beginPath();
                tempContext.arc(point[0], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[0] + point[2], point[1], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[0], point[1] + point[3], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[0] + point[2], point[1] + point[3], 10, Math.PI * 2, 0, !1);
                tempContext.fill();
            }

            if (p[0] === 'image') {
                tempContext.beginPath();
                tempContext.arc(point[1], point[2], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1] + point[3], point[2], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1], point[2] + point[4], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1] + point[3], point[2] + point[4], 10, Math.PI * 2, 0, !1);
                tempContext.fill();
            }

            if (p[0] === 'pdf') {
                tempContext.beginPath();
                tempContext.arc(point[1], point[2], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1] + point[3], point[2], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1], point[2] + point[4], 10, Math.PI * 2, 0, !1);
                tempContext.fill();

                tempContext.beginPath();
                tempContext.arc(point[1] + point[3], point[2] + point[4], 10, Math.PI * 2, 0, !1);
                tempContext.fill();
            }
        },
        isPointInPath: function(x, y, first, second) {
            return x > first - 10 && x < first + 10 && y > second - 10 && y < second + 10;
        },
        getPoint: function(point, prev, otherPoint) {
            if (point > prev) {
                point = otherPoint + (point - prev);
            } else {
                point = otherPoint - (prev - point);
            }

            return point;
        },
        getXYWidthHeight: function(x, y, prevX, prevY, oldPoints) {
            if (oldPoints.pointsToMove == 'stretch-first') {
                if (x > prevX) {
                    oldPoints.x = oldPoints.x + (x - prevX);
                    oldPoints.width = oldPoints.width - (x - prevX);
                } else {
                    oldPoints.x = oldPoints.x - (prevX - x);
                    oldPoints.width = oldPoints.width + (prevX - x);
                }

                if (y > prevY) {
                    oldPoints.y = oldPoints.y + (y - prevY);
                    oldPoints.height = oldPoints.height - (y - prevY);
                } else {
                    oldPoints.y = oldPoints.y - (prevY - y);
                    oldPoints.height = oldPoints.height + (prevY - y);
                }
            }

            if (oldPoints.pointsToMove == 'stretch-second') {
                if (x > prevX) {
                    oldPoints.width = oldPoints.width + (x - prevX);
                } else {
                    oldPoints.width = oldPoints.width - (prevX - x);
                }

                if (y < prevY) {
                    oldPoints.y = oldPoints.y + (y - prevY);
                    oldPoints.height = oldPoints.height - (y - prevY);
                } else {
                    oldPoints.y = oldPoints.y - (prevY - y);
                    oldPoints.height = oldPoints.height + (prevY - y);
                }
            }

            if (oldPoints.pointsToMove == 'stretch-third') {
                if (x > prevX) {
                    oldPoints.x = oldPoints.x + (x - prevX);
                    oldPoints.width = oldPoints.width - (x - prevX);
                } else {
                    oldPoints.x = oldPoints.x - (prevX - x);
                    oldPoints.width = oldPoints.width + (prevX - x);
                }

                if (y < prevY) {
                    oldPoints.height = oldPoints.height + (y - prevY);
                } else {
                    oldPoints.height = oldPoints.height - (prevY - y);
                }
            }

            return oldPoints;
        },
        dragShape: function(x, y) {
            if (!this.global.ismousedown) return;

            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            if (is.isDragLastPath) {
                this.dragLastPath(x, y);
            }

            if (is.isDragAllPaths) {
                this.dragAllPaths(x, y);
            }

            var g = this.global;

            g.prevX = x;
            g.prevY = y;
        },
        end: function() {
            if (!points.length) return;

            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            var point = points[points.length - 1];
            drawHelper[point[0]](context, point[1], point[2]);
        },
        dragAllPaths: function(x, y) {
            var g = this.global,
                prevX = g.prevX,
                prevY = g.prevY,
                p, point,
                length = points.length,
                getPoint = this.getPoint,
                i = g.startingIndex;

            for (i; i < length; i++) {
                p = points[i];
                point = p[1];

                if (p[0] === 'line') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3])
                        ], p[2]
                    ];
                }

                if (p[0] === 'pencil') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3])
                        ], p[2]
                    ];
                }

                if (p[0] === 'arrow') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3])
                        ], p[2]
                    ];
                }

                if (p[0] === 'text') {
                    points[i] = [p[0],
                        [
                            point[0],
                            getPoint(x, prevX, point[1]),
                            getPoint(y, prevY, point[2])
                        ], p[2]
                    ];
                }

                if (p[0] === 'arc') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            point[2],
                            point[3],
                            point[4]
                        ], p[2]
                    ];
                }

                if (p[0] === 'rect') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            point[2],
                            point[3]
                        ], p[2]
                    ];
                }

                if (p[0] === 'image') {
                    points[i] = [p[0],
                        [
                            point[0],
                            getPoint(x, prevX, point[1]),
                            getPoint(y, prevY, point[2]),
                            point[3],
                            point[4],
                            point[5]
                        ], p[2]
                    ];
                }

                if (p[0] === 'pdf') {
                    points[i] = [p[0],
                        [
                            point[0],
                            getPoint(x, prevX, point[1]),
                            getPoint(y, prevY, point[2]),
                            point[3],
                            point[4],
                            point[5]
                        ], p[2]
                    ];
                }

                if (p[0] === 'quadratic') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3]),
                            getPoint(x, prevX, point[4]),
                            getPoint(y, prevY, point[5])
                        ], p[2]
                    ];
                }

                if (p[0] === 'bezier') {
                    points[i] = [p[0],
                        [
                            getPoint(x, prevX, point[0]),
                            getPoint(y, prevY, point[1]),
                            getPoint(x, prevX, point[2]),
                            getPoint(y, prevY, point[3]),
                            getPoint(x, prevX, point[4]),
                            getPoint(y, prevY, point[5]),
                            getPoint(x, prevX, point[6]),
                            getPoint(y, prevY, point[7])
                        ], p[2]
                    ];
                }
            }
        },
        dragLastPath: function(x, y) {
            // if last past is undefined?
            if (!points[points.length - 1]) return;

            var g = this.global,
                prevX = g.prevX,
                prevY = g.prevY,
                p = points[points.length - 1],
                point = p[1],
                getPoint = this.getPoint,
                getXYWidthHeight = this.getXYWidthHeight,
                isMoveAllPoints = g.pointsToMove === 'all';

            if (p[0] === 'line') {

                if (g.pointsToMove === 'head' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'tail' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'pencil') {

                if (g.pointsToMove === 'head' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'tail' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'arrow') {

                if (g.pointsToMove === 'head' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'tail' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'text') {

                if (g.pointsToMove === 'head' || isMoveAllPoints) {
                    point[1] = getPoint(x, prevX, point[1]);
                    point[2] = getPoint(y, prevY, point[2]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'arc') {
                point[0] = getPoint(x, prevX, point[0]);
                point[1] = getPoint(y, prevY, point[1]);

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'rect') {

                if (isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'stretch-first') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[0],
                        y: point[1],
                        width: point[2],
                        height: point[3],
                        pointsToMove: g.pointsToMove
                    });

                    point[0] = newPoints.x;
                    point[1] = newPoints.y;
                    point[2] = newPoints.width;
                    point[3] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-second') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[0],
                        y: point[1],
                        width: point[2],
                        height: point[3],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.y;
                    point[2] = newPoints.width;
                    point[3] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-third') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[0],
                        y: point[1],
                        width: point[2],
                        height: point[3],
                        pointsToMove: g.pointsToMove
                    });

                    point[0] = newPoints.x;
                    point[2] = newPoints.width;
                    point[3] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-last') {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'image') {

                if (isMoveAllPoints) {
                    point[1] = getPoint(x, prevX, point[1]);
                    point[2] = getPoint(y, prevY, point[2]);
                }

                if (g.pointsToMove === 'stretch-first') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.x;
                    point[2] = newPoints.y;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-second') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[2] = newPoints.y;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-third') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.x;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-last') {
                    point[3] = getPoint(x, prevX, point[3]);
                    point[4] = getPoint(y, prevY, point[4]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'pdf') {

                if (isMoveAllPoints) {
                    point[1] = getPoint(x, prevX, point[1]);
                    point[2] = getPoint(y, prevY, point[2]);
                }

                if (g.pointsToMove === 'stretch-first') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.x;
                    point[2] = newPoints.y;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-second') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[2] = newPoints.y;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-third') {
                    var newPoints = getXYWidthHeight(x, y, prevX, prevY, {
                        x: point[1],
                        y: point[2],
                        width: point[3],
                        height: point[4],
                        pointsToMove: g.pointsToMove
                    });

                    point[1] = newPoints.x;
                    point[3] = newPoints.width;
                    point[4] = newPoints.height;
                }

                if (g.pointsToMove === 'stretch-last') {
                    point[3] = getPoint(x, prevX, point[3]);
                    point[4] = getPoint(y, prevY, point[4]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'quadratic') {

                if (g.pointsToMove === 'starting-points' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === 'control-points' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                if (g.pointsToMove === 'ending-points' || isMoveAllPoints) {
                    point[4] = getPoint(x, prevX, point[4]);
                    point[5] = getPoint(y, prevY, point[5]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }

            if (p[0] === 'bezier') {

                if (g.pointsToMove === 'starting-points' || isMoveAllPoints) {
                    point[0] = getPoint(x, prevX, point[0]);
                    point[1] = getPoint(y, prevY, point[1]);
                }

                if (g.pointsToMove === '1st-control-points' || isMoveAllPoints) {
                    point[2] = getPoint(x, prevX, point[2]);
                    point[3] = getPoint(y, prevY, point[3]);
                }

                if (g.pointsToMove === '2nd-control-points' || isMoveAllPoints) {
                    point[4] = getPoint(x, prevX, point[4]);
                    point[5] = getPoint(y, prevY, point[5]);
                }

                if (g.pointsToMove === 'ending-points' || isMoveAllPoints) {
                    point[6] = getPoint(x, prevX, point[6]);
                    point[7] = getPoint(y, prevY, point[7]);
                }

                points[points.length - 1] = [p[0], point, p[2]];
            }
        }
    };

    var pencilHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;

            // make sure that pencil is drawing shapes even 
            // if mouse is down but mouse isn't moving
            tempContext.lineCap = 'round';
            pencilDrawHelper.pencil(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['pencil', [t.prevX, t.prevY, x, y], pencilDrawHelper.getOptions(), 'start'];

            t.prevX = x;
            t.prevY = y;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
                pencilDrawHelper.pencil(tempContext, [t.prevX, t.prevY, x, y]);

                points[points.length] = ['pencil', [t.prevX, t.prevY, x, y], pencilDrawHelper.getOptions(), 'end'];

                t.prevX = x;
                t.prevY = y;
            }

            this.ismousedown = false;
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
                pencilDrawHelper.pencil(tempContext, [t.prevX, t.prevY, x, y]);

                points[points.length] = ['pencil', [t.prevX, t.prevY, x, y], pencilDrawHelper.getOptions()];

                t.prevX = x;
                t.prevY = y;
            }
        }
    }

    var pencilLineWidth = document.getElementById('pencil-stroke-style').value,
        pencilStrokeStyle = '#' + document.getElementById('pencil-fill-style').value;

    var pencilDrawHelper = clone(drawHelper);

    pencilDrawHelper.getOptions = function() {
        return [pencilLineWidth, pencilStrokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin, font];
    }

    var markerHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;

            // make sure that pencil is drawing shapes even 
            // if mouse is down but mouse isn't moving
            tempContext.lineCap = 'round';
            markerDrawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['line', [t.prevX, t.prevY, x, y], markerDrawHelper.getOptions()];

            t.prevX = x;
            t.prevY = y;
        },
        mouseup: function(e) {
            this.ismousedown = false;
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
                markerDrawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

                points[points.length] = ['line', [t.prevX, t.prevY, x, y], markerDrawHelper.getOptions()];

                t.prevX = x;
                t.prevY = y;
            }
        }
    }

    var markerLineWidth = document.getElementById('marker-stroke-style').value,
        markerStrokeStyle = '#' + document.getElementById('marker-fill-style').value,
        markerGlobalAlpha = 0.7;

    var markerDrawHelper = clone(drawHelper);

    markerDrawHelper.getOptions = function() {
        return [markerLineWidth, markerStrokeStyle, fillStyle, markerGlobalAlpha, globalCompositeOperation, lineCap, lineJoin, font];
    }

    var eraserHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;

            tempContext.lineCap = 'round';
            drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

            points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

            t.prevX = x;
            t.prevY = y;
        },
        mouseup: function(e) {
            this.ismousedown = false;
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.lineCap = 'round';
                drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);

                points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

                t.prevX = x;
                t.prevY = y;
            }
        }
    };

    var textHandler = {
        text: '',
        selectedFontFamily: 'Arial',
        selectedFontSize: '15',
        lastFillStyle: '',
        onShapeSelected: function() {
            tempContext.canvas.style.cursor = 'text';
            this.x = this.y = this.pageX = this.pageY = 0;
            this.text = '';
        },
        onShapeUnSelected: function() {
            this.text = '';
            this.showOrHideTextTools('hide');
            tempContext.canvas.style.cursor = 'default';

            if (typeof this.blinkCursorInterval !== 'undefined') {
                clearInterval(this.blinkCursorInterval);
            }
        },
        getFillColor: function(color) {
            color = (color || fillStyle).toLowerCase();

            if (color == 'rgba(255, 255, 255, 0)' || color == 'transparent' || color === 'white') {
                return 'black';
            }

            return color;
        },
        writeText: function(keyPressed, isBackKeyPressed) {
            if (!is.isText) return;

            if (isBackKeyPressed) {
                textHandler.text = textHandler.text.substr(0, textHandler.text.length - 1);
                textHandler.fillText(textHandler.text);
                return;
            }

            textHandler.text += keyPressed;
            textHandler.fillText(textHandler.text);
        },
        fillText: function(text) {
            if (!is.isText) return;

            tempContext.clearRect(0, 0, tempContext.canvas.width, tempContext.canvas.height);

            var options = textHandler.getOptions();
            drawHelper.handleOptions(tempContext, options);
            tempContext.fillStyle = textHandler.getFillColor(options[2]);
            tempContext.font = textHandler.selectedFontSize + 'px "' + textHandler.selectedFontFamily + '"';

            tempContext.fillText(text, textHandler.x, textHandler.y);
        },
        blinkCursorInterval: null,
        index: 0,
        blinkCursor: function() {
            textHandler.index++;
            if (textHandler.index % 2 == 0) {
                textHandler.fillText(textHandler.text + '|');
            } else {
                textHandler.fillText(textHandler.text);
            }
        },
        getOptions: function() {
            var options = {
                font: textHandler.selectedFontSize + 'px "' + textHandler.selectedFontFamily + '"',
                fillStyle: textHandler.getFillColor(),
                strokeStyle: '#6c96c8',
                globalCompositeOperation: 'source-over',
                globalAlpha: 1,
                lineJoin: 'round',
                lineCap: 'round',
                lineWidth: 2
            };
            font = options.font;
            return options;
        },
        appendPoints: function() {
            var options = textHandler.getOptions();
            points[points.length] = ['text', ['"' + textHandler.text + '"', textHandler.x, textHandler.y], drawHelper.getOptions(options)];
        },
        mousedown: function(e) {
            if (!is.isText) return;

            if (textHandler.text.length) {
                this.appendPoints();
            }

            textHandler.x = textHandler.y = 0;
            textHandler.text = '';

            textHandler.pageX = e.pageX;
            textHandler.pageY = e.pageY;

            textHandler.x = e.pageX - canvas.offsetLeft - 5;
            textHandler.y = e.pageY - canvas.offsetTop + 10;

            if (typeof textHandler.blinkCursorInterval !== 'undefined') {
                clearInterval(textHandler.blinkCursorInterval);
            }

            textHandler.blinkCursor();
            textHandler.blinkCursorInterval = setInterval(textHandler.blinkCursor, 700);

            this.showTextTools();
        },
        mouseup: function(e) {},
        mousemove: function(e) {},
        showOrHideTextTools: function(show) {
            if (show === 'hide') {
                if (this.lastFillStyle.length) {
                    fillStyle = this.lastFillStyle;
                    this.lastFillStyle = '';
                }
            } else if (!this.lastFillStyle.length) {
                this.lastFillStyle = fillStyle;
                fillStyle = 'black';
            }

            this.fontFamilyBox.style.display = show == 'show' ? 'block' : 'none';
            this.fontSizeBox.style.display = show == 'show' ? 'block' : 'none';

            this.fontSizeBox.style.left = this.x + 'px';
            this.fontFamilyBox.style.left = (this.fontSizeBox.clientWidth + this.x) + 'px';

            this.fontSizeBox.style.top = this.y + 'px';
            this.fontFamilyBox.style.top = this.y + 'px';
        },
        showTextTools: function() {
            if (!this.fontFamilyBox || !this.fontSizeBox) return;

            this.unselectAllFontFamilies();
            this.unselectAllFontSizes();

            this.showOrHideTextTools('show');

            this.eachFontFamily(function(child) {
                child.onclick = function(e) {
                    e.preventDefault();

                    textHandler.showOrHideTextTools('hide');

                    textHandler.selectedFontFamily = this.innerHTML;
                    this.className = 'font-family-selected';
                };
                child.style.fontFamily = child.innerHTML;
            });

            this.eachFontSize(function(child) {
                child.onclick = function(e) {
                    e.preventDefault();

                    textHandler.showOrHideTextTools('hide');

                    textHandler.selectedFontSize = this.innerHTML;
                    this.className = 'font-family-selected';
                };
                // child.style.fontSize = child.innerHTML + 'px';
            });
        },
        eachFontFamily: function(callback) {
            var childs = this.fontFamilyBox.querySelectorAll('li');
            for (var i = 0; i < childs.length; i++) {
                callback(childs[i]);
            }
        },
        unselectAllFontFamilies: function() {
            this.eachFontFamily(function(child) {
                child.className = '';
                if (child.innerHTML === textHandler.selectedFontFamily) {
                    child.className = 'font-family-selected';
                }
            });
        },
        eachFontSize: function(callback) {
            var childs = this.fontSizeBox.querySelectorAll('li');
            for (var i = 0; i < childs.length; i++) {
                callback(childs[i]);
            }
        },
        unselectAllFontSizes: function() {
            this.eachFontSize(function(child) {
                child.className = '';
                if (child.innerHTML === textHandler.selectedFontSize) {
                    child.className = 'font-size-selected';
                }
            });
        },
        onReturnKeyPressed: function() {
            if (!textHandler.text || !textHandler.text.length) return;
            var fontSize = parseInt(textHandler.selectedFontSize) || 15;
            this.mousedown({
                pageX: this.pageX,
                // pageY: parseInt(tempContext.measureText(textHandler.text).height * 2) + 10
                pageY: this.pageY + fontSize + 5
            });
            drawHelper.redraw();
        },
        fontFamilyBox: document.querySelector('.fontSelectUl'),
        fontSizeBox: document.querySelector('.fontSizeUl')
    };

    var arcHandler = {
        global: {
            ismousedown: false,
            prevX: 0,
            prevY: 0,
            prevRadius: 0,
            isCircleDrawn: false,
            isCircledEnded: true,
            isClockwise: false,
            arcRangeContainer: null,
            arcRange: null
        },
        mousedown: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            g.prevX = x;
            g.prevY = y;

            g.ismousedown = true;
        },
        mouseup: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (g.ismousedown) {
                if (!g.isCircleDrawn && g.isCircledEnded) {
                    var prevX = g.prevX,
                        prevY = g.prevY,
                        radius = ((x - prevX) + (y - prevY)) / 3;

                    g.prevRadius = radius;
                    g.isCircleDrawn = true;
                    g.isCircleEnded = false;

                    var c = (2 * Math.PI * radius) / 21,
                        angle,
                        xx = prevX > x ? prevX - x : x - prevX,
                        yy = prevY > y ? prevY - y : y - prevY;

                    angle = (xx + yy) / (2 * c);
                    points[points.length] = ['arc', [prevX + radius, prevY + radius, radius, angle, 1], drawHelper.getOptions()];

                    var arcRange = g.arcRange,
                        arcRangeContainer = g.arcRangeContainer;

                    arcRangeContainer.style.display = 'block';
                    arcRange.focus();

                    arcRangeContainer.style.top = (y + canvas.offsetTop + 20) + 'px';
                    arcRangeContainer.style.left = x + 'px';

                    arcRange.value = 2;
                } else if (g.isCircleDrawn && !g.isCircleEnded) {
                    this.end();
                }
            }

            g.ismousedown = false;

            this.fixAllPoints();
        },
        mousemove: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var ismousedown = g.ismousedown,
                isCircleDrawn = g.isCircleDrawn,
                isCircleEnded = g.isCircledEnded;

            if (ismousedown) {
                if (!isCircleDrawn && isCircleEnded) {
                    var prevX = g.prevX,
                        prevY = g.prevY,
                        radius = ((x - prevX) + (y - prevY)) / 3;

                    tempContext.clearRect(0, 0, 2000, 2000);

                    drawHelper.arc(tempContext, [prevX + radius, prevY + radius, radius, Math.PI * 2, true]);
                }
            }
        },
        fixAllPoints: function() {
            var toFixed = this.toFixed;

            for (var i = 0; i < points.length; i++) {
                var p = points[i],
                    point;
                if (p[0] === 'arc') {
                    point = p[1];
                    points[i] = ['arc', [toFixed(point[0]), toFixed(point[1]), toFixed(point[2]), toFixed(point[3]), point[4]],
                        p[2]
                    ];
                }
            }
        },
        init: function() {
            var markIsClockwise = find('is-clockwise'),
                g = this.global;

            g.arcRangeContainer = find('arc-range-container');
            g.arcRange = find('arc-range');

            addEvent(markIsClockwise, 'change', function(e) {
                g.isClockwise = markIsClockwise.checked;

                g.arcRange.value = arcHandler.toFixed(g.arcRange.value);
                g.arcRange.focus();

                arcHandler.arcRangeHandler(e);

                if (!points.length) return;

                var p = points[points.length - 1],
                    point = p[1];

                tempContext.clearRect(0, 0, innerWidth, innerHeight);
                drawHelper.arc(tempContext, [point[0], point[1], point[2], point[3], point[4]]);
            });

            var arcRange = g.arcRange;
            addEvent(arcRange, 'keydown', this.arcRangeHandler);
            addEvent(arcRange, 'focus', this.arcRangeHandler);
        },
        arcRangeHandler: function(e) {
            var g = arcHandler.global,
                arcRange = g.arcRange;

            var key = e.keyCode,
                value = +arcRange.value;
            if (key == 39 || key == 40) arcRange.value = (value < 2 ? value : 1.98) + .02;
            if (key == 37 || key == 38) arcRange.value = (value > 0 ? value : .02) - .02;

            if (!key || key == 13 || key == 39 || key == 40 || key == 37 || key == 38) {
                var range = Math.PI * arcHandler.toFixed(value);
                var p = points[points.length - 1];

                if (p[0] === 'arc') {
                    var point = p[1];
                    points[points.length - 1] = ['arc', [point[0], point[1], point[2], range, g.isClockwise ? 1 : 0],
                        p[2]
                    ];

                    drawHelper.redraw();
                }
            }
        },
        toFixed: function(input) {
            return Number(input).toFixed(1);
        },
        end: function() {
            var g = this.global;

            g.arcRangeContainer.style.display = 'none';
            g.arcRange.value = 2;

            g.isCircleDrawn = false;
            g.isCircleEnded = true;

            drawHelper.redraw();
        }
    };

    arcHandler.init();

    var lineHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['line', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

                t.ismousedown = false;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);

                drawHelper.line(tempContext, [t.prevX, t.prevY, x, y]);
            }
        }
    };

    var arrowHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        arrowSize: 10,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['arrow', [t.prevX, t.prevY, x, y], drawHelper.getOptions()];

                t.ismousedown = false;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);

                drawHelper.arrow(tempContext, [t.prevX, t.prevY, x, y]);
            }
        }
    };

    var rectHandler = {
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['rect', [t.prevX, t.prevY, x - t.prevX, y - t.prevY], drawHelper.getOptions()];

                t.ismousedown = false;
            }

        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);

                drawHelper.rect(tempContext, [t.prevX, t.prevY, x - t.prevX, y - t.prevY]);
            }
        }
    };

    var quadraticHandler = {
        global: {
            ismousedown: false,
            prevX: 0,
            prevY: 0,
            controlPointX: 0,
            controlPointY: 0,
            isFirstStep: true,
            isLastStep: false
        },
        mousedown: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (!g.isLastStep) {
                g.prevX = x;
                g.prevY = y;
            }

            g.ismousedown = true;

            if (g.isLastStep && g.ismousedown) {
                this.end(x, y);
            }
        },
        mouseup: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (g.ismousedown && g.isFirstStep) {
                g.controlPointX = x;
                g.controlPointY = y;

                g.isFirstStep = false;
                g.isLastStep = true;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var g = this.global;

            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            if (g.ismousedown && g.isFirstStep) {
                drawHelper.quadratic(tempContext, [g.prevX, g.prevY, x, y, x, y]);
            }

            if (g.isLastStep) {
                drawHelper.quadratic(tempContext, [g.prevX, g.prevY, g.controlPointX, g.controlPointY, x, y]);
            }
        },
        end: function(x, y) {
            var g = this.global;

            if (!g.ismousedown) return;

            g.isLastStep = false;

            g.isFirstStep = true;
            g.ismousedown = false;

            x = x || g.controlPointX || g.prevX;
            y = y || g.controlPointY || g.prevY;

            points[points.length] = ['quadratic', [g.prevX, g.prevY, g.controlPointX, g.controlPointY, x, y], drawHelper.getOptions()];
        }
    };

    var bezierHandler = {
        global: {
            ismousedown: false,
            prevX: 0,
            prevY: 0,

            firstControlPointX: 0,
            firstControlPointY: 0,
            secondControlPointX: 0,
            secondControlPointY: 0,

            isFirstStep: true,
            isSecondStep: false,
            isLastStep: false
        },
        mousedown: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (!g.isLastStep && !g.isSecondStep) {
                g.prevX = x;
                g.prevY = y;
            }

            g.ismousedown = true;

            if (g.isLastStep && g.ismousedown) {
                this.end(x, y);
            }

            if (g.ismousedown && g.isSecondStep) {
                g.secondControlPointX = x;
                g.secondControlPointY = y;

                g.isSecondStep = false;
                g.isLastStep = true;
            }
        },
        mouseup: function(e) {
            var g = this.global;

            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            if (g.ismousedown && g.isFirstStep) {
                g.firstControlPointX = x;
                g.firstControlPointY = y;

                g.isFirstStep = false;
                g.isSecondStep = true;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var g = this.global;

            tempContext.clearRect(0, 0, innerWidth, innerHeight);

            if (g.ismousedown && g.isFirstStep) {
                drawHelper.bezier(tempContext, [g.prevX, g.prevY, x, y, x, y, x, y]);
            }

            if (g.ismousedown && g.isSecondStep) {
                drawHelper.bezier(tempContext, [g.prevX, g.prevY, g.firstControlPointX, g.firstControlPointY, x, y, x, y]);
            }

            if (g.isLastStep) {
                drawHelper.bezier(tempContext, [g.prevX, g.prevY, g.firstControlPointX, g.firstControlPointY, g.secondControlPointX, g.secondControlPointY, x, y]);
            }
        },
        end: function(x, y) {
            var g = this.global;

            if (!g.ismousedown) return;

            g.isLastStep = g.isSecondStep = false;

            g.isFirstStep = true;
            g.ismousedown = false;

            g.secondControlPointX = g.secondControlPointX || g.firstControlPointX;
            g.secondControlPointY = g.secondControlPointY || g.firstControlPointY;

            x = x || g.secondControlPointX;
            y = y || g.secondControlPointY;

            points[points.length] = ['bezier', [g.prevX, g.prevY, g.firstControlPointX, g.firstControlPointY, g.secondControlPointX, g.secondControlPointY, x, y], drawHelper.getOptions()];
        }
    };

    var zoomHandler = {
        scale: 1.0,
        up: function(e) {
            this.scale += .01;
            this.apply();
        },
        down: function(e) {
            this.scale -= .01;
            this.apply();
        },
        apply: function() {
            tempContext.scale(this.scale, this.scale);
            context.scale(this.scale, this.scale);
            drawHelper.redraw();
        },
        icons: {
            up: function(ctx) {
                ctx.font = '22px Verdana';
                ctx.strokeText('+', 10, 30);
            },
            down: function(ctx) {
                ctx.font = '22px Verdana';
                ctx.strokeText('-', 15, 30);
            }
        }
    };

    var FileSelector = function() {
        var selector = this;

        selector.selectSingleFile = selectFile;
        selector.selectMultipleFiles = function(callback) {
            selectFile(callback, true);
        };

        function selectFile(callback, multiple, accept) {
            var file = document.createElement('input');
            file.type = 'file';

            if (multiple) {
                file.multiple = true;
            }

            file.accept = accept || 'image/*';

            file.onchange = function() {
                if (multiple) {
                    if (!file.files.length) {
                        console.error('No file selected.');
                        return;
                    }
                    callback(file.files);
                    return;
                }

                if (!file.files[0]) {
                    console.error('No file selected.');
                    return;
                }

                callback(file.files[0]);

                file.parentNode.removeChild(file);
            };
            file.style.display = 'none';
            (document.body || document.documentElement).appendChild(file);
            fireClickEvent(file);
        }

        function fireClickEvent(element) {
            var evt = new window.MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                button: 0,
                buttons: 0,
                mozInputSource: 1
            });

            var fired = element.dispatchEvent(evt);
        }
    };

    var imageHandler = {
        lastImageURL: null,
        lastImageIndex: 0,
        images: [],

        ismousedown: false,
        prevX: 0,
        prevY: 0,
        load: function(width, height) {
            var t = imageHandler;
            points[points.length] = ['image', [imageHandler.lastImageURL, t.prevX, t.prevY, width, height, imageHandler.lastImageIndex], drawHelper.getOptions()];
            document.getElementById('drag-last-path').click();

            // share to webrtc
            syncPoints(true);
        },
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                points[points.length] = ['image', [imageHandler.lastImageURL, t.prevX, t.prevY, x - t.prevX, y - t.prevY, imageHandler.lastImageIndex], drawHelper.getOptions()];

                t.ismousedown = false;
            }

        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);

                drawHelper.image(tempContext, [imageHandler.lastImageURL, t.prevX, t.prevY, x - t.prevX, y - t.prevY, imageHandler.lastImageIndex]);
            }
        }
    };

    var pdfHandler = {
        lastPdfURL: null,
        lastIndex: 0,
        lastPointIndex: 0,
        removeWhiteBackground: false,
        pdfPageContainer: document.getElementById('pdf-page-container'),
        pdfPagesList: document.getElementById('pdf-pages-list'),
        pdfNext: document.getElementById('pdf-next'),
        pdfPrev: document.getElementById('pdf-prev'),
        pdfClose: document.getElementById('pdf-close'),
        pageNumber: 1,

        images: [],
        ismousedown: false,
        prevX: 0,
        prevY: 0,
        getPage: function(pageNumber, callback) {
            pageNumber = parseInt(pageNumber) || 1;

            if (!pdfHandler.pdf) {
                pdfjsLib.disableWorker = false;
                pdfjsLib.getDocument(pdfHandler.lastPdfURL).then(function(pdf) {
                    pdfHandler.pdf = pdf;
                    pdfHandler.getPage(pageNumber, callback);
                });
                return;
            }

            var pdf = pdfHandler.pdf;
            pdf.getPage(pageNumber).then(function(page) {
                pdfHandler.pageNumber = pageNumber;

                var scale = 1.5;
                var viewport = page.getViewport(scale);

                var cav = document.createElement('canvas');
                var ctx = cav.getContext('2d');
                cav.height = viewport.height;
                cav.width = viewport.width;

                var renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };

                if (pdfHandler.removeWhiteBackground === true) {
                    renderContext.background = 'rgba(0,0,0,0)';
                }

                page.render(renderContext).then(function() {
                    if (pdfHandler.removeWhiteBackground === true) {
                        var imgd = ctx.getImageData(0, 0, cav.width, cav.height);
                        var pix = imgd.data;
                        var newColor = {
                            r: 0,
                            g: 0,
                            b: 0,
                            a: 0
                        };

                        for (var i = 0, n = pix.length; i < n; i += 4) {
                            var r = pix[i],
                                g = pix[i + 1],
                                b = pix[i + 2];

                            if (r == 255 && g == 255 && b == 255) {
                                pix[i] = newColor.r;
                                pix[i + 1] = newColor.g;
                                pix[i + 2] = newColor.b;
                                pix[i + 3] = newColor.a;
                            }
                        }
                        ctx.putImageData(imgd, 0, 0);
                    }

                    pdfHandler.lastPage = cav.toDataURL('image/png');
                    callback(pdfHandler.lastPage, cav.width, cav.height, pdf.numPages);
                });
            });
        },
        load: function(lastPdfURL) {
            pdfHandler.lastPdfURL = lastPdfURL;
            pdfHandler.getPage(parseInt(pdfHandler.pdfPagesList.value || 1), function(lastPage, width, height, numPages) {
                pdfHandler.prevX = canvas.width - width - parseInt(width / 2);

                var t = pdfHandler;
                pdfHandler.lastIndex = pdfHandler.images.length;
                var point = [lastPage, 60, 20, width, height, pdfHandler.lastIndex];

                pdfHandler.lastPointIndex = points.length;
                points[points.length] = ['pdf', point, drawHelper.getOptions()];

                pdfHandler.pdfPagesList.innerHTML = '';
                for (var i = 1; i <= numPages; i++) {
                    var option = document.createElement('option');
                    option.value = i;
                    option.innerHTML = 'Page #' + i;
                    pdfHandler.pdfPagesList.appendChild(option);

                    if (pdfHandler.pageNumber.toString() == i.toString()) {
                        option.selected = true;
                    }
                }

                pdfHandler.pdfPagesList.onchange = function() {
                    pdfHandler.load(lastPdfURL);
                };

                pdfHandler.pdfNext.onclick = function() {
                    pdfHandler.pdfPagesList.selectedIndex++;
                    pdfHandler.pdfPagesList.onchange();
                };

                pdfHandler.pdfPrev.onclick = function() {
                    pdfHandler.pdfPagesList.selectedIndex--;
                    pdfHandler.pdfPagesList.onchange();
                };

                pdfHandler.pdfClose.onclick = function() {
                    pdfHandler.pdfPageContainer.style.display = 'none';
                };

                document.getElementById('drag-last-path').click();

                pdfHandler.pdfPrev.src = data_uris.pdf_next;
                pdfHandler.pdfNext.src = data_uris.pdf_prev;
                pdfHandler.pdfClose.src = data_uris.pdf_close;

                pdfHandler.pdfPageContainer.style.top = '20px';
                pdfHandler.pdfPageContainer.style.left = (point[3] - parseInt(point[3] / 2)) + 'px';
                pdfHandler.pdfPageContainer.style.display = 'block';

                // share to webrtc
                syncPoints(true);
            });
        },
        mousedown: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;

            t.prevX = x;
            t.prevY = y;

            t.ismousedown = true;
        },
        mouseup: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                if (points[pdfHandler.lastPointIndex]) {
                    points[pdfHandler.lastPointIndex] = ['pdf', [pdfHandler.lastPage, t.prevX, t.prevY, x - t.prevX, y - t.prevY, pdfHandler.lastIndex], drawHelper.getOptions()];
                }

                t.ismousedown = false;
            }
        },
        mousemove: function(e) {
            var x = e.pageX - canvas.offsetLeft,
                y = e.pageY - canvas.offsetTop;

            var t = this;
            if (t.ismousedown) {
                tempContext.clearRect(0, 0, innerWidth, innerHeight);
                drawHelper.pdf(tempContext, [pdfHandler.lastPage, t.prevX, t.prevY, x - t.prevX, y - t.prevY, pdfHandler.lastIndex]);
            }
        },
        reset_pos: function(x, y) {
            pdfHandler.pdfPageContainer.style.top = y + 'px';
            if (!points[pdfHandler.lastPointIndex]) return;
            var point = points[pdfHandler.lastPointIndex][1];
            pdfHandler.pdfPageContainer.style.left = (point[1] + point[3] - parseInt(point[3] / 2) - parseInt(pdfHandler.pdfPageContainer.clientWidth / 2)) + 'px';
        },
        end: function() {
            // pdfHandler.pdfPageContainer.style.display = 'none';
        }
    };

    var icons = {};
    if (params.icons) {
        try {
            icons = JSON.parse(params.icons);
        } catch (e) {
            icons = {};
        }
    }

    var data_uris = {
        line: icons.line || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAFEJJREFUeJztXXuQXFWZ/33f7cd0z4Q8CEWxkmRmpVgWQS2FuCslASG8fKzuwpCQBAjkISgkhNeuWo5RcS1MolirS2JCCBEnmbiFICQxIS9qsUrKtwgu1JoosAWSQBLS3dN9+3zf/tEzPd0zPTPn9HT39Ov3R3Ln3PO6/fvdc8/jO98h1Bm6urr4tD92dMDns0HogGo7FNNFcQqTToXSFJBERTjEQEhVIYQUk6SgHAfkiAJHVPEmKf1FgYMEOQjBC2+c95dDK1eulPF+xlKCxrsCY8VD13ZPM8Z8WEguUNXzIXouMbdCcyIpoLkBuZc6THgmUX4eghMCeZ5Bzynrs8Y3P1u2c8mrpX6mSqLmBLDxho0tqd7gxSxypSG6khVnZG9q5h/NXg+El0QA+ReZv4y8rMw7SM2O1lhg/8IDC3uLf7rKoyYE0HNNT+htL3kFKzpF6ZMMTBiO6EoLIC8cclwMP06EnsNtE3at3NaZcn7YCqOqBbDu2u4zQenFUNxAoFMA5Pz41SiAgf8M9K8seNh4vH75Uze9POrDjhOqTgAKpfVzui8lNXeC+PL+XziH94GYeX+jqgSgOf+oYicDqz678+a9BMpNPe6oGgF0dXXxtJfO/DQgXwL4vXmM17gAsvEUvwFj5W07bn68WoQw7gJQKG2Y030VVL9GjPcXIrpeBJDz3y9V9IvLdi3eiXHGuApg3Zwfvsdj+RZAswf9QPUugL4L2WkMrbjj6cUvYpwwLgJ4ZP4jrWn1vmpUb2ewl/ujNpYAFADSRvTb0bB2LX1yaRwVRsUFsH5e92WAWcvgdh1Ect/V0ItSCmDQlzdPADn3KygAZKogf1Lxlix/etEeVBAVE8DaJU9Eg7ETqwDc0h9WFgGoQlShMlBAP8lEfY+b89TZsJxwAgGUI46+/EQ1k2dZBNAXLPqdiX7w3kpNKFVEABvmb3mfQrcw9Kz85jd7VbwABBARqFGoaIY0AvpoLEy2pQD6wyjnQrWvHKMQEUBKKwAoAJHnlb25y3cveh5lRtkFsHFB9wJjsI4ZLYObz6IFoIBJG0haMiSAkMtjOQUwkC4TJiKQtMCkTbZu2eoXKwAoRBAn1ZuX7126BWVE2QTQNWtfYPq019cw4bZCRAPuApC0wPgZ4rPoJ3ucBJAbJmkDkxKIkTELYCBc1/zN5Mn3dG7rNCgDyiKA9Tf9eAKnYluJ+EqgMNHDhRcSgEkZ+Kk01CiGJbsKBJBtFYwgnTIwKYOxCwCA6k98jsy9e/f1MZQYJRfA5nmbT0tRYDsT3t8fVqwA0ikDv9cHRHNqWv0CyOYlCr/XRzplxiaADH4FoauW7138BkqIkgpg04Ke6ULpPVA6IzfcVQDGN/DjPkR0oJI1KID+WyIKP+7D+GYsAgCMeYnEu2TZgdLZIJRMAA9f3/1uA93L4OmDa24rABVFMpaC8fs+d5T96WtaAP2VM75BMpaCihYngEzAIYG5ZMWeW/+EEoBLkcmmBT3TpZ/8IuH3phE/muj7btYnvJCH6KQIgi2BsWTTrvD2PDBr3emlqNOYBbB53ubThNN7iiVfRZE41pt5MwYrvg5BBIRbQ4hMbAFxcQ0wA+1CZs+3P/r9U8danzEJYP1NP55gOLCdwGeMHnso0imD+Fvxun7rh4MX8hCdHIUX8orLgPlMgXnqm7MfaR1LPYoWwL6ufQE2vVvB9P7RYw9FMpZC4lhi6Fx8A4GYEJkYQbg1VFx60AcDfqK755qeIlU0BgH8+c9/XcPAlc4JFZkm/0TVm8tVDOG2zCehqC454xOvHj58f7FlFyWATTdsXQDgNtd0KorY0QT83nQxxdY1gi0BRCdF8kclliDwitWzvjenmHKdBfDIwi3vA2GdazoVbdjvvS0CIQ/RkyNFdQ4V2PDtWd87xzWdkwDWLnkiqootAFpc0qkoYkdiMH5dbaopC7ygh9YpUWcRMHPUMHd3zdroxI2TAELJxDcBOsslTYb8OEy6Sb4tvKCH1pOjzp8DAs45iZPfcEljLYCHb+q+jAm3umSuigz5frPZd0VGBBHnjiEBy1Zd9OAltvGtBNBza08bKa91qwqQeDuRWQhpoigEwpmOoStYZO3qf1htldBKAImYfAVAu0sleo8nkUr4LkmaKIBQNIjwhLBbIuZ3I9z6ZZuoozYwD1+/7T3qpX/LYC9vIQfIX63IWefxEz5ih2PAoIWWzFpJgbCc8LwFnDpbDCoYln8J0NB6gwgn3owh3Zt5oXLtTDIBeTbP/ffSRHLOHftu/R+MgBFbAIUSPPOtjOm2HcQIYm9V3Lq57tF2chTsOfXZA2Jo9WiRRszxBzf1XEXg2S6lxt6KZ5Y7mygpiAnRKW79AWJ8bM1HvnvZSHGGXZfs6upifUW/5tINTb6TRLpBZvkWbZ0/pvQbF7jbegZbggi3hdF7ImmdxgD3KXT3cHsRh20B3v3K338aYOuFHkkLEkdryjdCTSIyqcXpU8DM562+8D8/Mez9QoEKJSh9yaVisbcbe2XPFb977df43Wu/dk5HTIhOdhwaEroUWrApLyiAzTf3XAqi99rm7yd8+M0hX8UQigadrIoI9IFVsx6cVehe4bZE6U7r3DXz9jdRWUQnR53is+KuguGDAzYt6j4TwOW2GecZcTZRMQRCnpshCeFjq2f9xxDLraEtgHqLrTNVIH60+faPFyKT3IxIVLxFg8PyBNBzTU+IIDfYZpiMpfK3aTVRUXhBD6GofSugKjeu/eDaYG5YngCSE/QKgE+xzTBxvDnsG29ETrJfJ2DmU0+0St7EXp4AhNBpm5mf8JvWPVWAQDiAgMOIQJHPcVYAG2/Y2KKi/2SbUfId+9moJsqLFofVQhL51ANXPJBNkBVAkNsuZuY2m0zUZLZwNVEdCLWF7E3ImCf68dCF2T/7L4TtTbyT8VT+cmQT4woicuoMAprlOisAEgcBNG36qw7hNnsBiAwSQPeN3dPAsNrepaINP+0747yS7MssKUKRoPVngJnOWvORB08D+gRgPP6wbUGNbuY147zTcemKC0ePWGlQZrnYFkbTFwB99gACvsB2QikVb9zmv598DjCMb/CTb+zE3t37s/cHm6UVNP8qGLk0CEWD1vwQ6AIAP2IAUNXzbQtp1G1dQ8nfgf27D4x3tfIQcmgBRGkmAAS6urqYX6NzbXr1YjJeuqj0roWqGjPOOx2X3jlA/hP/vgMHnj4AAcBEmDG5AxNaTiraKLRU8EIeiKnPmdYoYJyjUOKO/zurA4DVHvNGfPsz5M/KI3//0wcgUDAGyK8W2NoJMHDSqn/87nRmCZ5tm3mjTf3OOP90zC5Avmof+VOqi3wACIQc3M8wn82AdtjGT6capwUYiXyiPvLD1UU+AATCDr4iSDuYSNtt4zdKC1CQ/N055E+uTvKBzBKxPaiDobB27tQIO3zbz5+G2XcNkP94DZEPABxw2DxCmMFKsFr/V9G63/AxPPlSE+QDAHtsvzCkmMoKmmoTV0x9v/0Fyd/VTz7XBPn9YEsBqGIqMzDFJrLYjC1rFO3nT8Psu3PI/3of+egnv71myAcAst44IlNZACv74npt/geT/+Ovb880+xAQao98wL4FADgSYMBqHbEed/20zyxMPlRr8s3PwnaWkRFmiJ0A6s0ApH3mNFx290UD5N+3Pae3X8Pkw4V/hMfktbhWMSz56BvqTapd8l3BYNiuH9YFRn7z64N826+1AEkW2AmgGA+W1Yb2mdNw2T31TT4AFwUkmQErfy7FujavFhQkf9f++iMfyJ60YhEzwRA5YhOVvdoVQPvMabj83osbgnwAUOtJOz7MymQpgJIcLlJxDCH/a/VNPmA/aUeEw0yKN60iM9XcZ2A08qfXJfliP2dDOMwg/MU2c89lpWmc0T5zGi7/1wHyH/vqUxnyUb/kA3DarU2ihxjAQdsERR9vUmG0z5yOKwaTv7uPfNQv+QCcXPMq4RATyFoATuZG44T2Dw1DvtY/+YCj0Y7SQSZDL9jGD1R5CzCE/K/kkF/HzX4uXMz2DLw/8EvTf39IBCdsErjsQ680RiV/Yv2TDzhYboscu/fZJa/wypUrBVCrc+rZY0ebs8qgowD5+xqQ/HTK2C/bMz1PIGUAYMZztoWM8dTLkqPjQ9Nx+b81yQeQOWjbGvQckPUVTM8CuN0mWSgaQvKd0u8PvP2nQxxYOSFLfu5Qr4HIB4BU3F4ABDwLZP0D8M9sE4Yi9vvPKolGJx/q1gIYlgEBLFj/L68K5GWbhMSEYBWKYO+ufQPj/IkzGot8ZLbt237/VfDiPQc+9zqQ4yGElXbYFubijaLSaETyASDp4EIehCzXWQEoqb0AWkPl2NxaEjQi+arq9P1XLiAAk47vF+C4TQbEhFCRBx43UXqkTqSsm38RHI29OfWZ/r+zAli4aWEvQx63LTR8ktMBlU2UEb3H7Zt/Ijy28oXO7DAub3lPyeuxzSjYEqj6qeFGQDqZRjppP/1LTHkc5wkgckx3icpfbTNrmdhsBcYbiWMOnT/B620naE9uUJ4AOrd1pgB62Da/cDRUUzYC9QbjGyenXcq6cekvl+b1FoewFxRvvXWOBESKONq0idIg7nhIl3i8YXDYEAHMe/jql1Vlp22m4bZQVS4Q1TvSKYOUi79mxZP37PvM/w4OLth+M3mrXCrT6nigYRNjR9z1dFaWgpwWFMD8h67eC8hvbPMOtgSrdo2gHpGK+/Adev4i8osV+299ptC9ggLoO2VypUulolMidbF7qNqhooi7ntLm4cvOJ4cueOjax6H4pW0Z7HHmEKMmyorE0YSbtxbVn9+1/9btw90e1rqDQPoIb/0ixGGRaEIYfq9flEPJ71yeGXy88ObvRj0+flBFMeT4+DqFn/CdXfUr8xeGe/uBUU4Pv37DtTsB+xEBAESnRGtuA0ktQIwi9rZjx0/xxF37P7NnpCij23exrhDR2Qy2Guuxx2idEkXscMyylvl4zynvHbUFGOyVuxFagNhbcTsfwH0QiB9QKnhaaC5Gnca7YcPcFxn0LeuSkVknaE4Tlw6JY71O8/0AQErfXP7MLaMa+VjN4/YGo10Q/ZNLBVomhBGKNoeGY0Uq7juf0KbAy8fR8lWbuFYCWLruk3GBLnGqBYDopAgCjemFpiRIJ9NFHc3LqktWHlhoNU9svZKzcNPcPYB+x6kmBLSeHGlOFRcBkzKIHUkU4ZxL1txx4Jb9trGdlvJEE/eKwmoTST+ICK0nR5sicIDxTabT5+qaT/BbL+x/3iWJkwAWblrY63k6FyJO4xFiQuuUpghskCXf0TGnACdIzdxlO5c5dRicF/Ovf2jO8+qx8y4OYkL05EjTimgEpFMG8SOJoryysujCO5757IvO6ZxLAnDjxmu7VdVpaAhkPgfRSZGq215WDfATPuJvJ4r1yHr/igO3/KiYhEWb87TG+W6o/sQ5IQGRiS1Vvbeg0uh9J4mEg2FnHkQfe9fUKU7f/VwULYDObZ0mmvCug8qvikkfbg0hOjHS0NPGKorE0YSTTX8eBM9F22h+57bOoo9yGZNBX+e2zhN+EFcJ8FIx6b2Qh+jkaM24nikl0imD+NtxGL847kT1RU4HPr70yaWOCwT5GLNF5+IN170RTPuXQHComPTElPkktIYawp5AVZGMpdB7rLdoF/wqchCks5f9981WHt5GQklMehc8uuBVEzSXSJEiADLrB9FJLXXdGpiUQfxo75jOXxSRgyT46J17b3mtFHUq6Sv30I3d01ToaVY9Mzd8oGOreTNbhcIVmbGwH/ezLk+dVwP7w/LS5fg7LhSWE065R3xmL2lQuhHCBt0SUaRiKUhakPvI/Q+d1/EfLhyAivmjAJeWivyc2pYO35/zw1M5QE8x4YP9Ya4C6L8wKYNUrw+I1qQA1Cj8Xj/znS/wfG4C0OcoEPj4sp1jb/ZzUfJdHYu3XPdGIuldBMB9iDgIXshD5KTMqmItuaoVI0jFffS+kyy6k5cLVXks0oKLS00+UMZTAHqu6fFi4fT9IFpRbAuQe0/Rd3h1SiDpnB+1iloASZtM/YzkvMj5D+baAihw/7smT/r8WIZ6I6Hs3e6N87fMUTEbwBwdqwCy4QoYYyBp6TOQHD8BiBGYtECMydYtW/0xCECAEyR64/I9S/8LZURFxl3r5285h8V0g+mckgig70IBQAARyRxsaTQzlVpGAaj2lSOaEV+2bgWILlIAIvpbz9M5t+9a+keUGRUbeG+9emskFk5/A6CsN7KSCGDw26MKUYXKQAH98+uuAsjOy/flJ6rZdjm3zNIKQFfDS3zBdVWvWFR85mXjvO5LFLoOwN+WRQDDhOuQAvr+HDLWysl9OKLLI4CXhbDkjp8u3o8KouJd64WPzt3jt7adC+j9gFT+PPqRJK8j3CsTBPABfD19/Pj7Kk0+MA4tQC7Wz9v8d1BvDUGvqlgLMOheXguQd1n+FkBVn1BJ37X86dGtd8uFqph8Xz9v82UkdB9A5zWEAFR/LkRfWL5z0YibNiqBqhAAACiUNsz5wSeUuIuAD9SjAETlFwT+8m0/vXn7SNu1KomqEUA/FEobrnv0Ihi9C8RX1YMARPEkQKtu33nTM9VCfD+qTgC5+P7Vj5yBAC0iozcq86kAakYARuR1Am9U+BuW7RzqmaNaUNUC6MfaJWuDfLRttpJ2ksqnAJ5YlQIQOQqixwDtCb4hewY7ZKpG1IQAcvHAFdvD0bbDFyrTlYBeCaWzsjfHQQCieJFUdwhhx5HohGdWbussvS/9MqLmBDAYD35682ns4QIlvYCUZgr0XAImlEcAchyC3wP0nJA8S+I9+7ntC18v9TNVEjUvgMFQKG3450enG0qfDaIOFXQQaIaITlXGVECmknKERMIAhzMCkCSYk2IkQeDDxHJYQYdV9BAUhwh80AP9YcmT179SbZ24seL/AVBNStOkJv4jAAAAAElFTkSuQmCC',
        arrow: icons.arrow || 'data:image/png;base64,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',
        pencil: icons.pencil || 'data:image/png;base64,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',
        marker: icons.marker || 'data:image/png;base64,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',
        dragSingle: icons.dragSingle || 'data:image/png;base64,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',
        dragMultiple: icons.dragMultiple || 'data:image/png;base64,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',
        eraser: icons.eraser || 'data:image/png;base64,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',
        rectangle: icons.rectangle || 'data:image/png;base64,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',
        arc: icons.arc || 'data:image/png;base64,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',
        bezier: icons.bezier || 'data:image/png;base64,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',
        quadratic: icons.quadratic || 'data:image/png;base64,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',
        text: icons.text || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAWVJREFUeJzt28ENgzAQAEETpf+WSQfJA6xD2ZkCjCWv7mFgLQAAAKDimN4A69y8/tczfm1+OA8ngDgBxAkgTgBxAogTQJx7gOf7dU9w6QxNgDgBxAkgTgBxAogTQJwA4t43rLH7ffa/G72LMQHiBBAngDgBxAkgTgBxAogTQJwA4gQQJ4A4AcQJIE4AcQKIu+N7gOl/C65+jzC9/1EmQJwA4gQQJ4A4AcQJIE4AcQKIE0CcAOIEECeAOAHECSBOAHECiBNAnADiBBAngDgBxAkgTgBxAogTQJwA4gQQJ4A4AcQJIE4AcQKIE0CcAOIEECeAOAHECSBOAHECiBNAnADiBBAngDgBxAkgTgBxAogTQJwA4gQQJ4A4AcQJIE4AcQKIE0CcAOIEECeAOAHECSBOAHECiBNAnADiBBAngDgBxAkgTgBxx/QGWOfm9b+esQkQJ4A4AcQJIE4AcQKIEwAAAABAxAcVTAXjELyg1wAAAABJRU5ErkJggg==',
        image: icons.image || 'data:image/png;base64,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',
        pdf: icons.pdf || 'data:image/png;base64,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',
        zoom_in: icons.zoom_in || 'data:image/png;base64,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',
        zoom_out: icons.zoom_out || 'data:image/png;base64,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',
        lineWidth: icons.lineWidth || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAABgUlEQVR4nO3csU0DMRgF4AdKoKFhGsa5YViCHTIIomEVGlJAAwWhoYAj57N98vdJr7XQ70jBlvMSAAAAAAAAAAAAAAAAYHsuCq93k+QuyW3hdfnykuQpyWvrP+SnfZL7JMckH7JqjqdZ72ftTAWXSQ5pP5jRcjjNvrkp7YcxaqYZ+7O6x7QfxKh5nLE/vyrxT+BbkqsC6/B/70mulyzQxXcI7ZT4ADwXWIPzLJ59iQ/AQ4E1OE8Xs3cMbJNujoFJsouLoFr5vgjazdqZP7gK3pZur4IBAAAAAAAAAACAtjwK3ZZuH4XqB6j/LFw/wODp5ochU9oPY9RMM/ZndfoB2kU/wOD0A7CMfoBt0w8wuC5m7xjYJt0cAxP9ADWjH2Bg3V4FAwAAAAAAAAAAAG15FLot3T4K1Q9Q/1m4foDB080PQ6a0H8aomWbsz+r0A7SLfoDB6QdgGf0A26YfYHBdzN4xsE26OQYm+gFqRj/AwLq9CgYAAAAAAAAAAAAAAABq+gRzFKdEQnj1fQAAAABJRU5ErkJggg==',
        colorsPicker: icons.colorsPicker || 'data:image/png;base64,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',
        extraOptions: icons.extraOptions || 'data:image/png;base64,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',
        undo: icons.undo || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABPxJREFUeNrsnVuIVVUYx9dpQiIdvOBtDGa8RILSQz4koWYvRZeXEkRztJd8ExGkSPBRSxDMB0ESxBBpSnyLMCGJChV6SSURpEkcZia8RjqpmTTT97HXYQYcZ87Za5+z917f7wd/BhT1eNZvfWutvdbeuzI0NOTALk/wFSAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAlBq9LyAkJeY5yWeSmabbz6gA70n6JX9LplkWwNoQME/yleSwZI7ktn6HzAFsoL3+R8kaBv5hnjTS63fR8DYrAL3eaAWg1xuuAPR6oxWAXm+4AtDrjVYA7fWfSNbSlPYqQLXX0/jGKgC93nAFoNcbrQD0esMVgF5vtALQ6w1XAHq90QqQR6//jwpgt9dXJE9LWqwKUAk91lWpVEI/Q4fkY0lnDv9/7f2/Sf5yyfEw/XlLck3SI+mT9PqfA0VswOD2y1mATt/4HQXuJPcl170oFyVnJeckl/zvIUDKsV4b/t2SVs5/Jb9Lzki+l/wg+aOMAuRxKniDL69DEUUrxDE/f5nWbAHKcix8ruTLyBp+tFyW7JY8jwDDrI+w14+Xu5IjkhctCzDPSK8fK/9IDrrkTiRTAmww2OvHii4tt/nrDlELoGP9FzT4Y6Mrh5diFaCTXl9T9KLShzEJMJexPlW6JDPKLsBGfxGEBk2XXyQL8xIgi82gQQchvCA5IVma27XkDIaADiZ+mawSXolhEniFxkydm5KVLANt56pkSQwXgqgG6dMtaY/hUjBzg/TR01ETY9kMWkc1SJW9sW0HUw3qiy6x34lFAOYG6aLf1eyYBGBuUH8OxCYAc4P6omcQl8UoQN5zg0G/M6enex8WXILv3Cj3cYS2XxHuCxh5gGRnrevfjPhT8qo/tTPJZ6pLnh/c7uXU4WqBZLrL/0aatyTHy34qeLxq0NXEXqWneVvH+UwtXoiXJZslR3M883DSJXczRTUEPG6l0Iwv+Ybv2fUyRfKGZJ9L7g9olgB6J9MKCwI0a26QVoCRTJa87ZL7AgaaIMEhKwJUWd/AlUIWAoxkkZ/HXG7wjmGbJQEaWQ2yFqCKHvPa6jd1GiHBRmsCNGpu0CgBqsxyydNL72UswNdWBci6GjRagCp6DPznDAXQW9jnWBUgy7lBswSorhz2ZyjBKusCZFENmilAlS2SBxkIsAcBwncY8xBAWe2G31eUNj/plUkECNthzEsA5U1/KTrkFPFMBAirBnkKoLwuuROwkbWc18Y9ilaBlX5PoejoDSHv++3euvfhXHL7fRCxvjSqx1eC6oMpioxeQv4g5Z99NvhfN/Dm0LFWCnkPASPZk2IY+Jw5QNjcoEgCTJB8W6cA3yBA2EqhSAIoz7j6NpJOI0D6atDnL8jMKNhne81PCmsR4FcESM98l7w+vq2An21HjQJ0I0A4RVwJPSU5VYMAvVwHCKeID7jQQ6qbXPIA67FoidF+SDjvkrME5sofDPOpS84RNKx6IUCx0aFgq1+tUAGMog+WPIAAttFl4ZVRfr2CADbQo+DbEcA2+iTW4whgF73w85HL+OVVCFAuLjh/GNQzIfQvLNLt4VAbrX4o0FfS9Ev7Lc5VACg3DAEIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgApeN/AQYAUjtq/Zx6jVYAAAAASUVORK5CYII=',
        pdf_next: icons.pdf_next || 'data:image/png;base64,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',
        pdf_prev: icons.pdf_prev || 'data:image/png;base64,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',
        pdf_close: icons.pdf_close || 'data:image/png;base64,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'
    };

    var tools = {
        line: true,
        arrow: true,
        pencil: true,
        marker: true,
        dragSingle: true,
        dragMultiple: true,
        eraser: true,
        rectangle: true,
        arc: true,
        bezier: true,
        quadratic: true,
        text: true,
        image: true,
        pdf: true,
        zoom: true,
        lineWidth: true,
        colorsPicker: true,
        extraOptions: true,
        code: true,
        undo: true
    };

    if (params.tools) {
        try {
            var t = JSON.parse(params.tools);
            tools = t;
        } catch (e) {}
    }

    if (tools.code === true) {
        document.querySelector('.preview-panel').style.display = 'block';
    }

    function setSelection(element, prop) {
        endLastPath();
        hideContainers();

        is.set(prop);

        var selected = document.getElementsByClassName('selected-shape')[0];
        if (selected) selected.className = selected.className.replace(/selected-shape/g, '');

        if (!element.className) {
            element.className = '';
        }

        element.className += ' selected-shape';
    }

    /* Default: setting default selected shape!! */
    is.set(window.selectedIcon);

    function setDefaultSelectedIcon() {
        var toolBox = document.getElementById('tool-box');
        var canvasElements = toolBox.getElementsByTagName('canvas');
        var shape = window.selectedIcon.toLowerCase();

        var firstMatch;
        for (var i = 0; i < canvasElements.length; i++) {
            if (!firstMatch && (canvasElements[i].id || '').indexOf(shape) !== -1) {
                firstMatch = canvasElements[i];
            }
        }
        if (!firstMatch) {
            window.selectedIcon = 'Pencil';
            firstMatch = document.getElementById('pencil-icon');
        }

        setSelection(firstMatch, window.selectedIcon);
    }

    window.addEventListener('load', function() {
        setDefaultSelectedIcon();
    }, false);

    (function() {
        var cache = {};

        var lineCapSelect = find('lineCap-select');
        var lineJoinSelect = find('lineJoin-select');

        function getContext(id) {
            var context = find(id).getContext('2d');
            context.lineWidth = 2;
            context.strokeStyle = '#6c96c8';
            return context;
        }

        function bindEvent(context, shape) {
            if (shape === 'Pencil' || shape === 'Marker') {
                lineCap = lineJoin = 'round';
            }

            addEvent(context.canvas, 'click', function() {
                // pdfHandler.pdfPageContainer.style.display = 'none';

                if (textHandler.text.length) {
                    textHandler.appendPoints();
                }

                if (shape === 'Text') {
                    textHandler.onShapeSelected();
                } else {
                    textHandler.onShapeUnSelected();
                }

                if (shape === 'Pencil' || shape === 'Marker') {
                    lineCap = lineJoin = 'round';
                }

                dragHelper.global.startingIndex = 0;

                setSelection(this, shape);

                if (this.id === 'drag-last-path') {
                    find('copy-last').checked = true;
                    find('copy-all').checked = false;
                } else if (this.id === 'drag-all-paths') {
                    find('copy-all').checked = true;
                    find('copy-last').checked = false;
                }

                if (this.id === 'image-icon') {
                    var selector = new FileSelector();
                    selector.accept = 'image/*';
                    selector.selectSingleFile(function(file) {
                        if (!file) return;

                        var reader = new FileReader();
                        reader.onload = function(event) {
                            var image = new Image();
                            image.onload = function() {
                                var index = imageHandler.images.length;

                                imageHandler.lastImageURL = image.src;
                                imageHandler.lastImageIndex = index;

                                imageHandler.images.push(image);
                                imageHandler.load(image.clientWidth, image.clientHeight);
                            };
                            image.style = 'position: absolute; top: -99999999999; left: -999999999;'
                            document.body.appendChild(image);
                            image.src = event.target.result;
                        };
                        reader.readAsDataURL(file);
                    });
                }

                if (this.id === 'pdf-icon') {
                    var selector = new FileSelector();
                    selector.selectSingleFile(function(file) {
                        if (!file) return;

                        function onGettingPdf() {
                            var reader = new FileReader();
                            reader.onload = function(event) {
                                pdfHandler.pdf = null; // to make sure we call "getDocument" again
                                pdfHandler.load(event.target.result);
                            };
                            reader.readAsDataURL(file);
                        }
                        onGettingPdf();
                    }, null, 'application/pdf');
                }

                if (this.id === 'pencil-icon' || this.id === 'eraser-icon' || this.id === 'marker-icon') {
                    cache.lineCap = lineCap;
                    cache.lineJoin = lineJoin;

                    lineCap = lineJoin = 'round';
                } else if (cache.lineCap && cache.lineJoin) {
                    lineCap = cache.lineCap;
                    lineJoin = cache.lineJoin;
                }

                if (this.id === 'eraser-icon') {
                    cache.strokeStyle = strokeStyle;
                    cache.fillStyle = fillStyle;
                    cache.lineWidth = lineWidth;

                    strokeStyle = 'White';
                    fillStyle = 'White';
                    lineWidth = 10;
                } else if (cache.strokeStyle && cache.fillStyle && typeof cache.lineWidth !== 'undefined') {
                    strokeStyle = cache.strokeStyle;
                    fillStyle = cache.fillStyle;
                    lineWidth = cache.lineWidth;
                }
            });
        }

        var toolBox = find('tool-box');
        toolBox.style.height = (innerHeight) + 'px'; // -toolBox.offsetTop - 77

        function decorateDragLastPath() {
            var context = getContext('drag-last-path');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'DragLastPath');
            };
            image.src = data_uris.dragSingle;
        }

        decorateDragLastPath();

        if (tools.dragSingle === true) {
            document.getElementById('drag-last-path').style.display = 'block';
        }

        function decorateDragAllPaths() {
            var context = getContext('drag-all-paths');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'DragAllPaths');
            };
            image.src = data_uris.dragMultiple;
        }

        decorateDragAllPaths();

        if (tools.dragMultiple === true) {
            document.getElementById('drag-all-paths').style.display = 'block';
        }

        function decorateLine() {
            var context = getContext('line');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Line');
            };
            image.src = data_uris.line;
        }

        if (tools.line === true) {
            decorateLine();
            document.getElementById('line').style.display = 'block';
        }

        function decorateUndo() {
            var context = getContext('undo');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);

                document.querySelector('#undo').onclick = function() {
                    if (points.length) {
                        points.length = points.length - 1;
                        drawHelper.redraw();
                    }

                    // share to webrtc
                    syncPoints(true);
                };
            };
            image.src = data_uris.undo;
        }

        if (tools.undo === true) {
            decorateUndo();
            document.getElementById('undo').style.display = 'block';
        }

        function decorateArrow() {
            var context = getContext('arrow');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Arrow');
            };
            image.src = data_uris.arrow;
        }

        if (tools.arrow === true) {
            decorateArrow();
            document.getElementById('arrow').style.display = 'block';
        }

        function decoreZoomUp() {
            var context = getContext('zoom-up');
            // zoomHandler.icons.up(context);
            addEvent(context.canvas, 'click', function() {
                zoomHandler.up();
            });

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
            };
            image.src = data_uris.zoom_in;
        }

        function decoreZoomDown() {
            var context = getContext('zoom-down');
            // zoomHandler.icons.down(context);
            addEvent(context.canvas, 'click', function() {
                zoomHandler.down();
            });

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
            };
            image.src = data_uris.zoom_out;
        }

        if (tools.zoom === true) {
            decoreZoomUp();
            decoreZoomDown();

            document.getElementById('zoom-up').style.display = 'block';
            document.getElementById('zoom-down').style.display = 'block';
        }

        function decoratePencil() {

            function hexToRGBA(h, alpha) {
                return 'rgba(' + hexToRGB(h).join(',') + ',1)';
            }

            var colors = [
                ['FFFFFF', '006600', '000099', 'CC0000', '8C4600'],
                ['CCCCCC', '00CC00', '6633CC', 'FF0000', 'B28500'],
                ['666666', '66FFB2', '006DD9', 'FF7373', 'FF9933'],
                ['333333', '26FF26', '6699FF', 'CC33FF', 'FFCC99'],
                ['000000', 'CCFF99', 'BFDFFF', 'FFBFBF', 'FFFF33']
            ];

            var context = getContext('pencil-icon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Pencil');
            };
            image.src = data_uris.pencil;

            var pencilContainer = find('pencil-container'),
                pencilColorContainer = find('pencil-fill-colors'),
                strokeStyleText = find('pencil-stroke-style'),
                pencilColorsList = find("pencil-colors-list"),
                fillStyleText = find('pencil-fill-style'),
                pencilSelectedColor = find('pencil-selected-color'),
                pencilSelectedColor2 = find('pencil-selected-color-2'),
                btnPencilDone = find('pencil-done'),
                canvas = context.canvas,
                alpha = 0.2;

            // START INIT PENCIL



            pencilStrokeStyle = hexToRGBA(fillStyleText.value, alpha)

            pencilSelectedColor.style.backgroundColor =
                pencilSelectedColor2.style.backgroundColor = '#' + fillStyleText.value;

            colors.forEach(function(colorRow) {
                var row = '<tr>';

                colorRow.forEach(function(color) {
                    row += '<td style="background-color:#' + color + '" data-color="' + color + '"></td>';
                })
                row += '</tr>';

                pencilColorsList.innerHTML += row;
            })

            Array.prototype.slice.call(pencilColorsList.getElementsByTagName('td')).forEach(function(td) {
                addEvent(td, 'mouseover', function() {
                    var elColor = td.getAttribute('data-color');
                    pencilSelectedColor2.style.backgroundColor = '#' + elColor;
                    fillStyleText.value = elColor
                });

                addEvent(td, 'click', function() {
                    var elColor = td.getAttribute('data-color');
                    pencilSelectedColor.style.backgroundColor =
                        pencilSelectedColor2.style.backgroundColor = '#' + elColor;

                    fillStyleText.value = elColor;


                    pencilColorContainer.style.display = 'none';
                });
            })

            // END INIT PENCIL

            addEvent(canvas, 'click', function() {
                hideContainers();

                pencilContainer.style.display = 'block';
                pencilContainer.style.top = (canvas.offsetTop + 1) + 'px';
                pencilContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

                fillStyleText.focus();
            });

            addEvent(btnPencilDone, 'click', function() {
                pencilContainer.style.display = 'none';
                pencilColorContainer.style.display = 'none';

                pencilLineWidth = strokeStyleText.value;
                pencilStrokeStyle = hexToRGBA(fillStyleText.value, alpha);
            });

            addEvent(pencilSelectedColor, 'click', function() {
                pencilColorContainer.style.display = 'block';
            });
        }

        if (tools.pencil === true) {
            decoratePencil();
            document.getElementById('pencil-icon').style.display = 'block';
        }

        function decorateMarker() {

            function hexToRGBA(h, alpha) {
                return 'rgba(' + hexToRGB(h).join(',') + ',' + alpha + ')';
            }
            var colors = [
                ['FFFFFF', '006600', '000099', 'CC0000', '8C4600'],
                ['CCCCCC', '00CC00', '6633CC', 'FF0000', 'B28500'],
                ['666666', '66FFB2', '006DD9', 'FF7373', 'FF9933'],
                ['333333', '26FF26', '6699FF', 'CC33FF', 'FFCC99'],
                ['000000', 'CCFF99', 'BFDFFF', 'FFBFBF', 'FFFF33']
            ];

            var context = getContext('marker-icon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Marker');
            };
            image.src = data_uris.marker;

            var markerContainer = find('marker-container'),
                markerColorContainer = find('marker-fill-colors'),
                strokeStyleText = find('marker-stroke-style'),
                markerColorsList = find("marker-colors-list"),
                fillStyleText = find('marker-fill-style'),
                markerSelectedColor = find('marker-selected-color'),
                markerSelectedColor2 = find('marker-selected-color-2'),
                btnMarkerDone = find('marker-done'),
                canvas = context.canvas,
                alpha = 0.2;

            // START INIT MARKER



            markerStrokeStyle = hexToRGBA(fillStyleText.value, alpha)

            markerSelectedColor.style.backgroundColor =
                markerSelectedColor2.style.backgroundColor = '#' + fillStyleText.value;

            colors.forEach(function(colorRow) {
                var row = '<tr>';

                colorRow.forEach(function(color) {
                    row += '<td style="background-color:#' + color + '" data-color="' + color + '"></td>';
                })
                row += '</tr>';

                markerColorsList.innerHTML += row;
            })

            Array.prototype.slice.call(markerColorsList.getElementsByTagName('td')).forEach(function(td) {
                addEvent(td, 'mouseover', function() {
                    var elColor = td.getAttribute('data-color');
                    markerSelectedColor2.style.backgroundColor = '#' + elColor;
                    fillStyleText.value = elColor
                });

                addEvent(td, 'click', function() {
                    var elColor = td.getAttribute('data-color');
                    markerSelectedColor.style.backgroundColor =
                        markerSelectedColor2.style.backgroundColor = '#' + elColor;

                    fillStyleText.value = elColor;


                    markerColorContainer.style.display = 'none';
                });
            })

            // END INIT MARKER

            addEvent(canvas, 'click', function() {
                hideContainers();

                markerContainer.style.display = 'block';
                markerContainer.style.top = (canvas.offsetTop + 1) + 'px';
                markerContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

                fillStyleText.focus();
            });

            addEvent(btnMarkerDone, 'click', function() {
                markerContainer.style.display = 'none';
                markerColorContainer.style.display = 'none';

                markerLineWidth = strokeStyleText.value;
                markerStrokeStyle = hexToRGBA(fillStyleText.value, alpha);
            });

            addEvent(markerSelectedColor, 'click', function() {
                markerColorContainer.style.display = 'block';
            });
        }

        if (tools.marker === true) {
            decorateMarker();
            document.getElementById('marker-icon').style.display = 'block';
        }

        function decorateEraser() {
            var context = getContext('eraser-icon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Eraser');
            };
            image.src = data_uris.eraser;
        }

        if (tools.eraser === true) {
            decorateEraser();
            document.getElementById('eraser-icon').style.display = 'block';
        }

        function decorateText() {
            var context = getContext('text-icon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Text');
            };
            image.src = data_uris.text;
        }

        if (tools.text === true) {
            decorateText();
            document.getElementById('text-icon').style.display = 'block';
        }

        function decorateImage() {
            var context = getContext('image-icon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Image');
            };
            image.src = data_uris.image;
        }

        if (tools.image === true) {
            decorateImage();
            document.getElementById('image-icon').style.display = 'block';
        }


        function decoratePDF() {
            var context = getContext('pdf-icon');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Pdf');
            };
            image.src = data_uris.pdf;
        }

        if (tools.pdf === true) {
            decoratePDF();
            document.getElementById('pdf-icon').style.display = 'block';
        }

        function decorateArc() {
            var context = getContext('arc');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Arc');
            };
            image.src = data_uris.arc;
        }

        if (tools.arc === true) {
            decorateArc();
            document.getElementById('arc').style.display = 'block';
        }

        function decorateRect() {
            var context = getContext('rectangle');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Rectangle');
            };
            image.src = data_uris.rectangle;
        }

        if (tools.rectangle === true) {
            decorateRect();
            document.getElementById('rectangle').style.display = 'block';
        }

        function decorateQuadratic() {
            var context = getContext('quadratic-curve');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'QuadraticCurve');
            };
            image.src = data_uris.quadratic;
        }

        if (tools.quadratic === true) {
            decorateQuadratic();
            document.getElementById('quadratic-curve').style.display = 'block';
        }

        function decorateBezier() {
            var context = getContext('bezier-curve');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
                bindEvent(context, 'Bezier');
            };
            image.src = data_uris.bezier;
        }

        if (tools.bezier === true) {
            decorateBezier();
            document.getElementById('bezier-curve').style.display = 'block';
        }

        function tempStrokeTheLine(context, width, mx, my, lx, ly) {
            context.beginPath();
            context.lineWidth = width;
            context.moveTo(mx, my);
            context.lineTo(lx, ly);
            context.stroke();
        }

        function decorateLineWidth() {
            var context = getContext('line-width');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
            };
            image.src = data_uris.lineWidth;

            var lineWidthContainer = find('line-width-container'),
                lineWidthText = find('line-width-text'),
                btnLineWidthDone = find('line-width-done'),
                h1 = document.getElementsByTagName('h1')[0],
                canvas = context.canvas;

            addEvent(canvas, 'click', function() {
                hideContainers();

                lineWidthContainer.style.display = 'block';
                lineWidthContainer.style.top = (canvas.offsetTop + 1) + 'px';
                lineWidthContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

                lineWidthText.focus();
            });

            addEvent(btnLineWidthDone, 'click', function() {
                lineWidthContainer.style.display = 'none';
                lineWidth = lineWidthText.value;
            });
        }

        if (tools.lineWidth === true) {
            decorateLineWidth();
            document.getElementById('line-width').style.display = 'block';
        }

        function decorateColors() {
            var context = getContext('colors');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
            };
            image.src = data_uris.colorsPicker;

            var colorsContainer = find('colors-container'),
                strokeStyleText = find('stroke-style'),
                fillStyleText = find('fill-style'),
                btnColorsDone = find('colors-done'),
                h1 = document.getElementsByTagName('h1')[0],
                canvas = context.canvas;

            addEvent(canvas, 'click', function() {
                hideContainers();

                colorsContainer.style.display = 'block';
                colorsContainer.style.top = (canvas.offsetTop + 1) + 'px';
                colorsContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

                strokeStyleText.focus();
            });

            addEvent(btnColorsDone, 'click', function() {
                colorsContainer.style.display = 'none';
                strokeStyle = strokeStyleText.value;
                fillStyle = fillStyleText.value;
            });
        }

        if (tools.colorsPicker === true) {
            decorateColors();
            document.getElementById('colors').style.display = 'block';
        }

        function decorateAdditionalOptions() {
            var context = getContext('additional');

            var image = new Image();
            image.onload = function() {
                context.drawImage(image, 4, 4, 32, 32);
            };
            image.src = data_uris.extraOptions;

            var additionalContainer = find('additional-container'),
                btnAdditionalClose = find('additional-close'),
                h1 = document.getElementsByTagName('h1')[0],
                canvas = context.canvas,
                globalAlphaSelect = find('globalAlpha-select'),
                globalCompositeOperationSelect = find('globalCompositeOperation-select');

            addEvent(canvas, 'click', function() {
                hideContainers();

                additionalContainer.style.display = 'block';
                additionalContainer.style.top = (canvas.offsetTop + 1) + 'px';
                additionalContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';
            });

            addEvent(btnAdditionalClose, 'click', function() {
                additionalContainer.style.display = 'none';

                globalAlpha = globalAlphaSelect.value;
                globalCompositeOperation = globalCompositeOperationSelect.value;
                lineCap = lineCapSelect.value;
                lineJoin = lineJoinSelect.value;
            });
        }

        if (tools.extraOptions === true) {
            decorateAdditionalOptions();
            document.getElementById('additional').style.display = 'block';
        }

        var designPreview = find('design-preview'),
            codePreview = find('code-preview');

        // todo: use this function in share-drawings.js
        // to sync buttons' states
        window.selectBtn = function(btn, isSkipWebRTCMessage) {
            codePreview.className = designPreview.className = '';

            if (btn == designPreview) designPreview.className = 'preview-selected';
            else codePreview.className = 'preview-selected';

            if (!isSkipWebRTCMessage && window.connection && connection.numberOfConnectedUsers >= 1) {
                connection.send({
                    btnSelected: btn.id
                });
            } else {
                // to sync buttons' UI-states
                if (btn == designPreview) btnDesignerPreviewClicked();
                else btnCodePreviewClicked();
            }
        };

        addEvent(designPreview, 'click', function() {
            selectBtn(designPreview);
            btnDesignerPreviewClicked();
        });

        function btnDesignerPreviewClicked() {
            codeText.parentNode.style.display = 'none';
            optionsContainer.style.display = 'none';

            hideContainers();
            endLastPath();
        }

        addEvent(codePreview, 'click', function() {
            selectBtn(codePreview);
            btnCodePreviewClicked();
        });

        function btnCodePreviewClicked() {
            codeText.parentNode.style.display = 'block';
            optionsContainer.style.display = 'block';

            codeText.focus();
            common.updateTextArea();

            setHeightForCodeAndOptionsContainer();

            hideContainers();
            endLastPath();
        }

        var codeText = find('code-text'),
            optionsContainer = find('options-container');

        function setHeightForCodeAndOptionsContainer() {
            codeText.style.width = (innerWidth - optionsContainer.clientWidth - 30) + 'px';
            codeText.style.height = (innerHeight - 40) + 'px';

            codeText.style.marginLeft = (optionsContainer.clientWidth) + 'px';
            optionsContainer.style.height = (innerHeight) + 'px';
        }

        var isAbsolute = find('is-absolute-points'),
            isShorten = find('is-shorten-code');

        addEvent(isShorten, 'change', common.updateTextArea);
        addEvent(isAbsolute, 'change', common.updateTextArea);
    })();

    function hideContainers() {
        var additionalContainer = find('additional-container'),
            colorsContainer = find('colors-container'),
            markerContainer = find('marker-container'),
            markerColorContainer = find('marker-fill-colors'),
            pencilContainer = find('pencil-container'),
            pencilColorContainer = find('pencil-fill-colors'),
            lineWidthContainer = find('line-width-container');

        additionalContainer.style.display =
            colorsContainer.style.display =
            markerColorContainer.style.display =
            markerContainer.style.display =
            pencilColorContainer.style.display =
            pencilContainer.style.display =
            lineWidthContainer.style.display = 'none';
    }

    function setTemporaryLine() {
        var arr = ["line", [139, 261, 170, 219],
            [1, "rgba(0,0,0,0)", "rgba(0,0,0,0)", 1, "source-over", "round", "round", "15px \"Arial\""]
        ];
        points.push(arr);
        drawHelper.redraw();

        setTimeout(function() {
            setSelection(document.getElementById('line'), 'Line');
        }, 1000);

        setTimeout(setDefaultSelectedIcon, 2000);
    }

    var canvas = tempContext.canvas,
        isTouch = 'createTouch' in document;

    addEvent(canvas, isTouch ? 'touchstart mousedown' : 'mousedown', function(e) {
        if (isTouch) e = e.pageX ? e : e.touches.length ? e.touches[0] : {
            pageX: 0,
            pageY: 0
        };

        var cache = is;

        if (cache.isLine) lineHandler.mousedown(e);
        else if (cache.isArc) arcHandler.mousedown(e);
        else if (cache.isRectangle) rectHandler.mousedown(e);
        else if (cache.isQuadraticCurve) quadraticHandler.mousedown(e);
        else if (cache.isBezierCurve) bezierHandler.mousedown(e);
        else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mousedown(e);
        else if (cache.isPencil) pencilHandler.mousedown(e);
        else if (cache.isEraser) eraserHandler.mousedown(e);
        else if (cache.isText) textHandler.mousedown(e);
        else if (cache.isImage) imageHandler.mousedown(e);
        else if (cache.isPdf) pdfHandler.mousedown(e);
        else if (cache.isArrow) arrowHandler.mousedown(e);
        else if (cache.isMarker) markerHandler.mousedown(e);

        !cache.isPdf && drawHelper.redraw();

        preventStopEvent(e);
    });

    function preventStopEvent(e) {
        if (!e) {
            return;
        }

        if (typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        if (typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }
    }

    addEvent(canvas, isTouch ? 'touchend touchcancel mouseup' : 'mouseup', function(e) {
        if (isTouch && (!e || !('pageX' in e))) {
            if (e && e.touches && e.touches.length) {
                e = e.touches[0];
            } else if (e && e.changedTouches && e.changedTouches.length) {
                e = e.changedTouches[0];
            } else {
                e = {
                    pageX: 0,
                    pageY: 0
                }
            }
        }

        var cache = is;

        if (cache.isLine) lineHandler.mouseup(e);
        else if (cache.isArc) arcHandler.mouseup(e);
        else if (cache.isRectangle) rectHandler.mouseup(e);
        else if (cache.isQuadraticCurve) quadraticHandler.mouseup(e);
        else if (cache.isBezierCurve) bezierHandler.mouseup(e);
        else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mouseup(e);
        else if (cache.isPencil) pencilHandler.mouseup(e);
        else if (cache.isEraser) eraserHandler.mouseup(e);
        else if (cache.isText) textHandler.mouseup(e);
        else if (cache.isImage) imageHandler.mouseup(e);
        else if (cache.isPdf) pdfHandler.mousedown(e);
        else if (cache.isArrow) arrowHandler.mouseup(e);
        else if (cache.isMarker) markerHandler.mouseup(e);

        !cache.isPdf && drawHelper.redraw();

        syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);

        preventStopEvent(e);
    });

    addEvent(canvas, isTouch ? 'touchmove mousemove' : 'mousemove', function(e) {
        if (isTouch) e = e.pageX ? e : e.touches.length ? e.touches[0] : {
            pageX: 0,
            pageY: 0
        };

        var cache = is;

        if (cache.isLine) lineHandler.mousemove(e);
        else if (cache.isArc) arcHandler.mousemove(e);
        else if (cache.isRectangle) rectHandler.mousemove(e);
        else if (cache.isQuadraticCurve) quadraticHandler.mousemove(e);
        else if (cache.isBezierCurve) bezierHandler.mousemove(e);
        else if (cache.isDragLastPath || cache.isDragAllPaths) dragHelper.mousemove(e);
        else if (cache.isPencil) pencilHandler.mousemove(e);
        else if (cache.isEraser) eraserHandler.mousemove(e);
        else if (cache.isText) textHandler.mousemove(e);
        else if (cache.isImage) imageHandler.mousemove(e);
        else if (cache.isPdf) pdfHandler.mousedown(e);
        else if (cache.isArrow) arrowHandler.mousemove(e);
        else if (cache.isMarker) markerHandler.mousemove(e);

        preventStopEvent(e);
    });

    var keyCode;

    function onkeydown(e) {
        keyCode = e.which || e.keyCode || 0;

        if (keyCode == 8 || keyCode == 46) {
            if (isBackKey(e, keyCode)) {
                // back key pressed
            }
            return;
        }

        if (e.metaKey) {
            isControlKeyPressed = true;
            keyCode = 17;
        }

        if (!isControlKeyPressed && keyCode === 17) {
            isControlKeyPressed = true;
        }
    }

    function isBackKey(e, keyCode) {
        var doPrevent = false;
        var d = e.srcElement || e.target;
        if ((d.tagName.toUpperCase() === 'INPUT' &&
                (
                    d.type.toUpperCase() === 'TEXT' ||
                    d.type.toUpperCase() === 'PASSWORD' ||
                    d.type.toUpperCase() === 'FILE' ||
                    d.type.toUpperCase() === 'SEARCH' ||
                    d.type.toUpperCase() === 'EMAIL' ||
                    d.type.toUpperCase() === 'NUMBER' ||
                    d.type.toUpperCase() === 'DATE')
            ) ||
            d.tagName.toUpperCase() === 'TEXTAREA') {
            doPrevent = d.readOnly || d.disabled;
        } else {
            doPrevent = true;
        }

        if (doPrevent) {
            e.preventDefault();
        }
        return doPrevent;
    }

    addEvent(document, 'keydown', onkeydown);

    function onkeyup(e) {
        if (e.which == null && (e.charCode != null || e.keyCode != null)) {
            e.which = e.charCode != null ? e.charCode : e.keyCode;
        }

        keyCode = e.which || e.keyCode || 0;

        if (keyCode === 13 && is.isText) {
            textHandler.onReturnKeyPressed();
            return;
        }

        if (keyCode == 8 || keyCode == 46) {
            if (isBackKey(e, keyCode)) {
                textHandler.writeText(textHandler.lastKeyPress, true);
            }
            return;
        }

        // Ctrl + t
        if (isControlKeyPressed && keyCode === 84 && is.isText) {
            textHandler.showTextTools();
            return;
        }

        // Ctrl + z
        if (isControlKeyPressed && keyCode === 90) {
            if (points.length) {
                points.length = points.length - 1;
                drawHelper.redraw();

                syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);
            }
        }

        // Ctrl + a
        if (isControlKeyPressed && keyCode === 65) {
            dragHelper.global.startingIndex = 0;

            endLastPath();

            setSelection(find('drag-all-paths'), 'DragAllPaths');
        }

        // Ctrl + c
        if (isControlKeyPressed && keyCode === 67 && points.length) {
            copy();
        }

        // Ctrl + v
        if (isControlKeyPressed && keyCode === 86 && copiedStuff.length) {
            paste();

            syncPoints(is.isDragAllPaths || is.isDragLastPath ? true : false);
        }

        // Ending the Control Key
        if (typeof e.metaKey !== 'undefined' && e.metaKey === false) {
            isControlKeyPressed = false;
            keyCode = 17;
        }

        if (keyCode === 17) {
            isControlKeyPressed = false;
        }
    }

    addEvent(document, 'keyup', onkeyup);

    function onkeypress(e) {
        if (e.which == null && (e.charCode != null || e.keyCode != null)) {
            e.which = e.charCode != null ? e.charCode : e.keyCode;
        }

        keyCode = e.which || e.keyCode || 0;

        var inp = String.fromCharCode(keyCode);
        if (/[a-zA-Z0-9-_ !?|\/'",.=:;(){}\[\]`~@#$%^&*+-]/.test(inp)) {
            textHandler.writeText(String.fromCharCode(keyCode));
        }
    }

    addEvent(document, 'keypress', onkeypress);

    function onTextFromClipboard(e) {
        if (!is.isText) return;
        var pastedText;
        if (window.clipboardData && window.clipboardData.getData) { // IE
            pastedText = window.clipboardData.getData('Text');
        } else if (e.clipboardData && e.clipboardData.getData) {
            pastedText = e.clipboardData.getData('text/plain');
        }
        if (pastedText && pastedText.length) {
            textHandler.writeText(pastedText);
        }
    }

    addEvent(document, 'paste', onTextFromClipboard);

    // scripts on this page directly touches DOM-elements
    // removing or altering anything may cause failures in the UI event handlers
    // it is used only to bring collaboration for canvas-surface
    var lastPointIndex = 0;

    var uid;

    window.addEventListener('message', function(event) {
        if (!event.data) return;

        if (!uid) {
            uid = event.data.uid;
        }

        if (event.data.captureStream) {
            webrtcHandler.createOffer(function(sdp) {
                sdp.uid = uid;
                window.parent.postMessage(sdp, '*');
            });
            return;
        }

        if (event.data.renderStream) {
            setTemporaryLine();
            return;
        }

        if (event.data.sdp) {
            webrtcHandler.setRemoteDescription(event.data);
            return;
        }

        if (event.data.genDataURL) {
            var dataURL = context.canvas.toDataURL(event.data.format, 1);
            window.parent.postMessage({
                dataURL: dataURL,
                uid: uid
            }, '*');
            return;
        }

        if (event.data.undo && points.length) {
            var index = event.data.index;

            if (event.data.tool) {
                var newArray = [];
                var length = points.length;
                var reverse = points.reverse();
                for (var i = 0; i < length; i++) {
                    var point = reverse[i];
                    if (point[0] !== event.data.tool) {
                        newArray.push(point);
                    }
                }
                points = newArray.reverse();
                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (index === 'all') {
                points = [];
                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (index.numberOfLastShapes) {
                try {
                    points.length -= index.numberOfLastShapes;
                } catch (e) {
                    points = [];
                }

                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (index === -1) {
                if (points.length && points[points.length - 1][0] === 'pencil') {
                    var newArray = [];
                    var length = points.length;
                    var reverse = points.reverse();
                    var ended;
                    for (var i = 0; i < length; i++) {
                        var point = reverse[i];
                        if (point[3] == 'start') {
                            ended = true;
                        } else if (ended) {
                            newArray.push(point);
                        }
                    }

                    points = newArray.reverse();
                    drawHelper.redraw();
                    syncPoints(true);
                    return;
                }

                points.length = points.length - 1;
                drawHelper.redraw();
                syncPoints(true);
                return;
            }

            if (points[index]) {
                var newPoints = [];
                for (var i = 0; i < points.length; i++) {
                    if (i !== index) {
                        newPoints.push(points[i]);
                    }
                }
                points = newPoints;
                drawHelper.redraw();
                syncPoints(true);
            }
            return;
        }

        if (event.data.syncPoints) {
            syncPoints(true);
            return;
        }

        if (event.data.clearCanvas) {
            points = [];
            drawHelper.redraw();
            return;
        }

        if (!event.data.canvasDesignerSyncData) return;

        // drawing is shared here (array of points)
        var d = event.data.canvasDesignerSyncData;

        if (d.startIndex !== 0) {
            for (var i = 0; i < d.points.length; i++) {
                points[i + d.startIndex] = d.points[i];
            }
        } else {
            points = d.points;
        }

        lastPointIndex = points.length;

        // redraw the <canvas> surfaces
        drawHelper.redraw();
    }, false);

    function syncPoints(isSyncAll) {
        if (isSyncAll) {
            lastPointIndex = 0;
        }

        if (lastPointIndex == points.length) return;

        var pointsToShare = [];
        for (var i = lastPointIndex; i < points.length; i++) {
            pointsToShare[i - lastPointIndex] = points[i];
        }

        if (pointsToShare.length) {
            syncData({
                points: pointsToShare || [],
                startIndex: lastPointIndex
            });
        }

        if (!pointsToShare.length && points.length) return;

        lastPointIndex = points.length;
    }

    function syncData(data) {
        window.parent.postMessage({
            canvasDesignerSyncData: data,
            uid: uid
        }, '*');
    }

    var webrtcHandler = {
        createOffer: function(callback) {
            var captureStream = document.getElementById('main-canvas').captureStream();
            var peer = this.getPeer();

            captureStream.getTracks().forEach(function(track) {
                peer.addTrack(track, captureStream);
            });

            peer.onicecandidate = function(event) {
                if (!event || !!event.candidate) {
                    return;
                }

                callback({
                    sdp: peer.localDescription.sdp,
                    type: peer.localDescription.type
                });
            };
            peer.createOffer({
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false
            }).then(function(sdp) {
                peer.setLocalDescription(sdp);
            });
        },
        setRemoteDescription: function(sdp) {
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp)).then(function() {
                if (typeof setTemporaryLine === 'function') {
                    setTemporaryLine();
                }
            });
        },
        createAnswer: function(sdp, callback) {
            var peer = this.getPeer();
            peer.onicecandidate = function(event) {
                if (!event || !!event.candidate) {
                    return;
                }

                callback({
                    sdp: peer.localDescription.sdp,
                    type: peer.localDescription.type
                });
            };
            this.peer.setRemoteDescription(new RTCSessionDescription(sdp)).then(function() {
                peer.createAnswer({
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: true
                }).then(function(sdp) {
                    peer.setLocalDescription(sdp);
                });
            });

            peer.ontrack = function(event) {
                callback({
                    stream: event.streams[0]
                });
            };
        },
        getPeer: function() {
            var WebRTC_Native_Peer = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
            var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
            var RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

            var peer = new WebRTC_Native_Peer(null);
            this.peer = peer;
            return peer;
        }
    };

})();
