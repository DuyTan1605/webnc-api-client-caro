const board = [];

function newMove(data)
{
    board=board.push(data);
    return board;
}

exports.module={
    newMove
}