var nibbles = (function () {
    function nibbles(location) {
        this.nibblesLength = 150;
        this.currentDirection = 2 /* up */;
        this.resetPoint(location);
    }
    nibbles.prototype.resetPoint = function (location) {
        this.segments = new Array();
        var segment = new gameLine();
        segment.start = location.copy();
        segment.end = location.copy();
        segment.end.moveByDirection(this.currentDirection, 1);
        this.segments.push(segment);
        this.move(gameSettings.nibblesWidth);
    };

    nibbles.prototype.getCurrentSegment = function () {
        return this.segments[this.segments.length - 1];
    };

    nibbles.prototype.hasCrossedItself = function () {
        if (this.segments.length < 3)
            return false;

        var lines = new Array();
        for (var index = 0; index < (this.segments.length - 1); index++)
            lines.push(this.segments[index]);

        return this.hasCrossedLocations(lines);
    };

    nibbles.prototype.hasCrossedLocations = function (lines) {
        var currentSegment = this.getCurrentSegment();
        for (var index = 0; index < lines.length; index++) {
            if (currentSegment.crosses(lines[index]))
                return true;
        }

        return false;
    };

    nibbles.prototype.move = function (length) {
        var currentSegment = this.getCurrentSegment();
        currentSegment.progress(gameSettings.nibblesSpeed);

        var excess = commonExtensions.sum(this.segments, function (segment) {
            return segment.length;
        }) - this.nibblesLength;
        while (excess > 0) {
            var firstSegment = this.segments[0];
            if (firstSegment.length < excess)
                this.segments.shift();
            else
                firstSegment.trimStart(excess);

            excess = commonExtensions.sum(this.segments, function (segment) {
                return segment.length;
            }) - this.nibblesLength;
        }
    };

    nibbles.prototype.changeDirection = function (newDirection) {
        if (newDirection === this.currentDirection || newDirection === commonExtensions.opposite(this.currentDirection))
            return;

        var currentSegment = this.segments[this.segments.length - 1];
        var halfWidth = gameSettings.nibblesWidth / 2;
        var segment = new gameLine();
        switch (this.currentDirection) {
            case 2 /* up */:
                segment.start.y = currentSegment.end.y - halfWidth;
                break;
            case 3 /* down */:
                segment.start.y = currentSegment.end.y + halfWidth;
                break;
            case 0 /* left */:
                segment.start.x = currentSegment.end.x - halfWidth;
                break;
            case 1 /* right */:
                segment.start.x = currentSegment.end.x + halfWidth;
                break;
        }

        switch (newDirection) {
            case 2 /* up */:
                segment.start.y = currentSegment.end.y - halfWidth;
                break;
            case 3 /* down */:
                segment.start.y = currentSegment.end.y + halfWidth;
                break;
            case 0 /* left */:
                segment.start.x = currentSegment.end.x - halfWidth;
                break;
            case 1 /* right */:
                segment.start.x = currentSegment.end.x + halfWidth;
                break;
        }

        this.currentDirection = newDirection;
        segment.end = segment.start.copy();
        segment.end.moveByDirection(newDirection, 1);
        this.currentDirection = newDirection;
        this.segments.push(segment);
    };
    return nibbles;
})();
//# sourceMappingURL=nibbles.js.map
