/************************ board.js
 * Holds a board
 */

/******* Board class
 * Creates a chess board from given fen. This class
 * handles making moves and holding the current state of the board
 * @param fen the fen of the starting position of the board
 * @constructor
 */
function Board(fen) {
    pieces = generatePieces(fen);
    this.pieces = {};
    this.kings = {};

    for (var i=0; i < pieces.length; i++) {
        piece = this.pieces[i];
        this.pieces[piece.position] = piece;
        if (piece.type === KING) {
            this.kings[piece.color] = piece;
        }
    }

}

/** checkLegalMove(from, to)
 * Checks if a move is legal, using the piece at from, and moving to to.
 * Doesn't check for special rules: En Passant, Castling.
 * @param from square of the piece to move
 * @param to target square of the move
 * @returns {boolean} true if move is legal.
 */
Board.prototype.checkLegalMove = function(from, to) {
    // getting the details of the required squares.
    from_square = this.pieces[from];
    to_square = this.pieces[to];
    var path;
    if (!from_square) {
        // can't make a move from an empty square
        return false;
    }
    else if (from_square && to_square) {
        // If both squares are occupied
        if (from_square.color === to_square.color) {
            // can't capture it's own piece.
            return false;
        } else {
            path = from_square.get_capture_path(to);
        }
    }
    else {
    // if we are here, we have a piece we want to move and the target square is empty.
    path = from_square.get_path(to);
    }

    // looking at all the elements of the path but the last, as we already know it.
    for (var i=0; i< path.length - 1; i++) {
        if (this.pieces[path[i]]) return false;
    }

    // finally check if no kings were exposed.
    return this.noChecksAfter(from, to);
};

/** noChecksAfter(from, to)
 * Checks if there are illegal checks in the position after a move will be made.
 * @param from square of the piece to move
 * @param to target square of the move
 * @returns {boolean} true if move is legal.
 */
Board.prototype.noChecksAfter = function(from, to) {

    // grab the king of the player that moved.
    var player_color = this.pieces[from].color;
    var player_king = this.kings[player_color];

    // iterating over the pieces.
    for (position in this.pieces) {
        if (!this.pieces.hasOwnProperty(position)) continue;

        piece = this.pieces[position];
        if (piece.color = player_color) continue;

        // get the path to the king
        var path = piece.get_capture_path(player_king.position);
        var blocked = false;

        // move to next piece if the piece can't reach the king
        if (!path) continue;

        for (var i=0; i<path.length - 1; i++) {
            // if we are blocking the check from this piece, we can move to the piece
            if (path[i] === to) {
                blocked = true;
                break;
            }

            // if the square is occupied by a piece that is not moving, we can move to the next piece
            if (path[i] != from && this.pieces[path[i]]) {
                blocked = true;
                break;
            }
        }

        // if there is an empty path to the king, he is in check.
        if (!blocked) {
            return false;
        }
    }

    // if, after checking all the pieces, no piece has an empty path to the king, the king is safe.
    return true;
};