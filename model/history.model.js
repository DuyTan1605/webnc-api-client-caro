const db = require("../utils/db_config");

module.exports = {
    all : ()=>{
        return db.load(`select * from histories`)
    },
    add : entity=>{
        return db.add(`histories`,entity);
    },
    get: entity => {
        return db.load(`select * from histories where ${entity.key} = '${entity.value}'`);
    }

}