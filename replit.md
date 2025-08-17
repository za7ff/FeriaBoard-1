# Overview

This is a professional personal website for "Feria" inspired by the baguzel.com design aesthetic. The website features a modern dark theme with orange accent colors, comprehensive sections including hero area, skills showcase, statistics display, and comment system. The design follows baguzel.com's sophisticated layout with navigation header, professional typography, and clean card-based components. Comments are only visible to admin via hidden login.

# User Preferences

Preferred communication style: Simple, everyday language.
Website language: English (fully converted from Arabic)
Design preference: Formal and calm design with subtle animations, professional appearance, minimal and sophisticated
Admin access: Admin button positioned on the right side for easy access
Admin credentials: username "admin", password "newpass123" (hidden from UI)
Data persistence: Comments are permanently saved to PostgreSQL database
Session persistence: Login sessions last 30 days to prevent automatic logout
Discord notifications: Bot sends Discord messages when new comments are submitted
Personal information: Name is Meshall alHarbi, age 20, lives in Al-Qassim, Buraydah
Information button: Added "Information about me" button with personal details and custom Discord avatar
Avatar: Uses Discord profile image (https://cdn.discordapp.com/avatars/700928520716681237/adc96beeec6bdc6824d9584607682124.webp)

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
- **Complete Theme Overhaul**: Redesigned to match baguzel.com's modern aesthetic
- **Navigation Header**: Professional top navigation with Home, About, Contact, and Admin links
- **Hero Section**: Large heading with professional tagline and call-to-action button
- **Skills Showcase**: Horizontal scrolling tags displaying technical expertise
- **Statistics Section**: Professional stats display with impressive numbers
- **Color Scheme**: Dark theme with orange accent colors matching baguzel.com
- **Typography**: Modern Inter font with proper weight hierarchy
- **Professional Layout**: Clean sections with proper spacing and card-based design

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