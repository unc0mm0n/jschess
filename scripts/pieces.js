/************************ Pieces.js
 * Will be used to hold the pieces prototype.
 * pP - pawn
 * bB - bishop
 * rR - rook
 * nN - knight
 * qQ - queen
 * kK - king
 ****************/

var WHITE = 'white';
var BLACK = 'black';

function Piece(position, color) {
    this.position = position;
    this.color = color;
}

Piece.prototype.test = function(){
    console.log(this + " was tested");
}

Pawn.prototype = new Piece();
Pawn.prototype.constructor = Pawn;
function Pawn(position, color) {
    Piece.call(this, position, color);
    this.startPosition = (color === WHITE? 2 : 7);
    this.direction = (color === WHITE? 1 : -1);
    console.log("pawn positioned at "+this.position +', ' + this.direction + ' for ' + this.color + this.startPosition);
}

/**
 * Returns the path the piece needs in order to get to the given square, if it's not a capture.
 * Returns null if the piece can't reach the square in one move.
 * @param to target square.
 */
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

/**
 * Returns the path the piece needs in order to capture in the given square.
 * Returns null if the piece can't reach the square in one move.
 * @param to target square.
 */
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