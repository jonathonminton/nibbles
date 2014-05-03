var gamePoint = (function () {
    function gamePoint(x, y) {
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
    gamePoint.prototype.move = function (x, y) {
        this.x += x;
        this.y += y;
    };

    gamePoint.prototype.moveByDirection = function (moveDirection, length) {
        switch (moveDirection) {
            case 2 /* up */:
                this.y -= length;
                break;

            case 3 /* down */:
                this.y += length;
                break;

            case 0 /* left */:
                this.x -= length;
                break;

            case 1 /* right */:
                this.x += length;
                break;
        }
    };

    gamePoint.prototype.copy = function () {
        return new gamePoint(this.x, this.y);
    };

    gamePoint.prototype.equals = function (compare) {
        return this.x === compare.x && this.y === compare.y;
    };
    return gamePoint;
})();

var gameSize = (function () {
    function gameSize(width, height) {
        this.width = 0;
        this.height = 0;
        this.width = width;
        this.height = height;
    }
    gameSize.prototype.copy = function () {
        return new gameSize(this.width, this.height);
    };

    gameSize.prototype.equals = function (compare) {
        return this.width === compare.width && this.height === compare.height;
    };
    return gameSize;
})();

var gameRectangle = (function () {
    function gameRectangle() {
        this.location = new gamePoint(0, 0);
        this.size = new gameSize(0, 0);
    }
    Object.defineProperty(gameRectangle.prototype, "left", {
        get: function () {
            return this.location.x;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(gameRectangle.prototype, "top", {
        get: function () {
            return this.location.y;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(gameRectangle.prototype, "right", {
        get: function () {
            return this.location.x + this.size.width;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(gameRectangle.prototype, "bottom", {
        get: function () {
            return this.location.y + this.size.height;
        },
        enumerable: true,
        configurable: true
    });

    gameRectangle.prototype.copy = function () {
        var result = new gameRectangle();
        result.location = this.location.copy();
        result.size = this.size.copy();
        return result;
    };

    gameRectangle.prototype.getPoints = function () {
        var items = new Array();
        items.push(new gamePoint(this.left, this.top));
        items.push(new gamePoint(this.left, this.bottom));
        items.push(new gamePoint(this.right, this.top));
        items.push(new gamePoint(this.right, this.bottom));
        return items;
    };

    gameRectangle.prototype.intersects = function (rectangle) {
        var _this = this;
        if (commonExtensions.firstOrDefault(rectangle.getPoints(), function (point) {
            return _this.contains(point);
        }))
            return true;

        if (commonExtensions.firstOrDefault(this.getPoints(), function (point) {
            return rectangle.contains(point);
        }))
            return true;

        // todo: figure out the + shape (no corners are contained)
        return false;
    };

    gameRectangle.prototype.contains = function (point) {
        return point.x >= this.location.x && point.x <= (this.location.x + this.size.width) && point.y >= this.location.y && point.y <= (this.location.y + this.size.height);
    };
    return gameRectangle;
})();

var gameLine = (function () {
    function gameLine() {
        this.start = new gamePoint(0, 0);
        this.end = new gamePoint(0, 0);
    }
    Object.defineProperty(gameLine.prototype, "length", {
        get: function () {
            return Math.abs(this.start.x === this.end.x ? this.start.y - this.end.y : this.start.x - this.end.x);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(gameLine.prototype, "yDiff", {
        get: function () {
            return this.end.y - this.start.y;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(gameLine.prototype, "xDiff", {
        get: function () {
            return this.end.x - this.start.x;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(gameLine.prototype, "angle", {
        get: function () {
            return Math.atan2(this.yDiff, this.xDiff);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(gameLine.prototype, "slope", {
        get: function () {
            var d = this.xDiff;
            if (d == 0)
                return 0;

            return this.yDiff / d;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(gameLine.prototype, "slopeIntercept", {
        get: function () {
            return this.start.y - (this.start.x * this.slope);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(gameLine.prototype, "isVertical", {
        get: function () {
            return this.slope === 0 && this.start.x === this.end.x;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(gameLine.prototype, "isHorizontal", {
        get: function () {
            return this.slope === 0 && this.start.y === this.end.y;
        },
        enumerable: true,
        configurable: true
    });

    gameLine.prototype.getIntersectionPoint = function (line) {
        var slope = this.slope;
        if (line.isVertical && this.isVertical)
            return null;

        if (line.isHorizontal && this.isHorizontal)
            return null;

        if (line.isVertical)
            return new gamePoint(line.start.x, (this.slope * line.start.x) + this.slopeIntercept);

        if (this.isVertical)
            return new gamePoint(this.start.x, (line.slope * this.start.x) + line.slopeIntercept);

        var slopeIntercept = this.slopeIntercept;
        var x = (line.slopeIntercept - slopeIntercept) / (slope - line.slope);
        return new gamePoint(x, (slope * x) + slopeIntercept);
    };

    gameLine.prototype.containsPoint = function (point) {
        return this.IsNumberBetween(point.x, this.start.x, this.end.x) && this.IsNumberBetween(point.y, this.start.y, this.end.y);
    };

    gameLine.prototype.crosses = function (line) {
        var interSectionPoint = this.getIntersectionPoint(line);
        if (!interSectionPoint)
            return false;

        return this.containsPoint(interSectionPoint) && line.containsPoint(interSectionPoint);
    };

    gameLine.prototype.IsNumberBetween = function (value, start, end) {
        return (value <= start && value >= end) || (value <= end && value >= start);
    };

    gameLine.prototype.progress = function (length) {
        this.progressPoint(this.end, length);
    };

    gameLine.prototype.trimStart = function (length) {
        this.progressPoint(this.start, length);
    };

    gameLine.prototype.lengthenStart = function (length) {
        this.progressPoint(this.start, -length);
    };

    gameLine.prototype.progressPoint = function (point, length) {
        var angle = this.angle;
        point.move(length * Math.cos(angle), length * Math.sin(angle));
    };

    gameLine.prototype.copy = function () {
        var line = new gameLine();
        line.start = this.start.copy();
        line.end = this.end.copy();
        return line;
    };
    return gameLine;
})();

var direction;
(function (direction) {
    direction[direction["left"] = 0] = "left";
    direction[direction["right"] = 1] = "right";
    direction[direction["up"] = 2] = "up";
    direction[direction["down"] = 3] = "down";
})(direction || (direction = {}));
//# sourceMappingURL=gametypes.js.map
