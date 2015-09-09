
/************************ game.js
 *
 * main file of the game.
 */

var STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

var context;
var canvas;

function generateBoardFromFen(fen) {
    return new Board(fen);
}

function generatePage() {
    var body = document.getElementById('body');
    var gameArea = document.createElement('div');
    gameArea.setAttribute('id', 'gameArea');

    var gameCanvas = document.createElement('canvas');
    gameCanvas.setAttribute('id', 'gameCanvas');
    gameCanvas.setAttribute('width', '80%');
    gameCanvas.setAttribute('height', '80%');
    gameArea.appendChild(gameCanvas);
    body.appendChild(gameArea);

    canvas = gameCanvas;
    context = canvas.getContext('2D');

}

function main() {
    generatePage();
}

document.addEventListener('load', main());