import mysql from 'mysql2/promise';

async function exploreData() {
  try {
    const connection = await mysql.createConnection({
      host: 'joskarerp.drogueriajoskar.com',
      port: 3939,
      user: 'indicadores',
      password: 'indica2026',
      database: 'datasis'
    });
    
    // Look at sitems specifically for discounts and suppliers
    const [sitems_sample] = await connection.query('SELECT tipoa, numa, codigoa, desca, cana, preca, tota, descuento, descu, descu1, descu2, desca FROM sitems LIMIT 5;');
    console.log('sitems sample:', sitems_sample);

    const [sprv] = await connection.query('SELECT * FROM sprv LIMIT 2;');
    console.log('sprv sample:', sprv.map(s => ({ codigo: s.cod_prov, desc: s.descrip })));

    // Try to see if there's a link between articles and suppliers in sitems or another table (e.g., sinv, articulo)
    const [tables] = await connection.query('SHOW TABLES;');
    const tableNames = tables.map(r => Object.values(r)[0]);
    const invTables = tableNames.filter(t => t.toLowerCase().includes('inv') || t.toLowerCase().includes('art') || t.toLowerCase().includes('prov'));
    console.log('Inventory/Provider tables:', invTables.join(', '));
    
    if (invTables.includes('sinv')) {
      const [sinv] = await connection.query('SELECT codigo, descrip, marca, prov1 FROM sinv LIMIT 2;');
      console.log('sinv sample:', sinv);
    }

    await connection.end();
  } catch (err) {
    console.error('MySQL error:', err.message);
  }
}

exploreData();
