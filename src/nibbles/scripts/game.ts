/// <reference path="common.ts" />
/// <reference path="gameSettings.ts" />
/// <reference path="gameTypes.ts" />
/// <reference path="nibbles.ts" />

class gameRenderer {
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvas.width = gameSettings.canvasSize.width;
        this.canvas.height = gameSettings.canvasSize.height;
        this.clearAll();
    }

    get canvasContext(): CanvasRenderingContext2D {
        return this.canvas.getContext("2d");
    }

    show() {
        this.canvas.style.visibility = "visible";
    }

    hide() {
        this.canvas.style.visibility = "collapsed";
    }

    clearNibbles(player: nibbles) {
        this.drawNibblesForColor(player, "blue");
    }

    drawNibbles(player: nibbles) {
        this.drawNibblesForColor(player, "yellow");
    }

    drawNibblesForColor(player: nibbles, color: string) {
        for (var index: number = 0; index < player.segments.length; index++) {
            var segment = player.segments[index];
            var line = segment.copy();
            if (index > 0) {
                line.lengthenStart(gameSettings.nibblesWidth);
            }

            this.drawLine(line, color, gameSettings.nibblesWidth);
        }
    }

    drawLines(lines: Array<gameLine>, color: string, width: number) {
        lines.forEach(line => this.drawLine(line, color, width));
    }

    drawLine(line: gameLine, color: string, width: number) {
        this.canvasContext.beginPath();
        this.canvasContext.lineWidth = width;
        this.canvasContext.strokeStyle = color;
        this.canvasContext.moveTo(line.start.x, line.start.y);
        this.canvasContext.lineTo(line.end.x, line.end.y);
        this.canvasContext.stroke();
    }

    clearAll() {
        this.clear(0, 0, this.canvas.width, this.canvas.height);
    }

    clear(x: number, y: number, width: number, height: number) {
        this.canvasContext.fillStyle = "blue";
        this.canvasContext.fillRect(x, y, width, height); 
    }

    clearRect(rect: gameRectangle) {
        this.clear(rect.location.x, rect.location.y, rect.size.width, rect.size.height);
    }

    clearRectangles(rectangles: Array<gameRectangle>) {
        rectangles.forEach(rect => this.clearRect(rect));
    }

    drawText(text: string, color: string, font: string) {
        this.canvasContext.font = font;
        this.canvasContext.fillStyle = color;
        this.canvasContext.lineWidth = 1;
        var width = this.canvasContext.measureText(text).width;
        var left = (this.canvas.width / 2) - (width / 2);
        this.canvasContext.fillText(text, left, 100);
    }
}

class game {
    player: nibbles;
    timerHandle: number;
    started: boolean = false;
    paused: boolean = false;
    renderer: gameRenderer;
    livesRemaining: number = 2;
    walls: Array<gameLine> = new Array<gameLine>();
    static instance: game = new game();

    get nibblesStartPoint(): gamePoint {
        return new gamePoint(gameSettings.canvasSize.width / 2, gameSettings.canvasSize.height / 2);
    }

    start() {
        if (this.started)
            return;

        this.loadWalls();
        this.livesRemaining = 2;
        this.started = true;
        this.paused = false; 
        this.player = new nibbles(this.nibblesStartPoint);
        this.timerHandle = setInterval(this.timer_Elapsed, gameSettings.gameInterval);
        if (!this.renderer) {
            var canvas = <HTMLCanvasElement>document.getElementById("gameCanvas");
            this.renderer = new gameRenderer(canvas);
            document.onkeydown = (e) => this.onKeyDown(e);
        }

        this.renderer.clearAll();
        this.renderer.show();
        this.drawWalls();
    }

    stop() {
        this.started = false;
        this.paused = false;
        clearInterval(this.timerHandle);
        this.renderer.clearAll();
        this.renderer.hide();
    }

    pause() {
        this.paused = true;
        clearInterval(this.timerHandle);
        this.renderer.drawText("Do you wish to quit? y/n", "white", "2em Verdana");
    }

    resume() {
        this.renderer.clearAll();
        this.drawWalls();
        this.paused = false;
        this.timerHandle = setInterval(this.timer_Elapsed, gameSettings.gameInterval);
    }

    die() {
        if (this.livesRemaining === 0) {
            this.stop();
            this.renderer.drawText("Game Over", "white", "2em Verdana");
            return;
        }

        this.livesRemaining--;
        this.resetPlayer();
    }

    loadWalls() {
        this.walls.length = 0;
        this.addBorders();
    }

    drawWalls() {
        this.renderer.drawLines(this.walls, "red", gameSettings.wallWidth);
    }

    addBorders() {
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
    }

    onKeyDown(e: KeyboardEvent): boolean {
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
                 
                this.player.changeDirection(direction.left);
                return false;
            case 38:
                // up 
                if (this.paused)
                    return true;

                this.player.changeDirection(direction.up);
                return false;

            case 39:
                // right
                if (this.paused)
                    return true;

                this.player.changeDirection(direction.right);
                return false;

            case 40:
                // down
                if (this.paused)
                    return true;

                this.player.changeDirection(direction.down);
                return false;
        }

        return true;
    }

    hasCrossedWalls(): boolean {
        return this.walls.some((wall, wallIndex, wallLines) =>
            this.player.segments.some((segmentLine, segmentIndex, segmentLines) =>
                segmentLine.crosses(wall)));
    }

    movePlayer() {
        this.renderer.clearNibbles(this.player);
        this.player.move(gameSettings.nibblesSpeed);
        if (this.player.hasCrossedItself() || this.hasCrossedWalls()) {
            this.die();
            return;
        }

        this.renderer.drawNibbles(this.player);
    }

    resetPlayer() {
        this.pause();
        this.player.resetPoint(this.nibblesStartPoint);
        this.resume();
    }

    timer_Elapsed = () => {
        this.movePlayer();
    }
} 