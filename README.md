# CoffeeConnect ☕

A social media web app for coffee enthusiasts to discover, review, and share local coffee shops with friends.

## Quick Start - Ultra Simplified!

### The Only Two Commands You Need:

```bash
# START: Begin coding session
coffee

# END: Save and finish
finished
```

That's it! The `coffee` command navigates to the project and starts the server.
The `finished` command stops the server, commits your changes, and exits.

### What Happens:
**When you type `coffee`:**
- Navigates to `~/coffee-shop-app`
- Starts dev server at http://localhost:3000
- Opens your browser to see the app
- Ready to code!

**When you type `finished`:**
- Checks if you have changes
- Asks if you want to commit them
- Saves everything to Git
- Stops the server
- Exits the session

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

## Your Complete Workflow

### Starting a Coding Session:
```bash
coffee
```
That's one command! The terminal will show:
```
☕ Starting CoffeeConnect...
📂 Project: ~/coffee-shop-app
🌐 Server: http://localhost:3000

When done coding, type: finished

▲ Next.js 16.1.6
- Local:        http://localhost:3000
✓ Ready in 1.2s
```

### Ending a Coding Session:
```bash
finished
```
You'll be prompted if you have changes:
```
☕ Ending CoffeeConnect session...

📝 You have uncommitted changes!

Would you like to commit these changes? (y/n): y
Enter commit message: Added new contact page
✓ Changes committed!

✓ Session saved. Happy caffeination! ☕
```

**Pro tip:** Type `n` if you don't want to commit - changes will be stashed safely.

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
