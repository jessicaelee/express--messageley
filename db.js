/** Database connection for messagely. */


const { Client } = require("pg");
const { DB_URI } = require("./config");


const client = new Client(DB_URI);

// const db = new Client({ connectionString: DB_URI });
// db.connect();

client.connect();


module.exports = client;
