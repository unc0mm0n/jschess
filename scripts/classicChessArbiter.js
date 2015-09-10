/**
 * Created by Yuval on 10/09/2015.
 */
/******* Arbiter object
 * The job of the arbiter is to rule whether moves are legal or not on a board,
 * to set up the initial position, to decide whether a game is over or not,
 * and to give instructions on making of special moves.
 * A special move is a move that requires two or more pieces to move (e.g. castling),
 * that requires removal of seemingly unrelated pieces (e.g. en-passant), that changes
 * a piece (e.g. promotion), or anything that is not just moving a piece to a square and capturing there.
 */

/******* ClassicChessArbiter object
 * ClassicChessArbiter is an arbiter following the rules of classic chess without a clock.
 * Following this structure will make sure other arbiters work well with the program.
 **/
function ClassicChessArbiter() {
    this.STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
}

/**
 * attaches a board object for the arbiter to observe, all rulings will be based on attached board.
 * @param board board to observe.
 */
ClassicChessArbiter.prototype.observeBoard = function(board){
    this.board = board;
};

/**
 * Checks if a given move is legal
 * @param move a Move object with to and from squares.
 * @param current_player the player whose turn it is.
 * @returns {boolean} true if move is legal.
 */
ClassicChessArbiter.prototype.isMoveLegal = function(move, current_player){
    if (!this.board) {
        return false;
    }
    // getting the details of the required squares.
    var from = move.from;
    var to = move.to;
    var from_piece = this.board.pieces_by_square[from];
    var to_piece = this.board.pieces_by_square[to];

    var path;
    if (!from_piece) {
        // can't make a move from an empty square
        return false;
    }

    // if we are not ignoring turn orders, we need to make sure the pieces match color.
    if (current_player != from_piece.color) {
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
        if (this.board.pieces_by_square[path[i]]) return false;
    }

    // finally check that no king was exposed.
    return this.kingSafeAfter(move);
};

/** kingSafeAfter(move)
 * Checks if there are illegal checks in the position after a move will be made.
 * @returns {boolean} true if move is legal.
 * @param move move object with from square and to square.
 */
ClassicChessArbiter.prototype.kingSafeAfter = function(move) {
    var from = move.from;
    var to = move.to;

    // grab the king of the player that moved.
    var player_color = this.board.pieces_by_square[from].color;
    var player_king = this.board.kings[player_color];
    var king_position = (player_king === this.board.pieces_by_square[from]? to : player_king.square);

    // iterating over the pieces.
    for (square in this.board.pieces_by_square) {
        if (!this.board.pieces_by_square.hasOwnProperty(square)) continue; // maybe not necessary...

        piece = this.board.pieces_by_square[square];
        // same colored pieces can't check the king
        if (piece.color == player_color) continue;

        // if we are capturing the piece it can't check the king
        if (piece.isAt(to)) continue;

        // get the path to the king
        var path = piece.get_capture_path(king_position);
        var blocked = false;

        // move to next piece if the piece can't reach the king
        if (!path) continue;

        for (var i=0; i<path.length - 1; i++) {
            // if we are blocking the check from this piece, we can move to the next piece
            if (path[i].equals(to)) {
                blocked = true;
                break;
            }

            // if the square is occupied by a piece that is not moving, we can move to the next piece
            if (!(path[i].equals(from)) && this.board.pieces_by_square[path[i]]) {
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

/**
 * returns a special moves object if the move is a special move.
 * See utils.SpecialMove for details.
 * @param move a Move with from square and to square.
 * @param current_player the current player to play.
 * @return specialMove a SpecialMove object with the details of the move.
 */
ClassicChessArbiter.prototype.getSpecialMove = function(move, current_player) {
    if (this.board.pieces_by_square[move.from].color !== current_player) return null;

    var castleMove = getCastle(move);
    if (castleMove) return castleMove;

    // var enPassant = getEnPassant(move, current_player); //TODO
    // var promotion = getPromotion(move, current_player); //TODO
};

ClassicChessArbiter.prototype.getCastle = function(move) {
    var from = move.from;
    var to = move.to;
    var king = this.pieces_by_square[from];

    // if we are not dealing with a king or are dealing with a king that moved already, we can't castle.
    if (king.type !== KING || king.has_moved ) {
        return null;
    }

    // if the king is trying to switch ranks, or is not moving by exactly two squares, we can't castle.
    if (Math.abs(from.file - to.file) !== 2 || from.rank !== to.rank) {
        return null;
    }

    // if the king is in check right now, we can't castle
    king_in_check = new Move(from, from);
    if (!this.noChecksAfter(king_in_check)) {
        return null;
    }
    var rook; // will be used to keep track of the castling rook
    var new_rook_square; // will hold the square the rook needs to move to;

    var path = []; // will be used to keep track of the king's entire path
    // moving right means kingside castling
    if (from.file < to.file) {
        // get the king side rook.
        rook = this.pieces_by_square[new Square(8, from.rank)];
        // add two steps to the right to the path.
        path.push(from.getSquareAtOffset(1, 0));
        path.push(to);

        new_rook_square = from.getSquareAtOffset(1, 0);
    } else {
        // we are moving left, castling queenside (we know that they are not equal)
        // get the queen side rook
        rook = this.pieces_by_square[new Square(1, from.rank)];
        // add three steps to the left to the path.
        path.push(from.getSquareAtOffset(-1, 0));
        path.push(to);

        // also check if there is a piece right next to the rook, as it's not in our path
        var rook_neighbour_square = from.getSquareAtOffset(-3, 0);
        if (this.pieces_by_square[rook_neighbour_square]) return null;

        new_rook_square = from.getSquareAtOffset(-1, 0);
    }

    if (!rook || rook.has_moved || rook.type != ROOK) {
        // checking this is really a rook that haven't move.
        return null;
    }

    // finally we check the path to make sure it's empty, and everything is safe
    for (var i = 0; i < path.length; i++) {
        // if there's a piece there, we can't castle.
        if (this.pieces_by_square[path[i]]) {
            return null;
        }
        var castle_move = new Move(from, path[i]);

        if (!this.kingSafeAfter(castle_move)){
            return null;
        }

    }

    var king_move = new Move(from, to);
    var rook_move = new Move(rook.square, new_rook_square);

    castle_move = new SpecialMove([king_move, rook_move]);
};