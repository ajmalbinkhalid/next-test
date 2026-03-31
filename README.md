# NexLearn Frontend

Frontend foundation for a Next.js App Router exam platform with OTP auth, profile onboarding, a protected exam flow, and a local proxy layer to avoid browser CORS issues while developing on `localhost:3000`.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Axios
- Zustand
- TanStack Query
- React Hook Form + Zod
- Sonner for feedback toasts

## Project Structure

```text
src
├── app
│   ├── (auth)
│   ├── (protected)
│   └── api
├── api
│   └── config
├── components
│   ├── shared
│   └── ui
├── contexts
├── hooks
├── lib
├── provider
├── types
└── utils
```

## Environment Variables

Create a `.env.local` file using `.env.example`.

```bash
NEXT_PUBLIC_API_BASE_URL=/api
UPSTREAM_API_BASE_URL=https://nexlearn.noviindusdemosites.in
```

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- Browser requests go to the local Next.js proxy route at `/api/[...path]`, which forwards to the upstream API.
- Auth state is managed with Zustand, mirrored into local storage, and reflected in a lightweight browser cookie so protected layouts can redirect early.
- The Axios client attaches the access token automatically and performs a one-time refresh-token retry before forcing logout on session expiry.
- The UI foundation is intentionally reusable: API modules, providers, context, utils, and route-local components are separated for future expansion.
