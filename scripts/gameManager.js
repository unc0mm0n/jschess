/**
 * Created by Yuval on 10/09/2015.
 */
var consts = require('./constants.js');

function GameManager(arbiter, fen) {
    /**
     * This object manages an actual game, in charge of recording the game,
     * passing the moves to the arbiter and the board with all required
     * data, and generating info for the server.
     * @param fen
     * @param arbiter
     * @constructor
     */
    this.arbiter = arbiter;
    var fen_data = fen.split(" ");
    this.board = require('./board.js')(fen_data[0], fen_data[2]);
    this.players = fen_data[1] === consts.WHITE? [consts.WHITE, consts.BLACK] : [consts.BLACK, consts.WHITE];
    this.game_record = [];

    this.arbiter.observeBoard(this.board);
}

/**
 * Attempts to make a given move, if allowed by arbiter.
 * @param move Move object of the wanted move to make.
 * @returns {boolean} true if a move was made.
 */
GameManager.prototype.makeMove = function(move) {

    var specialMove = this.arbiter.getSpecialMove(move, this.players[0], this.game_record);

    if (specialMove) { // first we check if it's a special move.
        this.board.makeSpecialMove(specialMove);
        // record it
        this.game_record.push(specialMove);
        // switch to next player
        this.players.push(this.players.shift());
        // and check for game end.
        this.result = this.arbiter.getResult(this.players[0]);

        return specialMove;

    } else if (this.arbiter.isMoveLegal(move, this.players[0])) { // otherwise if it's a normal move
        // do it.
        this.board.makeMove(move);
        // record it.
        this.game_record.push(move);
        // switch to next player.
        this.players.push(this.players.shift());
        // check if game is over.
        this.result = this.arbiter.getResult(this.players[0]);

        return consts.MOVE;
    }
    return false;
};

GameManager.prototype.isOver = function() {
    return this.result;
};

GameManager.prototype.canPickSquare = function(square) {
    return this.board.pieces_by_square[square] &&
        this.board.pieces_by_square[square].color == this.players[0];
};

GameManager.prototype.getFen = function() {
    var piece_fen = this.board.getPieceFen();
    return piece_fen + ' ' + this.players[0] + ' ' + '-';
};

module.exports = function(arbiter, fen)  {
    return new GameManager(arbiter, fen);
};