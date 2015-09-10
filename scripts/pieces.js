/************************ Pieces.js
 * Will be used to hold the pieces prototype.
 * pP - pawn
 * bB - bishop
 * rR - rook
 * nN - knight
 * qQ - queen
 * kK - king
 * This will be the first file to load, thus all constants here are usable in other files.
 ****************/

var WHITE = 'w';
var BLACK = 'b';

var PAWN = 'P';
var KNIGHT = 'N';
var KING = 'K';
var BISHOP = 'B';
var ROOK = 'R';
var QUEEN = 'Q';

var WHITE_KING_START = new Square(5,1);
var BLACK_KING_START = new Square(5,8);

var WHITE_ROOK_STARTS = [new Square(1,1), new Square(8,1)]; // NOTE THAT ROOK CLASS WILL BREAK IF THESE ARE NOT OF THE SAME LENGTH
var BLACK_ROOK_STARTS = [new Square(8,1), new Square(8,8)]; // oopsy.

/********* Piece class
 * The parent class of all piece types.
 * @param square square of the piece.
 * @param color color of the piece, should be either 'white' or 'black'.
 * @constructor
 */
function Piece(square, color) {
    this.square = square;
    this.color = color;
//  console.log(this.constructor.name+" created at "+ this.square + " for " + this.color);
}

/**
 * Returns the path the piece needs in order to get to the given square, if it's not a capture.
 * Returns null if the piece can't reach the square in one move.
 * @param to target square.
 */

Piece.prototype.get_path = function(to) {
    return null;
};

/**
 * Returns the path the piece needs in order to capture in the given square.
 * Returns null if the piece can't reach the square in one move.
 * Implement this if the piece captures in a different way then moving (i.e. a pawn);
 * @param to target square.
 */

Piece.prototype.get_capture_path = function(to) {
    return this.get_path(to);
};

/**
 * Compares the square of the piece with given square
 * @returns {boolean} if the piece is at the given square.
 */

Piece.prototype.isAt= function(square) {
  return (this.square.equals(square));
};

/******* Pawn class
 * Holds the movement of the pawn, refer to Piece for explanations.
 * @type {Piece}
 */
Pawn.prototype = Object.create(Piece.prototype);
Pawn.prototype.constructor = Pawn;
function Pawn(square, color) {
    Piece.call(this, square, color);
    this.startPosition = (color === WHITE? 2 : 7);
    this.direction = (color === WHITE? 1 : -1);

    this.type = PAWN;
}

Pawn.prototype.get_path = function(to) {
    if (this.square.file != to.file) {
        // if we are moving to a different file, illegal move.
        return null;
    }
        // first check if we are moving one squares forward
        if (to.rank === this.square.rank + 1*this.direction) {
            return [this.square.getSquareAtOffset(0, 1*this.direction)];
        }
        // otherwise if it's the first move
        else if (this.square.rank === this.startPosition) {
            // and we are moving twice
            if (to.rank === this.square.rank + 2*this.direction) {
                return [this.square.getSquareAtOffset(0, 1*this.direction),
                    this.square.getSquareAtOffset(0, 2*this.direction)];
            }
        }
        // if all else fails return null
        return null;
};


Pawn.prototype.get_capture_path = function(to) {
    if (Math.abs(this.square.file - to.file) != 1) {
        // if we are not moving exactly one file, illegal move.
        return null;
    }
    // if we are moving exactly one square in the correct direction vertically, the capture is ok.
    if (to.rank === this.square.rank + 1*this.direction) {
        return [to];
    }
    // if all else fails return null
    return null;
};

/******* Knight class
 * Holds the movement of the Knight, refer to Piece for explanations.
 * @type {Piece}
 */
Knight.prototype = Object.create(Piece.prototype);
Knight.prototype.constructor = Knight;
function Knight(square, color) {
    Piece.call(this, square, color);

    this.type = KNIGHT;
}

Knight.prototype.get_path = function(to) {
    var h_movement = Math.abs(this.square.file - to.file);
    var v_movement = Math.abs(this.square.rank - to.rank);

    if ((h_movement === 2 && v_movement === 1) || (h_movement === 1 && v_movement === 2)) {
        return [to];
    }
    return null;
};

/******* King class
 * Holds the movement of the King, refer to Piece for explanations.
 * @type {Piece}
 */
King.prototype = Object.create(Piece.prototype);
King.prototype.constructor = King;
function King(square, color, has_moved) {
    Piece.call(this, square, color);

    this.type = KING;

    // checks if a special has_moved parameter was given, otherwise set it by starting square.
    this.has_moved = has_moved?
            true : (!square.equals(WHITE_KING_START) && !square.equals(BLACK_KING_START));
}

King.prototype.get_path = function(to) {
    var h_movement = Math.abs(this.square.file - to.file);
    var v_movement = Math.abs(this.square.rank - to.rank);

    if (h_movement > 1 || v_movement > 1) {
        // if we try to move more then one square in any direction, it's invalid
        return null;
    }

    if (h_movement || v_movement) {
        // otherwise if we are moving at all, it's valid
        return [to];
    }

    return null;
};

/******* Bishop class
 * Holds the movement of the Bishop, refer to Piece for explanations.
 * @type {Piece}
 */
Bishop.prototype = Object.create(Piece.prototype);
Bishop.prototype.constructor = Bishop;
function Bishop(square, color) {
    Piece.call(this, square, color);

    this.type = BISHOP;
}

Bishop.prototype.get_path = function(to) {
    // Only one diagonal going up (from left to right) will get each value, and the value doesn't change across the diagonal.
    var this_main_diag = this.square.file - this.square.rank;
    var to_main_diag = to.file - to.rank;

    // Only one diagonal going down will get each value, and the value again stays the same across the diagonal.
    var this_sub_diag = this.square.file + this.square.rank;
    var to_sub_diag = to.file + to.rank;

    var file_distance = this.square.file - to.file;

    // if we are not moving.
    if (!file_distance) return null;

    var path = [];
    if (this_main_diag === to_main_diag) {
        // On the main diagonal we are going up as we go right (and down as we go left).
        if (file_distance > 0) {
            // this means we are to the right of the target.
            for (var i = 1; i <= file_distance; i++) {
                path.push(this.square.getSquareAtOffset(-i, -i));
            }

            return path;
        } else { // otherwise we are left of the target.
            for (i = 1; i <= -file_distance; i++) {
                path.push(this.square.getSquareAtOffset(i, i));
            }

            return path;
        }
    }
    else if (this_sub_diag === to_sub_diag) {
        // On the secondary diagonal we are going down as we go right (and up as we go left).
        if (file_distance > 0) {
            // this means we are to the right of the target.
            for (i = 1; i <= file_distance; i++) {
                path.push(this.square.getSquareAtOffset(-i, i));
            }

            return path;
        } else { // otherwise we are left of the target.
            for (i = 1; i <= -file_distance; i++) {
                path.push(this.square.getSquareAtOffset(i, -i));
            }

            return path;
        }
    }

    return null;
};

/******* Rook class
 * Holds the movement of the Rook, refer to Piece for explanations.
 * @type {Piece}
 */
Rook.prototype = Object.create(Piece.prototype);
Rook.prototype.constructor = Rook;
function Rook(square, color, has_moved) {
    Piece.call(this, square, color);

    // checks if a special has_moved parameter was given, otherwise set it by starting square.
    if (has_moved) {
        this.has_moved = has_moved;
    } else {
        var starting_match = false;
        for (var i = 0; i < WHITE_ROOK_STARTS; i++) {
            if (square.equals(WHITE_ROOK_STARTS[i])) {
                starting_match = true;
                break;
            } else if (square.equals(BLACK_ROOK_STARTS[i])) {
                starting_math = true;
                break;
            }
        }
    }
    this.type = ROOK;
}

Rook.prototype.get_path = function(to) {
    // Easier than the bishop as we don't need the diagonal tricks, otherwise pretty similar
    var v_movement = this.square.rank - to.rank;
    var h_movement = this.square.file - to.file;

    // XOR to make sure we move either horizontally or vertically, but not both.
    if (!((v_movement? 1 : 0) ^ (h_movement? 1 : 0))) {
        return null;
    }

    var path = [];
    if (h_movement > 0) {
        // moving left
        for (var i=1; i <= h_movement; i++) {
            path.push(this.square.getSquareAtOffset(-i, 0));
        }
    } else if (h_movement < 0) {
        // moving right
        for (i=1; i <= -h_movement; i++) {
            path.push(this.square.getSquareAtOffset(i, 0));
        }
    } else if (v_movement > 0) {
        // moving down
        for (i = 1; i <= v_movement; i++) {
            path.push(this.square.getSquareAtOffset(0, -i));
        }
    } else {
        // as we are guaranteed to have moved in a direction, it must be up.
        for (i = 1 ; i <= -v_movement; i++) {
            path.push(this.square.getSquareAtOffset(0, i));
        }
    }

    return path;
};

/******* Queen class
 * Holds the movement of the Queen, refer to Piece for explanations.
 * @type {Piece}
 */
Queen.prototype = Object.create(Piece.prototype);
Queen.prototype.constructor = Queen;
function Queen(position, color) {
    Piece.call(this, position, color);

    this.type = QUEEN;
}

Queen.prototype.get_path = function(to) {
    // we will just reuse our effort from the rook and bishop.
    var rook_path = Rook.prototype.get_path.call(this, to);
    return rook_path? rook_path: Bishop.prototype.get_path.call(this,to);

};