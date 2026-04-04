const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkData() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const [users] = await db.query('SELECT * FROM users');
        console.log(`Users count: ${users.length}`);
        console.log(JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await db.end();
    }
}
checkData();
