# CoffeeConnect ☕

A social media web app for coffee enthusiasts to discover, review, and share local coffee shops with friends.

## Quick Start

### Start the Development Server
```bash
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Aliases (If Set Up)
```bash
# Navigate to project
coffee

# Start server
coffeestart

# Check git status
coffeestatus

# Run linter
coffeelint
```

## Project Structure

```
coffee-shop-app/
├── app/
│   ├── page.tsx          # Home/landing page
│   ├── shops/
│   │   ├── page.tsx      # Browse all coffee shops
│   │   └── [id]/page.tsx # Individual shop details
│   ├── about/page.tsx    # About page
│   └── types.ts          # TypeScript interfaces
├── CLAUDE.md             # Guide for Claude Code AI
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at port 3000 |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint to check code quality |

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first styling
- **React 19** - UI library

## Features

- ✅ Browse coffee shops with filters (WiFi, Outlets, Quiet)
- ✅ View individual shop details with reviews
- ✅ Responsive design for mobile and desktop
- ✅ Type-safe with TypeScript
- 🚧 User authentication (planned)
- 🚧 Map integration (planned)
- 🚧 Social features (planned)

## Saving Your Work

### When Done Coding for the Day:
1. **Stop the dev server** - Press `Ctrl+C` in the terminal running the server
2. **Commit your changes** (if you made any):
   ```bash
   git add .
   git commit -m "Describe what you changed"
   ```
3. **Close the terminal** - Your work is safely saved in Git

### Coming Back to Work:
1. **Open a new terminal**
2. **Navigate to project**:
   - Type `coffee` (if using aliases)
   - Or `cd ~/coffee-shop-app`
3. **Start the server**:
   - Type `coffeestart` (if using aliases)
   - Or `npm run dev`
4. **Open browser** to http://localhost:3000

## Git Workflow

```bash
# Check what changed
git status

# See what you changed in files
git diff

# Save your changes
git add .
git commit -m "Your message here"

# See commit history
git log
```

## Known Issues

### npm Cache Permissions
If you have trouble installing packages:
```bash
npm install --cache /tmp/npm-cache
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Future Enhancements

- [ ] User authentication (NextAuth.js)
- [ ] Real database (Prisma + PostgreSQL)
- [ ] Google Maps integration for shop locations
- [ ] Photo uploads for shops and reviews
- [ ] Friend system and social features
- [ ] Real-time notifications
- [ ] Mobile app version
