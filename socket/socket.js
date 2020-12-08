const socketIo = require("socket.io");
var listUser=[];
const _= require('lodash');

exports.connect=(server)=>
{
    //onsole.log("Initial install socket")
    const io = socketIo(server);
    io.on("connection", (socket) => {
        //console.log("New client connected");
        socket.on('connect', () => {
            //console.log(socket.connected); // true
        });

        socket.on('login', async(message) => {
           console.log(message);
           if(_.findIndex(listUser,{iduser:message.iduser})<0)
           {
                listUser.push(message);
           }
           console.log("New list user",listUser);
            io.sockets.emit("listonline",listUser);
        });
        
        socket.on('logout', async(message) => {
            console.log("User disconnected with id="+ message.iduser);
            listUser = _.filter(listUser,function(user)
            {
                return user.iduser!=message.iduser;
            })
            console.log("List user after log out",listUser);
            io.sockets.emit("listonline",listUser)

         });

        socket.on("disconnect", (data) => {
            console.log("Client disconnected", data);
            console.log(listUser);
            //clearInterval(interval);
        });

    })

}