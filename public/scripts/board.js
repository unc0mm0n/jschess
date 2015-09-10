/************************ board.js
 * Holds a board
 */

var WHITE_CASTLE_KING = 'K';
var WHITE_CASTLE_QUEEN = 'Q';
var BLACK_CASTLE_KING = 'k';
var BLACK_CASTLE_QUEEN = 'q';
var NO_CASTLES = '-';

function Board(fen) {
    /******* Board class
     * Creates a chess board from given fen. This class
     * handles making moves and holding the current state of the board
     * @param fen the fen of the starting position of the board
     * @constructor
     */
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

    this.players = fen_data[1] === WHITE? [WHITE, BLACK] : [BLACK, WHITE];
    this.setCastlingByFen(fen_data[2]);
}

/**
 * makes a given move on the board, doesn't check for legality!
 * only confirmation here is that we are moving a piece. I.e. that
 * there is a piece at from, and that from != to.
 * @returns {boolean} true if the move was made successfully.
 * @param move a Move object with from square and to square.
 */
Board.prototype.makeMove = function(move) {
    var from = move.from;
    var to = move.to;
    var piece = this.pieces_by_square[from];
    if (!piece || from.equals(to)) {
        return false
    }

    this.pieces_by_square[to] = piece;
    delete this.pieces_by_square[from];
    piece.square = to;
    piece.has_moved = true;

    return true;
};

/***
 * Makes a special move, this can include a number of moves in a row,
 * removal of a number of pieces at any location, or swapping
 * pieces for different kind of pieces.
 * Check utils.SpecialMove for structure
 * @param specialMove a SpecialMove object containing the information for the move.
 * @returns {boolean} true if move was made successfully.
 */
Board.prototype.makeSpecialMove = function(specialMove) {
    for (var i=0; i<specialMove.moves.length; i++) {
        this.makeMove(specialMove.moves[i]);
    }

    for (i=0; i<specialMove.removes.length; i++) {
        delete this.pieces_by_square[specialMove.removes[i]];
    }

    for (i=0; i<specialMove.insertions.length; i++) {
        this.insertPiece(specialMove.insertions[i][0],
            specialMove.insertions[i][1],
            specialMove.insertions[i][2]);
    }

    return true;
};
/**
 * Puts a new piece of given color on given square, will delete existing piece on the square
 * @param square
 * @param new_piece_type
 */
Board.prototype.insertPiece = function(square, new_piece_type, new_piece_color) {
    delete this.pieces_by_square[square];
    this.pieces_by_square[square] = generatePiece(new_piece_type, new_piece_color, square.file, square.rank);
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
