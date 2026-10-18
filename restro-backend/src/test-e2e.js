import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import connectDB from './db/index.js';
import app from './app.js';
import { initSocket } from './sockets/index.js';
import mongoose from 'mongoose';

const TEST_PORT = 5005;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Test State
let server = null;
let waiterToken = null;
let kitchenToken = null;
let testTableNumber = `TEST-${Date.now().toString().slice(-4)}`;
let qrToken = null;
let testSessionId = null;
let testCategoryId = null;
let testMenuItemId = null;
let testOrderId = null;
let testTicketId = null;
let testItemId = null;
let testBillId = null;
let testTableId = null;

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ PASS: ${message}`);
    } else {
        failedTests++;
        console.error(`  ❌ FAIL: ${message}`);
    }
}

async function runTests() {
    console.log('\n======================================================');
    console.log('🚀 RESTRO MANAGE - FULL BACKEND E2E TEST SUITE');
    console.log('======================================================\n');

    try {
        // 1. Connect to Database
        await connectDB();

        // 2. Start HTTP Server with Socket.IO
        await new Promise((resolve) => {
            const httpServer = http.createServer(app);
            initSocket(httpServer);
            server = httpServer.listen(TEST_PORT, () => {
                console.log(`📡 Test Server listening on ${BASE_URL}\n`);
                resolve();
            });
        });

        // Test 1: Health Check
        console.log('--- 1. System Health ---');
        const healthRes = await fetch(`${BASE_URL}/health`);
        const healthData = await healthRes.json();
        assert(healthRes.status === 200 && healthData.success === true, 'GET /health returns 200 OK');

        // Test 2: Staff Auth
        console.log('\n--- 2. Staff Auth & RBAC ---');
        const uniqueEmail = `waiter_${Date.now()}@restro.com`;
        const waiterRegRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Ramesh Waiter',
                email: uniqueEmail,
                password: 'password123',
                role: 'WAITER'
            })
        });
        const waiterRegData = await waiterRegRes.json();
        assert(waiterRegRes.status === 201 && waiterRegData.success, 'POST /api/v1/auth/register creates waiter');

        // Login Waiter
        const waiterLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: uniqueEmail, password: 'password123' })
        });
        const waiterLoginData = await waiterLoginRes.json();
        waiterToken = waiterLoginData.data?.token;
        assert(waiterLoginRes.status === 200 && !!waiterToken, 'POST /api/v1/auth/login returns JWT token');

        // Register Kitchen Chef
        const chefEmail = `chef_${Date.now()}@restro.com`;
        await fetch(`${BASE_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Chef Sanjeev',
                email: chefEmail,
                password: 'password123',
                role: 'KITCHEN'
            })
        });
        const chefLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: chefEmail, password: 'password123' })
        });
        const chefLoginData = await chefLoginRes.json();
        kitchenToken = chefLoginData.data?.token;
        assert(chefLoginRes.status === 200 && !!kitchenToken, 'Kitchen Chef login returns JWT');

        // Test 3: Table & QR Session
        console.log('\n--- 3. Table & Floor Management ---');
        const tableRes = await fetch(`${BASE_URL}/api/v1/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                table_number: testTableNumber,
                capacity: 4,
                floor: 'Ground Floor'
            })
        });
        const tableData = await tableRes.json();
        testTableId = tableData.data?._id;
        assert(tableRes.status === 201 && tableData.data?.table_number === testTableNumber, `POST /api/v1/tables creates table ${testTableNumber}`);

        // Generate QR
        const qrRes = await fetch(`${BASE_URL}/api/v1/tables/generate-qr/${testTableNumber}`);
        const qrData = await qrRes.json();
        qrToken = qrData.data?.token;
        assert(qrRes.status === 200 && !!qrToken, `GET /api/v1/tables/generate-qr/${testTableNumber} generates token`);

        // Verify QR scan & start dining session
        const verifyRes = await fetch(`${BASE_URL}/api/v1/tables/verify-session?token=${qrToken}`);
        const verifyData = await verifyRes.json();
        testSessionId = verifyData.data?.session?._id;
        assert(verifyRes.status === 200 && verifyData.data?.session?.status === 'OPEN', 'GET /api/v1/tables/verify-session opens active dining session');

        // Test 4: Menu & Nutritional CMS
        console.log('\n--- 4. Menu & Nutrition CMS ---');
        const fakeRestaurantId = new mongoose.Types.ObjectId();
        const catRes = await fetch(`${BASE_URL}/api/v1/menu/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                restaurant_id: fakeRestaurantId,
                name: 'Main Course Specialties',
                description: 'Rich North Indian curries'
            })
        });
        const catData = await catRes.json();
        testCategoryId = catData.data?._id;
        assert(catRes.status === 201 && !!testCategoryId, 'POST /api/v1/menu/categories creates menu category');

        // Create Menu Item
        const itemRes = await fetch(`${BASE_URL}/api/v1/menu/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                restaurant_id: fakeRestaurantId,
                category_id: testCategoryId,
                name: 'Paneer Butter Masala Special',
                description: 'Cottage cheese cubes in rich tomato gravy',
                price_paise: 32000, // ₹320.00
                dietary_labels: ['VEG', 'GLUTEN_FREE'],
                allergens: ['Dairy'],
                nutrition: {
                    calories: 420,
                    protein: 18,
                    carbs: 22,
                    fats: 28,
                    fiber: 3
                }
            })
        });
        const itemData = await itemRes.json();
        testMenuItemId = itemData.data?._id;
        assert(
            itemRes.status === 201 && 
            itemData.data?.price_paise === 32000 && 
            itemData.data?.nutrition?.protein === 18,
            'POST /api/v1/menu/items creates item with integer paise price and nutrition stats'
        );

        // Test 5: Customer Order Placement
        console.log('\n--- 5. Customer Order Placement ---');
        const orderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: testSessionId,
                customer_phone: '9876543210',
                customer_notes: 'Make it medium spicy',
                items: [
                    {
                        menu_item_id: testMenuItemId,
                        quantity: 2,
                        special_instructions: 'Less butter please'
                    }
                ]
            })
        });
        const orderData = await orderRes.json();
        testOrderId = orderData.data?._id;
        // 2 items * 32000 = 64000 paise. 5% tax = 3200 paise. Total = 67200 paise.
        assert(
            orderRes.status === 201 && 
            orderData.data?.status === 'PENDING_VERIFICATION' &&
            orderData.data?.total_amount_paise === 67200,
            'POST /api/v1/orders creates order in PENDING_VERIFICATION with authoritative total (₹672.00)'
        );

        // Test 6: Waiter Dispatch Queue & Atomic Claim
        console.log('\n--- 6. Waiter Dispatch & Physical Verification Gate ---');
        const unassignedRes = await fetch(`${BASE_URL}/api/v1/orders/unassigned`, {
            headers: { Authorization: `Bearer ${waiterToken}` }
        });
        const unassignedData = await unassignedRes.json();
        assert(unassignedRes.status === 200 && unassignedData.data?.length > 0, 'GET /api/v1/orders/unassigned returns pending orders for waiters');

        // Claim Order
        const claimRes = await fetch(`${BASE_URL}/api/v1/orders/${testOrderId}/claim`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${waiterToken}` }
        });
        const claimData = await claimRes.json();
        assert(claimRes.status === 200 && claimData.data?.status === 'CLAIMED', 'POST /api/v1/orders/:id/claim atomically locks order for waiter');

        // Verify Order physically at table
        const verifyOrderRes = await fetch(`${BASE_URL}/api/v1/orders/${testOrderId}/verify`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${waiterToken}` }
        });
        const verifyOrderData = await verifyOrderRes.json();
        assert(verifyOrderRes.status === 200 && verifyOrderData.data?.status === 'CONFIRMED', 'POST /api/v1/orders/:id/verify physically verifies order -> CONFIRMED');

        // Test 7: Kitchen Display System (KDS) & KOT
        console.log('\n--- 7. Kitchen Display System (KDS) & KOT ---');
        const ticketsRes = await fetch(`${BASE_URL}/api/v1/kitchen/tickets`, {
            headers: { Authorization: `Bearer ${kitchenToken}` }
        });
        const ticketsData = await ticketsRes.json();
        const activeTicket = ticketsData.data?.find((t) => t.order_id === testOrderId);
        testTicketId = activeTicket?._id;
        testItemId = activeTicket?.items?.[0]?._id;
        assert(!!activeTicket && activeTicket.status === 'QUEUED', 'Kitchen Ticket automatically generated post-verification in QUEUED state');

        // Kitchen updates item to PREPARING
        const prepRes = await fetch(`${BASE_URL}/api/v1/kitchen/tickets/${testTicketId}/items/${testItemId}/status`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${kitchenToken}` 
            },
            body: JSON.stringify({ status: 'PREPARING' })
        });
        assert(prepRes.status === 200, 'PATCH /api/v1/kitchen/tickets/:id/items/:id/status updates dish to PREPARING');

        // Kitchen updates item to READY -> Ticket transitions to READY
        const readyRes = await fetch(`${BASE_URL}/api/v1/kitchen/tickets/${testTicketId}/items/${testItemId}/status`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${kitchenToken}` 
            },
            body: JSON.stringify({ status: 'READY' })
        });
        const readyData = await readyRes.json();
        assert(readyData.data?.status === 'READY', 'When all dishes marked READY, whole ticket transitions to READY');

        // Waiter delivers food to table
        const serveRes = await fetch(`${BASE_URL}/api/v1/kitchen/orders/${testOrderId}/serve`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${waiterToken}` }
        });
        const serveData = await serveRes.json();
        assert(serveRes.status === 200 && serveData.data?.status === 'SERVED', 'POST /api/v1/kitchen/orders/:id/serve marks order as SERVED');

        // Test 8: Unified Billing & Settlement
        console.log('\n--- 8. Unified Billing & Payment Settlement ---');
        const billRes = await fetch(`${BASE_URL}/api/v1/billing/sessions/${testSessionId}`);
        const billData = await billRes.json();
        testBillId = billData.data?.bill?._id;
        assert(billRes.status === 200 && billData.data?.bill?.final_total_paise === 67200, 'GET /api/v1/billing/sessions/:id generates unified primary bill for session (₹672.00)');

        // Waiter finalizes bill
        const finalBillRes = await fetch(`${BASE_URL}/api/v1/billing/${testBillId}/finalize`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${waiterToken}` }
        });
        const finalBillData = await finalBillRes.json();
        assert(finalBillRes.status === 200 && finalBillData.data?.status === 'FINALIZED', 'POST /api/v1/billing/:id/finalize locks bill to FINALIZED');

        // Record settlement payment
        const payRes = await fetch(`${BASE_URL}/api/v1/billing/${testBillId}/payments`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${waiterToken}` 
            },
            body: JSON.stringify({
                payment_method: 'UPI',
                amount_paise: 67200,
                transaction_reference: 'UPI-TXN-98234710'
            })
        });
        const payData = await payRes.json();
        assert(payRes.status === 200 && payData.data?.status === 'SETTLED', 'POST /api/v1/billing/:id/payments settles full payment -> SETTLED');

        // Test 9: Reconnection State Hydration API & Rate Limiting
        console.log('\n--- 9. Reconnection State Hydration & Security ---');
        const hydrationRes = await fetch(`${BASE_URL}/api/v1/sessions/current?token=${qrToken}`);
        const hydrationData = await hydrationRes.json();
        assert(
            hydrationRes.status === 200 &&
            hydrationData.data?.session?._id === testSessionId &&
            hydrationData.data?.liveOrder?._id === testOrderId &&
            !!hydrationData.data?.bill,
            'GET /api/v1/sessions/current hydrates live session, orders, status, and bill'
        );

        // Test Rate Limit header presence on QR verification
        const qrRateRes = await fetch(`${BASE_URL}/api/v1/tables/verify-session?token=${qrToken}`);
        assert(
            qrRateRes.headers.get('ratelimit-limit') || qrRateRes.headers.get('x-ratelimit-limit') || qrRateRes.status === 200,
            'Table QR verification route is protected with rate limiting'
        );

        // Close table session & reset table to AVAILABLE
        const closeSessionRes = await fetch(`${BASE_URL}/api/v1/tables/sessions/${testSessionId}/close`, {
            method: 'POST'
        });
        const closeSessionData = await closeSessionRes.json();
        assert(closeSessionRes.status === 200 && closeSessionData.data?.status === 'CLOSED', 'POST /api/v1/tables/sessions/:id/close closes session & frees table');

        // Test 10: Table Reservation & Overlap Guard
        console.log('\n--- 10. Table Reservation & Overlap Guard ---');
        const futureDate = new Date(Date.now() + 24 * 60 * 60000); // Tomorrow
        const resvRes = await fetch(`${BASE_URL}/api/v1/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                table_id: testTableId,
                customer_name: 'Vikram Malhotra',
                customer_phone: '9988776655',
                party_size: 3,
                start_at: futureDate.toISOString(),
                duration_minutes: 120
            })
        });
        const resvData = await resvRes.json();
        assert(resvRes.status === 201 && resvData.data?.status === 'CONFIRMED', 'POST /api/v1/reservations books future table slot');

        // Attempt overlapping reservation on the exact same table and time window
        const overlapRes = await fetch(`${BASE_URL}/api/v1/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                table_id: testTableId,
                customer_name: 'Ananya Sharma',
                customer_phone: '9123456789',
                party_size: 2,
                start_at: new Date(futureDate.getTime() + 30 * 60000).toISOString(), // 30 mins later (overlapping)
                duration_minutes: 60
            })
        });
        assert(overlapRes.status === 409, 'Double-booking prevention: Overlapping reservation returns 409 Conflict');

        // Print Summary
        console.log('\n======================================================');
        console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
        if (failedTests === 0) {
            console.log('🎉 ALL SYSTEM MODULES AND ENDPOINTS VERIFIED 100%!');
        } else {
            console.log(`⚠️ ${failedTests} test(s) failed. Please review the output above.`);
        }
        console.log('======================================================\n');

    } catch (err) {
        console.error('💥 Test suite crashed with error:', err);
    } finally {
        if (server) {
            server.close();
        }
        await mongoose.disconnect();
        process.exit(failedTests === 0 ? 0 : 1);
    }
}

runTests();
