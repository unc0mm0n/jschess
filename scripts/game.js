
/************************ game.js
 *
 * main file of the game.
 */

WHITE = 'white';
BLACK = 'black';

var STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

/** generateBoardFromFen(fen)
 * Generates a board at the position given and returns it.
 * TODO: Turn board and pieces into appropriate objects
 * fen: FEN string to generate position from
 */
function generateBoardFromFen(fen) {
    board = []
    ranks = fen.split(' ')[0].split('/');

    for (var i=0; i < ranks.length; i++) {

        board_rank = [];
        // get the next rank from the array
        squares = ranks[i].split('');
        
        for (var j=0; j < squares.length; j++) {

            // a number means empty spaces, so if we encounter a number we skip the same number of tiles
            if (Number(squares[j])) {
                for (var k=0; k < Number(squares[j]); k++) {
                    board_rank.push(" ");
                }
            }

            // otherwise we just have a piece to add.
            else {
                board_rank.push(squares[j]);
            }
        }

        // and finally add the rank itself to the board
        board.push(board_rank);
    }

    return board;
}

var b = new Queen([4,4], WHITE);

console.log(b.get_path([8,8]));
console.log(b.get_capture_path([8,8]));
console.log(b.get_capture_path([0,0]));
console.log(b.get_capture_path([7,1]));
console.log(b.get_capture_path([1,7]));
console.log(b.get_capture_path([1,16]));
console.log(b.get_capture_path([4,4]));
console.log(b.get_capture_path([4,5]));
console.log(b.get_capture_path([3,5]));
console.log(b.get_capture_path([3,3]));
console.log(b.get_capture_path([6,4]));
console.log(b.get_capture_path([-3,4]));
console.log(b.get_capture_path([4,-4]));