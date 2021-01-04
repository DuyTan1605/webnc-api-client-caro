const socketIo = require("socket.io");
var listUser=[];
var listRooms = [];
const _= require('lodash');
const { async } = require("q");
const { boards: boardModel1 } = require("../models/index")
const { users: userModel } = require("../models/index")
const formatMessage = require('./message');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./users');

const {
 newMove
} = require("./board");

const botName = "CHAT BOT ROOM";
const boardModel = require("../model/board.model");

exports.connect = (server)=>
{
    //onsole.log("Initial install socket")
    const io = socketIo(server, {cors: {
        origin: '*',
      }});

    io.on("connection", (socket) => {
       console.log("List user now",listUser);

       
        socket.on('connect',async () => {
            console.log("Socket connected with id: ",socket.id); // true
        });

        socket.on('login', async(message) => {
         //  console.log("Message:", message);
           if(_.findIndex(listUser,{id:message.id})<0)
           {
                listUser.push({...message,idDevice:socket.id});
           }
           // console.log("New list user",listUser);
            io.emit("listonline",listUser);
        });
        
        socket.on('logout', async(message) => {
            console.log("User disconnected with id="+ message.id);
            listUser = _.filter(listUser,function(user)
            {
                return user.id!=message.id;
            })
            console.log("List user after log out",listUser);
            io.emit("listonline",listUser)

         });

        
        socket.on("listBoard", async ()=>{
          
            const boards = await boardModel.all();
            console.log("Boards ", boards);
            io.emit("listBoard",boards);
        })

        socket.on("listUser", async ()=>{
            io.emit("listonline",listUser);
        })
        //-------------------------------------------CHAT ROOM--------------------------------------------

        socket.on('joinRoom', ({ username, room }) => {
            const user = userJoin(socket.id, username, room);
        
            socket.join(user.room);
        
            // Welcome current user
            socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
            socket.emit('player',user.player);
            // Broadcast when a user connects
            socket.broadcast
              .to(user.room)
              .emit(
                'message',
                formatMessage(botName, `${user.username} has joined the chat`)
              );
        
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
              room: user.room,
              users: getRoomUsers(user.room)
            });
          });
        
        socket.on('chatMessage', msg => {
            const user = getCurrentUser(socket.id);
        
            io.to(user.room).emit('message', formatMessage(user.username, msg));
        });

        socket.on("leaveRoom",()=>{
            
            const user = userLeave(socket.id);
            console.log("User leave",socket.id);
            if (user) {
              io.to(user.room).emit(
                'message',
                formatMessage(botName, `${user.username} has left the chat`)
              );
        
              // Send users and room info
              io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
              });
              console.log("data after leave room:",{
                room: user.room,
                users: getRoomUsers(user.room)
              } )
            }
        })

        // socket.on("move",(data)=>{
        //   const user = getCurrentUser(socket.id);
        //   //const newBoard=newBoard(data);
        //   const newData = {
        //     i:data.i,
        //     player: data.player,
        //     stepNumber: data.stepNumber,
        //     history:data.history,
        //     currentRole:data.currentRole
        //   }
        //   console.log(newData);
        //   socket.broadcast.to(user.room).emit("move",newData);
        // })

        //--------------------------------------------------------------------------------


        socket.on('joinroom', function (data) {

         
          socket.data = data;
          socket.room = data.room;
          socket.join(data.room);
          if(!listRooms[data.room])
          {
            listRooms[data.room]={};
            listRooms[data.room].id = data.room;
            listRooms[data.room].users = [];
          }
          console.log(!listRooms[data.room].users.findIndex(user=>user.id == data.user.id))
          if(!listRooms[data.room].playerO && listRooms[data.room].users.findIndex(user=>user.id == data.user.id)==-1)
          {
            listRooms[data.room].users.push(data.user);
            listRooms[data.room].playerO = data.user;
            listRooms[data.room].playerO.status = "CONNECTED";
            console.log("List room return :",listRooms[data.room]);
            //io.in(data.room).emit('joinroom-success',listRooms[data.room]);
          }  

          if(!listRooms[data.room].playerX  && listRooms[data.room].users.findIndex(user=>user.id == data.user.id)==-1)
          {
            listRooms[data.room].users.push(data.user);
            listRooms[data.room].playerX = data.user;
            listRooms[data.room].playerX.status = "CONNECTED";
            console.log("List room return :",listRooms[data.room])
            
          }

          if(listRooms[data.room].users.findIndex(user=>user.id == data.user.id)==-1)
          {
            listRooms[data.room].users.push(data.user);
          }
          io.in(data.room).emit('joinroom-success',listRooms[data.room]);
          io.emit('joined-room',listRooms[data.room]);
        });


        socket.on("joined-room",function(data)
        {
        
            if(listRooms[data.id])
            {
              console.log(data);
              socket.emit('joined-room',listRooms[data.id]);
            }
            return null;
        })

        socket.on('chat', function (data) {
          console.log(socket.room);
            socket.emit('chat', {
              sender: 'Tôi',
              message: data.message
            });
            socket.to(socket.room).emit('chat', {
              sender: data.sender,
              message: data.message
            });
        });

        socket.on('move', function (data) {
  
          console.log(data);
          socket.to(socket.room).emit('move', data);
          
          listRooms[socket.room].lastMove = data;
        });

        socket.on('on-reconnect', function (data) {
          
          console.log("On reconnected:", listRooms);
          // find the room
          if (data.roomInfo) {
      
            socket.data = data.userInfo;
            
            if (listRooms[data.roomInfo.id].playerO.status === 'DISCONNECTED') {
              listRooms[data.roomInfo.id].playerO.status = "CONNECTED";
            }
            else {
              listRooms[data.roomInfo.id].playerX.status = "CONNECTED";
            }

            socket.room = listRooms[data.roomInfo.id].id;
            socket.join(socket.room);
            console.log("Socket room:",listRooms[data.roomInfo.id])
            io.in(socket.room).emit('on-reconnect', listRooms[data.roomInfo.id]);
            
            // send last move in case user missed it when reconnecting
            if (listRooms[data.roomInfo.id].lastMove) {
              socket.emit('move', listRooms[data.roomInfo.id].lastMove);
            }

          }
        });

        //------------------------------------------------------------------------------------



        socket.on("disconnect", async (data) => {
             console.log("Client disconnected", socket.room);
            listUser = listUser.filter(user=>user.idDevice != socket.id)
            io.emit("listonline",listUser);
            console.log(socket.data);
           // clearInterval(interval);

           if(socket.room)
           {
            socket.removeAllListeners();
            socket.leave(socket.room);

            if (listRooms[socket.room].playerO.id === socket.data.id) {
              listRooms[socket.room].playerO.status = 'DISCONNECTED';
            }
            else {
              listRooms[socket.room].playerX.status = 'DISCONNECTED';
            }
            
            if (listRooms[socket.room].playerO.status === 'DISCONNECTED' && listRooms[socket.room].playerX.status === 'DISCONNECTED') {
    
              // destroy the room
              listRooms.splice(socket.room, 1);
            // console.log('Room [' + socket.room + '] destroyed');
            } else {
            
              // inform the other
              io.to(listRooms[socket.room].id).emit('disconnect1', listRooms[socket.room]);
            }
          }
            // const user = userLeave(socket.id);
            // console.log("User leave",socket.id);
            // if (user) {
            //   io.to(user.room).emit(
            //     'message',
            //     formatMessage(botName, `${user.username} has left the chat`)
            //   );
        
            //   // Send users and room info
            //   io.to(user.room).emit('roomUsers', {
            //     room: user.room,
            //     users: getRoomUsers(user.room)
            //   });
            //   console.log("data after leave room:",{
            //     room: user.room,
            //     users: getRoomUsers(user.room)
            //   } )
            // }
        });



    })

}