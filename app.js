var express = require('express'),
    app = express();

app.use(express.static(__dirname + '/public'));
console.log('listening..');
app.listen(8080);