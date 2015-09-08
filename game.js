var STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** generateBoardFromFen(fen)
 * Generates a board at the position given and returns it.
 * TODO: Turn board and pieces into appropriate objects
 * fen: FEN string to generate position from
 */
function generateBoardFromFen(fen) {
    board = []
    rows = fen.split(' ')[0].split('/');

    for (var i=0; i < rows.length; i++) {

        board_row = [];
        // get the next row from the array
        cells = rows[i].split('');
        
        for (var j=0; j < cells.length; j++) {

            // a number means empty spaces, so if we encounter a number we skip the same number of tiles
            if (Number(cells[j])) {
                for (var k=0; k < Number(cells[j]); k++) {
                    board_row.push(" ");
                }
            }

            // otherwise we just have a piece to add.
            else {
                board_row.push(cells[j]);
            }
        }

        // and finally add the row itself to the board
        board.push(board_row);
    }

    return board;
}

console.log(generateBoardFromFen(STARTING_FEN));