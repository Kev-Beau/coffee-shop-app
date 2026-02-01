# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CoffeeConnect** is a social media web app for coffee enthusiasts to discover, review, and share local coffee shops with friends. Built with Next.js 16, TypeScript, and Tailwind CSS.

**Location:** `/Users/kevinbeaudin/coffee-shop-app`

## Development Commands

### Start Development Server
```bash
cd ~/coffee-shop-app
npm run dev
```
The app runs at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Run Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

### Install Dependencies
**Note:** Due to npm cache permissions, use:
```bash
npm install --cache /tmp/npm-cache
```

## Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Runtime:** Node.js v24.13.0

### Project Structure

```
coffee-shop-app/
├── app/
│   ├── about/
│   │   └── page.tsx          # About page with app info
│   ├── shops/
│   │   ├── page.tsx          # Coffee shop listing page
│   │   └── [id]/
│   │       └── page.tsx      # Individual shop detail page
│   ├── types.ts              # TypeScript interfaces
│   ├── layout.tsx            # Root layout with metadata
│   ├── page.tsx              # Home/landing page
│   └── globals.css           # Global styles
├── public/                   # Static assets
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript config
├── next.config.ts            # Next.js config
└── tailwind.config.ts        # Tailwind config
```

### Key Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page with hero section and features |
| `/shops` | `app/shops/page.tsx` | Browse all coffee shops with filters |
| `/shops/[id]` | `app/shops/[id]/page.tsx` | Individual shop details and reviews |
| `/about` | `app/about/page.tsx` | About page and mission |

### Data Models

**CoffeeShop** interface (`app/types.ts`):
```typescript
{
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
  tags: string[];
  image: string;
  hours: string;
  wifi: boolean;
  outlets: boolean;
  quiet: boolean;
}
```

**Review** interface (`app/types.ts`):
```typescript
{
  id: string;
  shopId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
}
```

## Code Conventions

### Naming
- **Files:** `kebab-case.tsx` or `kebab-case.ts`
- **Components:** PascalCase (e.g., `ShopCard`, `ReviewList`)
- **Variables/Functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE

### Styling
- Use Tailwind utility classes
- Color scheme: amber/brown for coffee theme
- Rounded corners: `rounded-2xl` for cards
- Shadows: `shadow-md` for base, `shadow-lg` for emphasis
- Gradients: `from-amber-50 to-orange-50` for backgrounds

### Component Patterns
- Server Components by default (no `use client` unless needed)
- `Link` from `next/link` for navigation
- Async page components for dynamic routes

### Data Management
- Currently using hard-coded data in page components
- Shop data is in `app/shops/page.tsx`
- Shop details are in `app/shops/[id]/page.tsx`
- Review data is in `app/shops/[id]/page.tsx`

## Known Issues

### npm Cache Permissions
The npm cache has permission issues. When installing dependencies:
```bash
npm install --cache /tmp/npm-cache
```

## Future Enhancements

Planned features mentioned in the app:
- Friend recommendations
- Interactive maps with real-time availability
- Social features for planning coffee meetups
- Photo sharing and check-ins
- User authentication
- Database integration (currently using mock data)

## Development Notes

- The app uses the App Router (not Pages Router)
- All pages are server-rendered by default
- Dynamic routes use `[id]` folder syntax with `async` components
- Emoji icons are used instead of images for simplicity
