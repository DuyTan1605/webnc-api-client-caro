const getDate=()=>{
    const dateCreated=new Date();
    const created_at= dateCreated.getFullYear() + "-"+ (dateCreated.getMonth()+1) + "-"+ dateCreated.getDate();
    return created_at;
}
module.exports={
    getDate
}