/// <reference path="gameTypes.ts" />
var commonExtensions = (function () {
    function commonExtensions() {
    }
    commonExtensions.sum = function (items, callback) {
        var result = 0;
        items.forEach(function (item) {
            return result += callback(item);
        });
        return result;
    };

    commonExtensions.firstOrDefault = function (items, callback) {
        for (var index = 0; index < items.length; index++) {
            var item = items[index];
            if (callback(item))
                return item;
        }

        return null;
    };

    commonExtensions.getItems = function (items, startIndex, length) {
        var result = new Array();
        for (var index = startIndex; index < (startIndex + length); index++)
            result.push(items[index]);

        return result;
    };

    commonExtensions.select = function (items, getResult) {
        var results = new Array();
        items.forEach(function (item) {
            return results.push(getResult(item));
        });
        return results;
    };

    commonExtensions.opposite = function (currentDirection) {
        switch (currentDirection) {
            case 0 /* left */:
                return 1 /* right */;
            case 1 /* right */:
                return 0 /* left */;
            case 2 /* up */:
                return 3 /* down */;
            case 3 /* down */:
                return 2 /* up */;
            default:
                return 2 /* up */;
        }
    };
    return commonExtensions;
})();
//# sourceMappingURL=common.js.map
