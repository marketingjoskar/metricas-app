import mysql from 'mysql2/promise';

async function checkRepoSchema() {
  try {
    const connection = await mysql.createConnection({
      host: 'joskarerp.drogueriajoskar.com',
      port: 3939,
      user: 'indicadores',
      password: 'indica2026',
      database: 'datasis'
    });
    
    console.log('Checking repo_sitems schema...');
    const [columns] = await connection.query('SHOW COLUMNS FROM repo_sitems;');
    console.log('Columns in repo_sitems:', columns.map(c => c.Field).join(', '));

    const [types] = await connection.query('SELECT DISTINCT tipoa FROM repo_sitems LIMIT 10;');
    console.log('Distinct tipoa in repo_sitems:', types.map(t => t.tipoa).join(', '));

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkRepoSchema();
