import { pool } from './db';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  console.log('Setting up database...');
  
  // Create schema
  try {
    console.log('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        bio TEXT,
        profile_picture TEXT
      )
    `);
    
    console.log('Creating books table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        cover_image TEXT,
        genre TEXT,
        publication_date TEXT,
        isbn TEXT
      )
    `);
    
    console.log('Creating user_books table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_books (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        book_id INTEGER NOT NULL REFERENCES books(id),
        status TEXT NOT NULL,
        progress INTEGER,
        rating INTEGER,
        review TEXT,
        is_public BOOLEAN DEFAULT false,
        date_added TIMESTAMP DEFAULT NOW(),
        date_updated TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('Creating follows table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER NOT NULL REFERENCES users(id),
        followed_id INTEGER NOT NULL REFERENCES users(id)
      )
    `);
    
    console.log('Tables created successfully');
    
    // Insert sample data
    console.log('Adding sample books...');
    const initialBooks = [
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Fiction",
        publicationDate: "2020-08-13",
        isbn: "9781786892737"
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        coverImage: "https://images.unsplash.com/photo-1531911120215-9f628dc6e9c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Self-help",
        publicationDate: "2018-10-16",
        isbn: "9781847941831"
      },
      {
        title: "Dune",
        author: "Frank Herbert",
        coverImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Science Fiction",
        publicationDate: "1965-08-01",
        isbn: "9780441172719"
      },
      {
        title: "The Invisible Life of Addie LaRue",
        author: "V.E. Schwab",
        coverImage: "https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Fantasy",
        publicationDate: "2020-10-06",
        isbn: "9780765387561"
      },
      {
        title: "The Song of Achilles",
        author: "Madeline Miller",
        coverImage: "https://images.unsplash.com/photo-1511108690759-009324a90311?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Historical Fiction",
        publicationDate: "2011-09-20",
        isbn: "9780062060617"
      },
      {
        title: "Project Hail Mary",
        author: "Andy Weir",
        coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Science Fiction",
        publicationDate: "2021-05-04",
        isbn: "9780593135204"
      },
      {
        title: "Klara and the Sun",
        author: "Kazuo Ishiguro",
        coverImage: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Science Fiction",
        publicationDate: "2021-03-02",
        isbn: "9780571364879"
      },
      {
        title: "The Four Winds",
        author: "Kristin Hannah",
        coverImage: "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        genre: "Historical Fiction",
        publicationDate: "2021-02-02",
        isbn: "9781250178602"
      }
    ];
    
    // Insert books one by one to avoid issues with parameter limits
    for (const book of initialBooks) {
      await pool.query(
        `INSERT INTO books (title, author, cover_image, genre, publication_date, isbn) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [book.title, book.author, book.coverImage, book.genre, book.publicationDate, book.isbn]
      );
    }
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();