/*updated 12/10/2022*/
(function () {

    var ColorChips = loadColorChips();

    var doc = app.activeDocument;

    // Option 1. get the colors from selected items
    var myColors = ColorChips.getBasicColorsFromItems(doc.selection, true, false);

    // Option 2. get the colors from selected swatches in swatch panel
    // var myColors = doc.swatches.getSelected();

    // Option 3. get the colors by specifying swatch bny index
    // var myColors = [doc.swatches[5], doc.swatches[7]];

    var chips = new ColorChips(

        // edit any of the following settings:

        {
            colors: myColors,
            doc: doc,
            position: [704, 109],

            showName: true,
            showBreakdown: false,

            nameFilter: function (c, i) { return ColorChips.getColorName(c).replace(/^PANTONE\s/, '') },

            labelFont: "Muli-BoldItalic",
            labelFontSize: 6,
            labelAlignCenter: true,
            labelColor: app.activeDocument.swatches["GREY"].color,
            labelGap: 5,

            chipWidth: 18.3662,
            chipHeight: 18.3662,
            chipStrokeWidth: 0.6127,
            chipStrokeColor: undefined,
            chipGap: 7.706,

            showBorder: false,
            borderColor: undefined,
            margin: 0

        }

    );

    if (chips.colors.length == 0)
        return;

    // draw the ColorChips:

    // horizontal layout
    // chips.drawHorizontally();

    // vertical layout
    chips.drawVertically();


})();




function loadColorChips() {

    //  start ColorChips.jsx library file:

    /**
     * Makes a "Color Chips" group item
     * with can be drawn horizontally or
     * vertically, with one chip per
     * supplied breakdown or swatch.
     * All positioning measurements are in points.
     * @constructor
     * @param {Object} options
     * @param {Document} [options.doc] - an Illustrator Document (default: activeDocument).
     * @param {Array<Number>} [options.position] - [x, y] position of top left of swatch collection (default: center of view).
     * @param {Number} [options.chipWidth] - the color chip width (default: 30).
     * @param {Number} [options.chipHeight] - the color chip height (default: 30).
     * @param {Number} [options.chipStrokeWidth] - the color chip stroke width (default: 1).
     * @param {Number} [options.chipGap] - the space between color chips (default: 10).
     * @param {Number} [options.labelFont] - the label font (default: Illustrator's default).
     * @param {Number} [options.labelFontSize] - the label text size (default: 7).
     * @param {Boolean} [options.labelAlignCenter] - whether to center the labels (default: false: left-alignment).
     * @param {Number} [options.labelGap] - the space between the chip and the label (default: 5).
     * @param {Number} [options.margin] - the space between the border and the chips (default: 10).
     * @param {Boolean} [options.showBorder] - whether to show the outer border (default: true).
     * @param {Boolean} [options.showName] - whether to show labels (default: true).
     * @param {Boolean} [options.showBreakdown] - whether to show labels (default: true).
     * @param {Color} [options.borderColor] - the color of the border (default: non-global black).
     * @param {Color} [options.chipStrokeColor] - the color of the strokes (default: non-global black).
     * @param {Color} [options.labelColor] - the color of the labels (default: non-global black).
     * @param {Boolean} [options.makeSwatches] - whether to make swatches (default: false).
     * @param {Boolean} [options.makeGlobalSwatches] - whether swatches made are global (default: false).
     * @param {Boolean} [options.makeColorGroup] - whether to put swatches in a ColorGroup (default: false).
     * @param {String} [options.colorGroupName] - name for the ColorGroup (default: 'Chips').
     * @param {Array<Swatch>|Swatches|Array<Number>} [options.colors] - an array of Swatches or a Swatches object (default: all swatches in document).
     * @param {Function} [options.swatchFilter] - a function that filters swatches (default: no filter).
     * @param {Function} [options.nameFilter] - a function that returns the color name (default: returns unmodified name).
     */
    function ColorChips(options) {

        var black = new GrayColor()
        black.gray = 100;

        var self = this,
            doc = self.doc = options.doc || app.activeDocument,
            position = self.position = options.position,
            chipWidth = self.chipWidth = options.chipWidth || 30,
            chipHeight = self.chipHeight = options.chipHeight || 30,
            chipStrokeWidth = self.chipStrokeWidth = options.chipStrokeWidth != undefined ? options.chipStrokeWidth : 1,
            chipGap = self.chipGap = options.chipGap != undefined ? options.chipGap : 0,
            labelFont = self.labelFont = options.labelFont || undefined,
            labelFontSize = self.labelFontSize = options.labelFontSize || 7,
            labelAlignCenter = self.labelAlignCenter = options.labelAlignCenter,
            labelColor = self.labelColor = options.labelColor || black,
            labelGap = self.labelGap = options.labelGap != undefined ? options.labelGap : 5,
            showBorder = self.showBorder = options.showBorder !== false,
            margin = self.margin = options.margin != undefined ? options.margin : 0,
            borderColor = self.borderColor = options.borderColor || black,
            chipStrokeColor = self.chipStrokeColor = options.chipStrokeColor || black,
            nameFilter = self.nameFilter = options.nameFilter || function (c) { return c.name },
            showName = self.showName = options.showName !== false,
            showBreakdown = self.showBreakdown = options.showBreakdown !== false,
            colors = self.colors = options.colors || [],
            breakdowns = self.breakdowns = options.breakdowns || [],
            makeSwatches = options.makeSwatches === true,
            makeGlobalSwatches = options.makeGlobalSwatches === true,
            makeColorGroup = options.makeColorGroup === true,
            colorGroupName = self.colorGroupName = options.colorGroupName || 'Untitled';

        self.colorChipsGroupItems = [];

        if (breakdowns != undefined) {

            // make colors from breakdowns
            for (var i = 0; i < breakdowns.length; i++) {
                var c = ColorChips.colorFromBreakdown(breakdowns[i]);
                if (c != undefined)
                    colors.push(c);
            }

        }

        // sort colors
        self.colors.sort(options.sorter || basicSorter);

        if (makeSwatches === true)
            self.colorGroup = self.makeSwatches(makeGlobalSwatches, makeColorGroup, colorGroupName)

        if (self.labelFont != undefined)
            self.labelFont = app.textFonts[self.labelFont];

        // $/*debug*/.writeln('colors.length = ' + colors.length);

    }




    /**
     * Draw the ColorChips to document.
     * @param {Bool} isHorizontal - whether to draw in horizontal or vertical format (default: true).
     * @param {Array<Number>} position - the coordinates of the top-left of the swatch panel item.
     * @returns {GroupItem} - the ColorChips page item.
     */
    ColorChips.prototype.draw = function (isHorizontal, position) {

        var self = this,
            group = self.doc.groupItems.add(),
            doc = self.doc,
            chipWidth = self.chipWidth,
            chipHeight = self.chipHeight,
            chipGap = self.chipGap,
            chipStrokeWidth = self.chipStrokeWidth,
            makeLabel = self.showName === true || self.showBreakdown === true,
            labelGap = makeLabel ? self.labelGap : 0,
            margin = self.margin,
            labelFunction = self.labelFunction || isHorizontal ? basicLabelHorizontal : basicLabelVertical;

        var x = 0,
            y = 0,
            textWidth = 0,
            textHeight = 0;

        for (var i = 0; i < self.colors.length; i++) {

            var c = self.colors[i];

            // make the label textFrame
            if (makeLabel) {

                var textFrame = labelFunction(x, y, c, i, self);

                if (textFrame.width > textWidth)
                    textWidth = textFrame.width;

                if (textFrame.height > textHeight)
                    textHeight = textFrame.height;

                textFrame.moveToEnd(group);

            }

            // make the chip rectangle
            var rect = doc.pathItems.rectangle(y, x, chipWidth, chipHeight);

            rect.filled = true;
            rect.fillColor = c.hasOwnProperty('color') ? c.color : c;
            rect.stroked = self.chipStrokeWidth > 0;
            rect.strokeWidth = chipStrokeWidth;
            rect.strokeColor = self.chipStrokeColor;
            rect.moveToEnd(group);

            if (isHorizontal)
                x += self.chipWidth + self.chipGap;

            else
                y -= self.chipHeight + self.chipGap;

        }

        var totalWidth,
            totalHeight;

        if (isHorizontal) {
            totalWidth = margin + (chipWidth * self.colors.length) + (chipGap * (self.colors.length - 1)) + margin;
            totalHeight = margin + chipHeight + labelGap + textHeight + margin;
        }

        else {
            totalWidth = margin + chipWidth + labelGap + textWidth + margin;
            totalHeight = margin + chipHeight * self.colors.length + chipGap * (self.colors.length - 1) + margin;
        }


        // outer border
        if (self.showBorder) {

            rect = doc.pathItems.rectangle(margin, - margin, totalWidth, totalHeight);
            rect.strokeColor = self.borderColor;
            rect.strokeWidth = self.chipStrokeWidth;
            rect.filled = false;
            rect.moveToEnd(group);

        }

        if (position != undefined)
            position = doc.convertCoordinate([position[0] + margin, -position[1] - margin], CoordinateSystem.ARTBOARDCOORDINATESYSTEM, CoordinateSystem.DOCUMENTCOORDINATESYSTEM);

        else if (self.position != undefined)
            position = doc.convertCoordinate([self.position[0], -self.position[1]], CoordinateSystem.ARTBOARDCOORDINATESYSTEM, CoordinateSystem.DOCUMENTCOORDINATESYSTEM);

        else
            position = [doc.activeView.centerPoint[0] - totalWidth / 2, doc.activeView.centerPoint[1] + totalHeight / 2];

        // final positioning
        group.position = position;

        self.colorChipsGroupItems.push(group)

        return group;

    };




    /**
     * Draw the ColorChips to document, horizontally.
     * @param {Array<Number>} position - the coordinates of the top-left of the swatch panel item.
     * @returns {GroupItem} - the ColorChips page item.
     */
    ColorChips.prototype.drawHorizontally = function (position) {

        return this.draw(true, position);

    };




    /**
     * Draw the ColorChips to document, vertically.
     * @param {Array<Number>} position - the coordinates of the top-left of the swatch panel item.
     * @returns {GroupItem} - the ColorChips page item.
     */
    ColorChips.prototype.drawVertically = function (position) {

        return this.draw(false, position);

    };


    /**
     * Returns Color object when given an array of values.
     * eg. [50] = GrayColor
     *     [255,128,0] = RGBColor
     *     [10,20,30,0] = CMYKColor
     * @param {Array<Number>} breakdown - an array of color breakdown values.
     * @returns {Color}
     */
    ColorChips.colorFromBreakdown = function colorFromBreakdown(breakdown) {

        if (breakdown == undefined)
            return;

        // sanity check
        for (var i = 0; i < breakdown.length; i++)
            if (breakdown[i] < 0)
                breakdown[i] = 0;

        var colr;

        switch (breakdown.length) {

            case 1: // [K]
                colr = new GrayColor();
                colr.gray = breakdown[0];
                break;

            case 3: // [R,G,B]
                colr = new RGBColor();
                colr.red = breakdown[0];
                colr.green = breakdown[1];
                colr.blue = breakdown[2];
                break;

            case 4: // [C,M,Y,K]
                colr = new CMYKColor();
                colr.cyan = breakdown[0];
                colr.magenta = breakdown[1];
                colr.yellow = breakdown[2];
                colr.black = breakdown[3];
                break;

            default:
                throw Error('ColorChips.colorFromBreakdown: couldn\'t parse color (' + breakdown + ')');

        }

        return colr;

    };


    /**
     * Returns the color breakdown of a given Color.
     * eg. GrayColor = [50]
     *     RGBColor = [255,128,0]
     *     CMYKColor = [10,20,30,0]
     * @param {Color} colr - an Illustrator Color.
     * @returns {Array<Number>}
     */
    ColorChips.breakdownFromColor = function breakdownFromColor(colr) {

        if (colr == undefined)
            return;

        else if (colr.constructor.name == 'Swatch')
            colr = colr.color;

        else if (colr.constructor.name == 'SpotColor')
            colr = colr.spot.color;

        else if (colr.constructor.name == 'GradientColor')
            colr = colr.gradient.gradientStops[0].color;

        var breakdown;

        switch (colr.constructor.name) {

            case 'GrayColor': // [K]
                breakdown = [colr.gray];
                break;

            case 'RGBColor': // [R,G,B]
                breakdown = [colr.red, colr.green, colr.blue];
                break;

            case 'CMYKColor': // [C,M,Y,K]
                breakdown = [colr.cyan, colr.magenta, colr.yellow, colr.black];
                break;

            default:
                throw Error('ColorChips.breakdownFromColor: couldn\'t parse breakdown from "' + colr + '".');

        }

        return breakdown;

    };




    /**
     * Returns array of Colors by interpolating
     * between the two supplied colors.
     * eg. 20K and 50K with n = 2 -> [20K, 30K, 40K, 50K]
     * @param {Color} c1 - an Illustrator Color.
     * @param {Color} c2 - an Illustrator Color.
     * @param {Number} n - the number of steps in between.
     * @returns {Array<Number>}
     */
    ColorChips.colorsByInterpolation = function colorsByInterpolation(c1, c2, n) {

        var colrs = [],
            breakdown1 = ColorChips.breakdownFromColor(c1),
            breakdown2 = ColorChips.breakdownFromColor(c2);

        var breakdowns = interpolateArrays(breakdown1, breakdown2, n);

        // make colors
        for (var i = 0; i < breakdowns.length; i++) {

            var c = ColorChips.colorFromBreakdown(breakdowns[i]);

            if (c != undefined)
                colrs.push(c);

        }

    };


    /**
     * Create a ColorGroup containing
     * the ColorChip's colors.
     * @param {Boolean} makeGlobal - whether the swatches created will be global (default: false).
     * @param {Boolean} makeColorGroup - whether the swatches created will be global (default: false).
     * @param {String} colorGroupName - the name of the colorGroup.
     * @returns {SwatchGroup}
     */
    ColorChips.prototype.makeSwatches = function makeSwatches(makeGlobal, makeColorGroup, colorGroupName) {

        var self = this,
            colorGroup;

        if (makeColorGroup === true) {

            for (var i = 0; i < self.doc.swatchGroups.length; i++)
                if (self.doc.swatchGroups[i].name == colorGroupName)
                    colorGroup = self.doc.swatchGroups[i];

            if (colorGroup == undefined) {
                colorGroup = self.doc.swatchGroups.add();
                colorGroup.name = colorGroupName;
            }

            if (colorGroup == undefined)
                makeColorGroup = false;

        }

        for (var i = 0; i < self.colors.length; i++) {

            var c = self.colors[i],
                colorName = basicLabelForColor(c, '=', ' '),
                existingColor = getSwatch(self.doc, colorName),
                sw;

            if (existingColor != undefined)
                existingColor.remove();

            if (makeGlobal === true) {
                sw = self.doc.spots.add();
                sw.colorType = ColorModel.PROCESS;
            }

            else {
                sw = self.doc.swatches.add();
            }

            sw.name = colorName;
            sw.color = c;

            // store the swatch of the color
            for (var j = 0; j < self.doc.swatches.length; j++)
                if (self.doc.swatches[j].name == colorName)
                    self.colors[i] = self.doc.swatches[j];

            if (makeColorGroup)
                colorGroup.addSwatch(self.colors[i]);


            // self.colors[i] = self.doc.swatches.itemByName(colorName);

        }

        return colorGroup;

    };


    /**
     * Returns array of swatches or colors
     * found in fill or stroke of page item.
     * @param {Array<PageItems>} items - an Illustrator PageItem.
     * @param {Boolean} [fill] - whether to get fill color (default: true).
     * @param {Boolean} [stroke] - whether to get stroke color (default: true).
     * @returns {Array<Color|Swatch>}
     */
    ColorChips.getBasicColorsFromItems = function getBasicColorsFromItems(items, fill, stroke) {

        var found = [],
            uniquify = {};

        fill = fill !== false;
        stroke = stroke !== false;

        for (var i = 0; i < items.length; i++) {

            var itemColors = ColorChips.getBasicColorsFromItem(items[i]);

            if (
                itemColors == undefined
                || itemColors.length == 0
            )
                continue;

            if (
                fill !== false
                && itemColors.fillColors.length > 0
            ) {
                var fills = itemColors.fillColors;
                for (var j = 0; j < fills.length; j++) {
                    var id = ColorChips.getColorName(fills[j]);
                    if (uniquify[id] == undefined) {
                        found.push(fills[j]);
                        uniquify[id] = 1;
                    }
                }
            }

            if (stroke !== false) {
                var strokes = itemColors.strokeColors;
                for (var j = 0; j < strokes.length; j++) {
                    var id = ColorChips.getColorName(strokes[j]);
                    if (uniquify[id] == undefined) {
                        found.push(strokes[j]);
                        uniquify[id] = 1;
                    }
                }
            }

        }

        // remove duplicate colors


        return found;

    };


    /**
     * Returns array of swatches or colors
     * found in fill or stroke of page item.
     * @param {PageItem} item - an Illustrator page item.
     * @returns {Object} -  {fillColors: Array<Color>, strokeColors: Array<Color>}
     */
    ColorChips.getBasicColorsFromItem = function getBasicColorsFromItem(item) {
        // $.bp();
        if (item == undefined)
            throw Error('getItemColor: No item supplied.');

        var noColor = "[NoColor]",
            colorables = [],
            foundColors = {
                fillColors: [],
                strokeColors: []
            };

        // collect all the colorables
        if (item.constructor.name == 'PathItem') {
            colorables.push(item);
        }

        else if (
            item.constructor.name == 'CompoundPathItem'
            && item.pathItems
        ) {
            colorables.push(item.pathItems[0]);
        }

        else if (
            item.constructor.name == 'TextFrame'
            && item.textRanges
        ) {
            for (var i = item.textRanges.length - 1; i >= 0; i--)
                colorables.push({
                    fillColor: item.textRanges[i].characterAttributes.fillColor,
                    strokeColor: item.textRanges[i].characterAttributes.strokeColor
                });
        }

        if (colorables.length > 0)

            for (var i = 0; i < colorables.length; i++) {

                if (
                    colorables[i].hasOwnProperty('fillColor')
                    && colorables[i].fillColor != noColor
                    && (
                        !colorables[i].hasOwnProperty('filled')
                        || colorables[i].filled == true
                    )
                    && colorables[i].fillColor != undefined
                )
                    foundColors.fillColors.push(colorables[i].fillColor);

                if (
                    colorables[i].hasOwnProperty('strokeColor')
                    && colorables[i].strokeColor != noColor
                    && (
                        colorables[i].constructor.name == 'CharacterAttributes'
                        || colorables[i].stroked == true
                    )
                    && colorables[i].strokeColor != undefined
                )
                    foundColors.strokeColors.push(colorables[i].strokeColor);

            }

        else if (item.constructor.name == 'GroupItem') {

            // add colors from grouped items

            for (var i = 0; i < item.pageItems.length; i++) {
                var found = ColorChips.getBasicColorsFromItem(item.pageItems[i]);
                foundColors.fillColors = foundColors.fillColors.concat(found.fillColors);
                foundColors.strokeColors = foundColors.strokeColors.concat(found.strokeColors);
            }

        }

        return foundColors;

    };


    /**
     * Creates and formats a text label
     * for horizontally drawn ColorChips.
     * @param {Number} x - the label position x.
     * @param {Number} y - the label position y.
     * @param {Color} c - an Illustrator Color.
     * @param {Boolean} i - the index of the color.
     * @param {any} self - a parent object, eg. a ColorChips.
     * @returns {TextFrame} - the label.
     */
    function basicLabelHorizontal(x, y, c, i, self) {

        var textFrame = self.doc.textFrames.pointText([x, y]);

        if (self.labelFont != undefined)
            textFrame.textRange.characterAttributes.textFont = self.labelFont;

        var nameParts = [];
        if (self.showName)
            nameParts.push(self.nameFilter(c, i));
        if (self.showBreakdown)
            nameParts.push(basicLabelForColor(c, '\t', '\n'));

        textFrame.contents = nameParts.join('\n');

        textFrame.textRange.fillColor = self.labelColor;
        textFrame.textRange.size = self.labelFontSize;

        if (self.labelAlignCenter === true) {

            // JUSTIFIED CENTRED
            textFrame.position = [x + self.chipWidth / 2, y - self.chipHeight - self.labelGap];
            textFrame.textRange.justification = Justification.CENTER;

        }

        else {

            // JUSTIFIED LEFT
            textFrame.textRange.justification = Justification.LEFT;
            textFrame.position = [x, y - self.chipHeight - self.labelGap];

        }

        // set tab stop to align value
        var tstops = [new TabStopInfo()];
        tstops[0].position = self.labelFontSize * 1.2;
        textFrame.textRange.tabStops = tstops;

        return textFrame;

    };


    /**
     * Creates and formats a text label
     * for vertically drawn ColorChips.
     * @param {Number} x - the label position x.
     * @param {Number} y - the label position y.
     * @param {Color} c - an Illustrator Color.
     * @param {Boolean} i - the index of the color.
     * @param {any} self - a parent object, eg. a ColorChips.
     * @returns {TextFrame} - the label.
     */
    function basicLabelVertical(x, y, c, i, self) {

        var textFrame = self.doc.textFrames.pointText([x, y]);

        if (self.labelFont != undefined)
            textFrame.textRange.characterAttributes.textFont = self.labelFont;

        var nameParts = [];
        if (self.showName)
            nameParts.push(self.nameFilter(c, i));
        if (self.showBreakdown)
            nameParts.push(basicLabelForColor(c, '\t', '\n'));

        textFrame.contents = nameParts.join('\n');

        textFrame.textRange.fillColor = self.labelColor;
        textFrame.textRange.size = self.labelFontSize;
        textFrame.textRange.justification = Justification.LEFT;

        if (self.labelAlignCenter === true) {

            // ALIGN CENTER
            textFrame.position = [x + self.chipWidth + self.labelGap, y - ((self.chipHeight - textFrame.height) / 2)];

        }

        else {

            // JUSTIFIED TOP
            textFrame.position = [x + self.chipWidth + self.labelGap, y];

        }

        // set tab stop to align value
        var tstops = [new TabStopInfo()];
        tstops[0].position = self.labelFontSize * 1.2;
        textFrame.textRange.tabStops = tstops;

        return textFrame;

    };


    /**
     * Returns a string suitable for
     * labelling a color.
     * Example output:
     * 'C=100 M=50 Y=0 K=10' (to match Color.toString)
     * 'C\t100\nM\t50\nY\t0\nK\t10' (align value with tabs, one per line)
     * @param {Color} cc - an Illustrator Color.
     * @param {String} delim1 - a string that delimits channel values (default: '=').
     * @param {String} delim2 - a string that divides the channel reference and the value (default: ' ').
     * @param {Number} [decimalPlaces] - how many decimal places to show in value (default: 0).
     * @returns {String}
     */
    function basicLabelForColor(c, delim1, delim2, decimalPlaces) {

        var label,
            cc = c.hasOwnProperty('color') ? c.color : c;

        if (cc.constructor.name == 'SpotColor')
            cc = cc.spot.color;

        if (
            cc.hasOwnProperty('red')
            || cc.length == 3
        ) {
            label = symbolValueString(cc, delim1, delim2, decimalPlaces, [
                { symbol: 'R', property: 'red' },
                { symbol: 'G', property: 'green' },
                { symbol: 'B', property: 'blue' }
            ]);
        }

        else if (
            cc.hasOwnProperty('cyan')
            || cc.length == 4
        ) {
            label = symbolValueString(cc, delim1, delim2, decimalPlaces, [
                { symbol: 'C', property: 'cyan' },
                { symbol: 'M', property: 'magenta' },
                { symbol: 'Y', property: 'yellow' },
                { symbol: 'K', property: 'black' }
            ]);

        }

        else if (
            cc.hasOwnProperty('gray')
            || cc.length == 1
        ) {
            label = symbolValueString(cc, delim1, delim2, decimalPlaces, [
                { symbol: 'K', property: 'gray' }
            ]);
        }

        else if (cc.hasOwnProperty('pattern'))
            label = cc.pattern.name;

        else
            label = '#UNKNOWN';

        return label;

    };


    /**
     * Returns a text label derived
     * from a color's breakdown.
     * The `obj` argument can be any
     * object having properties expressed
     * in `map`, eg. an Illustrator Color
     * with properties expressed in the map,
     * eg. 'red' which gets the value '210';
     * or it can be an array of values,
     * eg. [210, 255, 33] for RGB and the
     * map's properties can be '0', '1', '2'.
     * Example output:
     * "R=210 G=255 B=33"
     * @param {Object} obj - an object or an array of values.
     * @param {String} [delim1] - first delimiter (default: '=').
     * @param {String} [delim2] - second delimiter, between values (default: ' ').
     * @param {Number} [decimalPlaces] - how many decimal places to show in value (default: 0).
     * @param {Object} map - label info object {symbol: 'R', property: 'red'}
     */
    function symbolValueString(obj, delim1, delim2, decimalPlaces, map) {

        if (delim1 == undefined)
            delim1 = '=';

        if (delim2 == undefined)
            delim2 = ' ';

        if (decimalPlaces == undefined)
            decimalPlaces = 0;

        var label = [];

        for (var i = 0; i < map.length; i++)
            label.push(map[i].symbol + delim1 + (obj[map[i].property] != undefined ? round(obj[map[i].property], decimalPlaces) : round(obj[i])));

        return label.join(delim2);

    };


    /**
     * Rounds a number to n decimal places.
     * @param {Number} num - the number to round.
     * @param {Number} [places] - the number of decimal places (default: 0)
     */
    function round(num, places) {

        places = Math.pow(10, places || 0);
        return Math.round(num * places) / places;

    };


    /**
     * Returns a document swatch by name.
     * @param {Document} doc - and Illustrator Document.
     * @param {String} name - the swatch name.
     * @returns {Swatch}
     */
    function getSwatch(doc, name) {

        for (var i = 0; i < doc.swatches.length; i++)
            if (doc.swatches[i].name == name)
                return doc.swatches[i];

    };


    /**
     * Returns `n` interpolations of the
     * two supplied Arrays, inclusive.
     * @param {Array<Number>} arr1
     * @param {Array<Number>} arr2
     * @param {Number} n - the number of interpolated arrays returns, inclusive of arr1 and arr2.
     * @returns {Array<Array>} - an array of arrays [arr1, inter1, inter2, ..., arr2] where length == n.
     */
    function interpolateArrays(arr1, arr2, n) {

        if (
            arr1 == undefined
            || arr2 == undefined
        )
            throw Error('interpolateArrays: missing argument(s).');

        if (arr1.length !== arr2.length)
            throw Error('interpolateArrays: array lengths don\'t match.');

        if (
            n.constructor.name != 'Number'
            || n < 0
            || n !== n
        )
            throw Error('interpolateArrays: bad argument for "n".');

        // calculate the interpolations
        var results = [];
        for (var j = 0; j < n; j++)
            results[j] = [];

        for (var i = 0; i < arr1.length; i++) {

            var s = arr1[i],
                e = arr2[i];

            for (var j = 0; j < n; j++)
                results[j].push(s + ((s - e) / (n - 1)) * -j);

        }

        return results;

    };


    /**
     * Derives a name given some
     * kind of color object.
     * @param {Color|Swatch|Spot} c - an Illustrator Color.
     */
     ColorChips.getColorName = function getColorName(c) {

        if (c.hasOwnProperty('name'))
            return c.name;

        if (c.hasOwnProperty('spot'))
            return c.spot.name;

        var label = basicLabelForColor(c);
        if (label != undefined)
            return label;

        throw Error('Could not get name of ' + c + '.');

    };


    /**
     * Sorts based on Color name,
     * derived using getColorName().
     * @param {Color|Spot|Swatch} a - and Illustrator Color.
     * @param {Color|Spot|Swatch} b - and Illustrator Color.
     * @returns {Number}
     */
    function basicSorter(a, b) {

        var nameA = ColorChips.getColorName(a),
            nameB = ColorChips.getColorName(b);

        if (nameA < nameB)
            return -1;

        if (nameA > nameB)
            return 1;

        return 0;

    };

    //  end ColorChips.js library file:

    return ColorChips;

}