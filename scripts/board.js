/************************ board.js
 * Holds a board
 */

var WHITE_CASTLE_KING = 'K';
var WHITE_CASTLE_QUEEN = 'Q';
var BLACK_CASTLE_KING = 'k';
var BLACK_CASTLE_QUEEN = 'q';
var NO_CASTLES = '-';

/******* Board class
 * Creates a chess board from given fen. This class
 * handles making moves and holding the current state of the board
 * @param fen the fen of the starting position of the board
 * @constructor
 */
function Board(fen) {
    var pieces = generatePieces(fen);

    // puts all pieces into the pieces_by_square object, which we
    // will be using exclusively to get piece information and manipulate the pieces.
    this.pieces_by_square = {};
    // also hold kings information by color.
    this.kings = {};
    for (var i=0; i < pieces.length; i++) {
        var piece = pieces[i];
        this.pieces_by_square[piece.square] = piece;
        if (piece.type === KING) {
            this.kings[piece.color] = piece;
        }
    }

    var fen_data = fen.split(" ");
    this.current_player = fen_data[1];
    this.setCastlingByFen(fen_data[2]);
}

/**
 * makes a given move on the board, doesn't check for legality!
 * only confirmation here is that we are moving a piece. I.e. that
 * there is a piece at from, and that from != to.
 * @param from square of the piece to move
 * @param to square of the target square
 * @returns {boolean} true if the move was made successfully.
 */
Board.prototype.makeMove = function(from, to) {
    var piece = this.pieces_by_square[from];
    if (!piece || from.equals(to)) {
        return false
    }

    // checks if the move is a legal castle, if so does it
    if (this.isCastle(from, to)) {
        //this.castle(from, to);
        return true;
    }

    // checks if the move is en-passant, if so does it. TODO
    // if (isEnPassant())

    // checks if the move is a pawn promotion, if so does it. TODO
    // if (isPromotion(from, to))

    this.pieces_by_square[to] = piece;
    delete this.pieces_by_square[from];
    piece.square = to;
    piece.has_moved = true;

    // change to other player's turn.
    this.current_player = this.current_player === WHITE? BLACK : WHITE;

    return true;
};

/** checkLegalMove(from, to)
 * Checks if a move is legal, using the piece at from, and moving to to.
 * Doesn't check for special rules e.g.: En Passant, Castling.
 * @param from square of the piece to move
 * @param to target square of the move
 * @returns {boolean} true if move is legal.
 * @param ignore_turn_order if passed, checkLegalMove won't check turn order.
 */
Board.prototype.checkLegalMove = function(from, to, ignore_turn_order) {
    // getting the details of the required squares.
    var from_piece = this.pieces_by_square[from];
    var to_piece = this.pieces_by_square[to];

    var path;
    if (!from_piece) {
        // can't make a move from an empty square
        return false;
    }

    // if we are not ignoring turn orders, we need to make sure the pieces match color.
    if (!ignore_turn_order && this.current_player != from_piece.color) {
        return false;
    }

    // check if a king is trying to castle.
    if (this.isCastle(from, to)) {
        console.log(true);
        return true;
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
        if (this.pieces_by_square[path[i]]) return false;
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
    var player_color = this.pieces_by_square[from].color;
    var player_king = this.kings[player_color];
    var king_position = (player_king === this.pieces_by_square[from]? to : player_king.square);

    // iterating over the pieces.
    for (square in this.pieces_by_square) {
        if (!this.pieces_by_square.hasOwnProperty(square)) continue; // maybe not necessary...

        piece = this.pieces_by_square[square];
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
            if (!(path[i].equals(from)) && this.pieces_by_square[path[i]]) {
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
 * sets pieces to have moved by fen data.
 * TODO: Required massive improvement, also to facilitate Fisher random in the future
 * @type {setCastlingByFen} The fen string with castling data i.e. kqKQ if none have moved.
 */
Board.prototype.setCastlingByFen = function(fen_data) {
    // if there are no castles, it's as easy as setting all kings to have moved.
    if (fen_data === NO_CASTLES) {
        for (king in this.kings) {
            if (!this.kings.hasOwnProperty(king)) continue; // still not sure if necessary.
            this.kings[king].has_moved = true;
        }
        return;
    }

    // now the complications start, to make our life easier we mark the rooks as have moved, as if both
    // moved no castling can happen anyway. I am hard-coding the rooks starting positions as
    // I'm out of ideas, 4 new constants just for this seems exaggerated. feel free to improve, future me or anyone else.
    // on second thoughts, this will not work if I'll ever want to play fisher chess.. TODO: Improve this part!!
    if (fen_data.indexOf(WHITE_CASTLE_KING) === -1) {
        var white_kingside_rook_square = new Square(1,8);
        // if there is no rook at the starting king side square we won't be able to castle anyway..
        if (this.pieces_by_square[white_kingside_rook_square]) {
            // doesn't really need to check if it's a rook or not, just set it to have moved.
            // if it's not a rook it doesn't matter anyway, and the piece there certainly have moved..
            this.pieces_by_square[white_kingside_rook_square].has_moved = true;
        }
    }
    if (fen_data.indexOf(WHITE_CASTLE_QUEEN) === -1) {
        var white_queenside_rook_square = new Square(1,1);
        // if there is no rook at the starting king side square we won't be able to castle anyway..
        if (this.pieces_by_square[white_queenside_rook_square]) {
            // doesn't really need to check if it's a rook or not, just set it to have moved.
            // if it's not a rook it doesn't matter anyway, and the piece there certainly have moved..
            this.pieces_by_square[white_queenside_rook_square].has_moved = true;
        }
    }
    if (fen_data.indexOf(BLACK_CASTLE_KING) === -1) {
        var black_kingside_rook_square = new Square(8,8);
        // if there is no rook at the starting king side square we won't be able to castle anyway..
        if (this.pieces_by_square[black_kingside_rook_square]) {
            // doesn't really need to check if it's a rook or not, just set it to have moved.
            // if it's not a rook it doesn't matter anyway, and the piece there certainly have moved..
            this.pieces_by_square[black_kingside_rook_square].has_moved = true;
        }
    }
    if (fen_data.indexOf(BLACK_CASTLE_QUEEN) === -1) {
        var black_queenside_rook_square = new Square(8,1);
        // if there is no rook at the starting king side square we won't be able to castle anyway..
        if (this.pieces_by_square[black_queenside_rook_square]) {
            // doesn't really need to check if it's a rook or not, just set it to have moved.
            // if it's not a rook it doesn't matter anyway, and the piece there certainly have moved..
            this.pieces_by_square[black_queenside_rook_square].has_moved = true;
        }
    }
};

/**
 * checks if the move is a legal castle.
 * @returns true if it's a castle, and it's legal.
 */
Board.prototype.isCastle = function (from, to) {
    var from_piece = this.pieces_by_square[from];

    // if we are not dealing with a king or are dealing with a king that moved already, we can't castle.
    if (!(from_piece.type === KING) || from_piece.has_moved ) {
        return false;
    }

    // if the king is trying to switch ranks, or is not moving by exactly two squares, we can't castle.
    if (Math.abs(from.file - to.file) !== 2 || from.rank !== to.rank) {
        return false
    }

    // if the king is in check right now, we can't castle
    if (!this.noChecksAfter(from, from)) {
        return false;
    }

    var rook; // will be used to keep track of the castling rook
    var path = []; // will be used to keep track of the king's entire path
    // moving right means kingside castling
    if (from.file < to.file) {
        // get the king side rook.
        rook = this.pieces_by_square[new Square(8, from.rank)];
        // add two steps to the right to the path.
        path.push(from.getSquareAtOffset(1, 0));
        path.push(from.getSquareAtOffset(2, 0));

    } else {
        // we are moving left, castling queenside (we know that they are not equal)
        // get the queen side rook
        rook = this.pieces_by_square[new Square(1, from.rank)];
        // add three steps to the left to the path.
        path.push(from.getSquareAtOffset(-1, 0));
        path.push(from.getSquareAtOffset(-2, 0));

        // also check if there is a piece right next to the rook, as it's not in our path
        var rook_neighbour_square = from.getSquareAtOffset(-3, 0);
        if (this.pieces_by_square[rook_neighbour_square]) return false;
    }

    if (!rook || rook.has_moved || rook.type != ROOK) {
        // checking this is really a rook that haven't move.
        return false;
    }

    // finally we check the path to make sure it's empty, and everything is safe
    for (var i = 0; i < path.length; i++) {
        // if there's a piece there, we can't castle.
        if (this.pieces_by_square[path[i]]) {
            return false;
        }
        if (!this.noChecksAfter(from, path[i])){
            return false;
        }

    }
    return true;
};
