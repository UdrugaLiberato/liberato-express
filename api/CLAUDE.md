# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Use bun instead of npm for all package management tasks.**

- `bun run dev` - Start development server with hot reload using nodemon and ts-node
- `bun run build` - Compile TypeScript to JavaScript in the `dist/` directory
- `bun run start` - Start production server from compiled JavaScript
- `bun run test` - Run Jest tests (automatically cleans old test files from dist/)
- `bun run test:prepare` - Reset test database using the shell script
- `bun run lint` - Run ESLint on TypeScript files
- `bun run lint:fix` - Run ESLint with auto-fix
- `bun run format` - Format code with Prettier
- `bun run format:check` - Check code formatting without making changes

## Database and Schema

This project uses **Prisma ORM** with PostgreSQL. The database schema is defined in `prisma/schema.prisma`.

**Core entities:**
- `user` - User accounts managed by Clerk authentication
- `city` - Geographic cities with coordinates and radius
- `category` - Business/location categories with slugs
- `location` - Main entity linking cities, categories, and users
- `question` - Survey questions linked to categories
- `answer` - User responses to questions about locations
- `image` - File attachments for cities, categories, and locations

**Key relationships:**
- Locations belong to a city and category, optionally owned by a user
- Images can be attached to cities, categories, or locations
- Answers link questions to specific locations
- All entities support soft deletion via `deletedAt` timestamps

## Architecture Overview

**Layered architecture pattern:**
- **Routes** (`src/routes/`) - Express route definitions with middleware
- **Controllers** (`src/controllers/`) - Request/response handling and validation
- **Services** (`src/services/`) - Business logic and database operations
- **Utils** (`src/utils/`) - Reusable utility functions for each domain

**Authentication & Authorization:**
- Uses Clerk for user authentication and session management
- Webhook handling for Clerk user lifecycle events
- Permission-based access control defined in `src/config/permissions.ts`

**File Upload System:**
- Local file uploads via multer to `uploads/` directory
- Async background processing sends files to external store service
- Images are linked to database entities after successful upload

**Caching:**
- Redis-based caching middleware for GET endpoints
- Graceful Redis connection handling with proper shutdown

**Configuration:**
- Environment variables validated and typed in `src/config/env.ts`
- Required: DATABASE_URL, GOOGLE_API_KEY, CLERK_* keys, STORE_URL

## Testing

Uses Jest with TypeScript support. Tests are located in `src/tests/` and are excluded from ESLint. The test suite includes integration tests for major endpoints and utilities.

## Key Development Notes

- TypeScript with strict configuration
- ESLint ignores test files and enforces Prettier formatting
- All database operations use Prisma client
- Controllers follow a consistent pattern using utility functions from `controller-utils.ts`
- Services handle the core business logic and return structured data
- Image uploads are processed asynchronously to avoid blocking API responses