# Military Resource Management System (MRMS)
## Use Case Specification — Version 1.0

### 1. Purpose
The Use Case Diagram defines how different users interact with the Military Resource Management System to manage resources, process requests, track maintenance, and monitor operations.

### 2. Actors

1. **Administrator:** Creates user accounts and assigns roles and units.
2. **Commander:** Approves or rejects resource requests, updates inventory, and views reports.
3. **Logistics Officer:** Manages inventory, checks availability, allocates resources, and processes returns.
4. **Regular User:** Views resources assigned to their unit, submits requests, tracks request status, and reports faults.
5. **Maintenance Officer:** Manages repairs, updates maintenance status, and maintains service records.

### 3. Main Use Cases

**User and Access Management**
- Log In
- Create User
- Assign Role and Unit

**Resource Management**
- Manage Inventory
- View Assigned-Unit Resources
- Check Resource Availability
- Allocate Resources
- Record Resource Return
- Inspect Returned Resource

**Request Management**
- Submit Resource Request
- Approve or Reject Request
- Track Request Status

**Maintenance Management**
- Report Fault
- Manage Repairs
- Update Maintenance Status
- Maintain Service Records

**Reports and Notifications**
- View Inventory Report
- View Allocation Report
- View Maintenance Report
- View Request Report
- View Activity History
- View Notifications

### 4. Business Rules

1. Only the Administrator can create user accounts and assign roles and units.
2. Resource requests must be approved by the Commander before allocation.
3. The Logistics Officer verifies availability before allocating resources.
4. Partial allocation is permitted when stock is insufficient; the remaining quantity stays pending.
5. Inventory changes must be recorded in the transaction history.
6. Returned equipment and vehicles must be inspected before becoming available again.
7. Resources undergoing maintenance cannot be allocated.
8. The Maintenance Officer manages repairs independently.
9. Regular Users can view resources relevant to their assigned unit.
10. The system generates in-app notifications for important request, allocation, and maintenance updates.

### 5. Resource Tracking

- **Equipment and vehicles:** Individually tracked using unique IDs, with allocation and maintenance histories.
- **Supplies:** Tracked primarily through quantities, including available and allocated quantities.

### 6. Scope

The first version is a college-level prototype focused on inventory management, resource requests, allocation, returns, maintenance, reporting, and role-based access.

### 7. Next Deliverable

Create the Use Case Diagram in draw.io using the five actors, their associated use cases, and the system boundary defined in this specification.