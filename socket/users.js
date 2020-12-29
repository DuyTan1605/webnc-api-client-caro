const users = [];
const _ = require("lodash");

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room };

  const usersInRoom = _.filter(users,{room:room});
  //console.log(usersInRoom);
  user.player="guest";

  if(usersInRoom.length==0)
  {
    user.player='X'
  }
  if(usersInRoom.length==1)
  {
    user.player='O'
  }
  console.log(user);
  users.push(user);

  
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

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
