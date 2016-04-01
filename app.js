var express = require('express'),
    app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var game_path = __dirname + '/public/game.html';
var users_queue = [];
var clients = {};
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
    console.log('user connected: ', socket.id, users_queue);
    if (users_queue.length == 2) {
        gameManager = require('./scripts/gameManager.js')(1, arbiter, [users_queue[0], users_queue[1]]);
        clients[users_queue[0]].join('1');
        clients[users_queue[1]].join('1');

        for(var i=0; i < gameManager.players.length; i++) {
            var player_id=gameManager.players[i];
            console.log(clients[player_id].id, player_id);
            clients[player_id].emit('color', gameManager.colors_by_player[player_id]);
        }
        io.to('1').emit('initialize', gameManager.getFen());
    }
    if (users_queue.length > 2) {
        io.to(socket.id).emit('initialize', gameManager.getFen());
        io.to(socket.id).emit('color', "observer");
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

    socket.on('disconnect', function() {
        console.log(socket.id, ' disconnected')
        users_queue.splice(users_queue.indexOf(socket.id), 1);
        if (gameManager.colors_by_player[socket.id] && users_queue.length >= 2) {
            gameManager = require('./scripts/gameManager.js')(arbiter, [users_queue[0], users_queue[1]], arbiter.STARTING_FEN);
            io.emit('initialize', gameManager.getFen()); 
        }
    })
});

var consts = require('./scripts/constants.js');
var movement = require('./scripts/movement.js');
var arbiter = require('./scripts/classicChessArbiter.js')();
var gameManager;

http.listen(app.get('port'));
console.log('listening on port ', app.get('port'));