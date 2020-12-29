const socketIo = require("socket.io");
var listUser=[];
const _= require('lodash');
const { async } = require("q");
const { boards: boardModel } = require("../models/index")
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

exports.connect=(server)=>
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
           console.log("Message:", message);
           if(_.findIndex(listUser,{id:message.id})<0)
           {
                listUser.push({...message,idDevice:socket.id});
           }
           console.log("New list user",listUser);
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
          boardModel.belongsTo(userModel,{foreignKey: 'created_by', targetKey: 'id'})
          const boards = await boardModel.findAll(
            {
            include:[
              {
              model: userModel,
              attributes: ["name"]
              }
            ]
          }
          );
            
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

        socket.on("move",(data)=>{
          const user = getCurrentUser(socket.id);
          //const newBoard=newBoard(data);
          const newData = {
            i:data.i,
            player: data.player,
            stepNumber: data.stepNumber,
            history:data.history,
            currentRole:data.currentRole
          }
          console.log(newData);
          socket.broadcast.to(user.room).emit("move",newData);
        })

        socket.on("disconnect", async (data) => {
            console.log("Client disconnected", socket.id);
            const index = _.findIndex(listUser,{idDevice:socket.id});
            console.log(index);
            if(index>=0)
            {
                listUser.splice(index,1);
                console.log("List client after disconnect: ",listUser);
                io.sockets.emit("listonline",listUser);
            }
            console.log("List client after disconnect1: ",listUser);
            io.sockets.emit("listonline",listUser);
            //clearInterval(interval);

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
        });



    })

}