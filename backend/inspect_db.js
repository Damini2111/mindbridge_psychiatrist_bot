const mysql = require('mysql2/promise');
require('dotenv').config();

async function inspect() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const [tables] = await db.query('SHOW TABLES');
        const dbName = process.env.DB_NAME;
        const tableNameKey = `Tables_in_${dbName}`;

        for (const tableRow of tables) {
            const tableName = tableRow[tableNameKey];
            console.log(`\n\n--- TABLE: ${tableName} ---`);
            const [columns] = await db.query(`DESCRIBE ${tableName}`);
            console.log(JSON.stringify(columns, null, 2));
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await db.end();
    }
}
inspect();
