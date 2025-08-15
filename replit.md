# Overview

This is a minimalist personal website for "Feria" with an enhanced animated background and simple comment system. The website features the name "Feria" in large animated text with luxury shimmer effects, a welcome animation notification for new visitors, and a refined comment submission area. Comments are only visible to admin via hidden login. The design is elegant and modern with animated gradient background, enhanced floating particles with color variations, and smooth transitions throughout.

# User Preferences

Preferred communication style: Simple, everyday language.
Website language: English (fully converted from Arabic)
Design preference: Clean modern dark design with just the Feria text and comment form, minimal and functional
Admin access: Admin button positioned on the right side for easy access
Admin credentials: username "admin", password "newpass123" (hidden from UI)
Data persistence: Comments are permanently saved to PostgreSQL database
Personal information: Name is Meshall alHarbi, age 20, lives in Al-Qassim, Buraydah
Information button: Added "Information about me" button with personal details and avatar

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom luxury-themed color scheme (gold accents on black background)
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Modular component architecture with reusable UI components

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with separate routes for public comments and admin moderation
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Request Logging**: Custom middleware for API request logging with response capture
- **Development**: Hot reload with Vite integration in development mode

## Data Layer
- **Database**: PostgreSQL with Neon Database serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Two main entities - users (admin authentication) and comments (persistent storage)
- **Validation**: Zod schemas for runtime validation shared between client and server
- **Storage Pattern**: DatabaseStorage implementation with PostgreSQL persistence
- **Persistence**: Comments are permanently stored and survive server restarts

## Authentication & Authorization
- **Current State**: Basic structure in place but not fully implemented
- **User Management**: User schema exists but no active authentication flow
- **Comment Moderation**: Simple approval-based system without user roles

## Form Validation & Data Flow
- **Client-side**: React Hook Form with Zod resolver for immediate feedback
- **Server-side**: Zod validation for all API inputs
- **Shared Schemas**: Common validation schemas in shared directory
- **Error Handling**: Graceful error display with toast notifications

## Development Tools
- **Build System**: Vite with TypeScript support and hot module replacement
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Database Migrations**: Drizzle Kit for schema migrations
- **Development Server**: Express with Vite middleware integration

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connection**: Uses `@neondatabase/serverless` for database connectivity

## UI Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **shadcn/ui**: Pre-built component system based on Radix UI
- **Lucide React**: Icon library for consistent iconography

## Recent Enhancements (January 2025)
- **Simplified Modern Design**: Clean dark background with modern glassmorphism card for comment form
- **Minimalist Layout**: Just "Feria" title and comment submission form as requested
- **Animated Background**: Added floating geometric shapes with smooth animations
- **Admin Button**: Positioned Admin button on the right side for easy access

## Styling & Design
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Google Fonts**: Inter, DM Sans, Fira Code, and other typography options
- **CSS Variables**: Custom design tokens for colors and spacing

## Form & Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **@hookform/resolvers**: Integration between React Hook Form and Zod

## State Management & API
- **TanStack Query**: Server state management with caching and synchronization
- **Date-fns**: Date manipulation and formatting utilities

## Development Environment
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution environment for development server