
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

// dreaded globals.
var context;
var canvas;
var images = {};
var board;
var arbiter;

var picked_square = null;

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

    drawBoard(canvas, board, COLOR_LIGHT_SQUARES, COLOR_DARK_SQUARES);
}

/**
 * handles mouse events as long as the game runs
 * @param event the mouse event.
 */
function onMouseClick(event) {

    if (result) return;
    var x = event.clientX - (canvas.offsetLeft - window.pageXOffset) - canvas.inner_padding;
    var y = event.clientY - (canvas.offsetTop - window.pageYOffset) - canvas.inner_padding;

    var square = getSquareFromXy([x,y], canvas.board_size);

    if (picked_square) { // if we already picked a piece, move it.
        move = new Move(picked_square, square);
        if (arbiter.isMoveLegal(move, board.current_player)) {
            board.makeMove(move);
        } else {
            var specialMove = arbiter.getSpecialMove(move, board.current_player);
            if (specialMove) {
                board.makeSpecialMove(specialMove);
            }
        }

        picked_square = null;
        result = arbiter.getResult(board.current_player);
        draw();

        if (result)updateResult(result);
    } // if we haven't picked a piece yet, but we can pick a piece, do so.
    else if (!picked_square && board.pieces_by_square[square]) {
        if (board.pieces_by_square[square].color == board.current_player) {
            picked_square = square;
            markSquare(canvas, square, board, COLOR_SELECTED_SQUARE);
        }
    }
}
/**
 * updates the result to the screen.
 * @param result result of the game
 */
function updateResult(result) {

}

function main() {
    loadImages();
    generatePage();

    arbiter = new ClassicChessArbiter();
    board = new Board(arbiter.STARTING_FEN);
    arbiter.observeBoard(board);
    result = null;

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    canvas.addEventListener('mousedown', onMouseClick, false);
    resizeCanvas();
}

document.addEventListener('load', main());