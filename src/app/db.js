const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',           // o el usuario que creaste
    host: 'localhost',
    database: 'parcial',     // nombre de tu base de datos
    password: '123456',
    port: 5432,
});

module.exports = pool;
