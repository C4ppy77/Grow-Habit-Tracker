# My V0 Project

A modern Next.js 14 application built with TypeScript, Tailwind CSS 4, and ShadCN UI components.  
Includes Radix UI primitives, Supabase authentication, and charting libraries for rich interactive dashboards.

## 🚀 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/), [Tailwind CSS Animate](https://github.com/jamiebuilds/tailwindcss-animate)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **State & Forms:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Auth & Backend:** [Supabase](https://supabase.com/)
- **Charts & Data Viz:** [Chart.js](https://www.chartjs.org/), [React ChartJS 2](https://react-chartjs-2.js.org/), [Recharts](https://recharts.org/)
- **Utilities:** date-fns, clsx, class-variance-authority
- **Animations & Carousels:** Embla Carousel, Vaul, Sonner

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd my-v0-project
pnpm install
```

## 🛠 Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## 🏗 Build

Create a production build:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## 🧹 Linting & Formatting

```bash
pnpm lint        # Check for lint errors
pnpm lint:fix    # Auto-fix lint errors (if enabled)
pnpm format      # Format code with Prettier
```

## 📁 Project Structure

```
my-v0-project/
├── app/                # Next.js app directory
├── components/         # UI components
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
├── public/             # Static assets
├── styles/             # Global styles
├── package.json        # Project configuration & dependencies
├── tsconfig.json       # TypeScript config
├── postcss.config.mjs  # PostCSS config (Tailwind + Autoprefixer)
├── tailwind.config.ts  # Tailwind CSS configuration
└── next.config.mjs     # Next.js configuration
```

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## 🛡 Git Ignore

Sensitive files (like `.env`) are excluded from version control as defined in `.gitignore`.

## 📜 License

This project is licensed under the MIT License.
