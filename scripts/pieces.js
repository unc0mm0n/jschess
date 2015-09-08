/****************
 * Will be used to hold the pieces prototype.
 * pP - pawn
 * bB - bishop
 * rR - rook
 * nN - knight
 * qQ - queen
 * kK - king
 ****************/
function Piece(position) {
    this.position = position;
}

Piece.prototype.test = functino() {
    console.log(this + "was tested");
}

Pawn.prototype = new Piece();
    