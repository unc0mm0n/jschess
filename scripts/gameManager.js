/**
 * Created by Yuval on 10/09/2015.
 */
var consts = require('./constants.js');

function GameManager(game_id, arbiter, player_ids, fen) {
    /**
     * This object manages an actual game, in charge of recording the game,
     * passing the moves to the arbiter and the board with all required
     * data, and generating info for the server.
     * @param fen starting fen for the game, if none is given arbiter.STARTING_FEN is called.
     * @param arbiter rules arbiter for the game
     * @param players Array of players in order of play (as dictated by the arbiter).
     * @constructor
     */
    this.arbiter = arbiter;
    if (!fen) {
        fen = arbiter.STARTING_FEN;
    }
    var fen_data = fen.split(" ");
    this.board = require('./board.js')(fen_data[0], fen_data[2]);
    this.players = player_ids;
    this.colors_by_player = this.pairColors(player_ids);
    this.game_record = [];
    this.game_id = game_id;
    this.arbiter.observeBoard(this.board);
}

/**
 * Attempts to make a given move, if allowed by arbiter.
 * @param move Move object of the wanted move to make.
 * @returns {boolean} true if a move was made.
 */
GameManager.prototype.makeMove = function(move, player_id) {
    var player = this.colors_by_player[player_id];

    if(!player) {
        console.log('invalid player ',player_id);
        console.log(this.colors_by_player);
        return false;
    }

    var specialMove = this.arbiter.getSpecialMove(move, player, this.game_record);

    if (specialMove) { // first we check if it's a special move.
        console.log('is special')
        this.board.makeSpecialMove(specialMove);
        // record it
        this.game_record.push(specialMove);
        // and check for game end.
        this.result = this.arbiter.getResult(player);

        this.arbiter.last_moving_player = player;

        return specialMove;
    console.log(' checking normal move legality')
    } else if (this.arbiter.isMoveLegal(move, this.colors_by_player[player_id])) { // otherwise if it's a normal move
        // do it.
        this.board.makeMove(move);
        // record it.
        this.game_record.push(move);
        // check if game is over.
        this.result = this.arbiter.getResult(player);

        this.arbiter.last_moving_player = player;
        
        return consts.MOVE;
    }
    return false;
};

GameManager.prototype.pairColors = function(player_ids) {
    players = {}
    var colors = this.arbiter.getColors()
    for (var i=0; i < player_ids.length; i++) {
        players[player_ids[i]] = colors[i];
    }
    return players;
}

GameManager.prototype.isOver = function() {
    return this.result;
};

GameManager.prototype.getFen = function(current_player_id) {
    var piece_fen = this.board.getPieceFen();
    return piece_fen + ' ' + this.colors_by_player[current_player_id] + ' ' + '-';
};

module.exports = function(game_id, arbiter, players, fen)  {
    return new GameManager(game_id, arbiter, players, fen);
};