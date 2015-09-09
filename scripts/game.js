
/************************ game.js
 *
 * main file of the game.
 */

var STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';


function generateBoardFromFen(fen) {
    var board = new Board(fen);
    for (var key in board.kings) {
        console.log(key);
    }
}

var b = new Queen([4,4], WHITE);

generateBoardFromFen(STARTING_FEN);