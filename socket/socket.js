const socketIo = require("socket.io");
var listUser=[];
const _= require('lodash');
const { boards: boardModel } = require("../models/index")
const { users: userModel } = require("../models/index")
const { history: historyModel } = require("../models/index")
const formatMessage = require('./message');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getDataFromRoom
} = require('./users');


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
            console.log("Emit board");
            boardModel.belongsTo(userModel,{foreignKey:'created_by',targetKey:'id'});

            const boards = await boardModel.findAll(
              {
                include: [
                  {
                    model: userModel,
                    attributes: ['name']
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

        socket.on('joinRoom', ({ username, room,idUser }) => {
            const user = userJoin(socket.id, username, room,idUser);
            const numberUser=getRoomUsers(room).length;

            //console.log(user);
            socket.join(user.room);
        
            // Welcome current user
            socket.emit('message', formatMessage(botName, 'Welcome !'));

            socket.emit('player',user);
            socket.emit("nowStep","X");
            // Broadcast when a user connects
            socket.broadcast
              .to(user.room)
              .emit(
                'message',
                formatMessage(botName, `${user.username} has joined room`)
              );
        
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
              room: user.room,
              users: getRoomUsers(user.room)
            });
            console.log(numberUser);
            if(numberUser<2)
            {
              io.to(user.room).emit("gameStart",false)
            }
            else{
              io.to(user.room).emit("gameStart",true);
            }
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
                formatMessage(botName, `${user.username} has left room`)
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

        //-------------------------------PLAY GAME----------------------------------


        socket.on("move",data=>{
          console.log(data);
          socket.broadcast
          .to(data.room).emit("move",data);
        })

        // socket.on("nowStep",data=>{
        //   socket.broadcast
        //   .to(data.room).emit("nowStep",data)
        //         })


        socket.on("history",data=>{

          console.log("DAta: ",data);
          const result=getDataFromRoom({room:data.room,winner:data.winner});
          console.log(result);
          console.log("Ne data:",{
            board: parseInt(data.room),
            winner: result.winner,
            loser: result.loser})
          historyModel.create({
            board: parseInt(data.room),
            winner: result.winner,
            loser: result.loser,
            data: JSON.stringify(data.data),
          })
          // const historyData={
          //   board:data.
          // }
          // await historyModel.create(data);
          // const result = await boardModel.findAll(
          //   {
          //     include: [
          //       {
          //         model: userModel,
          //         attributes: ['name']
          //       }
          //     ]
          //   }
          // );

        })





        //----------------------------------------------------------------------------------
        socket.on("disconnect", async (data) => {
            console.log("Client disconnected", socket.id);
            const index = _.findIndex(listUser,{idDevice:socket.id});
            console.log(index);
            if(index>=0)
            {
                listUser.splice(index,1);
                console.log("List client after disconnect: ",listUser);
                io.emit("listonline",listUser);
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