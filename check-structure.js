import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'joskarerp.drogueriajoskar.com',
  port: 3939,
  user: 'indicadores',
  password: 'indica2026',
  database: 'datasis'
});

// Probar el query corregido (marzo 2026)
const [rows] = await conn.query(`
  SELECT 
    a.proveed,
    COALESCE(c.nombre, 'OTROS') AS marca,
    COUNT(*) AS facturas,
    SUM(CAST(a.totad AS DECIMAL)) AS ventas,
    cl.cliente AS es_cliente
  FROM repo_sitems a
  LEFT JOIN sprv c ON c.proveed = a.proveed
  LEFT JOIN scli cl ON cl.rifci = c.rif
  WHERE a.tipo = 'F'
    AND a.descu3 > 1
    AND YEAR(a.fecha) = 2026 AND MONTH(a.fecha) = 3
    AND cl.cliente IS NULL
  GROUP BY a.proveed, marca, cl.cliente
  ORDER BY ventas DESC
  LIMIT 25
`);

console.log('=== PROVEEDORES FILTRADOS (sin clientes-proveedores) ===');
rows.forEach(r => console.log(JSON.stringify(r)));

// Verificar que TARIBA ya NO aparece
const hasTariba = rows.some(r => r.marca.includes('TARIBA'));
console.log('\n¿Aparece FARMACIA TARIBA?', hasTariba ? '❌ SÍ (problema)' : '✅ NO (correcto)');

await conn.end();
