var express = require('express'),
    app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var game_path = __dirname + '/public/game.html';

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(game_path);
});

io.on('connection', function(socket){
    socket.emit('initialize', gameManager.getFen());

    socket.on('move', function(move_json) {
        var move =  movement.getMoveFromJson(move_json);
        var move_type = gameManager.makeMove(move);
        if (move_type === consts.MOVE) {
            io.emit('move', move_json);
        } else if (move_type) {
            io.emit('specialMove', move_type);
        }
    });
});

var consts = require('./scripts/constants.js');
var movement = require('./scripts/movement.js');
var arbiter = require('./scripts/classicChessArbiter.js')();
var gameManager = require('./scripts/gameManager.js')(arbiter, arbiter.STARTING_FEN);


console.log('listening..');
http.listen(8080);