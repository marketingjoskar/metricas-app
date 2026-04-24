import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'joskarerp.drogueriajoskar.com',
  port: 3939,
  user: 'indicadores',
  password: 'indica2026',
  database: 'datasis'
});

function getWeekRanges(year, month) {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const dow = firstOfMonth.getUTCDay(); // 0=Dom, 1=Lun...
  const daysToFirstMonday = (1 - dow + 7) % 7;
  const firstMonday = new Date(firstOfMonth);
  firstMonday.setUTCDate(firstOfMonth.getUTCDate() + daysToFirstMonday);

  const fmt = d => `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}`;
  const dayName = d => ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][d.getUTCDay()];

  const lastOfMonth = new Date(Date.UTC(year, month, 0));
  const lastDow = lastOfMonth.getUTCDay();
  const daysBackToFriday = (lastDow - 5 + 7) % 7;
  const lastFriday = new Date(lastOfMonth);
  lastFriday.setUTCDate(lastOfMonth.getUTCDate() - daysBackToFriday);

  console.log(`\n  Día 1 del mes: ${dayName(firstOfMonth)} | Primer Lunes: ${fmt(firstMonday)} | Último día: ${fmt(lastOfMonth)} (${dayName(lastOfMonth)}) | Último Viernes: ${fmt(lastFriday)}`);

  return [1,2,3,4].map(n => {
    const mon = new Date(firstMonday);
    mon.setUTCDate(firstMonday.getUTCDate() + (n-1)*7);
    let fri = new Date(mon);
    fri.setUTCDate(mon.getUTCDate() + 4);
    if (n === 4) fri = lastFriday;
    return { num: n, label: `Semana ${n}: ${fmt(mon)} – ${fmt(fri)}` };
  });
}

// Verificar meses problemáticos
for (const [y, m, name] of [[2026,3,'MARZO 2026'],[2026,4,'ABRIL 2026'],[2026,2,'FEBRERO 2026']]) {
  console.log(`\n=== ${name} ===`);
  const ranges = getWeekRanges(y, m);
  ranges.forEach(r => console.log(`  ${r.label}`));
}

// SQL test: semana_num por fecha en marzo 2026
const [rows] = await conn.query(`
  SELECT
    LEAST(
      FLOOR(
        DATEDIFF(
          DATE_SUB(a.fecha, INTERVAL WEEKDAY(a.fecha) DAY),
          DATE_ADD(DATE(CONCAT(YEAR(a.fecha), '-', MONTH(a.fecha), '-01')),
                   INTERVAL (7 - WEEKDAY(DATE(CONCAT(YEAR(a.fecha), '-', MONTH(a.fecha), '-01')))) MOD 7 DAY)
        ) / 7
      ) + 1,
      4
    ) AS semana_num,
    MIN(a.fecha) AS primer_dia,
    MAX(a.fecha) AS ultimo_dia,
    COUNT(*) AS facturas
  FROM repo_sitems a
  WHERE a.tipo = 'F' AND a.descu3 > 1
    AND YEAR(a.fecha) = 2026 AND MONTH(a.fecha) = 3
    AND WEEKDAY(a.fecha) < 5
  GROUP BY semana_num
  ORDER BY semana_num
`);
console.log('\n=== SQL semana_num (datos reales marzo 2026) ===');
rows.forEach(r => {
  const d1 = new Date(r.primer_dia);
  const d2 = new Date(r.ultimo_dia);
  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  console.log(`  Semana ${r.semana_num}: ${d1.toISOString().slice(5,10)} (${days[d1.getUTCDay()]}) → ${d2.toISOString().slice(5,10)} (${days[d2.getUTCDay()]})  [${r.facturas} facturas]`);
});

await conn.end();
