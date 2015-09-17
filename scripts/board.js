/************************ board.js
 * Holds a board
 */
var consts = require('./constants.js');

function Board(piece_fen) {
    /******* Board class
     * Creates a chess board from given fen. This class
     * handles making moves and holding the current state of the board
     * @param fen the fen of the starting position of the board
     * @constructor
     */
    this.movement = require('./movement');

    var pieces = this.generatePieces(piece_fen);
    // puts all pieces into the pieces_by_square object, which we
    // will be using exclusively to get piece information and manipulate the pieces.
    this.pieces_by_square = {};
    // also hold kings information by color.
    this.kings = {};
    for (var i=0; i < pieces.length; i++) {
        var piece = pieces[i];
        this.pieces_by_square[piece.square] = piece;
        if (piece.type === consts.KING) {
            this.kings[piece.color] = piece;
        }
    }
}

/**
 * A generator to generate pieces from given fen and return them all in an array.
 */
Board.prototype.generatePieces = function(fen) {
    var pieces = require('./pieces.js');
    var piece_array = [];
    var ranks = fen.split('/');
    for (var i = 0; i < ranks.length; i++) {

        var squares = ranks[i];
        var rank = 8 - i;
        var file = 1; // keeping track of the current file.
        for (var j = 0; j < squares.length; j++) {
            if (Number(squares[j])) {
                file += Number(squares[j]);
                continue;
            }
            var color = (squares[j] === squares[j].toUpperCase() ? consts.WHITE : consts.BLACK);
            piece_array.push(pieces.generate(squares[j], color, file, rank));
            file += 1;
        }
    }
    return piece_array;
};

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
 * Check movement.SpecialMove for structure
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
 * @param square square for the new piece
 * @param new_piece_type type for the new piece
 * @param new_piece_color color for the new piece
 */
Board.prototype.insertPiece = function(square, new_piece_type, new_piece_color) {
    delete this.pieces_by_square[square];
    this.pieces_by_square[square] = require('./pieces').generate(new_piece_type, new_piece_color, square.file, square.rank);
};
/**
 * sets pieces to have moved by fen data.
 * TODO: Reimplement this..
 * @type {setCastlingByFen} The fen string with castling data i.e. kqKQ if none have moved.
 */
Board.prototype.setCastlingByFen = function(fen_data) {

};

module.exports = function(fen) {
    return new Board(fen);
};