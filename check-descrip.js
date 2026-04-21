import mysql from 'mysql2/promise';

async function checkDescrip() {
  try {
    const connection = await mysql.createConnection({
      host: 'joskarerp.drogueriajoskar.com',
      port: 3939,
      user: 'indicadores',
      password: 'indica2026',
      database: 'datasis'
    });
    
    console.log('Sample descrip from repo_sitems:');
    const [rows] = await connection.query('SELECT descrip FROM repo_sitems LIMIT 5;');
    console.log(rows.map(r => r.descrip));

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkDescrip();
