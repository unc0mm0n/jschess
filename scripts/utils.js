/**
 * Created by Yuval on 09/09/2015.
 */

/**
 *
 * @param square square object of the location on the board.
 * @param board_size size of the board
 * @returns {*} Array with x position and y position of the top left corner from the start of the board.
 * @param padding optional padding to the coordinates to fit board not positioned at 0,0, expected to be a number or array with two numbers
 */
function getXyFromSquare(square, board_size, padding) {
    var segment_size = board_size / 8;
    var row_segment = 8 - square.rank;
    var col_segment = square.file - 1;
    if (!padding) {
        return [segment_size * col_segment, segment_size * row_segment];
    } else if (Number(padding)) {
        return [segment_size * col_segment + padding, segment_size * row_segment + padding];
    } else {
        return [segment_size * col_segment + padding[0], segment_size * row_segment + padding[1]];
    }
}

/**
 * The opposite of getXyFromSquare, returns the square on the board the x and y values correspond to
 * @param xy_values the location of the click relative to the board.
 * @param board_size the size of the board.
 * @returns {number[]} array with file and rank of the square clicked.
 */
function getSquareFromXy(xy_values, board_size) {
    var segment_size = board_size / 8;
    rank = 8 - Math.floor(xy_values[1] / segment_size) ;
    file = Math.floor(xy_values[0] / segment_size) + 1;
    return getSquareFromArray([file,rank]);
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
            piece_array.push( generatePiece(squares[j], file, rank));
            file +=1;
        }
    }
    return piece_array;
}
function generatePiece(letter, file, rank) {
    var color = (letter === letter.toUpperCase()? WHITE : BLACK);
    var square = new Square(file, rank);
    letter = letter.toUpperCase();
    switch(letter) {
        case PAWN:
            return new Pawn(square, color);
        case KNIGHT:
            return new Knight(square, color);
        case KING:
            return new King(square, color);
        case BISHOP:
            return new Bishop(square, color);
        case ROOK:
            return new Rook(square, color);
        case QUEEN:
            return new Queen(square, color);
    }
}

/**
 * generates a square from the first two numbers in an array.
 * no validations are made.
 * @param position_array an array whose first two elements are numbers.
 * @returns {Square} a square with file equal to the first element and rank the second.
 */
function getSquareFromArray(position_array) {
    return new Square(position_array[0], position_array[1]);
}

/******* Square class
 * square object to encapsulate all these ugly arrays.
 * @param file file of the new square.
 * @param rank rank of the new square.
 */
function Square(file, rank) {
    this.file = file;
    this.rank = rank;

    /**
     * Checks if two squares have the same file and rank.
     * @param other another square
     * @returns {boolean} true if both squares are of the same position on the board.
     */
    this.equals = function(other) {
       return (this.file === other.file && this.rank === other.rank);
    };

    /**
     * Returns a string version of the square, formatted as "file rank".
     * @returns {string} string version of the square.
     */
    this.toString = function() {
        return String(file) + ' ' + String(rank);
    };


    /**
     * returns a new square with the given file and rank added to this square's file and rank.
     * @param file file to move the square
     * @param rank rank to move the square
     * @returns {Square}
     */
    this.getSquareAtOffset = function(file, rank) {
        file = Number(file)? file : 0;
        rank = Number(rank)? rank : 0;
        return new Square(this.file + file, this.rank + rank);
    }
};

/******* Move object
 * Move object to encapsulate a single game move.
 * Might be a bit of an overkill, but I prefer an array of moves over an array of arrays of squares.
 * @param from A square to move from.
 * @param to A square to move to.
 */
function Move(from, to) {
    this.from = from;
    this.to = to;
}

/******* SpecialMove object
 * Move object to encapsulate a single game move.
 * Might be a bit of an overkill, but I prefer an array of moves over an array of arrays of squares.
 * @param moves array of moves to make
 * @param removes array of squares to remove pieces from
 * @param promotions array of pairs, piece to swap with wanted piece type
 */
function SpecialMove(moves, removes, promotions) {
    this.moves = moves;
    this.removes = removes;
    this.promotions = promotions;
}

