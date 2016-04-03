var express = require('express'),
    app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var game_path = __dirname + '/public/game.html';

var users_queue = [];
var clients = {};
var games = {};
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

    while (users_queue.length >= 2) {
        var arbiter = require('./scripts/classicChessArbiter.js')();
        games[next_id] = get_new_game(next_id, arbiter, users_queue.splice(0,2));
        next_id++;
    }

    socket.on('move', function(move_json) {
        
        var move =  movement.getMoveFromJson(move_json);
        var move_type = games[this.game_id].makeMove(move, this.id);
        if (move_type === consts.MOVE) {
            io.in(this.game_id).emit('move', move);
        } else if (move_type) {
            io.in(this.game_id).emit('specialMove', move_type);
        }
     });

    socket.on('disconnect', function() {

        if (this.game_id && games[this.game_id].colors_by_player[this.id]) {
            for (var i=0; i < games[this.game_id].players.length; i++) {
                if (games[this.game_id].players[i] !== this.id) {
                    users_queue.push(games[this.game_id].players[i])
                }
            }
            console.log('user in game disconnected, ',this.id, users_queue);
        } else {
            users_queue.splice(users_queue.indexOf(this.id), 1);
        }

        while (users_queue.length >= 2) {
           var arbiter = require('./scripts/classicChessArbiter.js')();
           games[next_id] = get_new_game(next_id, arbiter, users_queue.splice(0,2));
           next_id++;
        }
    })
});

function get_new_game(game_id, arbiter, players) {

    var gameManager = require('./scripts/gameManager.js')(arbiter, players);

    console.log('new game started: ', gameManager.players)
    for (var i=0; i < players.length; i++) {
        
        socket = clients[players[i]];
        
        if (!socket.games) {
            socket.games = [game_id]
        } else {
            socket.games.push(game_id)
        }

        socket.join(game_id);
        socket.game_id = game_id;
        socket.emit('color', gameManager.colors_by_player[players[i]]);
    }

    io.to(game_id).emit('initialize', gameManager.getFen());
    return gameManager
}

var consts = require('./scripts/constants.js');
var movement = require('./scripts/movement.js');

http.listen(app.get('port'));
console.log('listening on port ', app.get('port'));