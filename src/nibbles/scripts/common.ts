/// <reference path="gameTypes.ts" />

class commonExtensions {
    static sum<T>(items: Array<T>, callback: (a: T) => number): number {
        var result: number = 0;
        items.forEach(item => result += callback(item));
        return result;
    }

    static firstOrDefault<T>(items: Array<T>, callback: (a: T) => boolean): T {
        for (var index: number = 0; index < items.length; index++) {
            var item = items[index];
            if (callback(item))
                return item;
        }

        return null;
    }

    static getItems<T>(items: Array<T>, startIndex: number, length: number): Array<T> {
        var result = new Array<T>();
        for (var index: number = startIndex; index < (startIndex + length); index++)
            result.push(items[index]);

        return result;
    }

    static select<TItem, TResult>(items: Array<TItem>, getResult: (a: TItem) => TResult): Array<TResult> {
        var results = new Array<TResult>();
        items.forEach(item => results.push(getResult(item)));
        return results;
    }

    static opposite(currentDirection: direction): direction {
        switch (currentDirection) {
            case direction.left:
                return direction.right;
            case direction.right:
                return direction.left;
            case direction.up:
                return direction.down;
            case direction.down:
                return direction.up;
            default:
                return direction.up;
        }
    }
}