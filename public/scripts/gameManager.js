/**
 * Created by Yuval on 10/09/2015.
 */

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
    this.board = new Board(fen);
    this.players = this.board.players;
    this.game_record = [];

    this.arbiter.observeBoard(this.board);
}

/**
 *
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

    } else if (this.arbiter.isMoveLegal(move, this.players[0])) { // otherwise if it's a normal move
        // do it.
        this.board.makeMove(move);
        // record it.
        this.game_record.push(move);
        // switch to next player.
        this.players.push(this.players.shift());
        // check if game is over.
        this.result = this.arbiter.getResult(this.players[0]);

    }
};

GameManager.prototype.isOver = function() {
    return this.result;
};

GameManager.prototype.canPickSquare = function(square) {
    return this.board.pieces_by_square[square] &&
        this.board.pieces_by_square[square].color == this.players[0];
};