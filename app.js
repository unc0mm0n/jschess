var express = require('express'),
    app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var game_path = __dirname + '/public/game.html';
var connected_users = [];

// for game.html file to be able to access resources
app.use(express.static(__dirname + '/public'));

// send game file on access to root directory.
app.get('/', function (req, res) {
    res.sendFile(game_path);
});

io.on('connection', function(socket){
    connected_users.push(socket.id);
    console.log('user connected: ', socket.id);
    if (connected_users.length >= 2) {
        if (!gameManager) {
            gameManager = require('./scripts/gameManager.js')(arbiter, [connected_users[0], connected_users[1]], arbiter.STARTING_FEN);
        }

        io.emit('initialize', gameManager.getFen());
    
    }
    socket.on('move', function(move_json) {
        if(!gameManager) {
            return
        }
        
        var move =  movement.getMoveFromJson(move_json.move);
        var move_type = gameManager.makeMove(move, move_json.player_id);
        console.log('move recieved: ', move_type)
        if (move_type === consts.MOVE) {
            io.emit('move', move);
        } else if (move_type) {
            io.emit('specialMove', move_type);
        }
     });
});




var consts = require('./scripts/constants.js');
var movement = require('./scripts/movement.js');
var arbiter = require('./scripts/classicChessArbiter.js')();
var gameManager;



console.log('listening..');
http.listen(8080);