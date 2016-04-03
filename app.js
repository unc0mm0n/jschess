var express = require('express'),
    app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var game_path = __dirname + '/public/game.html';
var users_queue = [];
var clients = {};
var next_id = 1;

app.set('port', (process.env.PORT || 8080));

// for game.html file to be able to access resources
app.use(express.static(__dirname + '/public'));

// send game file on access to root directory.
app.get('/', function (req, res) {
    res.sendFile(game_path);
});

io.on('connection', function(socket){

    users_queue.push(socket.id);
    clients[socket.id] = socket;

    console.log('user connected: ', socket.id);

    if (users_queue.length == 2) {
       start_game(next_id, arbiter, users_queue);
    }
    if (users_queue.length > 2) {
        io.to(socket.id).emit('initialize', gameManager.getFen());
        io.to(socket.id).emit('color', undefined);
    }

    socket.on('move', function(move_json) {
        if(!gameManager) {
            console.log('game manager not found');
            return
        }
        
        var move =  movement.getMoveFromJson(move_json);
        var move_type = gameManager.makeMove(move, this.id);
        if (move_type === consts.MOVE) {
            io.emit('move', move);
        } else if (move_type) {
            io.emit('specialMove', move_type);
        }
     });

    socket.on('disconnect', function() {

        console.log(this.id, ' disconnected')
        users_queue.splice(users_queue.indexOf(this.id), 1);
        if (gameManager.colors_by_player[this.id] && users_queue.length >= 2) {
            arbiter = require('./scripts/classicChessArbiter.js')();
            next_id++;
            start_game(next_id, arbiter, users_queue)
        }
    })
});

function start_game(game_id, arbiter, players) {
        gameManager = require('./scripts/gameManager.js')(game_id, arbiter, players);
        console.log('new game started: ', gameManager.players)
        for (var i=0; i < players.length; i++) {
            clients[players[i]].join(game_id);
            clients[players[i]].emit('color', gameManager.colors_by_player[players[i]]);
        }

        io.to(game_id).emit('initialize', gameManager.getFen());
}

var consts = require('./scripts/constants.js');
var movement = require('./scripts/movement.js');
var arbiter = require('./scripts/classicChessArbiter.js')();
var gameManager;

http.listen(app.get('port'));
console.log('listening on port ', app.get('port'));