import mysql from 'mysql2/promise';

async function checkSprv() {
  try {
    const connection = await mysql.createConnection({
      host: 'joskarerp.drogueriajoskar.com',
      port: 3939,
      user: 'indicadores',
      password: 'indica2026',
      database: 'datasis'
    });
    
    console.log('Checking sprv schema...');
    const [columns] = await connection.query('SHOW COLUMNS FROM sprv;');
    console.log('Columns in sprv:', columns.map(c => c.Field).join(', '));

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkSprv();
