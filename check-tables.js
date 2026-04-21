import mysql from 'mysql2/promise';

async function checkPermissions() {
  try {
    const connection = await mysql.createConnection({
      host: 'joskarerp.drogueriajoskar.com',
      port: 3939,
      user: 'indicadores',
      password: 'indica2026',
      database: 'datasis'
    });
    
    console.log('Listing accessible tables...');
    const [tables] = await connection.query('SHOW TABLES;');
    const tableNames = tables.map(r => Object.values(r)[0]);
    console.log('Accessible tables:', tableNames.join(', '));

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkPermissions();
