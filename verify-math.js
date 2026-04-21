import mysql from 'mysql2/promise';

async function verifyMath() {
  try {
    const connection = await mysql.createConnection({
      host: 'joskarerp.drogueriajoskar.com',
      port: 3939,
      user: 'indicadores',
      password: 'indica2026',
      database: 'datasis'
    });
    
    console.log('Sample data for math verification:');
    const [rows] = await connection.query(`
      SELECT cana, preca, tota, descu1, descu2, total_descuento 
      FROM repo_sitems 
      WHERE cana > 0 AND preca > 0 AND total_descuento > 0
      LIMIT 1
    `);
    console.log(rows[0]);

    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

verifyMath();
