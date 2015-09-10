/**
 * Created by Yuval on 10/09/2015.
 */

var RESULT_WIN = 'checkmate';
var RESULT_DRAW = 'draw';

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
 * @param player_color the colro of the player whose turn it is.
 * @returns {boolean} true if move is legal.
 */
ClassicChessArbiter.prototype.isMoveLegal = function(move, player_color){
    if (!this.board) {
        return false;
    }
    // getting the details of the required squares.
    var from = move.from;
    var to = move.to;
    var from_piece = this.board.pieces_by_square[from];
    var to_piece = this.board.pieces_by_square[to];

    // can't leave the board unfortunately
    if (to.file > 8 || to.rank > 8 || to.file < 1 || to.rank < 1) {
        return false;
    }

    var path;
    if (!from_piece) {
        // can't make a move from an empty square
        return false;
    }

    // if we are not ignoring turn orders, we need to make sure the pieces match color.
    if (player_color != from_piece.color) {
        return false;
    }

    if (from_piece && to_piece) {
        // If both squares are occupied
        if (from_piece.color === to_piece.color) {
            // can't capture it's own piece.
            return false;
        } else {
            path = from_piece.getCapturePath(to);
        }
    }
    else {
        // if we are here, we have a piece we want to move and the target square is empty.
        path = from_piece.getPath(to);
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
        var path = piece.getCapturePath(king_position);
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
 * Returns the squares of all of player's pieces that can reach target square.
 * @param target_square Square object to reach.
 * @param player_color color of the player to check
 * @param is_capture if true, will check pieces' capture_path instead of normal path.
 * @returns the pieces that can reach target square.
 */
ClassicChessArbiter.prototype.piecesCanReach = function(target_square, player_color, is_capture) {

    var pieces = [];
    // iterating over the pieces.
    for (key in this.board.pieces_by_square) {
        if (!this.board.pieces_by_square.hasOwnProperty(key)) continue; // maybe not necessary...

        var piece = this.board.pieces_by_square[key];
        move = new Move(piece.square, target_square);
        if(this.isMoveLegal(move, player_color)) {
            pieces.push(piece);
        }
    }


    return pieces;
};

/**
 * Checks if any pieces are checking the piece of given player
 * @param player_color color of the current player to move.
 * @returns an array of the pieces that can check the king.
 */
ClassicChessArbiter.prototype.piecesCheckingKing = function(player_color) {

    // grab the square of the current player's king
    var king_position = this.board.kings[player_color].square;
    var enemy_color = getEnemy(player_color);
    pieces = this.piecesCanReach(king_position, enemy_color, true);
    return pieces;
};

/**
 * returns a special moves object if the move is a special move.
 * See utils.SpecialMove for details.
 * @param move a Move with from square and to square.
 * @param player_color the current player to play.
 * @return specialMove a SpecialMove object with the details of the move.
 * @param game_record record of the game moves, in case any special move needs to look at the past.
 */
ClassicChessArbiter.prototype.getSpecialMove = function(move, player_color, game_record) {
    if (this.board.pieces_by_square[move.from].color !== player_color) return null;

    var castleMove = this.getCastle(move);
    if (castleMove) return castleMove;

    var enPassant = this.getEnPassant(move, game_record[game_record.length-1]);
    if (enPassant) return enPassant;

    var promotion = this.getPromotion(move);
    if (promotion) return promotion;

    return null;
};

/**
 * Returns a SpecialMove object with the promotion move if the given move is a legal promotion.
 * @param move A Move object with the move to make.
 * @returns {*} a SpecialMove object if a special move was made, null otherwise.
 */
ClassicChessArbiter.prototype.getPromotion = function(move) {
    var pawn = this.board.pieces_by_square[move.from];
    if (pawn.type !== PAWN) return null;

    if (!this.isMoveLegal(move, pawn.color)) {
        return false;
    }
    var target_rank = (pawn.direction + 1) * 3.5 + 1; // some wizardry to turn -1/1 to 1/8;
    if (move.to.rank === target_rank) {
        return new SpecialMove([move], null, [[move.to, QUEEN, pawn.color]]); //TODO: Prompt user for piece.
    }
};

/**
 * Returns a SpecialMove object with the En Passant move if the given move is a legal En Passant.
 * @param move A Move object with the move to make.
 * @param last_move A Move object with the last move that was made.
 * @returns {*} a SpecialMove object if a special move was made, null otherwise.
 */
ClassicChessArbiter.prototype.getEnPassant = function(move, last_move) {
    var pawn = this.board.pieces_by_square[move.from];
    if (pawn.type !== PAWN) return null;

    // can't be En Passant in the first move of the game
    if (!last_move) {
        return false;
    }

    var from = move.from;
    var to = move.to;

    // make sure it's a pawn trying to capture.
    if (Math.abs(from.file - to.file) !== 1 || to.rank - from.rank !== pawn.direction) {
        return null;
    }

    var enemy_pawn = this.board.pieces_by_square[last_move.to];

    // if it's not a piece, or a piece but not a pawn, or a pawn that haven't moved two squares, we can't take it.
    if (!enemy_pawn || enemy_pawn.type !== PAWN ||
        Math.abs(last_move.from.rank - last_move.to.rank) !== 2) {
        return null;
    }

    // finally if we are not moving to the square above it (in the pawn's movement direction), we can't take it.
    if (move.to.rank - last_move.to.rank !== pawn.direction || move.to.file !== last_move.to.file) {
        return null;
    }

    return new SpecialMove([move], [last_move.to]);
};

ClassicChessArbiter.prototype.getCastle = function(move) {
    var from = move.from;
    var to = move.to;
    var king = this.board.pieces_by_square[from];

    // if we are not dealing with a king or are dealing with a king that moved already, we can't castle.
    if (king.type !== KING || king.has_moved ) {
        return null;
    }

    // if the king is trying to switch ranks, or is not moving by exactly two squares, we can't castle.
    if (Math.abs(from.file - to.file) !== 2 || from.rank !== to.rank) {
        return null;
    }

    // if the king is in check right now, we can't castle
    if (this.piecesCheckingKing(king.color).length > 0) {
        return null;
    }
    var rook; // will be used to keep track of the castling rook
    var new_rook_square; // will hold the square the rook needs to move to;

    var path = []; // will be used to keep track of the king's entire path
    // moving right means kingside castling
    if (from.file < to.file) {
        // get the king side rook.
        rook = this.board.pieces_by_square[new Square(8, from.rank)];
        // add two steps to the right to the path.
        path.push(from.getSquareAtOffset(1, 0));
        path.push(to);

        new_rook_square = from.getSquareAtOffset(1, 0);
    } else {
        // we are moving left, castling queenside (we know that they are not equal)
        // get the queen side rook
        rook = this.board.pieces_by_square[new Square(1, from.rank)];
        // add three steps to the left to the path.
        path.push(from.getSquareAtOffset(-1, 0));
        path.push(to);

        // also check if there is a piece right next to the rook, as it's not in our path
        var rook_neighbour_square = from.getSquareAtOffset(-3, 0);
        if (this.board.pieces_by_square[rook_neighbour_square]) return null;

        new_rook_square = from.getSquareAtOffset(-1, 0);
    }

    if (!rook || rook.has_moved || rook.type != ROOK) {
        // checking this is really a rook that haven't move.
        return null;
    }

    // finally we check the path to make sure it's empty, and everything is safe
    for (var i = 0; i < path.length; i++) {
        // if there's a piece there, we can't castle.
        if (this.board.pieces_by_square[path[i]]) {
            return null;
        }
        var castle_move = new Move(from, path[i]);

        if (!this.kingSafeAfter(castle_move)){
            return null;
        }

    }

    var king_move = new Move(from, to);
    var rook_move = new Move(rook.square, new_rook_square);

    return new SpecialMove([king_move, rook_move]);
};

/**
 * returns a result if the game is over
 * @param next_player color of the next player to play.
 * @returns result if the game is over
 */
ClassicChessArbiter.prototype.getResult = function(next_player) {
    result = this.isCheckmate(next_player);
    if (result) {
        return result;
    } else {
        //return isStalemate(current_player_color); // TODO: Find how to implement this at least semi-efficiently.
    }
};

/**
 * returns a result if the position is checkmate on given player.
 * @param on_player the player that might be checkmated.
 */
ClassicChessArbiter.prototype.isCheckmate = function(on_player) {
    var king = this.board.kings[on_player];
    // first we check if the king can move.
    if (this.canKingMove(king)) {
        return false;
    }

    // otherwise we assume the king is not mated
    var mated = false;

    // and check if there is a checking piece that can't be taken or blocked.
    var checking_pieces = this.piecesCheckingKing(on_player);
    if (checking_pieces.length === 0) return false;

    var king_square = king.square;
    for (var i=0; i < checking_pieces.length; i++) {

        // if we can take
        var capturing_pieces = this.piecesCanReach(checking_pieces[i].square, on_player, true);
        if (capturing_pieces.length > 0) {
            continue;
        }

        // this is the path the piece takes to the king, which we should block.
        var path = checking_pieces[i].getCapturePath(king_square);
        var can_block = false;

        for (var j=0; j < path.length; j++) {
            // thus we check if we can block each square
            blocking_pieces = this.piecesCanReach(path[j], on_player, false);
            if (blocking_pieces.length>0) {
                can_block = true;
                break;
            }
        }

        // if we can't block the piece, it's mate
        if (!can_block) {
            return RESULT_WIN;
        }
    }
    return false;
};

/**
 * helper function to check if the king can move anywhere, returns true of false
 * @param king given piece, should be a king
 * return true if king can move.
 */
ClassicChessArbiter.prototype.canKingMove = function(king) {
    if (king.type !== KING) {
        return false;
    }

    // checking one square in every direction and every combination, we also redundantly check
    // if the king can stay in place, but this exits pretty early in isMoveLegal.
    for (var i=-1; i <= 1; i++) {
        for (var j=-1; j <= 1; j++) {
            var move = new Move(king.square, king.square.getSquareAtOffset(i, j));
            if (this.isMoveLegal(move, king.color)) {
                return true;
            }
        }
    }
    return false;
};