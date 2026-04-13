import { turso } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await turso.execute('SELECT id, name, favorite_fruit, message FROM farmers ORDER BY id DESC');

  const header = 'id,name,favorite_fruit,message\n';
  const rows = result.rows.map((row) => {
    const id = row.id;
    const name = `"${String(row.name).replace(/"/g, '""')}"`;
    const fruit = `"${String(row.favorite_fruit).replace(/"/g, '""')}"`;
    const message = `"${String(row.message).replace(/"/g, '""')}"`;
    return `${id},${name},${fruit},${message}`;
  });

  const csv = header + rows.join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="guestbook.csv"',
    },
  });
}
