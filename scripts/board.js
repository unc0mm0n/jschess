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
    var pieces = generatePieces(fen);
    this.pieces_by_position = {};
    this.kings = {};
    this.current_player = fen.split(" ")[1];
    for (var i=0; i < pieces.length; i++) {
        var piece = pieces[i];
        this.pieces_by_position[piece.position] = piece;
        if (piece.type === KING) {
            this.kings[piece.color] = piece;
        }
    }

}

/**
 * makes a given move on the board, doesn't check for legality!
 * only confirmation here is that indeed there is a piece at from.
 * @param from position of the piece to move
 * @param to position of the target square
 * @returns {boolean} true if the move was made successfully.
 */
Board.prototype.makeMove = function(from, to) {
    var piece = this.pieces_by_position[from];
    if (!piece) {
        return false
    }

    this.pieces_by_position[to] = piece;
    delete this.pieces_by_position[from];
    piece.position = to;

    // change to other player's turn.
    console.log(this.current_player);

    this.current_player = this.current_player === WHITE? BLACK : WHITE;
    return true;
};

/** checkLegalMove(from, to)
 * Checks if a move is legal, using the piece at from, and moving to to.
 * Doesn't check for special rules: En Passant, Castling.
 * @param from square of the piece to move
 * @param to target square of the move
 * @returns {boolean} true if move is legal.
 * @param ignore_turn_order if passed, checkLegalMove won't check turn order.
 */
Board.prototype.checkLegalMove = function(from, to, ignore_turn_order) {
    // getting the details of the required squares.
    var from_piece = this.pieces_by_position[from];
    var to_piece = this.pieces_by_position[to];

    var path;
    if (!from_piece) {
        // can't make a move from an empty square
        return false;
    }
    // if we are not ignoring turn orders, we need to make sure the pieces match color.
    if (!ignore_turn_order && this.current_player != from_piece.color) {
        console.log("wrong turn");
        return false;
    }

    if (from_piece && to_piece) {
        // If both squares are occupied
        if (from_piece.color === to_piece.color) {
            // can't capture it's own piece.
            return false;
        } else {
            path = from_piece.get_capture_path(to);
        }
    }
    else {
    // if we are here, we have a piece we want to move and the target square is empty.
    path = from_piece.get_path(to);
    }

    if (!path) {
        return false;
    }
    // looking at all the elements of the path but the last, as we already know it.
    for (var i=0; i< path.length - 1; i++) {
        if (this.pieces_by_position[path[i]]) return false;
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
    var player_color = this.pieces_by_position[from].color;
    var player_king = this.kings[player_color];
    var king_position = (player_king === this.pieces_by_position[from]? to : player_king.position);

    // iterating over the pieces.
    for (position in this.pieces_by_position) {
        if (!this.pieces_by_position.hasOwnProperty(position)) continue; // maybe not necessary...

        piece = this.pieces_by_position[position];
        // same colored pieces can't check the king
        if (piece.color == player_color)  continue;

        // if we are capturing the piece it can't check the king
        if (piece.isAt(to)) continue;

        // get the path to the king
        var path = piece.get_capture_path(king_position);
        var blocked = false;

        // move to next piece if the piece can't reach the king
        if (!path) continue;

        for (var i=0; i<path.length - 1; i++) {
            // if we are blocking the check from this piece, we can move to the piece
            if (path[i][0] === to[0] && path[i][1] === to[1]) {
                blocked = true;
                break;
            }

            // if the square is occupied by a piece that is not moving, we can move to the next piece
            if (!(path[i][0] === from[0] && path[i][1] === from[1]) && this.pieces_by_position[path[i]]) {
                blocked = true;
                break;
            }
        }

        // if there is an empty path to the king, he is in check.
        if (!blocked) {
            console.log("Check from ", piece.constructor.name, " at ", piece.position);
            return false;
        }
    }

    // if, after checking all the pieces, no piece has an empty path to the king, the king is safe.
    return true;
};