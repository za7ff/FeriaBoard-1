# Overview

This is a minimalist personal website for "Feria" with a black animated background and simple comment system. The website features just the name "Feria" in large white text and a comment submission area below. Comments are only visible to admin via hidden login. The design is clean and minimal with animated gradient background and floating particles.

# User Preferences

Preferred communication style: Simple, everyday language.
Website language: English (fully converted from Arabic)
Design preference: Minimalist, black animated background, clean design without unnecessary elements
Admin access: Shift + Right-click context menu for secure hidden admin access (no visible credentials)
Admin credentials: username "admin", password "secret123" (hidden from UI)

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
- **Schema**: Two main entities - users (for future authentication) and comments (with approval workflow)
- **Validation**: Zod schemas for runtime validation shared between client and server
- **Storage Pattern**: Abstracted storage interface with in-memory implementation for development

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