const socketIo = require("socket.io");
var listUser=[];
var listRooms = [];
var listRoomsNow = [];
const _= require('lodash');
const { async } = require("q");
const formatMessage = require('./message');
const shortid = require('shortid');
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

            //console.log(user);
            socket.join(user.room);
        
            // Welcome current user
            socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

            socket.emit('player',user);
            socket.emit("nowStep","X");
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


        socket.on('joinroom', async function (data) {

          console.log(data);
          if(!data.time)
          {
            const result = await boardModel.get({key:'id',value:data.room});
            data.time = result[0].time_for_one_step;
          }
          socket.data = data;
          socket.room = data.room;
          socket.join(data.room);
          data.user.idDevice = socket.id;
          if(!listRooms[data.room])
          {
            listRooms[data.room]={};
            listRooms[data.room].id = data.room;
            listRooms[data.room].time = data.time;
            listRooms[data.room].users = [];
          }
          
          if(!listRooms[data.room].playerO && listRooms[data.room].users.findIndex(user=>user.id == data.user.id)==-1)
          {
            listRooms[data.room].users.push(data.user);
            listRooms[data.room].playerO = data.user;
            listRooms[data.room].playerO.status = "CONNECTED";
            //io.in(data.room).emit('joinroom-success',listRooms[data.room]);
          }  

          if(!listRooms[data.room].playerX  && listRooms[data.room].users.findIndex(user=>user.id == data.user.id)==-1)
          {
            listRooms[data.room].users.push(data.user);
            listRooms[data.room].playerX = data.user;
            listRooms[data.room].playerX.status = "CONNECTED";
          }

          if(listRooms[data.room].users.findIndex(user=>user.id == data.user.id)==-1)
          {
            listRooms[data.room].users.push(data.user);
          }
          
         console.log("List room return :",listRooms[data.room]);
         if(listRooms[data.room].playerX && listRooms[data.room].playerO)
         {  
           io.in(data.room).emit('joinroom-success',listRooms[data.room]);
          //  io.to(data.room).emit('chat', {
          //     sender: "Room's Bot",
          //     message: "User "+ listRooms[data.room].playerX.name + " join room"
          //   });

          //   io.to(data.room).emit('chat', {
          //     sender: "Room's Bot",
          //     message: "User "+ listRooms[data.room].playerO.name + " join room"
          //   });
         }
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
            // socket.emit('chat', {
            //   idSender : data.idSender,
            //   sender : 'Tôi',
            //   message: data.message
            // });
            io.in(socket.room).emit('chat', {
              idSender : data.idSender,
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

            // socket.to(socket.room).emit('chat', {
            //   sender: "Room's Bot",
            //   message: "User "+ data.userInfo.name + " join room"
            // });

            // send last move in case user missed it when reconnecting
            if (listRooms[data.roomInfo.id].lastMove) {
              socket.emit('move', listRooms[data.roomInfo.id].lastMove);
            }

          }
        });


        socket.on('play-again-request', function (data) {
            socket.to(socket.room).emit('play-again-request', data);
        });

        socket.on('play-again-result', function (data) {
          socket.to(socket.room).emit('play-again-result', data);
        });

        socket.on('undo-result', function (data) {
          socket.to(socket.room).emit('undo-result', data);
        });
        
        socket.on('undo-request', function (data) {
          socket.to(socket.room).emit('undo-request', data);
      });

        socket.on('surrender-request', function (data) {
            socket.to(socket.room).emit('surrender-request', '');
        });
      
        socket.on('surrender-result', function (data) {
          socket.to(socket.room).emit('surrender-result', data);
          io.in(socket.room).emit('winner',data.winnerId);
        });

        socket.on('ceasefire-request', function (data) {
            socket.to(socket.room).emit('ceasefire-request', data);
        });

        socket.on('ceasefire-result', function (data) {
          socket.to(socket.room).emit('ceasefire-result', data);
          io.in(socket.room).emit('winner',"draw");
        });
        
        socket.on('endgame', function (data) {
          io.in(socket.room).emit('endgame',data);
          io.in(socket.room).emit('winner',data.winnerId);
        });
       
        socket.on('invitation', function (data) {
          io.emit("invitation",data);
        });

        socket.on('reject-invited', function (data) {
          io.emit("reject-invited",data);
        });

        socket.on('accept-invited', function (data) {
          io.emit("accept-invited",data);
        });

        socket.on('findPlayer', function (data) {
  
          // save data
          socket.data = data;
      
          // find an empty room
          for (var i = 0; i < listRoomsNow.length; i++) {
      
            // it's empty when there is no second player
            if (listRoomsNow[i].playerO == null && data.point == listRoomsNow[i].playerX.point) {
      
              // fill empty seat and join room
              listRoomsNow[i].playerO = data;
              listRoomsNow[i].users.push(data);
              socket.room = listRoomsNow[i].id;
              socket.join(socket.room);
      
              // send successful message to both
              io.in(listRoomsNow[i].id).emit('joinroom-now-success', listRoomsNow[i]);
             
              console.log('Room [' + socket.room + '] played');
              //delete listRoomsNow[i];
              return;
            }
          }
      
          // create new room if there is no empty one
          var room = {
            id: data.name + Date.now(),
            playerX: data,
            playerO: null,
            time: 10,
            users: []
          }
          room.users.push(data);
          listRoomsNow.push(room);
      
          // add this client to the room
          socket.room = room.id;
          socket.join(socket.room);
      
          console.log('Room [' + socket.room + '] created');
        });
        

        socket.on("cancelFindPlayer",function(data)
        {
            for(let i=0;i<listRoomsNow.length;i++)
            {
              if(listRoomsNow[i].playerX.id == data.id)
              {
                delete listRoomsNow[i];
              }
            }
            console.log("List room now :", listRoomsNow);
        })

        //------------------------------------------------------------------------------------



        socket.on("disconnect", async (data) => {
            //  console.log("Client disconnected", socket.room);
            // listUser = listUser.filter(user=>user.idDevice != socket.id)
            // io.emit("listonline",listUser);
          
           // clearInterval(interval);
           if(socket.room)
           {
            const pos = listRooms[socket.room].users.findIndex(user => user.idDevice == socket.id);
            // if(pos>=0)
            // {
            //   socket.to(socket.room).emit('chat', {
            //     sender: "Room's Bot",
            //     message: "User "+ listRooms[socket.room].users[pos].name + " left room"
            //   });
            // }
            listRooms[socket.room].users.splice(pos,1);
            console.log("pos: ",pos);
            console.log("List users: ",listRooms[socket.room]);
            socket.emit('joined-room',listRooms[socket.room]);

            socket.removeAllListeners();
            socket.leave(socket.room);

            console.log("Client disconnected",socket.data);
            console.log("Room: ",listRooms[socket.room]);

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