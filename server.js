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
  const targetMonth = req.query.month !== undefined ? req.query.month : new Date().getMonth() + 1;

  try {
    // CONSULTA OPTIMIZADA: Agrupamos por semana, marca y descuento directamente en MySQL
    // Usamos repo_sitems y un JOIN con sprv para obtener el nombre del proveedor/marca
    const query = `
      SELECT 
        CONCAT('Semana ', FLOOR((DAY(a.fecha) - 1) / 7) + 1) as semana,
        COALESCE(c.nombre, 'OTROS') as marca,
        COALESCE(a.descu3, 0) as descuento_promedio,
        SUM(CAST(a.cana AS DECIMAL)) as unidades,
        SUM(CAST(a.totad AS DECIMAL)) as ventas_netas,
        SUM(CAST(a.total_descu3 AS DECIMAL) / NULLIF(a.oficial, 0)) as descuento_usd
      FROM repo_sitems a
      LEFT JOIN sprv c ON c.proveed = a.proveed
      WHERE a.tipo = 'F' 
        AND YEAR(a.fecha) = ? 
        AND MONTH(a.fecha) = ?
      GROUP BY semana, marca, descuento_promedio
      ORDER BY ventas_netas DESC
    `;

    const [rows] = await pool.query(query, [targetYear, targetMonth]);

    // Procesamos ligeramente los nombres de las marcas para que se vean mejor en el UI (Glassmorphism)
    const resultList = rows.map(row => {
      let brand = row.marca.trim();
      
      // Si el nombre es muy largo (ej: CASA DE REPRESENTACION...), intentamos acortarlo
      if (brand.length > 20) {
        // Intentamos extraer el nombre comercial que suele estar al principio o ser una sigla
        const parts = brand.split(' ');
        if (parts.length > 2) {
          // Si tiene "CASA DE REPRESENTACION", "DROGUERIA", etc, lo omitimos
          const filterWords = ['CASA', 'DE', 'REPRESENTACION', 'DROGUERIA', 'CORPORACION', 'C.A', 'CA', 'S.A', 'SA', 'PRODUCTOS', 'MEDICAL', 'GROUP'];
          const cleanParts = parts.filter(p => !filterWords.includes(p.toUpperCase().replace(/[.,]/g, '')));
          brand = cleanParts.slice(0, 2).join(' ');
        }
      }

      const neto = parseFloat(row.ventas_netas || 0);

      return {
        semana: row.semana,
        marca: brand.toUpperCase(),
        descuento_promedio: parseFloat(row.descuento_promedio || 0),
        unidades: parseFloat(row.unidades || 0),
        ventas_netas: neto,
        descuento_usd: parseFloat(row.descuento_usd || 0)
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
