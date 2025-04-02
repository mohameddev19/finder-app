# Finder App

## Project Goal

The Finder App aims to assist families and authorities in locating missing persons and tracking released prisoners. It provides a platform for:

1.  **Reporting Missing Persons:** Allowing users (family members, friends) to submit information about individuals who are missing.
2.  **Searching for Missing Persons:** Enabling users to search the database for missing individuals based on various criteria.
3.  **Managing Released Prisoners:** Providing a secure interface for authorized personnel to record and manage information about released prisoners, potentially aiding in investigations or monitoring.
4.  **Connecting Information:** Facilitating the potential connection between missing persons reports and released prisoner data where legally and ethically permissible.

## Technology Stack

-   **Framework:** [Next.js](https://nextjs.org/) (React framework)
-   **UI Library:** [Mantine](https://mantine.dev/)
-   **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/)
-   **Database Provider:** [Neon](https://neon.tech/) (Serverless Postgres)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Authentication:** JWT (JSON Web Tokens)

## Project Structure

```
finder-app/
├── middleware.ts           # Handles authentication and route protection
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies and scripts
├── postcss.config.mjs      # PostCSS configuration (for Mantine)
├── public/                 # Static assets (images, fonts, etc.)
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── api/            # API route handlers
│   │   │   ├── auth/       # Authentication endpoints (login, register, logout)
│   │   │   └── ...         # Other API endpoints (prisoners, missing persons)
│   │   ├── (auth)/         # Route group for authentication pages (login, register)
│   │   ├── (main)/         # Route group for main application pages
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable UI components
│   ├── db/                 # Drizzle ORM setup
│   │   ├── migrate.ts      # Database migration script
│   │   ├── schema.ts       # Database table definitions
│   │   └── index.ts        # Drizzle client instance
│   ├── lib/                # Utility functions and helpers
│   │   └── auth.ts         # JWT token verification and user session logic
│   └── styles/             # Global styles (if any)
├── tsconfig.json           # TypeScript configuration
└── drizzle.config.ts       # Drizzle configuration
```

## Key Mechanisms

-   **Authentication:**
    -   Uses JWT stored in cookies (`finder_token`).
    -   `middleware.ts` protects routes based on authentication status and user type (e.g., 'authority').
    -   `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` handle user registration, login, and logout.
-   **Database:**
    -   Managed by Drizzle ORM with schema defined in `src/db/schema.ts`.
    -   Connects to a Neon serverless Postgres database.
    -   Migrations are handled using `drizzle-kit`.
-   **API Routes:**
    -   Located in `src/app/api/`.
    -   Handle data fetching, mutations, and interactions with the database.
-   **Frontend:**
    -   Built with React and Mantine components.
    -   Uses Next.js App Router for routing and server-side rendering/static generation.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd finder-app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  **Set up environment variables:**
    -   Create a `.env.local` file in the root directory.
    -   Add the following variables:
        ```env
        DATABASE_URL="your_neon_database_connection_string"
        JWT_SECRET="your_strong_jwt_secret_key"
        ```
    -   Replace the placeholder values with your actual Neon database URL and a secure JWT secret.
4.  **Run database migrations:**
    ```bash
    npm run db:push
    # or
    yarn db:push
    # or
    pnpm db:push
    ```
5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

Contributions are welcome! Please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/your-bug-fix-name`.
3.  **Make your changes.** Ensure code follows existing patterns and includes tests where applicable.
4.  **Lint your code:** Run `npm run lint` (or yarn/pnpm equivalent) and fix any errors.
5.  **Commit your changes** with clear and concise messages.
6.  **Push your branch** to your fork.
7.  **Open a Pull Request** against the main repository's `main` branch. Provide a detailed description of your changes.

We appreciate your help in improving the Finder App!

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
