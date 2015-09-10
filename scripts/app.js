var express = require('express'),
    app = express();

var path = 'l:\\Projects\\JavaScript\\chessAttempt'
app.use(express.static(path + '/public'));
console.log('listening..');
app.listen(8080);