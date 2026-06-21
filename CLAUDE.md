# SportMatch

A sports trainer booking app — like Treatwell, but for personal trainers, coaches, and fitness instructors. Users browse trainers by sport/location, view profiles, and book sessions.

## Stack

- **Expo SDK 54** with Expo Router 6 (file-based routing under `src/app/`)
- **React Native 0.81** / React 19.1
- **TypeScript** (strict)
- **Supabase** — auth, database, storage (not yet wired up)
- **NativeWind or inline StyleSheet** — TBD, lean toward plain StyleSheet for now

> Always check https://docs.expo.dev/versions/v54.0.0/ before writing Expo-specific code.

## Project structure

```
src/
  app/          # Expo Router screens (_layout.tsx + screen files)
  components/   # Shared UI components
  constants/    # Theme tokens (theme.ts)
  hooks/        # Custom hooks
  global.css    # Global styles
```

## Design principles

- **Clean and minimalist** — lots of whitespace, no visual clutter
- **Mobile-first** — designed for iOS/Android, web is secondary
- **Screen by screen** — build one complete screen at a time before moving on
- Neutral palette with one accent color (currently `#208AEF` blue from splash)
- No dark mode complexity until the core screens are done

## App screens (planned order)

1. Onboarding / splash
2. Auth (sign up / log in)
3. Home — trainer discovery feed
4. Search & filters (sport, location, price)
5. Trainer profile
6. Booking flow (pick date/time, confirm)
7. My bookings
8. User profile / settings

## Conventions

- One screen = one file in `src/app/`
- Shared UI pieces go in `src/components/`
- No premature abstraction — duplicate a little before extracting a component
- No comments unless the WHY is non-obvious
- Keep components small and focused; avoid god-components
- Use `expo-router` `<Link>` and `router.push()` for navigation — no React Navigation directly

## Supabase (to be configured)

Tables will include: `users`, `trainers`, `sports`, `availabilities`, `bookings`. Schema TBD as screens are built.

## Running the app

```bash
npm start          # Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
```
