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

var WHITE_KING_START = [5,1];
var BLACK_KING_START = [5,8];

var WHITE_ROOK_STARTS = [[1,1], [8,1]]; // NOTE THAT ROOK CLASS WILL BREAK IF THESE ARE NOT OF THE SAME LENGTH
var BLACK_ROOK_STARTS = [[1,8], [8,8]]; // oopsy.

/********* Piece class
 * The parent class of all piece types.
 * @param position position of the piece.
 * @param color color of the piece, should be either 'white' or 'black'.
 * @constructor
 */
function Piece(position, color) {
    this.position = position;
    this.color = color;
//  console.log(this.constructor.name+" created at "+ this.position + " for " + this.color);
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
 * Compares the position of the piece with given position
 * @returns {boolean} if the piece is at the given position.
 */

Piece.prototype.isAt= function(position) {
  return (this.position[0] === position[0] && this.position[1] == position[1]);
};

/******* Pawn class
 * Holds the movement of the pawn, refer to Piece for explanations.
 * @type {Piece}
 */
Pawn.prototype = Object.create(Piece.prototype);
Pawn.prototype.constructor = Pawn;
function Pawn(position, color) {
    Piece.call(this, position, color);
    this.startPosition = (color === WHITE? 2 : 7);
    this.direction = (color === WHITE? 1 : -1);

    this.type = PAWN;
}

Pawn.prototype.get_path = function(to) {
    if (this.position[0] != to[0]) {
        // if we are moving to a different file, illegal move.
        return null;
    }
        // first check if we are moving one squares forward
        if (to[1] === this.position[1] + 1*this.direction) {
            return [[this.position[0], this.position[1] + 1*this.direction]];
        }
        // otherwise if it's the first move
        else if (this.position[1] === this.startPosition) {
            // and we are moving twice
            if (to[1] === this.position[1] + 2*this.direction) {
                return [[this.position[0], this.position[1] + 1*this.direction],
                    [this.position[0], this.position[1] + 2*this.direction]];
            }
        }
        // if all else fails return null
        return null;
};


Pawn.prototype.get_capture_path = function(to) {
    if (Math.abs(this.position[0] - to[0]) != 1) {
        // if we are not moving exactly one tile, illegal move.
        return null;
    }
    // if we are moving exactly one square vertically, the capture is ok.
    if (to[1] === this.position[1] + 1*this.direction) {
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
function Knight(position, color) {
    Piece.call(this, position, color);

    this.type = KNIGHT;
}

Knight.prototype.get_path = function(to) {
    var h_movement = Math.abs(this.position[0] - to[0]);
    var v_movement = Math.abs(this.position[1] - to[1]);

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
function King(position, color, has_moved) {
    Piece.call(this, position, color);

    this.type = KING;

    // checks if a special has_moved parameter was given, otherwise set it by starting position.
    this.has_moved = has_moved?
            true : (!isSamePosition(position, WHITE_KING_START) && !isSamePosition(position, BLACK_KING_START));
}

King.prototype.get_path = function(to) {
    var h_movement = Math.abs(this.position[0] - to[0]);
    var v_movement = Math.abs(this.position[1] - to[1]);

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
function Bishop(position, color) {
    Piece.call(this, position, color);

    this.type = BISHOP;
}

Bishop.prototype.get_path = function(to) {
    // Only one diagonal going up (from left to right) will get each value, and the value doesn't change across the diagonal.
    var this_main_diag = this.position[0] - this.position[1];
    var to_main_diag = to[0] - to[1];

    // Only one diagonal going down will get each value, and the value again stays the same across the diagonal.
    var this_sub_diag = this.position[0] + this.position[1];
    var to_sub_diag = to[0] + to[1];

    var path = [];
    if (this_main_diag === to_main_diag) {
        // On the main diagonal we are going up as we go right (and down as we go left).
        if (this.position[0] > to[0]) {
            // this means we are to the right of the target
            dist = this.position[0] - to[0];
            for (var i = 1; i <= dist; i++) {
                path.push([this.position[0] - i, this.position[1] - i]);
            }

            return path;
        } else if (this.position[0] < to[0]) {
            // this means we are to the left of the target, we check this to make sure we are not standing still
            dist = to[0] - this.position[0];
            for (i = 1; i <= dist; i++) {
                path.push([this.position[0] + i, this.position[1] + i]);
            }

            return path;
        }
    }
    else if (this_sub_diag === to_sub_diag) {
        // On the secondary diagonal we are going down as we go right (and up as we go left).
        if (this.position[0] > to[0]) {
            // this means we are to the right of the target
            dist = this.position[0] - to[0];
            for (var i = 1; i <= dist; i++) {
                path.push([this.position[0] - i, this.position[1] + i]);
            }

            return path;
        } else if (this.position[0] < to[0]) {
            // this means we are to the left of the target, we check this to make sure we are not standing still
            dist = to[0] - this.position[0];
            for (i = 1; i <= dist; i++) {
                path.push([this.position[0] + i, this.position[1] - i]);
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
function Rook(position, color, has_moved) {
    Piece.call(this, position, color);

    // checks if a special has_moved parameter was given, otherwise set it by starting position.
    if (has_moved) {
        this.has_moved = has_moved;
    } else {
        var starting_match = false;
        for (var i = 0; i < WHITE_ROOK_STARTS; i++) {
            if (isSamePosition(position, WHITE_ROOK_STARTS[i])) {
                starting_match = true;
                break;
            } else if (isSamePosition(position, BLACK_ROOK_STARTS[i])) {
                starting_math = true;
                break;
            }
        }
    }
    this.type = ROOK;
}

Rook.prototype.get_path = function(to) {
    // Easier than the bishop as we don't need the diagonal tricks, otherwise pretty similar
    // Looking at the XOR of the values to make sure that we indeed move somewhere on a file or rank
    if ( (this.position[0] === to[0]? 1:0) ^ (this.position[1] === to[1]? 1:0)) {
        var path = [];
        var dist;
        if (this.position[0] > to[0]) {
            // moving left
            dist = this.position[0] - to[0];
            for (var i=1; i <= dist; i++) {
                path.push([this.position[0] - i, this.position[1]]);
            }
        } else if (this.position[0] < to[0]) {
            // moving right
            dist = to[0] - this.position[0];
            for (i=1; i <= dist; i++) {
                path.push([this.position[0] + i, this.position[1]]);
            }
        } else if (this.position[1] > to[1]) {
            // moving down
            dist = this.position[1] - to[1];
            for (i = 1; i <= dist; i++) {
                path.push([this.position[0], this.position[1] - i]);
            }
        } else {
            // as we are guaranteed to have moved in a direction, it must be up.
            dist = to[1] - this.position[1];
            for (i = 1 ; i <= dist; i++) {
                path.push([this.position[0], this.position[1] + i]);
            }
        }

        return path;
    }

    return null;
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