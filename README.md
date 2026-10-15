# CleanOnes Admin

CleanOnes Admin is the web dashboard for the CleanOnes service. This project uses Next.js, React, TypeScript, and Tailwind CSS.

## Requirements

- Node.js 20.9 or later (Node.js 20 LTS or later is recommended)
- npm (the repository includes `package-lock.json`)
- Access to a running CleanOnes backend API

Check your installed versions:

```bash
node --version
npm --version
```

## Install and run locally

Open a terminal in the `cleanones-admin` directory:

```bash
cd cleanones-admin
npm ci
```

Create a `.env.local` file in this directory and configure the backend URL as described below. Then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The development server listens on port **3000** and is configured to accept connections from other devices on the network.

When running this project alongside CleanOnes Client, keep each project in its own terminal. Client runs on port **3001** by default.

## Environment configuration

The Admin app needs the CleanOnes backend API. In `cleanones-admin/.env.local`, set:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Replace `http://localhost:5000` with the actual backend origin and port in your environment. Do **not** add `/api/v1` to this value: the Admin app adds that API prefix when making requests. The configured origin is also used for the Socket.IO connection by default.

Optional integrations:

```dotenv
# Set this only when the Socket.IO server is hosted at a different origin
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Needed for Google Maps features
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Needed for GeoNames place search
NEXT_PUBLIC_GEONAMES_USERNAME=your-geonames-username

# Set to a truthy value to enable development request logging
DEBUG_REQUESTS=1
```

Restart the development server after changing `.env.local`. Variables beginning with `NEXT_PUBLIC_` are made available to browser code; do not put private credentials in them. Keep `.env.local` out of version control and use your deployment platform's environment-variable settings for deployed environments.

## Available commands

Run these from the `cleanones-admin` directory:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 |
| `npm run lint` | Run ESLint |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build (run `npm run build` first) |

To test a production build locally:

```bash
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) after the server starts.

## Backend and API notes

- The backend must be running and reachable from the Admin app.
- Browser API calls use the Next.js `/api/proxy` route, which forwards requests to the configured backend's `/api/v1` API.
- For a local backend, use its actual host and port in `NEXT_PUBLIC_API_BASE_URL`; the example port `5000` is only a placeholder.
- If API requests fail, check the backend URL, backend availability, and the browser/server terminal logs.
- Google Maps and GeoNames are optional integrations; configure their variables only if the corresponding features are needed.

## Troubleshooting

### Port 3000 is already in use

Stop the other process using port 3000, or run Next.js on another port:

```bash
npm run dev -- -p 3002
```

### API requests fail or return a network error

Confirm the backend is running, update `NEXT_PUBLIC_API_BASE_URL` to the backend origin (without `/api/v1`), and restart the Admin dev server.

### Dependency installation fails

Confirm that Node.js meets the minimum version and run `npm ci` from this project's directory. If `package-lock.json` has intentionally changed, use `npm install` to install and update the lockfile.

## Related documentation

- [Next.js documentation](https://nextjs.org/docs)
