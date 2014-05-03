/// <reference path="common.ts" />
/// <reference path="gameSettings.ts" />
/// <reference path="gameTypes.ts" />
/// <reference path="nibbles.ts" />
var gameRenderer = (function () {
    function gameRenderer(canvas) {
        this.canvas = canvas;
        this.canvas.width = gameSettings.canvasSize.width;
        this.canvas.height = gameSettings.canvasSize.height;
        this.clearAll();
    }
    Object.defineProperty(gameRenderer.prototype, "canvasContext", {
        get: function () {
            return this.canvas.getContext("2d");
        },
        enumerable: true,
        configurable: true
    });

    gameRenderer.prototype.show = function () {
        this.canvas.style.visibility = "visible";
    };

    gameRenderer.prototype.hide = function () {
        this.canvas.style.visibility = "collapsed";
    };

    gameRenderer.prototype.clearNibbles = function (player) {
        this.drawNibblesForColor(player, "blue");
    };

    gameRenderer.prototype.drawNibbles = function (player) {
        this.drawNibblesForColor(player, "yellow");
    };

    gameRenderer.prototype.drawNibblesForColor = function (player, color) {
        for (var index = 0; index < player.segments.length; index++) {
            var segment = player.segments[index];
            var line = segment.copy();
            if (index > 0) {
                line.lengthenStart(gameSettings.nibblesWidth);
            }

            this.drawLine(line, color, gameSettings.nibblesWidth);
        }
    };

    gameRenderer.prototype.drawLines = function (lines, color, width) {
        var _this = this;
        lines.forEach(function (line) {
            return _this.drawLine(line, color, width);
        });
    };

    gameRenderer.prototype.drawLine = function (line, color, width) {
        this.canvasContext.beginPath();
        this.canvasContext.lineWidth = width;
        this.canvasContext.strokeStyle = color;
        this.canvasContext.moveTo(line.start.x, line.start.y);
        this.canvasContext.lineTo(line.end.x, line.end.y);
        this.canvasContext.stroke();
    };

    gameRenderer.prototype.clearAll = function () {
        this.clear(0, 0, this.canvas.width, this.canvas.height);
    };

    gameRenderer.prototype.clear = function (x, y, width, height) {
        this.canvasContext.fillStyle = "blue";
        this.canvasContext.fillRect(x, y, width, height);
    };

    gameRenderer.prototype.clearRect = function (rect) {
        this.clear(rect.location.x, rect.location.y, rect.size.width, rect.size.height);
    };

    gameRenderer.prototype.clearRectangles = function (rectangles) {
        var _this = this;
        rectangles.forEach(function (rect) {
            return _this.clearRect(rect);
        });
    };

    gameRenderer.prototype.drawText = function (text, color, font) {
        this.canvasContext.font = font;
        this.canvasContext.fillStyle = color;
        this.canvasContext.lineWidth = 1;
        var width = this.canvasContext.measureText(text).width;
        var left = (this.canvas.width / 2) - (width / 2);
        this.canvasContext.fillText(text, left, 100);
    };
    return gameRenderer;
})();

var game = (function () {
    function game() {
        var _this = this;
        this.started = false;
        this.paused = false;
        this.livesRemaining = 2;
        this.walls = new Array();
        this.timer_Elapsed = function () {
            _this.movePlayer();
        };
    }
    Object.defineProperty(game.prototype, "nibblesStartPoint", {
        get: function () {
            return new gamePoint(gameSettings.canvasSize.width / 2, gameSettings.canvasSize.height / 2);
        },
        enumerable: true,
        configurable: true
    });

    game.prototype.start = function () {
        var _this = this;
        if (this.started)
            return;

        this.loadWalls();
        this.livesRemaining = 2;
        this.started = true;
        this.paused = false;
        this.player = new nibbles(this.nibblesStartPoint);
        this.timerHandle = setInterval(this.timer_Elapsed, gameSettings.gameInterval);
        if (!this.renderer) {
            var canvas = document.getElementById("gameCanvas");
            this.renderer = new gameRenderer(canvas);
            document.onkeydown = function (e) {
                return _this.onKeyDown(e);
            };
        }

        this.renderer.clearAll();
        this.renderer.show();
        this.drawWalls();
    };

    game.prototype.stop = function () {
        this.started = false;
        this.paused = false;
        clearInterval(this.timerHandle);
        this.renderer.clearAll();
        this.renderer.hide();
    };

    game.prototype.pause = function () {
        this.paused = true;
        clearInterval(this.timerHandle);
        this.renderer.drawText("Do you wish to quit? y/n", "white", "2em Verdana");
    };

    game.prototype.resume = function () {
        this.renderer.clearAll();
        this.drawWalls();
        this.paused = false;
        this.timerHandle = setInterval(this.timer_Elapsed, gameSettings.gameInterval);
    };

    game.prototype.die = function () {
        if (this.livesRemaining === 0) {
            this.stop();
            this.renderer.drawText("Game Over", "white", "2em Verdana");
            return;
        }

        this.livesRemaining--;
        this.resetPlayer();
    };

    game.prototype.loadWalls = function () {
        this.walls.length = 0;
        this.addBorders();
    };

    game.prototype.drawWalls = function () {
        this.renderer.drawLines(this.walls, "red", gameSettings.wallWidth);
    };

    game.prototype.addBorders = function () {
        var rect = new gameRectangle();
        rect.size = gameSettings.canvasSize.copy();
        var line = new gameLine();
        var halfWidth = gameSettings.wallWidth / 2;
        line.start.move(0, halfWidth);
        line.end.y = halfWidth;
        line.end.x = rect.right;
        this.walls.push(line.copy());
        line.start = line.end.copy();
        line.start.move(-halfWidth, -halfWidth);
        line.end.x = rect.right - halfWidth;
        line.end.y = rect.bottom;
        this.walls.push(line.copy());
        line.start = line.end.copy();
        line.start.move(-halfWidth, -halfWidth);
        line.end.x = 0;
        line.end.y = rect.bottom - halfWidth;
        this.walls.push(line.copy());
        line.start = line.end.copy();
        line.start.move(halfWidth, halfWidth);
        line.end.y = 0;
        line.end.x = halfWidth;
        this.walls.push(line.copy());
    };

    game.prototype.onKeyDown = function (e) {
        if (!this.started)
            return true;

        switch (e.keyCode) {
            case 78:
                // n
                if (this.paused) {
                    this.resume();
                    return false;
                }

                break;
            case 89:
                // y
                if (this.paused) {
                    this.stop();
                    return false;
                }

                break;
            case 27:
                // esc
                this.pause();
                return false;
            case 37:
                // left
                if (this.paused)
                    return true;

                this.player.changeDirection(0 /* left */);
                return false;
            case 38:
                // up
                if (this.paused)
                    return true;

                this.player.changeDirection(2 /* up */);
                return false;

            case 39:
                // right
                if (this.paused)
                    return true;

                this.player.changeDirection(1 /* right */);
                return false;

            case 40:
                // down
                if (this.paused)
                    return true;

                this.player.changeDirection(3 /* down */);
                return false;
        }

        return true;
    };

    game.prototype.hasCrossedWalls = function () {
        var _this = this;
        return this.walls.some(function (wall, wallIndex, wallLines) {
            return _this.player.segments.some(function (segmentLine, segmentIndex, segmentLines) {
                return segmentLine.crosses(wall);
            });
        });
    };

    game.prototype.movePlayer = function () {
        this.renderer.clearNibbles(this.player);
        this.player.move(gameSettings.nibblesSpeed);
        if (this.player.hasCrossedItself() || this.hasCrossedWalls()) {
            this.die();
            return;
        }

        this.renderer.drawNibbles(this.player);
    };

    game.prototype.resetPlayer = function () {
        this.pause();
        this.player.resetPoint(this.nibblesStartPoint);
        this.resume();
    };
    game.instance = new game();
    return game;
})();
//# sourceMappingURL=game.js.map
