
/************************ game.js
 *
 * main file of the game.
 */

var STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
var PADDING = 30;

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
    body.appendChild(gameCanvas);

    canvas = gameCanvas;
    context = canvas.getContext('2d');
    console.log(canvas, context);
}

function resizeCanvas() {
    var size = Math.min(window.innerWidth, window.innerHeight) - PADDING;
    canvas.width = size;
    canvas.height = size;
    console.log(size);
    draw();
}

function draw() {

    context.fillStyle = '#000000';
    context.fillRect(0,0,canvas.width, canvas.height);
    context.fill();
    console.log('filled')
}

function main() {
    generatePage();

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
}

document.addEventListener('load', main());