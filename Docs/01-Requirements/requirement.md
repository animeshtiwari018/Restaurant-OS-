# Restaurant OS — Product Specification

## 1. Product Vision

Build a complete restaurant operating system that connects customers, waiters, kitchen staff, and restaurant administrators through one platform.

## 2. Target Users

- Customers ordering food or reserving tables.
- Waiters managing dine-in service.
- Kitchen staff preparing and updating orders.
- Restaurant administrators managing menus, tables, staff, and operations.

## 3. Core Features

### Customer
- Browse restaurant menu.
- Add items to cart and place pre-orders.
- Scan a table QR code and order at the table.
- Reserve a table.
- Track order status.

### Waiter
- View assigned tables.
- View and manage dine-in orders.
- Update service status.

### Kitchen
- View incoming orders.
- Accept orders and update preparation status.
- Mark orders as ready.

### Administrator
- Manage menu items, categories, and prices.
- Manage tables and QR codes.
- View orders and reservations.
- Manage staff roles.

## 4. Technology Stack

- Frontend: Next.js, React, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Database access: Prisma ORM
- Validation: Zod
- Version control: Git and GitHub

## 5. Initial MVP

The first milestone is a working dine-in ordering workflow:

1. Customer opens a table-specific QR URL.
2. Customer views the menu and creates a cart.
3. Customer submits an order.
4. The backend validates and stores the order.
5. Kitchen staff views the order.
6. Kitchen updates its status.
7. Customer can see the updated status.

Use seeded sample restaurant data for testing.

## 6. Engineering Requirements

- Validate all incoming API data.
- Calculate prices on the server, not from client-submitted totals.
- Keep order items and prices as historical snapshots.
- Use database transactions for operations that must succeed together.
- Prevent unauthorized access to staff and administrator functions.
- Store secrets in environment variables.
- Test order status transitions and concurrent requests.

## 7. Initial Out of Scope

- Multi-restaurant SaaS billing.
- Real payment gateway integration.
- Delivery fleet management.
- AI recommendations.
- Native mobile applications.
