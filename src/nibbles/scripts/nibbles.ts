class nibbles {
    nibblesLength: number = 150;
    segments: Array<gameLine>;
    currentDirection: direction = direction.up;

    constructor(location: gamePoint) {
        this.resetPoint(location);
    }

    resetPoint(location: gamePoint) {
        this.segments = new Array<gameLine>();
        var segment = new gameLine();
        segment.start = location.copy();
        segment.end = location.copy();
        segment.end.moveByDirection(this.currentDirection, 1);
        this.segments.push(segment);
        this.move(gameSettings.nibblesWidth);
    }

    getCurrentSegment(): gameLine {
        return this.segments[this.segments.length - 1];
    }

    hasCrossedItself(): boolean {
        if (this.segments.length < 3)
            return false;

        var lines = new Array<gameLine>();
        for (var index = 0; index < (this.segments.length - 1); index++)
            lines.push(this.segments[index]);

        return this.hasCrossedLocations(lines);
    }

    hasCrossedLocations(lines: Array<gameLine>) {
        var currentSegment = this.getCurrentSegment();
        for (var index: number = 0; index < lines.length; index++) {
            if (currentSegment.crosses(lines[index]))
                return true;
        }

        return false;
    }

    move(length: number) {
        var currentSegment = this.getCurrentSegment();
        currentSegment.progress(gameSettings.nibblesSpeed);

        var excess = commonExtensions.sum(this.segments, (segment) => segment.length) - this.nibblesLength;
        while (excess > 0) {
            var firstSegment = this.segments[0];
            if (firstSegment.length < excess)
                this.segments.shift();
            else
                firstSegment.trimStart(excess);

            excess = commonExtensions.sum(this.segments, (segment) => segment.length) - this.nibblesLength;
        }
    }

    changeDirection(newDirection: direction) {
        if (newDirection === this.currentDirection || newDirection === commonExtensions.opposite(this.currentDirection))
            return;

        var currentSegment = this.segments[this.segments.length - 1];
        var halfWidth = gameSettings.nibblesWidth / 2;
        var segment = new gameLine();
        switch (this.currentDirection) {
            case direction.up:
                segment.start.y = currentSegment.end.y - halfWidth;
                break;
            case direction.down:
                segment.start.y = currentSegment.end.y + halfWidth;
                break;
            case direction.left:
                segment.start.x = currentSegment.end.x - halfWidth;
                break;
            case direction.right:
                segment.start.x = currentSegment.end.x + halfWidth;
                break;
        }

        switch (newDirection) {
            case direction.up:
                segment.start.y = currentSegment.end.y - halfWidth;
                break;
            case direction.down:
                segment.start.y = currentSegment.end.y + halfWidth;
                break;
            case direction.left:
                segment.start.x = currentSegment.end.x - halfWidth;
                break;
            case direction.right:
                segment.start.x = currentSegment.end.x + halfWidth;
                break;
        }

        this.currentDirection = newDirection;
        segment.end = segment.start.copy();
        segment.end.moveByDirection(newDirection, 1);
        this.currentDirection = newDirection;
        this.segments.push(segment);
    }
}
