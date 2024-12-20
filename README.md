# Task Management API

A RESTful API for managing tasks, built with Express.js, TypeScript, and Prisma.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn (bun not tested)
- MySQL database

## Setup

1. Clone the repository

```bash
git clone https://github.com/shaneavelino/todo-app-server
cd todo-app-server
```

2. Install dependencies

```bash
npm install
```

3. Environment Setup
 - Connect to your locally running MySQL service
 - Create a `.env` file in the root directory with the following variables or rename the `.env.example` file and replace values with your user credentials:

```env
PORT=3000
DATABASE_URL="mysql://${user}:${password}@localhost:3306/${dbname}"
```

4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

## Running the Application

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Run tests:

```bash
npm test
```

## API Endpoints

### GET /tasks

Retrieve all tasks

Response:

```json
[
  {
    "id": "string",
    "title": "string",
    "color": "RED" | "BLUE" | "GREEN" | ...,
    "completed_status": boolean,
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

### GET /tasks/:id

Retrieve a specific task

Response:

```json
{
  "id": "string",
  "title": "string",
  "color": "RED" | "BLUE" | "GREEN" | ...,
  "completed_status": boolean,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### POST /tasks

Create a new task

Request Body:

```json
{
  "title": "string",
  "color": "RED" | "BLUE" | "GREEN" | ... (optional),
  "completed_status": boolean (optional)
}
```

### PUT /tasks/:id

Update an existing task

Request Body:

```json
{
  "title": "string" (optional),
  "color": "RED" | "BLUE" | "GREEN" | ... (optional),
  "completed_status": boolean (optional)
}
```

### DELETE /tasks/:id

Delete a task

## Available Colors

- RED
- ORANGE
- YELLOW
- GREEN
- BLUE
- INDIGO
- PURPLE
- PINK
- BROWN

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 201: Resource created
- 400: Bad request (invalid input)
- 404: Resource not found
- 500: Server error

Error Response Format:

```json
{
  "error": "string",
  "details": {} (optional)
}
```

## Project Structure

```
src/
├── config/
│   └── prisma.ts         # Prisma client configuration
├── controllers/
│   └── taskController.ts # Task route handlers
├── routes/
│   └── taskRoutes.ts     # Route definitions
├── schemas/
│   └── taskSchemas.ts    # Validation schemas
├── __tests__/
│   └── tasks.test.ts     # API tests
└── index.ts              # Application entry point
```

## Development

### Testing

The project uses Jest for testing. Run tests with:

```bash
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
```

### Database Migrations

To create a new migration after schema changes:

```bash
npx prisma migrate dev --name <migration-name>
```

### Type Checking

```bash
npm run type-check
```

### Troubleshooting:

```> npx prisma init
(node:16732) ExperimentalWarning: CommonJS module /usr/local/lib/node_modules/npm/node_modules/debug/src/node.js is loading ES Module /usr/local/lib/node_modules/npm/node_modules/supports-color/index.js using require().
Support for loading ES Module in require() is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Need to install the following packages:
prisma@6.0.1
Ok to proceed? (y)

Error: (0 , USe.isError) is not a function
```
[Downgrade Node to v20.18.0 if current version >20.18.0](https://github.com/prisma/prisma/issues/25560)
