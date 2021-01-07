const db = require("../utils/db_config");

module.exports = {
    all : ()=>{
        return db.load(`select histories.*,boards.name
        from histories
        LEFT JOIN boards
        ON histories.board=boards.id`)
    },
    add : entity=>{
        return db.add(`histories`,entity);
    },
    get: entity => {
        return db.load(`select * from histories where ${entity.key} = '${entity.value}'`);
    }

}