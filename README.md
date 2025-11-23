# ProjectLaunch - AI-Powered Passion Project Platform

An AI-powered platform helping high school students discover, plan, and showcase meaningful passion projects that stand out in college applications.

## Features

✨ **AI-Powered Idea Generation** - Get personalized project ideas based on your interests and skills
🎯 **Structured Planning** - Break down projects into manageable milestones
📊 **Progress Tracking** - Gamified system with XP, levels, and streaks
🤖 **AI Mentor** - 24/7 guidance and support
🎨 **Portfolio Builder** - Showcase your projects beautifully
🌟 **Public Gallery** - Get inspired by other students' projects

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **AI**: OpenAI GPT-4o, Anthropic Claude
- **Vector Search**: Pinecone
- **Caching**: Upstash Redis
- **UI Components**: Radix UI, Lucide Icons
- **Styling**: Tailwind CSS with Duolingo-inspired design

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and database
- Clerk account for authentication
- OpenAI API key
- (Optional) Anthropic API key
- (Optional) Pinecone account for semantic search
- (Optional) Upstash Redis for caching

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd passion-project
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the `.env.example` file to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# AI Services
OPENAI_API_KEY="sk-..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Setting Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → Database and copy your connection strings
3. Update `DATABASE_URL` and `DIRECT_URL` in `.env`

### Setting Up Clerk

1. Create a new application at [clerk.com](https://clerk.com)
2. Configure sign-in/sign-up options (email, Google, etc.)
3. Copy your API keys to `.env`
4. **IMPORTANT - Set up webhook for user creation:**
   - Go to Clerk Dashboard → Webhooks
   - Click "Add Endpoint"
   - Endpoint URL: `https://your-domain.com/api/auth/webhook` (or `https://your-ngrok-url/api/auth/webhook` for local dev)
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret** (starts with `whsec_`) to `.env` as `CLERK_WEBHOOK_SECRET`
   - **Without this webhook, users won't be created in your database!**

### Database Setup

1. **Generate Prisma Client**

```bash
npx prisma generate
```

2. **Push schema to database**

```bash
npx prisma db push
```

3. **Open Prisma Studio (optional)**

```bash
npx prisma studio
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
passion-project/
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── providers.tsx      # React Query provider
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── profile/          # Profile-specific components
│   ├── projects/         # Project-specific components
│   └── gamification/     # Gamification components
├── lib/                   # Utility libraries
│   ├── db/               # Database client
│   ├── cache/            # Redis cache
│   ├── ai/               # AI clients
│   ├── services/         # Business logic
│   ├── validations/      # Zod schemas
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## Key Features Implementation Status

### ✅ Completed
- [x] Project setup and configuration
- [x] Database schema with Prisma
- [x] Clerk authentication integration
- [x] Tailwind CSS with Duolingo-inspired design
- [x] Core layout (sidebar, header, navigation)
- [x] Landing page
- [x] Dashboard page

### 🚧 To Do
- [ ] Profile onboarding flow
- [ ] AI-powered idea generation
- [ ] Project creation and management
- [ ] Gamification system (XP, levels, achievements)
- [ ] AI mentor chat interface
- [ ] Portfolio builder
- [ ] Public gallery
- [ ] Redis caching implementation

## Development Workflow

### Database Migrations

```bash
# Create a migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

## API Routes

### Authentication
- `POST /api/auth/webhook` - Clerk webhook for user sync

### Profile
- `GET /api/profile` - Get current user's profile
- `POST /api/profile` - Create profile
- `PATCH /api/profile` - Update profile

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PATCH /api/projects/[id]` - Update project

### AI
- `POST /api/ai/mentor` - Chat with AI mentor
- `POST /api/ai/ideas` - Generate project ideas

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables
4. Deploy!

## License

This project is licensed under the MIT License.

---

Built with ❤️ for students, by students.
