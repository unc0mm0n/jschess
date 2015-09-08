
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
   pieces = generatePieces(fen);
}

var b = new Queen([4,4], WHITE);

generateBoardFromFen(STARTING_FEN);