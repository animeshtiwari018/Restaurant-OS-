       MILITARY RESOURCE MANAGEMENT SYSTEM
                 USE CASE FLOW

                  ADMINISTRATOR
                       │
                       ▼
                  CREATE USER
                       │
                       ▼
                 ASSIGN ROLE & UNIT
                       │
                       ▼
                      LOGIN
                       │
                       ▼
                VIEW UNIT RESOURCES
                       │
                       ▼
                SUBMIT RESOURCE REQUEST
                       │
                       ▼
                  COMMANDER REVIEW
                       │
                ┌──────┴──────┐
                ▼             ▼
             APPROVED       REJECTED
                │             │
                ▼             ▼
        LOGISTICS OFFICER   NOTIFICATION
                │
                ▼
         CHECK AVAILABILITY
                │
                ▼
          ALLOCATE RESOURCE
                │
                ▼
          UPDATE INVENTORY
                │
                ▼
          SEND NOTIFICATION
                │
                ▼
              IN USE
                │
                ▼
             RESOURCE
               RETURN
                │
                ▼
          CONDITION INSPECTION
                │
          ┌─────┴─────┐
          ▼           ▼
       SERVICEABLE   FAULTY
          │           │
          ▼           ▼
       AVAILABLE   MAINTENANCE
                      OFFICER
                        │
                        ▼
                  MANAGE REPAIR
                        │
                        ▼
                UPDATE SERVICE RECORD
                        │
                        ▼
                MARK AS AVAILABLE