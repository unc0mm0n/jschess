
/************************ game.js
 *
 * main file of the game.
 */

var STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
var OUTER_PADDING = 30;
var INNER_PADDING_RATIO = 0.1;
var LIGHT_SQUARE_COLOR = '#66FF66';
var DARK_SQUARE_COLOR = '#336600';

// name of all the files to load. files must be located in data folder and be *.png.
var ASSETS = ['WKing', 'WQueen', 'WRook', 'WKnight', 'WBishop', 'WPawn',
        'BKing', 'BQueen', 'BRook', 'BKnight', 'BBishop', 'BPawn'];

var context;
var canvas;
var images = {};
var board;

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
 * draws the chess board itself on screen, ignoring the border, and using the global canvas for sizes.
 */
function drawBoard() {
    // just iterate over every square of the chess board and fill it with some color, for now..
    for (var i=1; i <= 8; i++) {
        for (var j=1; j <= 8; j++) {
            xy_values = getBoardPosition([i, j], canvas.board_size);
            square_size = canvas.board_size/8;

            // bottom left corner is black.. that is how chess works.
            if ( (i+j) % 2 === 1) {
                context.fillStyle = LIGHT_SQUARE_COLOR;
            } else {
                context.fillStyle = DARK_SQUARE_COLOR;
            }

            context.fillRect(xy_values[0] + canvas.inner_padding,
                xy_values[1] + canvas.inner_padding,
                square_size,
                square_size);
        }
    }
    drawPieces();
}

/**
 * draw the pieces on screen, using the global board element as the board and the global canvas for sizes.
 */
function drawPieces() {
    for (piece in board.pieces) {
        if (!board.pieces.hasOwnProperty(piece)) continue;

        // get the location data from the position, as having it as a key
        // turns it into a string.
        file = Number(piece[0]);
        rank = Number(piece[2]);

        // get the coordinates on board accordingly, and calculate the current square size.
        xy_values = getBoardPosition([file, rank] ,canvas.board_size);
        square_size = canvas.board_size / 8;

        piece_type = board.pieces[piece].type;
        piece_color = board.pieces[piece].color;
        // use the useful, and terribly written, helper function to get the image name.
        image_name = getImageFromTypeColor(piece_type, piece_color);

        // draw the image onto the canvas.
        context.drawImage(images[image_name],
            xy_values[0]+canvas.inner_padding,
            xy_values[1]+canvas.inner_padding,
            square_size,
            square_size);
    }
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

function main() {
    loadImages();
    generatePage();
    board = new Board(STARTING_FEN);

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
}

document.addEventListener('load', main());