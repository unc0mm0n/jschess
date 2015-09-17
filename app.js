var express = require('express'),
    app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var game_path = __dirname + '/public/game.html';

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(game_path);
});

console.log('listening..');
http.listen(8080);

io.on('connection', function(socket){
    socket.on('move', function(move_json) {
        var move =  movement.getMoveFromJson(move_json);
        console.log(move);
        if (gameManager.makeMove(move)) {
            io.emit('move', move_json);
        }
    });
});

var movement = require('./scripts/movement.js');
var arbiter = require('./scripts/classicChessArbiter.js')();
var gameManager = require('./scripts/gameManager.js')(arbiter, arbiter.STARTING_FEN);