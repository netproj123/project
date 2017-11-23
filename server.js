var express = require('express');
app = express();

var fs = require('fs');
var options = {
    key: fs.readFileSync('./webrtc.key'),
    cert: fs.readFileSync('./webrtc.crt')
}

var https = require('https').Server(options, app);
var io = require('socket.io')(https);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index.ejs');
})

// Testing of socket.io
app.get('/test1', function(req, res){
    res.render('test1.ejs');
});

// Testing of getUserMedia
app.get('/test2', function(req, res){
    res.render('test2.ejs');
});
    
users = [];
io.on('connection', function(socket){
    console.log('Connection Established!');
    var loggedUser;

    socket.on('setUsername', function(data) {
        //console.log(data);
        if (users.indexOf(data) > -1) {     // user already exists
            socket.emit('userExists', data + ' username is taken! Try another username.');
        }
        else {
            users.push(data);
            loggedUser = data;
            socket.emit('userSet', {username: data});
        }
    });

    socket.on('msg', function(data) {
        // Send message to everyone except myself
        socket.broadcast.emit('newmsg', data);

        // Send message to everyone including myself
        // io.sockets.emit('newmsg', data);
    });

    // ----- Signaling call -----

    socket.on('signal', function(data) {
        // Send signal to everyone except myself
        socket.broadcast.emit('signalMsg', {
            type: data.type,
            message: data.message
        });
    });


    socket.on('disconnect', function(data) {
        var index = users.indexOf(loggedUser);
        if (index > -1) {
            users.splice(index, 1);
            console.log(loggedUser + " disconnected!");
        }
        // console.log('user disconnected!');
    });
});

https.listen(8000, function(){
  console.log('listening on localhost:8000');
});