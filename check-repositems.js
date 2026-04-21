import mysql from 'mysql2/promise';

async function checkSchema() {
  try {
    const connection = await mysql.createConnection({
      host: 'joskarerp.drogueriajoskar.com',
      port: 3939,
      user: 'indicadores',
      password: 'indica2026',
      database: 'datasis'
    });
    
    console.log('Checking repositems schema...');
    const [columns] = await connection.query('SHOW COLUMNS FROM repositems;');
    console.log('Columns in repositems:', columns.map(c => c.Field).join(', '));

    const [types] = await connection.query('SELECT DISTINCT tipoa FROM repositems LIMIT 10;');
    console.log('Distinct tipoa in repositems:', types.map(t => t.tipoa).join(', '));

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkSchema();
