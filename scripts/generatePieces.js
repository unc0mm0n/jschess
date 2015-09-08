var WHITE = 'white';
var BLACK = 'black';

var PAWN = 'P';
var KNIGHT = 'N';
var KING = 'K';
var BISHOP = 'B';
var ROOK = 'R';
var QUEEN = 'Q';

/**
 * A generator to generate pieces from given fen and return them all in an array.
 */
function generatePieces(fen) {

    var pieceArray = [];

    var ranks = fen.split(' ')[0].split('/');
    for (var rank=1; rank <= ranks.length; rank++) {

        var squares = ranks[rank-1];

        var file = 1; // keeping track of the current file.
        for (var j=0; j < squares.length; j++) {
            if (Number(squares[j])) {
                file += Number(squares[j]);
                continue;
            }
            pieceArray.push(generatePiece(squares[j], [file, rank]));
            file +=1;
        }
    }

    return pieceArray;
}
function generatePiece(letter, position) {
    var color = (letter == letter.toUpperCase()? BLACK : WHITE);
    letter = letter.toUpperCase();
    switch(letter) {
        case PAWN:
            return new Pawn(color, position);
        case KNIGHT:
            return new Knight(color, position);
        case KING:
            return new King(color, position);
        case BISHOP:
            return new Bishop(color, position);
        case ROOK:
            return new Rook(color, position);
        case QUEEN:
            return new Queen(color, position);
    }
}