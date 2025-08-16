# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Use bun instead of npm for package management.**

- `bun run dev` - Start development server with hot reload using nodemon and ts-node
- `bun run build` - Compile TypeScript to JavaScript in dist/ directory
- `bun start` - Run production server from compiled dist/index.js
- `bun test` - Run Jest tests (automatically cleans compiled test files first)
- `bun run test:prepare` - Prepare test database (runs reset-test-db.sh script)
- `bun run lint` - Run ESLint on TypeScript files
- `bun run lint:fix` - Run ESLint with auto-fix
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting

## Project Architecture

This is a **Node.js Express API** for a location-based application with the following structure:

### Core Technologies

- **Express.js** - Web framework
- **TypeScript** - Language
- **Prisma** - ORM with PostgreSQL database
- **Clerk** - Authentication service
- **Redis** - Caching layer
- **Google Maps API** - Location services
- **Zod** - Schema validation
- **Axios** - HTTP client for external API calls

### Folder Structure

```
src/
├── config/          # Environment, Prisma, permissions config
├── controllers/     # HTTP request handlers
├── routes/          # Express route definitions
├── services/        # Business logic layer
├── utils/           # Helper functions and utilities
├── middleware/      # Express middleware (cache, upload)
├── types/           # TypeScript type definitions
├── exceptions/      # Custom error classes
└── tests/           # Jest test files
```

### Database Models

Core entities: `user`, `city`, `location`, `category`, `question`, `answer`, `image`, `vote`, `sponsor`, `notification`

- **Locations** belong to cities and categories, can have images and answers to questions
- **Users** can own locations (via Clerk authentication)
- **Cities** have geographic boundaries (lat/lng + radius)
- **Categories** organize locations with multilingual descriptions
- **Questions/Answers** provide rating/feedback system for locations
- **Votes** allow users to vote on locations (upvote/downvote)
- **Sponsors** represent business partners with associated images and metadata
- **Notifications** store device tokens for push notifications with platform support (ios/android/web, no user relation required)

### Key Patterns

- **Service Layer Pattern**: Controllers delegate to services for business logic
- **Utility Functions**: Shared logic in utils/ for data transformation and validation
- **Middleware**: Cache layer and file upload handling
- **Type Safety**: Custom TypeScript types in types/ directory
- **Graceful Shutdown**: Redis connection cleanup on server termination

### Authentication & Security

- Clerk middleware handles authentication
- Webhook endpoint for Clerk user events (before JSON parsing)
- CORS configured for cross-origin requests
- File upload handling with Multer

### Cache Strategy

Redis caching implemented in middleware with connection management.

### Important Notes

- Webhook routes require raw body parsing and must be defined before express.json()
- Tests are excluded from ESLint configuration
- Use tsconfig-paths for module resolution
- Database migrations managed through Prisma
- API includes voting system for locations and sponsor management
- Global statistics endpoint available for application metrics
- Notifications API supports public device token registration with platform filtering (active query: true/false/all)
