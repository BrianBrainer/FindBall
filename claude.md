# Football Game Platform - Claude Code Configuration

## Project Overview
A Next.js application for connecting football players with local games. Organizers post games, players join with upfront payment, waitlist system handles capacity management.

## Project Context
- **PRD Document**: See the comprehensive PRD artifact in '/Users/ryan.trainor/football-finder/decisions/Football Game Matching Platform - Product Requirements Document.pdf'
- **Key Features**: Payment-before-confirmation, waitlist system, geolocation-based discovery
- **Data Models**: Refer to TypeScript interfaces defined in PRD Section 3.2
- **API Patterns**: Follow RESTful endpoints outlined in PRD Section 3.3

## Tech Stack
- Next.js 14 with App Router
- TypeScript
- NextAuth.js
- Prisma + PostgreSQL
- Stripe for payments
- Vercel deployment

## Agents

### @architect
**Role:** System design and architecture decisions
**Responsibilities:**
- Database schema design
- API route structure
- Authentication flow design
- Payment integration architecture
- Caching strategies

### @frontend
**Role:** UI/UX implementation
**Responsibilities:** 
- React components with TypeScript
- CSS styling
- Form validation
- Real-time UI updates
- Mobile-responsive design
- Accessibility compliance

### @backend
**Role:** Server-side logic and APIs
**Responsibilities:**
- API route implementation
- Database queries with Prisma
- Authentication middleware
- Payment processing logic
- Real-time features (SSE)
- Error handling

### @database
**Role:** Data modeling and database operations
**Responsibilities:**
- Prisma schema updates
- Database migrations
- Query optimization
- Geospatial queries (PostGIS)
- Data relationships

## Coding Standards

### File Naming
- Components: PascalCase (`GameCard.tsx`)
- Pages: lowercase with hyphens (`create-game/page.tsx`)
- Utilities: camelCase (`formatGameTime.ts`)
- Types: PascalCase with `.types.ts` suffix

### Component Structure
```typescript
// Always use this pattern for components
interface ComponentProps {
  // Define props with JSDoc
}

export default function Component({ ...props }: ComponentProps) {
  // Component logic
  return (
    // JSX with proper TypeScript types
  )
}