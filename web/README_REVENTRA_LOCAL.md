Reventra - Local Run Instructions
1. Install dependencies:
   cd apps/web
   npm install    # or bun install

2. Apply DB migrations (creates tables):
   npx prisma migrate deploy
   # or if using bun: bunx prisma migrate deploy

3. Run development server:
   npm run dev
   # or bun run dev

4. Admin login (dev only):
   Email: kedar.marpakwar17@gmail.com
   Password: Kedar$1726

Notes:
- .env is pre-populated to connect to your Aiven service.
- For production, rotate DB credentials and remove the dev super-admin password.
- To enable real email magic links, set RESEND_API_KEY in .env.
