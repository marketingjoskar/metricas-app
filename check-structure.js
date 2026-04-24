import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'joskarerp.drogueriajoskar.com',
  port: 3939,
  user: 'indicadores',
  password: 'indica2026',
  database: 'datasis'
});

// Verificar que WEEKDAY < 5 excluye sábados y domingos (marzo 2026)
const [dias] = await conn.query(`
  SELECT 
    DAYNAME(a.fecha) AS dia,
    WEEKDAY(a.fecha) AS weekday_num,
    COUNT(*) AS facturas
  FROM repo_sitems a
  WHERE a.tipo = 'F'
    AND a.descu3 > 1
    AND YEAR(a.fecha) = 2026 AND MONTH(a.fecha) = 3
    AND WEEKDAY(a.fecha) < 5
  GROUP BY dia, weekday_num
  ORDER BY weekday_num
`);
console.log('=== DÍAS incluidos con WEEKDAY < 5 (debe ser solo Lun-Vie) ===');
dias.forEach(r => console.log(JSON.stringify(r)));

// Simular getWeekRanges para marzo 2026 (Lun-Vie)
const year = 2026, month = 3;
const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
const dow = firstOfMonth.getUTCDay();
const firstMonday = new Date(firstOfMonth);
firstMonday.setUTCDate(firstOfMonth.getUTCDate() - ((dow === 0 ? 7 : dow) - 1));
const fmt = d => `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}`;
const lastOfMonth = new Date(Date.UTC(year, month, 0));
const lastFriday = new Date(lastOfMonth);
const lastDow = lastFriday.getUTCDay();
if (lastDow === 6) lastFriday.setUTCDate(lastFriday.getUTCDate() - 1);
else if (lastDow === 0) lastFriday.setUTCDate(lastFriday.getUTCDate() - 2);

console.log('\n=== SEMANAS LABORALES MARZO 2026 (Lun-Vie) ===');
[1,2,3,4].forEach(n => {
  const mon = new Date(firstMonday);
  mon.setUTCDate(firstMonday.getUTCDate() + (n-1)*7);
  let fri = new Date(mon);
  fri.setUTCDate(mon.getUTCDate() + 4);
  if (n === 4) fri = lastFriday;
  console.log(`Semana ${n}: ${fmt(mon)} – ${fmt(fri)}  (${mon.toUTCString().slice(0,3)} → ${fri.toUTCString().slice(0,3)})`);
});

await conn.end();
