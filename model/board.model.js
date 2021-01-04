const db = require("../utils/db_config");

module.exports = {
    all : ()=>{
        return db.load(`select * from boards`)
    },
    add : entity=>{
        return db.add(`boards`,entity);
    },
    get: entity => {
        return db.load(`select * from boards where ${entity.key} = '${entity.value}'`);
    }

}