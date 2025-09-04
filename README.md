# Football Finder

A Next.js application for connecting football players with local games. Organizers can post games, players can join with upfront payment, and a waitlist system handles capacity management.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [API Routes](#api-routes)
- [Getting Started](#getting-started)
- [Development Guidelines](#development-guidelines)

## 🎯 Overview

Football Finder is a platform designed to solve the common problem of organizing local football games. It provides a seamless experience for:

- **Organizers**: Create and manage football games with player capacity limits
- **Players**: Discover, join, and track local football games
- **Community**: Build connections through shared sporting activities

### Key Business Logic

- **Payment-before-confirmation**: Players pay upfront to secure their spot
- **Waitlist system**: Automatic queue management for full games
- **Time conflict prevention**: Users cannot join overlapping games
- **Geolocation-based discovery**: Find games in your area

## ✨ Key Features

### For Players
- 🔍 **Game Discovery**: Browse available games with filtering options
- 💳 **Secure Payments**: Stripe integration for game fees
- ⏰ **Conflict Prevention**: Automatic detection of scheduling conflicts
- 👤 **Profile Management**: Track game history and preferences
- 📱 **Responsive Design**: Mobile-optimized experience

### For Organizers
- 🏟️ **Game Creation**: Easy game setup with location and pricing
- 👥 **Player Management**: View joined players and manage capacity
- 💰 **Payment Tracking**: Monitor payments and manage refunds
- 📊 **Analytics**: Track game performance and player engagement

### System Features
- 🔐 **Multi-auth**: Email/password and Google OAuth support
- 🚫 **Access Control**: Role-based permissions and validations
- ⚡ **Real-time Updates**: Live game status and player count updates
- 🗺️ **Location Services**: PostGIS integration for geospatial queries

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Components** - Reusable UI components

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Prisma ORM** - Database object-relational mapping
- **PostgreSQL** - Primary database with PostGIS extension
- **NextAuth.js** - Authentication framework

### External Services
- **Stripe** - Payment processing
- **Vercel** - Deployment platform
- **PostGIS** - Geospatial database extension

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   └── games/                # Game-related endpoints
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # User dashboard
│   │   ├── organized/            # User's organized games
│   │   └── joined/               # User's joined games
│   ├── games/                    # Game-related pages
│   │   ├── [id]/                 # Individual game pages
│   │   │   ├── join/             # Game joining flow
│   │   │   └── manage/           # Game management (organizers)
│   │   └── create/               # Game creation
│   └── users/                    # User profile pages
├── components/                   # Reusable UI components
│   ├── game/                     # Game-specific components
│   └── ui/                       # Generic UI components
├── lib/                         # Utility libraries
├── types/                       # TypeScript type definitions
└── utils/                       # Helper functions
```

### Key Directories Explained

- **`/app`**: Next.js 13+ App Router structure with file-based routing
- **`/components`**: Reusable React components organized by feature
- **`/lib`**: Core utilities like database connection and authentication config
- **`/types`**: TypeScript interfaces and type definitions
- **`/utils`**: Helper functions for formatting, validation, etc.

## 🧩 Core Components

### Game Components
- **`GameCard`**: Displays game information with join/leave functionality
- **`JoinGameForm`**: Handles game joining with payment integration
- **`LeaveGameButton`**: Manages leaving games with confirmation
- **`GameFilters`**: Filter interface for game discovery

### UI Components
- **`Card`**: Generic card container with header/content/footer
- **`Button`**: Styled button component with variants
- **`Badge`**: Status indicators for games and users
- **`Modal`**: Reusable modal dialog component

### Layout Components
- **`Navigation`**: Main site navigation with user context
- **`Footer`**: Site footer with links and information
- **`Layout`**: Page wrapper with common elements

## 🗃 Database Schema

### Core Models

#### User
```prisma
model User {
  id          String   @id @default(cuid())
  name        String?
  email       String   @unique
  password    String?  // For email/password auth
  phone       String?
  location    String?
  bio         String?
  skillLevel  SkillLevel?
  createdAt   DateTime @default(now())
  
  // Relations
  organizedGames  Game[]
  gameSignups     GameSignup[]
}
```

#### Game
```prisma
model Game {
  id             String      @id @default(cuid())
  title          String
  description    String?
  date           DateTime
  duration       Int         // Minutes
  location       String
  latitude       Float?
  longitude      Float?
  maxPlayers     Int
  currentPlayers Int         @default(0)
  pricePerPlayer Decimal
  gameType       GameType
  skillLevel     SkillLevel
  status         GameStatus  @default(OPEN)
  isPublic       Boolean     @default(true)
  
  organizerId    String
  organizer      User        @relation(fields: [organizerId], references: [id])
  signups        GameSignup[]
  
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}
```

#### GameSignup
```prisma
model GameSignup {
  id        String       @id @default(cuid())
  userId    String
  gameId    String
  status    SignupStatus @default(CONFIRMED)
  position  Int?         // For waitlist ordering
  createdAt DateTime     @default(now())
  
  user      User         @relation(fields: [userId], references: [id])
  game      Game         @relation(fields: [gameId], references: [id])
  
  @@unique([userId, gameId])
}
```

### Enums
- **`GameType`**: CASUAL, COMPETITIVE, PICKUP, TOURNAMENT
- **`SkillLevel`**: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- **`GameStatus`**: OPEN, CLOSED, CANCELLED, EXPIRED
- **`SignupStatus`**: CONFIRMED, PENDING_PAYMENT, WAITLISTED, CANCELLED

## 🔐 Authentication

The application supports multiple authentication methods:

### Email/Password Authentication
- Custom credentials provider using NextAuth.js
- Password hashing with bcrypt
- User registration and login flows

### OAuth Integration
- Google OAuth provider
- Automatic account linking
- Social profile information sync

### Session Management
- JWT-based sessions for credentials auth
- Database sessions for OAuth
- Secure session handling with NextAuth.js

### Configuration
```typescript
// /src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({...}),
    GoogleProvider({...})
  ],
  session: { strategy: "jwt" },
  callbacks: {...}
}
```

## 🛣 API Routes

### Authentication Routes
- `POST /api/auth/[...nextauth]` - NextAuth.js handler
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signin` - Email/password sign in

### Game Management Routes
- `GET /api/games` - List available games
- `POST /api/games` - Create new game
- `GET /api/games/[id]` - Get game details
- `PUT /api/games/[id]` - Update game (organizer only)
- `DELETE /api/games/[id]` - Cancel game (organizer only)

### Game Participation Routes
- `POST /api/games/[id]/join` - Join a game
- `POST /api/games/[id]/leave` - Leave a game
- `GET /api/games/[id]/players` - List game players (organizer only)

### User Routes
- `GET /api/users/[id]` - Get user profile
- `PUT /api/users/[id]` - Update user profile
- `GET /api/users/[id]/games` - Get user's games

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Stripe account (for payments)
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd football-finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   STRIPE_SECRET_KEY="sk_test_..."
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Code Quality
npm run lint                   # Run ESLint
npm run lint:fix               # Run ESLint with auto-fix
npm run format                 # Format code with Prettier
npm run format:check           # Check code formatting
npm run type-check             # Run TypeScript type checking
npm run check-all              # Run all checks (types, lint, format)
```

## 📋 Development Guidelines

### Code Style
- **TypeScript**: All code must be type-safe
- **ESLint**: Follow configured linting rules (see `eslint.config.mjs`)
- **Prettier**: Consistent code formatting (see `.prettierrc`)
- **Components**: Use PascalCase for component files
- **Utilities**: Use camelCase for utility functions

### ESLint Configuration
The project uses a comprehensive ESLint setup with the following rules:
- **Next.js**: Core web vitals and TypeScript rules
- **React**: React-specific linting with hooks validation
- **TypeScript**: Strict type checking with warnings for `any` types
- **Accessibility**: JSX accessibility rules for better UX
- **Import Organization**: Automatic import sorting and organization
- **Code Quality**: Consistent code patterns and best practices

### Prettier Configuration
Code formatting is standardized with Prettier:
- **Semi-colons**: Required
- **Quotes**: Single quotes preferred
- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Trailing Commas**: ES5 compatible

### File Naming Conventions
- **Pages**: lowercase with hyphens (`create-game/page.tsx`)
- **Components**: PascalCase (`GameCard.tsx`)
- **Utilities**: camelCase (`formatGameTime.ts`)
- **Types**: PascalCase with `.types.ts` suffix

### Component Structure
```typescript
// Standard component pattern
interface ComponentProps {
  // Props with JSDoc comments
}

export default function Component({ ...props }: ComponentProps) {
  // Component logic
  return (
    // JSX with proper TypeScript types
  )
}
```

### Database Guidelines
- Use Prisma migrations for schema changes
- Always include proper relations and indexes
- Use appropriate data types and constraints
- Follow naming conventions (camelCase for fields)

### API Guidelines
- RESTful endpoint design
- Proper HTTP status codes
- Consistent error response format
- Input validation and sanitization
- Authentication checks where required

### Security Best Practices
- Never commit secrets or API keys
- Validate all user inputs
- Implement proper CORS policies
- Use HTTPS in production
- Follow NextAuth.js security guidelines

## 🔧 Key Features Implementation

### Time Conflict Prevention
The system prevents users from joining games that overlap with their existing commitments:

```typescript
// 30-minute buffer between games
const hasTimeConflict = checkGameTimeConflict(targetGame, userJoinedGames)
if (hasTimeConflict) {
  // Prevent joining and show warning
}
```

### Payment Integration
Stripe handles all payment processing:

```typescript
// Payment flow (simplified)
const paymentIntent = await stripe.paymentIntents.create({
  amount: gamePrice * 100, // Convert to cents
  currency: 'usd',
  metadata: { gameId, userId }
})
```

### Real-time Updates
The application uses React's state management for real-time UI updates:

```typescript
// Example: Live player count updates
const [playerCount, setPlayerCount] = useState(game.currentPlayers)
// Updates when players join/leave
```

## 📚 Additional Resources

- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Documentation**: [prisma.io/docs](https://prisma.io/docs)
- **NextAuth.js Documentation**: [next-auth.js.org](https://next-auth.js.org)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)
- **Stripe API**: [stripe.com/docs/api](https://stripe.com/docs/api)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.