class gamePoint {
    x: number = 0;
    y: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    move(x: number, y: number) {
        this.x += x;
        this.y += y;
    }

    moveByDirection(moveDirection: direction, length: number) {
        switch (moveDirection) {
            case direction.up:
                this.y -= length;
                break;

            case direction.down:
                this.y += length;
                break;

            case direction.left:
                this.x -= length;
                break;
            
            case direction.right:
                this.x += length;
                break;
        }
    }

    copy(): gamePoint {
        return new gamePoint(this.x, this.y);
    }

    equals(compare: gamePoint): boolean {
        return this.x === compare.x &&
            this.y === compare.y;
    }
}

class gameSize {
    width: number = 0;
    height: number = 0;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    copy(): gameSize{
        return new gameSize(this.width, this.height);
    }

    equals(compare: gameSize): boolean {
        return this.width === compare.width &&
            this.height === compare.height;
    }
}

class gameRectangle {
    location: gamePoint = new gamePoint(0, 0);
    size: gameSize = new gameSize(0, 0);

    get left() {
        return this.location.x;
    }

    get top() {
        return this.location.y;
    }

    get right() {
        return this.location.x + this.size.width;
    }

    get bottom() {
        return this.location.y + this.size.height;
    }

    copy(): gameRectangle {
        var result = new gameRectangle();
        result.location = this.location.copy();
        result.size = this.size.copy();
        return result;
    }

    getPoints(): Array<gamePoint> {
        var items = new Array<gamePoint>();
        items.push(new gamePoint(this.left, this.top));
        items.push(new gamePoint(this.left, this.bottom));
        items.push(new gamePoint(this.right, this.top));
        items.push(new gamePoint(this.right, this.bottom));
        return items;
    }

    intersects(rectangle: gameRectangle): boolean {
        if (commonExtensions.firstOrDefault(rectangle.getPoints(), point => this.contains(point)))
            return true;

        if (commonExtensions.firstOrDefault(this.getPoints(), point => rectangle.contains(point)))
            return true;

        // todo: figure out the + shape (no corners are contained)
        return false;
    }

    contains(point: gamePoint): boolean {
        return point.x >= this.location.x &&
            point.x <= (this.location.x + this.size.width) &&
            point.y >= this.location.y &&
            point.y <= (this.location.y + this.size.height);
    }
}

class gameLine {
    start: gamePoint = new gamePoint(0, 0);
    end: gamePoint = new gamePoint(0, 0);

    get length(): number {
        return Math.abs(
            this.start.x === this.end.x ?
            this.start.y - this.end.y :
            this.start.x - this.end.x);
    }

    get yDiff(): number {
        return this.end.y - this.start.y;
    }

    get xDiff(): number {
        return this.end.x - this.start.x;
    }

    get angle(): number {
        return Math.atan2(this.yDiff, this.xDiff);
    }

    get slope(): number {
        var d = this.xDiff;
        if (d == 0) return 0;

        return this.yDiff / d;
    }

    get slopeIntercept(): number {
        return this.start.y - (this.start.x * this.slope);
    }

    get isVertical(): boolean {
        return this.slope === 0 && this.start.x === this.end.x;
    }

    get isHorizontal(): boolean {
        return this.slope === 0 && this.start.y === this.end.y;
    }

    getIntersectionPoint(line: gameLine): gamePoint {
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
        return new gamePoint(
            x,
            (slope * x) + slopeIntercept);
    }

    containsPoint(point: gamePoint): boolean {
        return this.IsNumberBetween(point.x, this.start.x, this.end.x) &&
            this.IsNumberBetween(point.y, this.start.y, this.end.y);
    }

    crosses(line: gameLine): boolean {
        var interSectionPoint = this.getIntersectionPoint(line);
        if (!interSectionPoint)
            return false;

        return this.containsPoint(interSectionPoint) &&
            line.containsPoint(interSectionPoint);
    }

    IsNumberBetween(value: number, start: number, end: number) {
        return (value <= start && value >= end) ||
            (value <= end && value >= start);
    }

    progress(length: number) {
        this.progressPoint(this.end, length);
    }

    trimStart(length: number) {
        this.progressPoint(this.start, length);
    }

    lengthenStart(length: number) {
        this.progressPoint(this.start, -length);
    }

    progressPoint(point: gamePoint, length: number) {
        var angle = this.angle;
        point.move(length * Math.cos(angle), length * Math.sin(angle));
    }

    copy(): gameLine {
        var line = new gameLine();
        line.start = this.start.copy();
        line.end = this.end.copy();
        return line;
    }
}

enum direction {
    left,
    right,
    up,
    down
}
