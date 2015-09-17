/**
 */

/******* Square class
 * square object to encapsulate all these ugly arrays.
 * @param file file of the new square.
 * @param rank rank of the new square.
 */
 function Square(file, rank) {
    this.file = file;
    this.rank = rank;

    /**
     * Checks if two squares have the same file and rank.
     * @param other another square
     * @returns {boolean} true if both squares are of the same position on the board.
     */
    this.equals = function (other) {
        return (this.file === other.file && this.rank === other.rank);
    };

    /**
     * Returns a string version of the square, formatted as "file rank".
     * @returns {string} string version of the square.
     */
    this.toString = function () {
        return String(file) + ' ' + String(rank);
    };


    /**
     * returns a new square with the given file and rank added to this square's file and rank.
     * @param file file to move the square
     * @param rank rank to move the square
     * @returns {Square}
     */
    this.getSquareAtOffset = function (file, rank) {
        file = Number(file) ? file : 0;
        rank = Number(rank) ? rank : 0;
        return new Square(this.file + file, this.rank + rank);
    };
}

function getSquareFromJson(json) {
return new Square(json.file, json.rank);
}

/******* Move object
 * Move object to encapsulate a single game move.
 * Might be a bit of an overkill, but I prefer an array of moves over an array of arrays of squares.
 * @param from A square to move from.
 * @param to A square to move to.
 */
function Move(from, to) {
    this.from = from;
    this.to = to;
}

function getMoveFromJson(move_json) {
    return new Move(getSquareFromJson(move_json.from), getSquareFromJson(move_json.to));
}
/******* SpecialMove object
 * Move object to encapsulate a single game move.
 * Might be a bit of an overkill, but I prefer an array of moves over an array of arrays of squares.
 * @param moves array of moves to make
 * @param removes array of squares to remove pieces from
 * @param insertions array of triplets, square to insert, wanted piece type, and piece color.
 */
function SpecialMove(moves, removes, insertions) {
    this.moves = moves ? moves : [];
    this.removes = removes ? removes : [];
    this.insertions = insertions ? insertions : [];
}

exports.Move = Move;
exports.Square = Square;
exports.SpecialMove = SpecialMove;
exports.getMoveFromJson = getMoveFromJson;
