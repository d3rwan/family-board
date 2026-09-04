# Family Board

A web application to display family calendars on a family board.

## Features

- Display Google Calendar events for each family member
- Intuitive user interface with day navigation
- Customizable colors and avatars for each member
- Google Calendar API integration
- Modern and responsive interface

## Configuration

The application configuration is stored in the browser's localStorage under the key `family-board-config`. It contains:

1. List of people with their configurations:
   - Name
   - Custom color
   - Avatar (URL)
   - Google Calendar ID

2. Environment variables:
   - Google Client ID
   - Google Client Secret
   - Google Redirect URI

The configuration can be modified through the user interface by clicking the ⚙️ button in the top right corner.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/family-board.git
   cd family-board
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the application in development mode:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — Starts the Vite development server with hot reload; use it for local development.
- `npm run build` — Type-checks with TypeScript and creates a production build; use it before deploying.
- `npm run build:gh-pages` — Type-checks and builds with the `/family-board` base path; use it when deploying to GitHub Pages.
- `npm run lint` — Runs ESLint over the project; use it to check code style and catch issues.
- `npm run preview` — Serves the production build locally for preview; use it to verify the build output.

## Google Calendar Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials:
   - Application type: Web Application
   - Authorized redirect URIs: `http://localhost:5173` (for development)
5. Copy the Client ID and Client Secret into your configuration

## Usage

1. Launch the application
2. Click on the "Connect with Google" button
3. Authorize calendar access
4. Configure family members and their calendars in settings
5. Navigate between days to view events

## Technologies used

- React
- TypeScript
- Vite
- Google Calendar API
- CSS Modules
- date-fns
