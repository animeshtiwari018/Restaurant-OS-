# M-RMS — Actors

## 1. What is an Actor?

An **actor** is a person or external entity that interacts with the M-RMS system.

Each actor has specific responsibilities and permissions.

```text
                    M-RMS
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
   ADMINISTRATOR   COMMANDER    LOGISTICS OFFICER
       │              │              │
       └──────────────┼──────────────┘
                      │
                      ▼
                 REGULAR USER
```

---

# 2. Administrator

### Role

Manages users, roles, units, and system-level configuration.

### Responsibilities

```text
Administrator
    │
    ├── Manage Users
    ├── Assign Roles
    ├── Manage Units
    ├── Activate / Deactivate Accounts
    └── System Configuration
```

### Cannot

```text
❌ Access or modify everything without permission
❌ Bypass audit/history controls
```

### Main Goal

> Maintain secure and organized system access.

---

# 3. Commander

### Role

Responsible for operational oversight and approval of resource requests within the authorized unit.

### Responsibilities

```text
Commander
    │
    ├── View Assigned Resources
    ├── Monitor Resource Status
    ├── Review Requests
    ├── Approve / Reject Requests
    └── Monitor Allocations
```

### Cannot

```text
❌ Manage system users
❌ Assign system roles
❌ Change system configuration
❌ Access unauthorized units
```

### Main Goal

> Ensure resource requests and allocations are properly reviewed and monitored.

---

# 4. Logistics Officer

### Role

Responsible for managing resources, inventory, allocation, returns, and maintenance records within their authorized scope.

### Responsibilities

```text
Logistics Officer
       │
       ├── Register Resources
       ├── Update Resource Information
       ├── Manage Inventory
       ├── Process Allocations
       ├── Record Returns
       ├── Track Maintenance
       └── View Resource History
```

### Main Goal

> Keep resource and inventory information accurate and up to date.

---

# 5. Regular User

### Role

A normal authorized user who can view permitted information and submit resource requests.

### Responsibilities

```text
Regular User
     │
     ├── View Permitted Resources
     ├── Create Resource Requests
     ├── View Own Requests
     └── Track Request Status
```

### Cannot

```text
❌ Approve requests
❌ Allocate resources
❌ Manage inventory
❌ Manage users
❌ Change system configuration
```

### Main Goal

> Request and use resources according to their assigned permissions.

---

# 6. Actor Permission Overview

```text
┌────────────────────┬──────┬───────────┬───────────────┬──────────────┐
│ Capability          │Admin │ Commander │Logistics      │Regular User  │
├────────────────────┼──────┼───────────┼───────────────┼──────────────┤
│ Users               │  ✓   │     -     │       -       │      -       │
│ Roles               │  ✓   │     -     │       -       │      -       │
│ Units               │  ✓   │     -     │       -       │      -       │
│ View Resources      │  ✓   │     ✓     │       ✓       │      ✓*      │
│ Manage Resources    │  ✓   │     -     │       ✓       │      -       │
│ Requests            │  ✓   │     ✓     │       ✓       │      ✓*      │
│ Approve Requests    │  -   │     ✓     │       -       │      -       │
│ Allocation          │  -   │     -     │       ✓       │      -       │
│ Inventory           │  -   │     -     │       ✓       │      -       │
│ Maintenance         │  -   │     -     │       ✓       │      -       │
│ Reports             │  ✓   │     ✓     │       ✓       │      -       │
│ Audit History       │  ✓   │     ✓     │       ✓       │      -       │
└────────────────────┴──────┴───────────┴───────────────┴──────────────┘

* Only information permitted by the user's role/unit.
```

---

# 7. Overall Actor Flow

```text
                         M-RMS
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ADMINISTRATOR       COMMANDER       LOGISTICS OFFICER
        │                  │                  │
   Users / Roles       Requests          Resources
   Units               Approval          Inventory
   Configuration       Monitoring        Allocation
                                           Maintenance
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                     REGULAR USER
                           │
                     View / Request
                           │
                           ▼
                    Resource Workflow
```

---

# 8. Important Design Rule

Every actor should only have access to the actions required for their responsibility.

```text
User
  ↓
Role
  ↓
Permissions
  ↓
Allowed Actions
```

This will later become the foundation of our **Role-Based Access Control (RBAC)** system.

The exact permission implementation will be designed during the API and Architecture phases.