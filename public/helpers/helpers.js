const getDate=()=>{
    const dateCreated=new Date();
    const created_at= dateCreated.getFullYear() + "-"+ (dateCreated.getMonth()+1) + "-"+ dateCreated.getDate();
    return created_at;
}

const getRank = (point)=>{
   if(0<=point && point<=10)
   {
       return 'Brozen'
   }
   if(11<=point && point<=30)
   {
       return 'Silver'
   }
   if(31<=point && point<=60)
   {
       return 'Gold'
   }
   if(61<=point)
   {
       return 'Diamond'
   }
}
module.exports={
    getDate,
    getRank
}