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
  const targetYear  = parseInt(req.query.year  || new Date().getFullYear());
  const targetMonth = parseInt(req.query.month !== undefined ? req.query.month : new Date().getMonth() + 1);

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // SEMANAS LABORALES (Lunes–Viernes), máximo 4 semanas por mes.
    //
    // Lógica:
    //   • WEEKDAY(fecha) devuelve 0=Lun … 6=Dom (modo MySQL).
    //   • WEEKDAY(fecha) < 5  → solo incluye Lun(0)..Vie(4); excluye Sáb(5) y Dom(6).
    //   • El "lunes de la semana" de cada fecha = fecha - WEEKDAY(fecha) días.
    //   • Calculamos cuántos lunes han pasado desde el primer lunes del mes.
    //   • LEAST(..., 4) fusiona los días 29-31 con la semana 4 cuando el mes
    //     no termina en viernes exacto.
    // ─────────────────────────────────────────────────────────────────────────
    const query = `
      SELECT 
        LEAST(
          FLOOR(
            DATEDIFF(
              DATE_SUB(a.fecha, INTERVAL WEEKDAY(a.fecha) DAY),
              DATE_SUB(DATE(CONCAT(YEAR(a.fecha), '-', MONTH(a.fecha), '-01')),
                       INTERVAL WEEKDAY(DATE(CONCAT(YEAR(a.fecha), '-', MONTH(a.fecha), '-01'))) DAY)
            ) / 7
          ) + 1,
          4
        ) AS semana_num,
        COALESCE(c.nombre, 'OTROS') AS marca,
        MAX(COALESCE(a.descu3, 0))           AS descuento_max,
        MIN(CASE WHEN a.descu3 > 1 THEN a.descu3 END) AS descuento_min,
        SUM(CAST(a.cana       AS DECIMAL))   AS unidades,
        SUM(CAST(a.totad      AS DECIMAL))   AS ventas_netas,
        SUM(CAST(a.total_descu3 AS DECIMAL) / NULLIF(a.oficial, 0)) AS descuento_usd
      FROM repo_sitems a
      LEFT JOIN sprv c ON c.proveed = a.proveed
      -- Excluir proveedores que también son clientes (ej: FARMACIA TARIBA)
      -- Si el RIF del proveedor existe en scli, se filtra fuera
      LEFT JOIN scli cl ON cl.rifci = c.rif
      WHERE a.tipo = 'F'
        AND YEAR(a.fecha)  = ?
        AND MONTH(a.fecha) = ?
        AND cl.cliente IS NULL
        AND WEEKDAY(a.fecha) < 5
      GROUP BY semana_num, marca
      HAVING MAX(a.descu3) > 1
      ORDER BY semana_num ASC, ventas_netas DESC
    `;

    const [rows] = await pool.query(query, [targetYear, targetMonth]);

    // ─────────────────────────────────────────────────────────────────────────
    // Calcular las 4 fechas exactas Lun–Vie para ese año/mes
    // y construir el label "Semana N: DD/MM – DD/MM"
    // Solo días laborales: el rango va de lunes a viernes de cada semana.
    // ─────────────────────────────────────────────────────────────────────────
    function getWeekRanges(year, month) {
      // Primer día del mes
      const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
      // Día de la semana del primer día (0=Dom, 1=Lun, … 6=Sáb)
      const dow = firstOfMonth.getUTCDay();
      // Retroceder hasta el lunes anterior (o el mismo si ya es lunes)
      const firstMonday = new Date(firstOfMonth);
      firstMonday.setUTCDate(firstOfMonth.getUTCDate() - ((dow === 0 ? 7 : dow) - 1));

      const fmt = d => `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}`;

      // Último día laboral (viernes) del mes: retrocede desde el último día del mes
      const lastOfMonth = new Date(Date.UTC(year, month, 0));
      const lastFriday = new Date(lastOfMonth);
      // Si el último día es sáb(6) retrocede 1, si es dom(0) retrocede 2
      const lastDow = lastFriday.getUTCDay();
      if (lastDow === 6) lastFriday.setUTCDate(lastFriday.getUTCDate() - 1);
      else if (lastDow === 0) lastFriday.setUTCDate(lastFriday.getUTCDate() - 2);

      return [1,2,3,4].map(n => {
        const mon = new Date(firstMonday);
        mon.setUTCDate(firstMonday.getUTCDate() + (n-1)*7);
        // Fin de semana laboral = lunes + 4 días = viernes
        let fri = new Date(mon);
        fri.setUTCDate(mon.getUTCDate() + 4);

        // La semana 4 siempre termina en el último viernes del mes
        if (n === 4) fri = lastFriday;

        return {
          num: n,
          label: `Semana ${n}: ${fmt(mon)} – ${fmt(fri)}`
        };
      });
    }

    const weekRanges = getWeekRanges(targetYear, targetMonth);
    const weekLabelMap = Object.fromEntries(weekRanges.map(w => [w.num, w.label]));

    // ─────────────────────────────────────────────────────────────────────────
    // Normalizar nombres de marcas + mapear label de semana
    // ─────────────────────────────────────────────────────────────────────────
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
      // Si min y max son iguales → "5%"; si difieren → "2% – 5%"
      const descuento_label = dMin === dMax
        ? `${dMax}%`
        : `${dMin}% – ${dMax}%`;

      return {
        semana:           weekLabelMap[row.semana_num] || `Semana ${row.semana_num}`,
        semana_num:       row.semana_num,
        marca:            brand.toUpperCase(),
        // descuento_promedio mantiene el valor máximo de la semana (usado para colorear barras)
        descuento_promedio: dMax,
        descuento_min:    dMin,
        descuento_max:    dMax,
        descuento_label:  descuento_label,  // ej: "2% – 5%" o "5%"
        unidades:         parseFloat(row.unidades    || 0),
        ventas_netas:     parseFloat(row.ventas_netas || 0),
        descuento_usd:    parseFloat(row.descuento_usd || 0),
      };
    });

    res.json({ data: resultList, weeks: weekRanges });
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
