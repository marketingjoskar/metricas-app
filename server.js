import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'joskarerp.drogueriajoskar.com',
  port: parseInt(process.env.DB_PORT || '3939'),
  user: process.env.DB_USER || 'indicadores',
  password: process.env.DB_PASSWORD || 'indica2026',
  database: process.env.DB_NAME || 'datasis',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api/erp/campaigns', async (req, res) => {
  const targetYear = req.query.year || new Date().getFullYear();
  const targetMonth = req.query.month !== undefined ? req.query.month : new Date().getMonth() + 1; // 1-indexed

  try {
    // We get sales for the given month, grouping by the brand/supplier which is often in parentheses at the end of 'desca'
    // This query is a somewhat complex approximation to extract the supplier and group by week.
    // In MySQL, WEEK(fecha) or WEEK(fecha, 1) gets the week.
    const query = `
      SELECT 
        WEEK(fecha, 1) as semana_del_ano,
        DAY(fecha) as dia,
        numa as doc, 
        codigoa, 
        desca, 
        CAST(cana AS DECIMAL) as cantidad, 
        CAST(preca AS DECIMAL) as precio, 
        CAST(tota AS DECIMAL) as total, 
        CAST(descu1 AS DECIMAL) as descuento1,
        CAST(descu2 AS DECIMAL) as descuento2
      FROM sitems 
      WHERE tipoa = 'F' 
        AND YEAR(fecha) = ? 
        AND MONTH(fecha) = ?
    `;
    
    // Limits the query just for the dashboard view to prevent heavy load, 
    // ideally it's pulling the entire month's data.
    const [rows] = await pool.query(query, [targetYear, targetMonth]);
    
    // Process rows in JS to extract brand / supplier
    const campaigns = {};
    rows.forEach(row => {
      // Extract brand inside parentheses, e.g., "PRODUCTO XYZ (H&M)"
      const match = row.desca.match(/\(([^)]+)\)$/);
      let brand = match ? match[1].trim().toUpperCase() : 'OTROS';
      if (brand === 'IPS' || brand === 'PISA' || brand === 'H&M' || brand === 'BIOSANO' || brand.includes('ADN') || brand.includes('KMPLUS')) {
        // Just normalize some
      }

      // Group into "weeks" for the month (Week 1, 2, 3, 4 of the month)
      const date = new Date(targetYear, targetMonth - 1, row.dia);
      const weekOfMonth = Math.ceil((date.getDate() + new Date(targetYear, targetMonth - 1, 1).getDay() - 1) / 7);
      const weekName = `Semana ${weekOfMonth}`;

      const maxDiscount = Math.max(row.descuento1 || 0, row.descuento2 || 0);
      const isDiscounted = maxDiscount > 0;
      
      const key = `${weekName}_${brand}_${maxDiscount}`;
      
      if (!campaigns[key]) {
        campaigns[key] = {
          semana: weekName,
          marca: brand,
          descuento_promedio: maxDiscount,
          unidades: 0,
          ventas_brutas: 0,
          ventas_netas: 0
        };
      }
      
      campaigns[key].unidades += row.cantidad;
      campaigns[key].ventas_brutas += (row.cantidad * row.precio);
      campaigns[key].ventas_netas += row.total;
    });

    const resultList = Object.values(campaigns).sort((a,b) => b.ventas_netas - a.ventas_netas);
    res.json({ data: resultList });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// For production (Dokploy), serve static Vite files
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const PORT = process.env.PORT || 80;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ERP Sync Server running on port ${PORT}`);
});
