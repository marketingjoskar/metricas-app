import mysql from 'mysql2/promise';

async function checkValues() {
  try {
    const connection = await mysql.createConnection({
      host: 'joskarerp.drogueriajoskar.com',
      port: 3939,
      user: 'indicadores',
      password: 'indica2026',
      database: 'datasis'
    });
    
    console.log('Distinct tipo in repo_sitems:');
    const [types] = await connection.query('SELECT DISTINCT tipo FROM repo_sitems;');
    console.log(types.map(t => t.tipo).join(', '));

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkValues();
