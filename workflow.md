# BaraGo System Workflow

This document describes the expected flow of the BaraGo Healthcare Scheduling Management System, with visual diagrams for residents, admins, and workers.

## System Overview

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

## Appointment Workflow

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

## Ambulance Workflow

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

## Role Workflow

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

## Resident Flow

1. Resident opens the landing page.
2. Resident logs in or registers.
3. Resident opens the appointment or ambulance request module.
4. Resident submits a request.
5. Resident monitors the status from the dashboard.

## Admin Flow

1. Admin logs in to `/admin`.
2. Admin creates health schedules first.
3. Admin reviews pending appointments and ambulance requests.
4. Admin approves, rejects, or reschedules requests.
5. Approved appointments are linked to schedules and counted against slots.

## Worker Flow

1. Worker logs in to `/health-worker`.
2. Worker views approved appointments sent after admin approval.
3. Worker checks patient details, schedule details, and active tasks.
4. Worker assists the resident during checkup day.
5. Worker marks the appointment as completed when finished.

## Business Rules

- Appointments cannot be booked for past dates.
- Appointments must be scheduled at least 2 days ahead.
- Only open schedules with remaining slots can be selected.
- Approved appointments increment the slot count of the linked schedule.
- Worker visibility starts only after admin approval.

## End-to-End Example

1. Resident logs in.
2. Resident books an appointment from an available schedule.
3. Appointment is saved as `pending`.
4. Admin logs in and reviews the request.
5. Admin approves the appointment.
6. The system links the appointment to the correct schedule.
7. The approved schedule slot count increases.
8. The resident receives a status update.
9. The approved appointment appears on the worker dashboard.
10. The worker views the patient and handles the checkup.
