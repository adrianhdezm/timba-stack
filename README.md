# Timba Stack - Fullstack Remix Template

Welcome to **Timba Stack**, a simple yet powerful [Remix](https://remix.run) template for building fullstack web applications.

## Getting Started

### Prerequisites

- Node.js (v20.x or higher)
- npm or yarn

### Create Your Project

To create a new project using this template, run the following command:

```bash
npx create-remix@latest --template adrianhdezm/timba-stack
```

This will set up your project using the **Timba Stack** template.

## Database migrations

After modifiying the database schema in `src/server/db.schema.ts`, you need to create a new migration file and apply it.

### Create a new migration file:

```bash
npx drizzle-kit generate
```

### Apply migrations:

```bash
npx drizzle-kit migrate
```

### Development

1. Navigate to your project directory:

   ```bash
   cd your-project-name
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to view your running app.

## Deployment

### Build for production:

```bash
npm run build
```

### Start the app in production mode:

```bash
npm start
```

## License

This project is licensed under the [MIT License](LICENSE).
