/**
 * Created by Yuval on 09/09/2015.
 */

/**
 *
 * @param position array with file and rank on the chess board
 * @param board_size size of the board
 * @returns {*} Array with x position and y position of the top left corner from the start of the board.
 * @param padding optional padding to the coordinates to fit board not positioned at 0,0, expected to be a number or array with two numbers
 */
function getXyFromBoardPosition(position, board_size, padding) {
    var segment_size = board_size / 8;
    var row_segment = 8 - position[1];
    var col_segment = position[0] - 1;
    if (!padding) {
        return [segment_size * col_segment, segment_size * row_segment];
    } else if (Number(padding)) {
        return [segment_size * col_segment + padding, segment_size * row_segment + padding];
    } else {
        return [segment_size * col_segment + padding[0], segment_size * row_segment + padding[1]];
    }
}

/**
 * The opposite of getXyFromBoardPosition, returns the square on the board the mouseclick was located on.
 * @param xy_values the location of the click relative to the board.
 * @param board_size the size of the board.
 * @returns {number[]} array with file and rank of the square clicked.
 */
function getBoardPositionFromXy(xy_values, board_size) {
    var segment_size = board_size / 8;
    rank = 8 - Math.floor(xy_values[1] / segment_size) ;
    file = Math.floor(xy_values[0] / segment_size) + 1;
    return [file,rank]
}
function getImageFromTypeColor(type, color) {
    var result = color[0].toUpperCase();
    switch(type) {
        case PAWN:
            return result+"Pawn";
        case KNIGHT:
            return result+"Knight";
        case KING:
            return result+"King";
        case BISHOP:
            return result+"Bishop";
        case ROOK:
            return result+"Rook";
        case QUEEN:
            return result+"Queen";
    }
    return result;
}

/**
 * A generator to generate pieces from given fen and return them all in an array.
 */
function generatePieces(fen) {

    var piece_array = [];

    var ranks = fen.split(' ')[0].split('/');
    for (var i=0; i < ranks.length; i++) {

        var squares = ranks[i];
        var rank = 8 - i;
        var file = 1; // keeping track of the current file.
        for (var j=0; j < squares.length; j++) {
            if (Number(squares[j])) {
                file += Number(squares[j]);
                continue;
            }
            piece_array.push( generatePiece(squares[j], [file, rank]));
            file +=1;
        }
    }
    return piece_array;
}
function generatePiece(letter, position) {
    var color = (letter === letter.toUpperCase()? WHITE : BLACK);
    letter = letter.toUpperCase();
    switch(letter) {
        case PAWN:
            return new Pawn(position, color);
        case KNIGHT:
            return new Knight(position, color);
        case KING:
            return new King(position, color);
        case BISHOP:
            return new Bishop(position, color);
        case ROOK:
            return new Rook(position, color);
        case QUEEN:
            return new Queen(position, color);
    }
}