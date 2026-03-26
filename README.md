# Batanani Digital - BOCRA Hackathon Project

A comprehensive full-stack digital platform for the Botswana Communications Regulatory Authority (BOCRA), featuring a modern React frontend and Express.js backend with TypeScript, Prisma ORM, and PostgreSQL database.

## 🌍 Project Overview

**Batanani Digital** is an integrated web application designed to modernize BOCRA's digital services and streamline operations for managing telecommunications regulations, licensing, complaints, and public communications in Botswana.

### Key Features
- 🔐 **Secure Authentication** - Role-based access control via Supabase
- 📋 **Complaint Management** - Track, manage, and respond to public complaints
- 📜 **Licensing System** - Telecommunications license applications and tracking
- 📚 **Document Portal** - Repository for regulatory documents and publications
- 💬 **AI-Powered Chat Support** - Real-time customer support (Groq AI)
- 📱 **WhatsApp Integration** - Support via Twilio WhatsApp API
- 🌐 **Multilingual Support** - English and Setswana
- 📊 **Admin Dashboard** - Analytics and system monitoring
- 🔔 **Notifications** - Real-time user alerts

## 📊 Project Structure

```
Batanani-Digital/
│
├── src/                               # Backend source (main branch)
│   ├── app.ts
│   ├── config/
│   ├── middleware/
│   └── modules/                       # Feature modules (MVC pattern)
│       ├── auth/
│       ├── chat/
│       ├── complaints/
│       ├── dashboard/
│       ├── documents/
│       └── licences/
│
├── prisma/                            # Database
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── BOCRA-frontend/                    # React frontend (frontend branch)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── locales/
│   │   └── i18n/
│   └── public/
│
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Complete Tech Stack with GitHub References

### Core Languages & Runtime

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[TypeScript](https://github.com/microsoft/TypeScript)** | [microsoft/TypeScript](https://github.com/microsoft/TypeScript) | Static type checking for JavaScript |
| **[Node.js](https://github.com/nodejs/node)** | [nodejs/node](https://github.com/nodejs/node) | JavaScript runtime environment |

### Backend Framework & Libraries

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[Express](https://github.com/expressjs/express)** | [expressjs/express](https://github.com/expressjs/express) | Web framework for Node.js |
| **[Prisma](https://github.com/prisma/prisma)** | [prisma/prisma](https://github.com/prisma/prisma) | Next-gen ORM for Node.js |
| **[PostgreSQL](https://github.com/postgres/postgres)** | [postgres/postgres](https://github.com/postgres/postgres) | Relational database |
| **[pg](https://github.com/brianc/node-postgres)** | [brianc/node-postgres](https://github.com/brianc/node-postgres) | PostgreSQL client for Node.js |
| **[@prisma/adapter-pg](https://github.com/prisma/prisma)** | [prisma/prisma](https://github.com/prisma/prisma) | PostgreSQL adapter for Prisma |
| **[Supabase](https://github.com/supabase/supabase)** | [supabase/supabase](https://github.com/supabase/supabase) | Open-source Firebase alternative |
| **[@supabase/supabase-js](https://github.com/supabase/supabase-js)** | [supabase/supabase-js](https://github.com/supabase/supabase-js) | JavaScript client for Supabase |

### Backend Security & Middleware

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[Helmet](https://github.com/helmetjs/helmet)** | [helmetjs/helmet](https://github.com/helmetjs/helmet) | Secure HTTP headers |
| **[CORS](https://github.com/expressjs/cors)** | [expressjs/cors](https://github.com/expressjs/cors) | Cross-Origin Resource Sharing |
| **[express-rate-limit](https://github.com/nfriedly/express-rate-limit)** | [nfriedly/express-rate-limit](https://github.com/nfriedly/express-rate-limit) | Rate limiting middleware |
| **[dotenv](https://github.com/motdotla/dotenv)** | [motdotla/dotenv](https://github.com/motdotla/dotenv) | Environment variable management |

### Frontend Framework & Build Tools

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[React](https://github.com/facebook/react)** | [facebook/react](https://github.com/facebook/react) | UI library |
| **[Vite](https://github.com/vitejs/vite)** | [vitejs/vite](https://github.com/vitejs/vite) | Next-gen build tool |
| **[@vitejs/plugin-react](https://github.com/vitejs/vite)** | [vitejs/vite](https://github.com/vitejs/vite) | React plugin for Vite |
| **[Vite Plugin PWA](https://github.com/vite-plugin-pwa/vite-plugin-pwa)** | [vite-plugin-pwa/vite-plugin-pwa](https://github.com/vite-plugin-pwa/vite-plugin-pwa) | PWA support for Vite |

### Frontend Routing & State Management

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[React Router](https://github.com/remix-run/react-router)** | [remix-run/react-router](https://github.com/remix-run/react-router) | Client-side routing |
| **[Zustand](https://github.com/pmndrs/zustand)** | [pmndrs/zustand](https://github.com/pmndrs/zustand) | Lightweight state management |

### Frontend Data Fetching & Query Management

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[TanStack Query (React Query)](https://github.com/TanStack/query)** | [TanStack/query](https://github.com/TanStack/query) | Powerful data fetching and caching |
| **[@tanstack/react-query](https://github.com/TanStack/query)** | [TanStack/query](https://github.com/TanStack/query) | React Query main package |
| **[@tanstack/react-query-devtools](https://github.com/TanStack/query)** | [TanStack/query](https://github.com/TanStack/query) | React Query dev tools |
| **[TanStack Table (React Table)](https://github.com/TanStack/table)** | [TanStack/table](https://github.com/TanStack/table) | Headless table library |
| **[@tanstack/react-table](https://github.com/TanStack/table)** | [TanStack/table](https://github.com/TanStack/table) | React Table main package |
| **[axios](https://github.com/axios/axios)** | [axios/axios](https://github.com/axios/axios) | Promise-based HTTP client |

### Frontend Styling

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[Tailwind CSS](https://github.com/tailwindlabs/tailwindcss)** | [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) | Utility-first CSS framework |
| **[PostCSS](https://github.com/postcss/postcss)** | [postcss/postcss](https://github.com/postcss/postcss) | CSS transformations |
| **[Autoprefixer](https://github.com/postcss/autoprefixer)** | [postcss/autoprefixer](https://github.com/postcss/autoprefixer) | CSS vendor prefixing |
| **[prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)** | [tailwindlabs/prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) | Tailwind class sorting |

### Frontend UI Component Libraries

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[Radix UI](https://github.com/radix-ui/primitives)** | [radix-ui/primitives](https://github.com/radix-ui/primitives) | Unstyled accessible components |
| **[@radix-ui/react-avatar](https://github.com/radix-ui/primitives)** | [radix-ui/primitives](https://github.com/radix-ui/primitives) | Avatar component |
| **[@radix-ui/react-dialog](https://github.com/radix-ui/primitives)** | [radix-ui/primitives](https://github.com/radix-ui/primitives) | Dialog/modal component |
| **[@radix-ui/react-dropdown-menu](https://github.com/radix-ui/primitives)** | [radix-ui/primitives](https://github.com/radix-ui/primitives) | Dropdown menu component |
| **[@radix-ui/react-label](https://github.com/radix-ui/primitives)** | [radix-ui/primitives](https://github.com/radix-ui/primitives) | Label component |
| **[@radix-ui/react-select](https://github.com/radix-ui/primitives)** | [radix-ui/primitives](https://github.com/radix-ui/primitives) | Select component |
| **[@radix-ui/react-separator](https://github.com/radix-ui/primitives)** | [radix-ui/primitives](https://github.com/radix-ui/primitives) | Separator component |
| **[@radix-ui/react-slot](https://github.com/radix-ui/primitives)** | [radix-ui/primitives](https://github.com/radix-ui/primitives) | Slot component |
| **[@radix-ui/react-switch](https://github.com/radix-ui/primitives)** | [radix-ui/primitives](https://github.com/radix-ui/primitives) | Toggle switch component |
| **[@radix-ui/react-tabs](https://github.com/radix-ui/primitives)** | [radix-ui/primitives](https://github.com/radix-ui/primitives) | Tabs component |
| **[@radix-ui/react-toast](https://github.com/radix-ui/primitives)** | [radix-ui/primitives](https://github.com/radix-ui/primitives) | Toast notification component |
| **[@radix-ui/react-tooltip](https://github.com/radix-ui/primitives)** | [radix-ui/primitives](https://github.com/radix-ui/primitives) | Tooltip component |
| **[Lucide React](https://github.com/lucide-icons/lucide)** | [lucide-icons/lucide](https://github.com/lucide-icons/lucide) | Beautiful icon library |
| **[lucide-react](https://github.com/lucide-icons/lucide)** | [lucide-icons/lucide](https://github.com/lucide-icons/lucide) | React icon components |
| **[Framer Motion](https://github.com/framer/motion)** | [framer/motion](https://github.com/framer/motion) | Production animation library |

### Frontend Forms & Validation

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[React Hook Form](https://github.com/react-hook-form/react-hook-form)** | [react-hook-form/react-hook-form](https://github.com/react-hook-form/react-hook-form) | Performant form library |
| **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** | [react-hook-form/resolvers](https://github.com/react-hook-form/resolvers) | Form validation resolvers |
| **[Zod](https://github.com/colinhacks/zod)** | [colinhacks/zod](https://github.com/colinhacks/zod) | TypeScript schema validation |
| **[class-variance-authority](https://github.com/joe-bell/class-variance-authority)** | [joe-bell/class-variance-authority](https://github.com/joe-bell/class-variance-authority) | CSS class utility |

### Frontend Utilities

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[clsx](https://github.com/lukeed/clsx)** | [lukeed/clsx](https://github.com/lukeed/clsx) | Class name utility |
| **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** | [dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge) | Merge Tailwind classes |
| **[React Dropzone](https://github.com/react-dropzone/react-dropzone)** | [react-dropzone/react-dropzone](https://github.com/react-dropzone/react-dropzone) | File upload component |
| **[react-hot-toast](https://github.com/timolins/react-hot-toast)** | [timolins/react-hot-toast](https://github.com/timolins/react-hot-toast) | Toast notifications |
| **[date-fns](https://github.com/date-fns/date-fns)** | [date-fns/date-fns](https://github.com/date-fns/date-fns) | Date utility library |
| **[Recharts](https://github.com/recharts/recharts)** | [recharts/recharts](https://github.com/recharts/recharts) | React charting library |

### Frontend Internationalization (i18n)

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[i18next](https://github.com/i18next/i18next)** | [i18next/i18next](https://github.com/i18next/i18next) | Internationalization framework |
| **[react-i18next](https://github.com/i18next/react-i18next)** | [i18next/react-i18next](https://github.com/i18next/react-i18next) | React i18next bindings |
| **[i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector)** | [i18next/i18next-browser-languageDetector](https://github.com/i18next/i18next-browser-languageDetector) | Browser language detection |

### Frontend Real-time Communication

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[Socket.io Client](https://github.com/socketio/socket.io-client)** | [socketio/socket.io-client](https://github.com/socketio/socket.io-client) | Real-time bidirectional communication |

### Frontend Database (Client-side)

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[Dexie](https://github.com/dexie/Dexie.js)** | [dexie/Dexie.js](https://github.com/dexie/Dexie.js) | IndexedDB wrapper |
| **[dexie-react-hooks](https://github.com/dexie/Dexie.js)** | [dexie/Dexie.js](https://github.com/dexie/Dexie.js) | React hooks for Dexie |

### Frontend PWA

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[Workbox Window](https://github.com/GoogleChromeLabs/workbox-window)** | [GoogleChromeLabs/workbox-window](https://github.com/GoogleChromeLabs/workbox-window) | Service worker client library |

### Development Tools - Backend

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[Nodemon](https://github.com/remy/nodemon)** | [remy/nodemon](https://github.com/remy/nodemon) | Auto-restart during development |
| **[ts-node](https://github.com/TypeStrong/ts-node)** | [TypeStrong/ts-node](https://github.com/TypeStrong/ts-node) | Execute TypeScript directly |

### Development Tools - Frontend

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[ESLint](https://github.com/eslint/eslint)** | [eslint/eslint](https://github.com/eslint/eslint) | JavaScript/TypeScript linter |
| **[@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint)** | [typescript-eslint/typescript-eslint](https://github.com/typescript-eslint/typescript-eslint) | TypeScript parser for ESLint |
| **[@typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint)** | [typescript-eslint/typescript-eslint](https://github.com/typescript-eslint/typescript-eslint) | TypeScript ESLint plugin |
| **[eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react)** | [jsx-eslint/eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) | React ESLint plugin |
| **[eslint-plugin-react-hooks](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks)** | [facebook/react](https://github.com/facebook/react) | React Hooks ESLint plugin |
| **[eslint-plugin-react-refresh](https://github.com/ArnaudBarre/eslint-plugin-react-refresh)** | [ArnaudBarre/eslint-plugin-react-refresh](https://github.com/ArnaudBarre/eslint-plugin-react-refresh) | Fast Refresh ESLint plugin |
| **[eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)** | [jsx-eslint/eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) | Accessibility ESLint plugin |
| **[Prettier](https://github.com/prettier/prettier)** | [prettier/prettier](https://github.com/prettier/prettier) | Code formatter |

### Testing Tools - Frontend

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[Vitest](https://github.com/vitest-dev/vitest)** | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) | Unit test framework |
| **[@vitest/ui](https://github.com/vitest-dev/vitest)** | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) | Vitest UI dashboard |
| **[@vitest/coverage-v8](https://github.com/vitest-dev/vitest)** | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) | Coverage reporting |
| **[@testing-library/react](https://github.com/testing-library/react-testing-library)** | [testing-library/react-testing-library](https://github.com/testing-library/react-testing-library) | React testing library |
| **[@testing-library/jest-dom](https://github.com/testing-library/jest-dom)** | [testing-library/jest-dom](https://github.com/testing-library/jest-dom) | Custom matchers for DOM |
| **[@testing-library/user-event](https://github.com/testing-library/user-event)** | [testing-library/user-event](https://github.com/testing-library/user-event) | User interaction simulation |
| **[jsdom](https://github.com/jsdom/jsdom)** | [jsdom/jsdom](https://github.com/jsdom/jsdom) | JavaScript DOM implementation |

### TypeScript Type Definitions

| Technology | GitHub Repository | Purpose |
|------------|-------------------|---------|
| **[@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped)** | [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) | Node.js type definitions |
| **[@types/react](https://github.com/DefinitelyTyped/DefinitelyTyped)** | [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) | React type definitions |
| **[@types/react-dom](https://github.com/DefinitelyTyped/DefinitelyTyped)** | [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) | React DOM type definitions |
| **[@types/express](https://github.com/DefinitelyTyped/DefinitelyTyped)** | [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) | Express type definitions |
| **[@types/cors](https://github.com/DefinitelyTyped/DefinitelyTyped)** | [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) | CORS type definitions |
| **[@types/pg](https://github.com/DefinitelyTyped/DefinitelyTyped)** | [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) | PostgreSQL type definitions |

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- PostgreSQL 12+ (or Supabase account)
- Git

### Backend Setup

```bash
# 1. Clone repository
git clone https://github.com/Amantl3/Batanani-Digital.git
cd Batanani-Digital

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with actual credentials

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate dev

# 6. Seed database (optional)
npx prisma db seed

# 7. Start development server
npm run dev
```

**Backend runs on:** `http://localhost:3000`

### Frontend Setup

```bash
# 1. Switch to frontend branch
git checkout frontend

# 2. Navigate to frontend directory
cd BOCRA-frontend

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.example .env
# Edit .env with API endpoints

# 5. Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

## 📋 API Routes

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user profile
- `POST /refresh` - Refresh auth token

### Complaints (`/api/complaints`)
- `GET /` - List all complaints
- `POST /` - Submit new complaint
- `GET /:id` - Get complaint details
- `PATCH /:id` - Update complaint
- `DELETE /:id` - Delete complaint

### Licenses (`/api/licences`)
- `GET /` - List all licenses
- `POST /` - Apply for license
- `GET /:id` - Get license details
- `PATCH /:id` - Update license status
- `DELETE /:id` - Cancel application

### Documents (`/api/documents`)
- `GET /` - List documents
- `POST /` - Upload document (admin)
- `GET /:id` - Get document details
- `DELETE /:id` - Delete document (admin)

### Chat (`/api/chat`)
- `POST /messages` - Send message
- `GET /messages` - Get chat history
- `GET /messages/:id` - Get specific message

### Dashboard (`/api/dashboard`)
- `GET /stats` - Get system statistics
- `GET /reports` - Get analytics reports
- `GET /users` - Get user data (admin)

## 🔐 Authentication & Security

### How Authentication Works
1. User registers or logs in via Supabase
2. Server receives JWT token from Supabase
3. Token stored in browser (Zustand store)
4. All API requests include Authorization header
5. Backend validates token via Supabase middleware

### Protected Routes (Frontend)
- `/dashboard` - Admin only
- `/portal/*` - Authenticated users
- `/complaints/track/*` - Authenticated users

### Protected Endpoints (Backend)
All endpoints except auth/public require valid JWT token in header:
```
Authorization: Bearer <supabase_jwt_token>
```

## 🌐 Internationalization (i18n)

### Supported Languages
- **en** - English
- **tn** - Setswana

### Translation Files
```
src/locales/
├── en.json      # English translations
└── tn.json      # Setswana translations
```

### Usage in Components
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  return <h1>{t('key.path')}</h1>;
}
```

## 📝 Environment Variables Reference


## 📦 Available Scripts

### Backend
```bash
npm run dev              # Development server with auto-reload
npm run build            # Build TypeScript
npm start                # Start production server
npm run typecheck        # Type checking
npx prisma studio       # Open Prisma database UI
npx prisma generate     # Generate Prisma client
npx prisma migrate      # Run migrations
npx prisma db seed      # Seed database
```

### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run type-check       # Check types
npm run test             # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
```

## 🎯 Data Fetching with TanStack Query (React Query)

### Configuration
TanStack Query is configured for efficient data fetching, caching, and synchronization:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['complaints'],
  queryFn: () => api.getComplaints(),
});

// Mutating data
const { mutate } = useMutation({
  mutationFn: (newComplaint) => api.createComplaint(newComplaint),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complaints'] }),
});
```

### Features
- Automatic caching and background refetching
- Built-in loading and error states
- Optimistic updates
- Request deduplication
- DevTools for debugging

## 🏗️ State Management with Zustand

### Store Structure
```typescript
// Auth Store
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// UI Store
const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

## 📊 Data Visualization with Recharts

Dashboard analytics use Recharts for interactive charts:
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Custom tooltips and legends

## 🎨 UI Components with Radix UI

All UI components use Radix UI for:
- Accessibility (WCAG 2.1 AA compliant)
- Unstyled by default (style with Tailwind)
- Keyboard navigation
- Screen reader support

## 📱 Responsive Design

The frontend uses Tailwind CSS with mobile-first approach:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

All pages are fully responsive and tested on various devices.

## 🚀 Deployment

### Backend Deployment (Railway/Heroku/Azure)
```bash
# Set environment variables on platform
git push deployment-branch

# The app automatically builds and deploys
```

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder to hosting platform
```

### Environment Variables for Production
- Update on hosting platform's dashboard
- Use same keys as local development
- Ensure database URL is production URL
- Use production API endpoints

## 🎓 Development Guidelines

### Code Style
- Use TypeScript (strict mode)
- Follow existing naming conventions
- Format with Prettier
- Use ESLint for linting

### Module Creation
1. Create folder in `src/modules/[name]`
2. Add `controller.ts`, `routes.ts`, `service.ts`
3. Export routes in main app.ts
4. Test all endpoints

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Commit migration files
4. Update types if needed

## 🤝 Contributing Guidelines

1. Create feature branch: `git checkout -b feature/description`
2. Make changes following code style
3. Test thoroughly
4. Commit with clear messages
5. Push and create pull request
6. Wait for code review and merge

## 📄 License

BOCRA Hackathon Project 2026

## 📞 Support & Contact

For issues, questions, or contributions:
- Create GitHub issues for bug reports
- Use discussions for feature requests
- Contact team for security concerns

## 🎉 Project Timeline

- **March 20, 2026** - Initial database setup
- **March 21, 2026** - Chat module added
- **March 24, 2026** - Document management added
- **Current** - Full-stack BOCRA digital platform

---

**Last Updated:** March 24, 2026  
**Status:** ✅ Main branch production-ready  
**Contributors:** BOCRA Hackathon Team

## 📚 Quick Reference

### Tech Stack Summary

**Frontend Stack:**
- React + TypeScript + Vite
- Tailwind CSS + Radix UI + Framer Motion
- Zustand + TanStack Query + React Hook Form
- Vitest + React Testing Library
- i18next for internationalization

**Backend Stack:**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Supabase for authentication
- Helmet + CORS + Rate Limiting
- Nodemon + ts-node for development

**All tools are referenced with their official GitHub repositories for easy access and contribution.**
