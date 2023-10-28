const express = require('express')
const app = express()
const chatServer = require('http').createServer(app)
const { v4: uuidv4 } = require('uuid')
const io = require('socket.io')(chatServer, {
  cors: {
    origin: "http://localhost:3000  ",
  }
})

io.use((socket, next) => {
  const username = socket.handshake.auth.username
  console.log('username',username);
  if (!username) {
    return next(new Error('invalid username'))
  }
  socket.username = username
  next()
})

let chatRooms = [
  {
    id:'AABBHHH',
    name: "新手村一",
    desc: "菜雞才能來喔！",
    userNumber: 0,
  },
  {
    id: 'GGHHYYYOO',
    name: "無差別",
    desc: "不管你是什麼雞都可以來～",
    userNumber: 0,
  },
];

io.on('connection', (socket) => {
  const users = []
  for([id, socket] of io.of('/').sockets) {
    users.push({
      userID: id,
      username: socket.username
    })
  }
  
  socket.emit("users", users)

  socket.broadcast.emit("connect-new-user", {
    userID: socket.id,
    username: socket.username,
  })
 
  socket.on("send-lobby-message", ({ from, message, time }) => {
    socket.broadcast.emit('receive-lobby-message', {name: from, message, time})
  })

  // socket.on("joinroom", ({ roomId, time }) => {
  //   console.log('房號', roomId);
    
  //   socket.join(roomId)

  //   socket.emit("joinSuccess", {
  //     message: `您已加入${roomId}`,
  //     time,
  //   });

  //   socket.broadcast.to(roomId).emit("joinSuccess", {
  //     message: `${socket.id} 已加入${roomId}`,
  //     time,
  //   });
   
  // });

  socket.on("sendRoommessage", ({roomId, message, time}) => {
    socket.broadcast.to(roomId).emit("receiveRoommessage", {
      message,
      time
    });
  })

  socket.on("send-private-message", ({to, content, time}) => {
    socket.to(to).emit("private message", {
      from: socket.id,
      content,
      time
    })
  })

  socket.on("disconnect", () => {
    socket.broadcast.emit("user disconnect", socket.id)
  });
});

app.get('/', (req, res) => {
  res.send('hELLO')
})

// app.listen(4000)
chatServer.listen(process.env.PORT || 4001)
