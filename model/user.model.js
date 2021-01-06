const db = require("../utils/db_config");

module.exports = {
    all : ()=>{
        return db.load(`select * from users`)
    },
    add : entity=>{
        return db.add(`users`,entity);
    },
    get: entity => {
        return db.load(`select * from users where ${entity.key} = '${entity.value}'`);
    },
    checkExisted: (entity)=>{
        return db.load(`select * from users where ${entity.key} = '${entity.value}' and account_type = 1`)
    },
    getAccountByType: entity=>{
        return db.load(`select * from users where ${entity.key} = '${entity.value}' and account_type='${entity.account_type}'`);
    },
    update : (field,entity) =>{
        console.log(field,entity)
        return db.update(`users`, field , entity);
    },
    getAllWithOrder: (field,type)=>{
        return db.load(`select * from users order by ${field} ${type}`)
    }

}