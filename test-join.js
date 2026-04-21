import mysql from 'mysql2/promise';

async function testJoin() {
  try {
    const connection = await mysql.createConnection({
      host: 'joskarerp.drogueriajoskar.com',
      port: 3939,
      user: 'indicadores',
      password: 'indica2026',
      database: 'datasis'
    });
    
    const query = `
      SELECT 
        a.descrip, 
        c.nombre as supplier_name
      FROM repo_sitems a
      LEFT JOIN sprv c ON c.proveed = a.proveed
      LIMIT 10
    `;
    const [rows] = await connection.query(query);
    console.log(rows);

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testJoin();
