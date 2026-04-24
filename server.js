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

app.get('/api/erp/providers', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT 
        c.proveed AS id, 
        c.nombre AS name 
      FROM sprv c
      JOIN repo_sitems a ON a.proveed = c.proveed
      -- Excluir proveedores que también son clientes
      LEFT JOIN scli cl ON cl.rifci = c.rif
      WHERE cl.cliente IS NULL
      ORDER BY c.nombre ASC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/erp/campaigns', async (req, res) => {
  const { startDate, endDate, providerId, minDiscount } = req.query;
  
  // Default to current month if no dates provided
  const now = new Date();
  const start = startDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const end = endDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}`;

  try {
    let whereClause = `
      WHERE a.tipo = 'F'
        AND a.fecha BETWEEN ? AND ?
        AND cl.cliente IS NULL
        AND WEEKDAY(a.fecha) < 5
    `;
    const params = [start, end];

    if (providerId) {
      whereClause += ` AND a.proveed = ?`;
      params.push(providerId);
    }

    if (minDiscount) {
      whereClause += ` AND a.descu3 >= ?`;
      params.push(parseFloat(minDiscount));
    }

    const query = `
      SELECT 
        DATE_FORMAT(DATE_SUB(a.fecha, INTERVAL WEEKDAY(a.fecha) DAY), '%Y-%m-%d') as monday_date,
        WEEK(a.fecha, 1) as week_of_year,
        COALESCE(c.nombre, 'OTROS') AS marca,
        a.proveed as provider_id,
        MAX(COALESCE(a.descu3, 0))           AS descuento_max,
        MIN(CASE WHEN a.descu3 > 1 THEN a.descu3 END) AS descuento_min,
        SUM(CAST(a.cana       AS DECIMAL))   AS unidades,
        SUM(CAST(a.totad      AS DECIMAL))   AS ventas_netas,
        SUM(CAST(a.total_descu3 AS DECIMAL) / NULLIF(a.oficial, 0)) AS descuento_usd
      FROM repo_sitems a
      LEFT JOIN sprv c ON c.proveed = a.proveed
      LEFT JOIN scli cl ON cl.rifci = c.rif
      ${whereClause}
      GROUP BY monday_date, week_of_year, provider_id, marca
      HAVING MAX(a.descu3) > 1
      ORDER BY monday_date ASC, ventas_netas DESC
    `;

    const [rows] = await pool.query(query, params);

    const filterWords = new Set(['CASA','DE','REPRESENTACION','DROGUERIA','CORPORACION','CA','SA','PRODUCTOS','MEDICAL','GROUP']);

    const resultList = rows.map(row => {
      let brand = row.marca.trim();
      if (brand.length > 20) {
        const parts = brand.split(' ');
        if (parts.length > 2) {
          const clean = parts.filter(p => !filterWords.has(p.toUpperCase().replace(/[.,]/g, '')));
          brand = clean.slice(0, 2).join(' ');
        }
      }

      const dMin = parseFloat(row.descuento_min || row.descuento_max || 0);
      const dMax = parseFloat(row.descuento_max || 0);
      const descuento_label = dMin === dMax ? `${dMax}%` : `${dMin}% – ${dMax}%`;

      const mon = new Date(row.monday_date);
      const fri = new Date(mon);
      fri.setDate(mon.getDate() + 4);
      const fmt = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
      const semanaLabel = `Semana del ${fmt(mon)} al ${fmt(fri)}`;

      return {
        semana:           semanaLabel,
        monday_date:      row.monday_date,
        marca:            brand.toUpperCase(),
        descuento_promedio: dMax,
        descuento_min:    dMin,
        descuento_max:    dMax,
        descuento_label:  descuento_label,
        unidades:         parseFloat(row.unidades    || 0),
        ventas_netas:     parseFloat(row.ventas_netas || 0),
        descuento_usd:    parseFloat(row.descuento_usd || 0),
      };
    });

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
