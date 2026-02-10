# my-first-book

Secure mdBook portal with Node.js + React + MongoDB.

**Dev with Docker**

1. Start services:

```bash
docker compose up --build
```

2. Open the React app: `http://localhost:5173`
3. Login with the seeded admin user (from `docker-compose.yml`):
   - email: `admin@example.com`
   - password: `admin1234`
4. Click **Open Book** to access the protected mdBook content.

**Notes**

- mdBook is built on-demand by the Node server when the `/book` route is accessed.
- Update admin credentials and secrets in `docker-compose.yml` or `server/.env`.
- Book sources live in `src/` and `book.toml` at the repo root.

**Local (without Docker)**

1. Start MongoDB locally.
2. Install mdBook if you don't already have it (`mdbook --version`).
2. Server:

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

3. Client:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```
