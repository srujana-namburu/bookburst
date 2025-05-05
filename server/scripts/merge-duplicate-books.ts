import { db } from '../db';
import { books, userBooks } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function mergeDuplicateBooks() {
  // 1. Find all (title, author) pairs with duplicates
  const duplicates = await db.execute(sql`
    SELECT LOWER(title) as ltitle, LOWER(author) as lauthor, array_agg(id) as ids, MIN(id) as min_id
    FROM books
    GROUP BY LOWER(title), LOWER(author)
    HAVING COUNT(*) > 1
  `);

  for (const row of duplicates.rows) {
    const { ltitle, lauthor, ids, min_id } = row;
    // 2. Update user_books to point to canonical book id (min_id)
    await db.execute(sql`
      UPDATE user_books SET book_id = ${min_id}
      WHERE book_id = ANY(${ids}) AND book_id != ${min_id}
    `);
    // 3. Delete duplicate book entries (except canonical)
    await db.execute(sql`
      DELETE FROM books WHERE id = ANY(${ids}) AND id != ${min_id}
    `);
    console.log(`Merged duplicates for '${ltitle}' by '${lauthor}' into book id ${min_id}`);
  }
  console.log('Duplicate book merge complete.');
}

mergeDuplicateBooks().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 