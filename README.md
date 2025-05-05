# 📚 BookBurst – Your Social Reading Tracker

Welcome to **BookBurst**!  
A modern, fullstack social reading tracker where you can manage your bookshelf, track your reading journey, and connect with a community of book lovers.  
Built with **TypeScript, React, Express, Drizzle ORM, and Tailwind CSS**.

---

## 🚀 Features at a Glance

### 🔐 Authentication & Authorization
- **Intention:**
  - Securely register, log in, and manage sessions.
  - Ensure only authenticated users can access personal data.
- **Technical Implementation:**
  - Passport.js with local strategy for authentication.
  - Passwords hashed with Node's crypto module.
  - Session management via express-session and PostgreSQL-backed store.
  - Protected API routes for user data.

---

### 📖 Bookshelf Management
- **Intention:**
  - Build a personal bookshelf and organize books by reading status.
  - Keep your collection up to date and easy to browse.
- **Technical Implementation:**
  - Add books via a modal, with Google Books API search/autofill.
  - Organize by status: _Currently Reading_, _Finished_, _Want to Read_.
  - Filter/sort by title, author, date, rating, and genre.
  - Mark books as public/private.
  - Remove books from shelf with instant feedback.
  - Backend: `user_books` table links users to books with status, progress, rating, and privacy.
  - Endpoints: `GET/POST/PATCH/DELETE /api/user-books`.

---

### ⏳ Reading Progress & Reviews
- **Intention:**
  - Track your reading progress, rate books, and jot down thoughts or reviews.
- **Technical Implementation:**
  - Update reading progress (0–100%) with a visual progress bar.
  - 1–5 star ratings, stored per user-book.
  - Optional text reviews for each book.
  - Backend: Progress, rating, and review fields in `user_books`.
  - Endpoints: `PATCH /api/user-books/:id` for updates.

---

### 🌟 Trending & Discovery
- **Intention:**
  - Discover popular books in the community and explore by genre or search.
- **Technical Implementation:**
  - Backend aggregates top books by number of users with that book in their shelf (grouped by title+author, no duplicates).
  - Endpoint: `GET /api/trending-books` returns top 10 (or all, sorted by count).
  - Client-side filtering of trending books by title, author, and genre.
  - "Surprise Me" button picks a random book from the database.

---

### 👥 Community & Social
- **Intention:**
  - Foster a social reading experience—find, follow, and interact with other readers.
- **Technical Implementation:**
  - Community page lists all users (except self), with search/filter by name/email.
  - User cards show name, books read, genres, and followers count.
  - Follow/unfollow with real-time UI updates. Backend: `follows` table, endpoints for follow/unfollow/status.
  - Public profile page shows user info, followers/following, and public bookshelf.
  - Tabs for bookshelf, activity, reviews, and public books.
  - Community tab for browsing and searching reviews from all users.
  - Endpoints: `/api/users`, `/api/users/:id/profile`, `/api/follow/:id`, `/api/reviews`.

---

### 🔎 Book Search & Google Books API
- **Intention:**
  - Make adding books easy and accurate by leveraging Google Books data.
- **Technical Implementation:**
  - In the Add Book modal, typing a title queries the Google Books API.
  - Top 5 results shown in a dropdown with title, cover, and author.
  - Selecting a result autofills the add book form.
  - Backend checks for existing books (case-insensitive by title+author) before adding.

---

### 🏠 Home & Dashboard
- **Intention:**
  - Give users a quick overview of their reading journey and community activity.
- **Technical Implementation:**
  - Hero section with call-to-action.
  - Currently Reading: shows books in progress, with quick actions.
  - Recently Added: highlights the latest books added to the shelf.
  - Trending Books: preview of top trending books.
  - Reading Challenges: progress bars for yearly and genre-based challenges.

---

### ✨ User Experience
- **Intention:**
  - Deliver a delightful, modern, and responsive interface.
- **Technical Implementation:**
  - UI: React, Tailwind CSS, and Radix UI for accessibility.
  - Responsive layouts for all devices.
  - Toast notifications for actions and errors.
  - Modals and dialogs for adding/viewing books.
  - Real-time updates with React Query.
  - Zod schemas for robust form validation.

---

## 🗂️ Project Structure

```
.
├── client/           # Frontend (React, Vite, Tailwind)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── context/
│       └── lib/
├── server/           # Backend (Express, Drizzle ORM, Passport)
│   ├── routes.ts
│   ├── auth.ts
│   ├── database-storage.ts
│   ├── db.ts
│   ├── db-setup.ts
│   └── scripts/
├── shared/           # Shared types and database schema
│   └── schema.ts
├── package.json
├── README.md
└── ...
```

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Radix UI, React Query, Wouter
- **Backend:** Express, TypeScript, Drizzle ORM, Passport.js, PostgreSQL (Neon serverless)
- **Database:** PostgreSQL (see schema in `shared/schema.ts`)
- **Other:** Google Books API, Zod validation, session management

---

## ⚡ Getting Started

### 1. **Clone the repository**
```bash
git clone https://github.com/your-username/bookburst.git
cd bookburst
```

### 2. **Install dependencies**
```bash
npm install
```

### 3. **Configure environment variables**

Create a `.env` file in the `server/` directory with:
```
DATABASE_URL=your_postgres_connection_url
SESSION_SECRET=your_session_secret
```

### 4. **Set up the database**
- The app uses Drizzle ORM and Neon serverless PostgreSQL.
- To initialize tables and add sample data, run:
  ```bash
  npm run db:push
  # or, for custom setup:
  tsx server/db-setup.ts
  ```

### 5. **Run the app in development**
```bash
npm run dev
```
- The app will be available at [http://localhost:3000](http://localhost:3000)

---

## 📝 Database Schema (Simplified)

- **users:** id, email, password, name, bio, profilePicture
- **books:** id, title, author, coverImage, genre, publicationDate, isbn
- **user_books:** id, userId, bookId, status, progress, rating, review, isPublic, dateAdded, dateUpdated
- **follows:** id, followerId, followedId
- **user_preferences:** userId, theme, lastActiveTab, recentlyViewedBooks, readingTime, lastActiveTimestamp

---

## 🌐 API Highlights

- `POST /api/register` – Register a new user
- `POST /api/login` – Login
- `GET /api/user-books` – Get your bookshelf
- `POST /api/books` – Add a new book
- `POST /api/user-books` – Add a book to your shelf
- `PATCH /api/user-books/:id` – Update status/progress/rating
- `GET /api/trending-books` – Get trending books
- `GET /api/users` – List users
- `POST /api/follow/:id` – Follow a user
- `DELETE /api/follow/:id` – Unfollow a user

---

## 🧑‍💻 Contributing

Pull requests are welcome!  
Please open an issue first to discuss any major changes.

---

## 📣 Credits

- Built with [React](https://react.dev/), [Express](https://expressjs.com/), [Drizzle ORM](https://orm.drizzle.team/), [Tailwind CSS](https://tailwindcss.com/), and [Neon](https://neon.tech/)
- Book covers and metadata via [Google Books API](https://developers.google.com/books)

---

## 🏆 License

MIT

---

> Made with ❤️ for book lovers everywhere!