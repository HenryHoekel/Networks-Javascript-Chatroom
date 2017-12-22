/*
  Henry Hoekel
  14207985
  December 2nd, 2017
  Chat room written for multiple users to use at once with client
  and server side relations.

  Uses sockets.io
*/


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 17985;


var fs = require('fs');
var numUsers= 0;

//default web page for when a user accesses the website
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//server serves web page for create user page
app.get('/createUser', function(req, res){
  res.sendFile(__dirname + '/createUser.html');
});

//server serves web page for chat page
app.get('/chat',function(req, res){
  res.sendFile(__dirname + '/chat.html');
})

//server serves web page for login page
app.get('/login',function(req,res){
  res.sendFile(__dirname + '/login.html');
})

//function when user connects
io.on('connection', function(socket){
  var addedUser = false;

  //function when user disconnects --> prints on server
  socket.on('disconnect', function(){
    if(socket.username == undefined){
      if(addedUser == false){
        return;
      }
      console.log("Guest disconnected");
    }
    else{
      if(numUsers!=0){
        numUsers--;
      }
      console.log("USER: "+socket.username+ " disconnected");
    }
  });

  //actually use this function for sending messages
  socket.on('new message',function(data){
    //check if message was empty--> if it is don't process
    if(data == ""){
      console.log("Error: Message sent was empty. Message not sent.");
      var nullMessage = "message was empty, try again";
      io.emit('ERROR: MESSAGE WAS NULL',nullMessage);
    }
    //message not null
    else{
      //check if guest logged in
      if(socket.username == undefined){
        var message = "Guest's message: "+data
        console.log(message);
        io.emit('new message',message);
      }
      //user is logged in
      else{
        var message = socket.username+"'s message: " + data;
        console.log(message);
        io.emit('new message', message);
      }
    }
  });

  /*
  //function to handle chat messages (OLD FUNCTION DON'T USE)
  socket.on('chat message', function(msg){
    if(msg == ""){
      console.log("Error: Message sent was empty. Message not sent.");
      var nullMessage = "message was empty, try again";
      io.emit('ERROR: MESSAGE WAS NULL',nullMessage);
    }
    else{
      console.log('message: ' + msg);
      io.emit('chat message', msg);
    }
  });*/

  //function to add a user to the chatroom and "database"
  socket.on('add user', function(username,password){
    if(addedUser){
      return;
    }
    addedUser = true;
    ++numUsers;
    //check if guest
    if(username=='guest'){
      addedUser = true;
      console.log('Guest user joined');
    }
    //user logged in
    else{
      socket.emit('login', {
        numUsers: numUsers
      });
      //set username
      socket.broadcast.emit('user joined',{
        username: socket.username,
        numUsers: numUsers
      });
      socket.username = username;
      var testWrite = "("+username+","+password+")";
      var logger = fs.createWriteStream('users.txt', {
        flags: 'a' // 'a' means appending (old data will be preserved)
      });
      logger.write(testWrite);
      //log to server side
      console.log("USER: "+username+" joined");
    }
  });

  //function to log in user
  socket.on('login user',function(user){
    socket.username= user;
    numUsers++;
    //log server side that someone joined
    console.log(user+ 'joined.');
  });

  //helper function to check login
  socket.on('check login',function(username,password){
    readFile();
  });
});

//helper function to read "database" of users
fs.readFile('./users.txt','utf-8', function(err,data){
  var str = data;
  var arr = data.split("(");
});

http.listen(17985, function(){
  console.log('listening on *:' + port);
});
