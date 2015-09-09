/*** inclueds all functions that are supposed to draw the game **/

/**
 * draws the chess board itself on screen, ignoring the border, and using the global canvas for sizes.
 */
function drawBoard(canvas, board, light_color, dark_color) {
    var context = canvas.getContext(GAME_CONTEXT);
    // just iterate over every square of the chess board and fill it with some color, for now..
    for (var i=1; i <= 8; i++) {
        for (var j=1; j <= 8; j++) {
            xy_values = getXyFromBoardPosition([i, j], canvas.board_size);
            square_size = canvas.board_size/8;

            // bottom left corner is black.. that is how chess works.
            if ( (i+j) % 2 === 1) {
                context.fillStyle = dark_color;
            } else {
                context.fillStyle = light_color;
            }

            context.fillRect(xy_values[0] + canvas.inner_padding,
                xy_values[1] + canvas.inner_padding,
                square_size,
                square_size);
        }
    }
    drawPieces(canvas, board);
}

/**
 * draw the pieces on screen, using the global board element as the board and the global canvas for sizes.
 */
function drawPieces(canvas, board) {
    for (piece in board.pieces_by_position) {
        if (!board.pieces_by_position.hasOwnProperty(piece)) continue;

        drawPiece(canvas, board.pieces_by_position[piece]);
    }
}

/**
 * draws a single piece to the screen
 * @param canvas the canvas to draw on
 * @param piece the piece to draw
 * @param board the board
 */
function drawPiece(canvas, piece, board) {
    var context = canvas.getContext(GAME_CONTEXT);
    // get the location data from the position, as having it as a key
    // turns it into a string.

    // get the coordinates on board accordingly, and calculate the current square size.
    xy_values = getXyFromBoardPosition(piece.position ,canvas.board_size);
    square_size = canvas.board_size / 8;

    piece_type = piece.type;
    piece_color = piece.color;
    // use the useful, and terribly written, helper function to get the image name.
    image_name = getImageFromTypeColor(piece_type, piece_color);

    // draw the image onto the canvas.
    context.drawImage(images[image_name],
        xy_values[0]+canvas.inner_padding,
        xy_values[1]+canvas.inner_padding,
        square_size,
        square_size);
}

/** marks a square with given color
 *
 */
function markSquare(color) {
    
}