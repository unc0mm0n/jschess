
/************************ game.js
 *
 * main file of the game.
 */

var OUTER_PADDING = 30;
var INNER_PADDING_RATIO = 0.1;
var GAME_CONTEXT = '2d';
var COLOR_LIGHT_SQUARES = '#66FF66';
var COLOR_DARK_SQUARES = '#336600';
var COLOR_SELECTED_SQUARE = '#FBB117';

// name of all the files to load. files must be located in data folder and be *.png.
var ASSETS = ['WKing', 'WQueen', 'WRook', 'WKnight', 'WBishop', 'WPawn',
        'BKing', 'BQueen', 'BRook', 'BKnight', 'BBishop', 'BPawn'];

// UPDATED STUFF..."""""
// dreaded globals.
var context;
var canvas;
var images = {};
var gameManager;

var picked_square = null;

/**
 * loads all images to the dreaded global space..
 */
function loadImages() {
    for (i = 0; i < ASSETS.length; i++) {
        images[ASSETS[i]] = new Image();
        images[ASSETS[i]].onload = function() {draw()};
        images[ASSETS[i]].src = "images\\" + ASSETS[i] + ".png";
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

    drawBoard(canvas, gameManager.board, COLOR_LIGHT_SQUARES, COLOR_DARK_SQUARES);
}

/**
 *
 * handles mouse events as long as the game runs
 * @param event the mouse event.
 */
function onMouseClick(event) {

    var x = event.clientX - (canvas.offsetLeft - window.pageXOffset) - canvas.inner_padding;
    var y = event.clientY - (canvas.offsetTop - window.pageYOffset) - canvas.inner_padding;

    var square = getSquareFromXy([x,y], canvas.board_size);

    if (picked_square) { // if we already picked a piece, move it.
        gameManager.makeMove(new Move(picked_square, square));
        picked_square = null;
        draw();
    } // if we haven't picked a piece yet, but we can pick a piece, do so.
    else if (!picked_square && gameManager.canPickSquare(square)) {
        picked_square = square;
        markSquare(canvas, square, gameManager.board, COLOR_SELECTED_SQUARE);
    }
    if (gameManager.isOver()) updateGameOver();
}
/**
 * updates the result to the screen.
 */
function updateGameOver() {
    window.alert(gameManager.result);
    console.log(gameManager.game_record);
}

function main() {
    loadImages();
    generatePage();

    var arbiter = new ClassicChessArbiter();
    gameManager = new GameManager(arbiter, arbiter.STARTING_FEN);

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    canvas.addEventListener('mousedown', onMouseClick, false);
    resizeCanvas();
}

document.addEventListener('load', main());