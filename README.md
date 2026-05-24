# BARAgo Health Appointment Management System

BARAgo is a full-stack health appointment management system designed for barangay healthcare operations. The application supports resident registration, appointment scheduling, ambulance assistance requests, administrative review workflows, health schedule management, notifications, and reporting.

## Overview

The system is organized as a TypeScript monorepo using npm workspaces. It includes a React frontend, an Express API server, shared OpenAPI-generated client packages, and a PostgreSQL database layer powered by Drizzle ORM.

The application supports three primary user roles:

- **Resident**: registers an account, submits health appointment requests, requests ambulance assistance, views notifications, and tracks request history.
- **Health Worker**: reviews approved appointments and records completion details.
- **Administrator**: manages residents, appointments, ambulance requests, health schedules, notifications, reports, and dashboard analytics.

## Features

- Resident account registration and authentication
- Role-based access control for residents, health workers, and administrators
- Appointment booking, review, approval, rejection, rescheduling, and completion
- Ambulance assistance request management
- Barangay health schedule management
- Resident verification and account status management
- In-app notifications
- Administrative dashboard and reports
- Shared API contracts through OpenAPI, Orval, and Zod
- PostgreSQL persistence using Drizzle ORM

## Workflow

### System Overview

```mermaid
flowchart LR
    A[Resident Login] --> B[Create Appointment or Ambulance Request]
    B --> C[Admin Reviews Request]
    C --> D{Decision}
    D -->|Approve| E[Schedule Linked and Status Updated]
    D -->|Reject| F[Resident Notified]
    D -->|Reschedule| G[Resident Receives New Schedule]
    E --> H[Worker Dashboard Receives Approved Task]
    H --> I[Worker Assists Resident]
    I --> J[Appointment Completed]
```

### Appointment Workflow

```mermaid
flowchart TD
    A[Resident logs in] --> B[Open Appointments]
    B --> C[Click Book Appointment]
    C --> D[Choose valid schedule]
    D --> E[Enter patient name, age, reason]
    E --> F[Submit appointment]
    F --> G[Status = Pending]
    G --> H[Admin opens Manage Appointments]
    H --> I[Admin reviews request]
    I --> J{Approve?}
    J -->|No - Reject| K[Resident gets rejection notice]
    J -->|No - Reschedule| L[Resident gets new date/time]
    J -->|Yes| M[System links matching schedule]
    M --> N[Approved slot count increments]
    N --> O[Resident notified]
    O --> P[Approved appointment appears on worker dashboard]
    P --> Q[Worker views patient details]
    Q --> R[Worker assists during checkup day]
    R --> S[Worker marks appointment completed]
```

### Ambulance Workflow

```mermaid
flowchart TD
    A[Resident logs in] --> B[Open Ambulance Request]
    B --> C[Enter emergency details]
    C --> D[Submit request]
    D --> E[Status = Pending]
    E --> F[Admin opens Manage Ambulance]
    F --> G[Admin reviews request]
    G --> H{Decision}
    H -->|Approve| I[Resident notified]
    H -->|Dispatch| J[Worker can coordinate if needed]
    H -->|Reject| K[Resident notified]
    J --> L[Request completed after response]
```

### Role Workflow

```mermaid
flowchart LR
    subgraph Resident
        R1[Register or Login]
        R2[Book appointment]
        R3[Request ambulance]
        R4[Track status]
    end

    subgraph Admin
        A1[Create schedules]
        A2[Approve or reject appointments]
        A3[Review ambulance requests]
        A4[Assign staff through schedules]
    end

    subgraph Worker
        W1[View approved appointments]
        W2[View patient details]
        W3[Follow assigned schedules]
        W4[Assist residents]
        W5[Complete appointment]
    end

    R2 --> A2
    R3 --> A3
    A1 --> A2
    A2 --> W1
    A4 --> W3
    W1 --> W2 --> W4 --> W5
```

### Summary

1. Resident logs in and submits an appointment or ambulance request.
2. Admin reviews the request and either approves, rejects, or reschedules it.
3. Approved appointments are linked to schedules and counted against slots.
4. Approved appointments become visible to the assigned worker.
5. Worker handles the resident during the actual checkup or related task.

## Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, Wouter, TanStack Query
- **Backend**: Node.js, Express 5, TypeScript, express-session
- **Database**: PostgreSQL, Drizzle ORM, drizzle-zod
- **API Contracts**: OpenAPI, Orval, Zod
- **Tooling**: npm workspaces, TypeScript project references, esbuild

## Project Structure

```text
.
├── artifacts/
│   ├── api-server/        # Express API server
│   ├── barago/            # React and Vite frontend application
│   └── mockup-sandbox/    # UI sandbox workspace
├── lib/
│   ├── api-client-react/  # Generated React Query API hooks
│   ├── api-spec/          # OpenAPI specification and code generation config
│   ├── api-zod/           # Generated Zod schemas
│   └── db/                # Drizzle schema, database client, and seed script
├── scripts/               # Workspace scripts
└── package.json           # Root workspace scripts and package configurations
```

## Prerequisites

Install the following before running the project:

- Node.js
- npm
- PostgreSQL database

## Environment Variables

Create the required environment configuration for local development before running the API server.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Drizzle ORM |
| `PORT` | Yes | Port used by the API server, commonly `8080` in local development |
| `SESSION_SECRET` | Recommended | Secret used by `express-session`; a development fallback exists, but production should always provide a secure value |
| `LOG_LEVEL` | Optional | API logging level, such as `info` or `debug` |

## Installation

Install all workspace dependencies from the repository root:

```bash
npm install
```

## Database Setup

Push the Drizzle schema to the configured PostgreSQL database:

```bash
npm run push -w @workspace/db
```

Seed development data when needed:

```bash
npm run seed -w @workspace/db
```

## Development

Run the frontend and API server together:

```bash
npm run dev
```

Run the frontend only:

```bash
npm run dev -w @workspace/barago
```

Run the API server only:

```bash
npm run dev -w @workspace/api-server
```

## Build and Validation

Run TypeScript checks across the workspace:

```bash
npm run typecheck
```

Build all packages that provide a build script:

```bash
npm run build
```

Regenerate API clients and validation schemas after OpenAPI changes:

```bash
npm run codegen -w @workspace/api-spec
```

## Main Packages

### `artifacts/barago`

The primary frontend application. It contains the role-based user interface, page routing, shared layout components, forms, dashboard views, and API integration through generated React Query hooks.

### `artifacts/api-server`

The backend API server. It defines authentication, session handling, route middleware, resident management, appointment management, ambulance requests, schedules, notifications, dashboards, and reports.

### `lib/db`

The shared database package. It contains the Drizzle client, PostgreSQL schema definitions, exported table objects, and database utilities used by the API server.

### `lib/api-spec`, `lib/api-client-react`, and `lib/api-zod`

These packages maintain the contract between the backend and frontend. The OpenAPI specification is used to generate typed API clients and Zod validation schemas.

## Security Notes

- Production deployments should always provide a strong `SESSION_SECRET`.
- Database credentials should be stored in environment variables and must not be committed to the repository.
- Passwords are hashed before storage.
- Role-based route protection is enforced in the backend middleware and reflected in the frontend routing flow.

## License

This project is licensed under the MIT License.
