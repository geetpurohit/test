// Define modules
const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const formatMessage = require('./utils/messages');
const { 
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/users');


// Express configuration
app.set('view engine', 'ejs');
//app.use(express.static('public'));
 
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

//so basically i can run this on my local computer but now socket will let a client connect to this
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room); //takes in an id, username and a romm

        socket.join(user.room);
        
        //this is to welcome somebody
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));        
        
        //this is like a global version of a message. like not static.
        socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

      io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
      });
    });

    //listen for chatMessage
    socket.on('chatMessage', msg =>{
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message', formatMessage(user.username , msg));
    });

    //this is to tell everyone someone disconnected 
    socket.on('disconnect', () => {
       const user = userLeave(socket.id);

       if (user) {
           io.to(user.room).emit(
               'message',
               formatMessage(botName, `${user.username} has left the chat.`)
           );

           io.to(user.room).emit(`roomUsers`, {
               room: user.room,
               users: getRoomUsers(user.room)
           });
        }
    });
}); 
 
const PORT = process.env.PORT  || 4000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//geet end

// This is me contributing

// This is me contributing again

// Third contributions

//Plz work
// server.listen(port, () => {
//     console.log(`Listening on port ${port}`);
//     console.log('Hello world!')
// });