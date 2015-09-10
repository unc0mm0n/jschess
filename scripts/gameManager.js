/**
 * Created by Yuval on 10/09/2015.
 */

/**
 * The class to manage an actual game, in charge of recording the game,
 * passing the moves to the arbiter and the board with all required
 * data, and generating info for the server.
 * @param board
 * @param arbiter
 * @constructor
 */
function GameManager(board, arbiter) {
    arbiter.observeBoard(board);
}