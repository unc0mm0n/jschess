
/************************ game.js
 *
 * main file of the game.
 */

var STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
var OUTER_PADDING = 30;
var INNER_PADDING_RATIO = 0.1;
var GAME_CONTEXT = '2d';
var LIGHT_SQUARE_COLOR = '#66FF66';
var DARK_SQUARE_COLOR = '#336600';

// name of all the files to load. files must be located in data folder and be *.png.
var ASSETS = ['WKing', 'WQueen', 'WRook', 'WKnight', 'WBishop', 'WPawn',
        'BKing', 'BQueen', 'BRook', 'BKnight', 'BBishop', 'BPawn'];

// dreaded globals.
var context;
var canvas;
var images = {};
var board;
var picked_piece;

/**
 * loads all images to the dreaded global space..
 */
function loadImages() {
    for (i = 0; i < ASSETS.length; i++) {
        images[ASSETS[i]] = new Image();
        images[ASSETS[i]].onload = function() {draw()};
        images[ASSETS[i]].src = "data\\" + ASSETS[i] + ".png";
    }
}

/**
 * populates the page with a canvas object and required html stuff.
 */
function generatePage() {
    // create a canvas populated inside a div
    var body = document.getElementById('body');
    var gameArea = document.createElement('div');
    gameArea.setAttribute('id', 'gameArea');

    var gameCanvas = document.createElement('canvas');
    gameCanvas.setAttribute('id', 'gameCanvas');
    body.appendChild(gameCanvas);

    // and store the canvas and it's context in the dreaded global space
    canvas = gameCanvas;
    context = canvas.getContext('2d');
}

/**
 * just something to make sure the canvas stays relevant.
 */
function resizeCanvas() {
    var size = Math.min(window.innerWidth, window.innerHeight) - OUTER_PADDING;
    canvas.width = size;
    canvas.height = size;
    canvas.inner_padding = INNER_PADDING_RATIO * size / 2;
    canvas.board_size = size - 2*canvas.inner_padding;
    draw();
}

/**
 * the main draw function of the code, all draw commands should come from here and
 * anything that needs to refresh the display should call this.
 */
function draw() {
    context.fillStyle = '#996633';
    context.fillRect(0,0,canvas.width, canvas.height);

    drawBoard();
}

function onMouseClick(event) {
    var x = event.clientX - (canvas.offsetLeft - window.pageXOffset) - canvas.inner_padding;
    var y = event.clientY - (canvas.offsetTop - window.pageYOffset) - canvas.inner_padding;

    position = getBoardPositionFromXy([x,y], canvas.board_size);
}
function main() {
    loadImages();
    generatePage();
    board = new Board(STARTING_FEN);

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    canvas.addEventListener('mousedown', onMouseClick, false);
    resizeCanvas();
}

document.addEventListener('load', main());