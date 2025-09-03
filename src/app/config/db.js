import { Pool } from 'pg';


const pool = new Pool({
    user: 'postgres',           // tu usuario
    host: 'localhost',
    database: 'parcial',     // tu base de datos
    password: '123456',
    port: 5432,
});

export default pool;
