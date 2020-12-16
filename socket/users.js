const users = [];
const _= require("lodash");

// Join user to chat
function userJoin(id, username, room,idUser) {

  const pos=_.findIndex(users,{id:id});
  console.log(id,username,room)
  if(pos>=0)
  {
    return users[pos];
  }

  const user = { id, username, room ,idUser};

  user.player = "guest";

  if(_.filter(users,{"room":room}).length==0)
  {
    user.player = "X";
  }
  if(_.filter(users,{"room":room}).length==1)
  {
    user.player = "O";
  }
  users.push(user);
  console.log("User: ",user);
  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);
   console.log("Index is:",id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

function getDataFromRoom(data)
{
  const winnerIndex = _.findIndex(users,{room:data.room,player:data.winner}); 
  const loserIndex = _.findIndex(users,{room:data.room,player:data.winner=="X"?"O":"X"});
  console.log(users);
  console.log(data,winnerIndex)
  return {
    winner:users[winnerIndex].idUser,
    loser: users[loserIndex].idUser
  }
}
module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getDataFromRoom
};
