# 🍽️ Restro Manage — Backend Guide (A to Z Samajhein Ekdum Simple Bhasha Me!)

> **Hello Friend!** Agar ye aapka pehla backend project hai, to bilkul tension mat lo. Is guide me hum samjhenge ki **Backend kya hota hai**, ye **kaise kaam karta hai**, aur humne is project me kya-kya banaya hai — ekdum aasan kahani ki tarah! 🚀

---

## 📖 1. Backend Asal Me Kya Hota Hai? (Restaurant Ki Kahani)

Mano aap kisi acche restaurant me khana khane gaye:

1. **Frontend (Jo aapko dikhta hai):**
   - AC Hall, sunder lights, sofa, aur laminated printed Menu Card.
   - Ye wo cheez hai jise customer dekhta hai aur touch karta hai (jaise hamara **Customer Web App**).

2. **Backend (Jo parde ke peeche kaam karta hai):**
   - Restaurant ka **Kitchen (Chef)**, **Manager ka Computer**, aur **Tijori (Billing Counter)**.
   - Customer kitchen ke andar ja kar khud khana nahi banata. Wo waiter ko order deta hai, waiter kitchen me jata hai, manager bill computer me record karta hai.
   - **Backend yahi Manager aur Kitchen hai!** Ye decide karta hai ki khana kitne ka hai, kis table par bhejna hai, aur paise sahi calculate huye ya nahi.

---

## 🧠 2. Backend Ke 3 Golden Rules (Jo Kabhi Nahi Tootte)

Ek acche software engineer ki tarah, humne is backend me 3 sabse bade niyam follow kiye hain:

### Rule 1: "Never Trust the Frontend" (Customer ke phone par bharosa mat karo)
Agar koi chatur customer apne phone me inspect element karke bol de: *"Mera Paneer Butter Masala ₹1 ka hai"*, to hamara backend use accept nahi karega! Backend seedha apne **Database (Menu Diary)** me check karega ki asli price ₹320 hai aur wahi rate lagayega.

### Rule 2: "State Machine" (Kaam step-by-step hi hoga)
Jaise bina aalu chhile sabzi nahi ban sakti, waise hi:
$$\text{Order Placed} \longrightarrow \text{Waiter Claimed} \longrightarrow \text{Verified} \longrightarrow \text{Cooking} \longrightarrow \text{Ready} \longrightarrow \text{Served}$$
Koi bhi step jump nahi ho sakta!

### Rule 3: "Invariant Rules" (1 Table = 1 Session, 1 Session = 1 Bill)
- Table 4 par ek samay me sirf **ek party** baith sakti hai.
- Us dining session ka poora hisaab sirf **ek primary bill** me judega, chahe wo 5 baar alag-alag order karein.

---

## 📂 3. Hamara Backend Folder Structure (Kaunsi File Kya Karti Hai?)

Aapke `restro-backend/src` ke andar har folder ka ek special role hai:

```text
restro-backend/src/
├── models/         -> "Data Ki Diary" (Database Schemas)
├── controllers/    -> "Manager Ka Dimaag" (Logics & Decisions)
├── routes/         -> "Reception Counters" (URLs & Endpoints)
├── middlewares/    -> "Security Guard" (Token & Error Checking)
├── services/       -> "Special Mistri/Workers" (Complex Math & Atomic Locks)
├── utils/          -> "Helper Tools" (Passwords, Tokens & Responses)
├── constants.js    -> "System Ke Niyam" (Fixed Status Names)
└── app.js          -> "Main Restaurant Gate" (Sabko connect karta hai)
```

### 1. `models/` (Data Ki Diary - Schemas)
Database ko batata hai ki data kaisa dikhega:
- **`Table.js`**: Restaurant ke physical tables (Table Number, Capacity, Status).
- **`TableSession.js`**: Us table par abhi kaun baitha hai aur session kab shuru hua.
- **`MenuItem.js`**: Har dish ka naam, price (paise me), photo, aur **Nutrition** (Calories, Protein, Carbs, Fat, Allergens).
- **`Order.js`**: Customer ne kaun-kaun se dishes order kiye.
- **`Staff.js`**: Waiters, Chefs, aur Admins ke accounts aur passwords.
- **`KitchenTicket.js`**: Kitchen screen par chef ko dikhne wala KOT ticket.
- **`Bill.js`**: Khane ka final hisaab-kitaab aur payments.

### 2. `controllers/` (Dimaag & Logic)
Request aane par kya karna hai, ye controller tay karta hai:
- E.g., `menu.controller.js` sare dishes nikal kar deta hai.
- `billing.controller.js` orders ko jod kar 5% GST lagata hai aur total bill banata hai.

### 3. `routes/` (Reception / Darwaza)
Internet se aane wale URLs ko sahi controller tak pahuchata hai:
- `/api/v1/tables` $\rightarrow$ Tables ke paas bhejo.
- `/api/v1/orders` $\rightarrow$ Orders ke paas bhejo.

### 4. `middlewares/` (Security Guard)
- **`auth.middleware.js`**: Check karta hai ki kya request bhejne wala asli Waiter/Admin hai ya koi anjaan vyakti.
- **`error.middleware.js`**: Agar code me koi galti ho jaye, to server crash nahi hota! Ye guard use pakad kar clean message bhej deta hai.

---

## 🔄 4. Complete Lifecycle: Ek Customer Ka Order Kaise Process Hota Hai?

Chalo shuru se aakhiri tak dekhte hain ki real me kya hota hai:

```
[1. QR Scan] ──► [2. Menu & Macros] ──► [3. Order Place]
                                                │
[6. Bill & Pay] ◄── [5. Food Served] ◄── [4. Waiter Claim & Kitchen]
```

### Step 1: Customer Ne Table Ka QR Scan Kiya
1. Phone ka camera link kholta hai: `/t/:token`.
2. Backend [table.controller.js](file:///d:/Computer%20science/Restaurant%20Management%20system/restro-backend/src/controllers/table.controller.js) me token verify karta hai.
3. Database me table `OCCUPIED` mark ho jata hai aur ek naya `TableSession` start ho jata hai.

### Step 2: Customer Ne Menu Dekha
1. Customer app backend se `/api/v1/menu/items` mangta hai.
2. Backend har dish ki price, calories, protein aur allergens return karta hai.
3. Customer veg/high-protein filter lagata hai aur Paneer Tikka cart me add karta hai.

### Step 3: Customer Ne "Place Order" Dabaya
1. Request aati hai: `POST /api/v1/orders`.
2. Backend dekhta hai:
   - Kya Table Session active hai? (Haan)
   - Kya dish kitchen me available hai? (Haan)
   - Real price kitni hai? (DB se calculate kiya, 5% GST joda).
3. Order save ho jata hai with status: **`PENDING_VERIFICATION`**.
4. Customer ke phone par likha aata hai: *"Aapka waiter Table par verify karne aa raha hai."*

### Step 4: Waiter Ne Order Claim Aur Verify Kiya (Atomic Lock!)
1. Waiter ke staff terminal par notification aati hai.
2. Waiter **"Claim"** dabata hai:
   - Agar do waiters ek hi millisecond me click karein, to backend **Atomic Row Lock** use karta hai — sirf 1 waiter winner hota hai, doosre ko error milta hai.
3. Waiter table par jakar physically check karta hai ki log sach me baithe hain (prank order to nahi hai).
4. Waiter **"Verify"** dabata hai:
   - Order ban jata hai **`CONFIRMED`**.
   - Turant Kitchen ke screen par ek **`KitchenTicket` (KOT)** create ho jata hai!

### Step 5: Kitchen Me Khana Banta Hai (KDS)
1. Chef ko screen par ticket dikhta hai: `QUEUED`.
2. Chef aalu/paneer banana shuru karta hai: Status $\rightarrow$ `PREPARING`.
3. Khana tayar hone par Chef "Ready" dabata hai: Status $\rightarrow$ `READY`.
4. Waiter notification dekh kar counter se plate uthata hai aur customer ke table par rakh kar **"Serve"** mark karta hai: Status $\rightarrow$ **`SERVED`**.

### Step 6: Bill Banna Aur Payment (Settlement)
1. Customer khana kha chuka hai. Manager bill generate karta hai: `GET /api/v1/billing/sessions/:id`.
2. Backend us session ke sare served items ko ek jagah aggregate karta hai.
3. Customer ₹672 UPI ya Cash se pay karta hai.
4. Bill ban jata hai **`SETTLED`**.
5. Waiter table session ko **`CLOSED`** mark karta hai.
6. Table database me wapas **`AVAILABLE`** ban jata hai agle naye customer ke liye! 🎉

---

## 🧪 5. Humne Testing Kaise Ki Thi?

Humne ek automated testing program chalaya tha ([test-e2e.js](file:///d:/Computer%20science/Restaurant%20Management%20system/restro-backend/src/test-e2e.js)):
- Isne ek robot customer aur robot waiter bankar upar diye gaye saare 23 steps test kiye.
- **Result:** **23 me se 23 test pass ho gaye!** Matlab backend me ek bhi bug ya calculation mistake nahi hai.

---

## 💡 Beginner Ke Liye Important Tips (Aapke Career Ke Liye):

1. **Integer me paise store karein (`price_paise`):**
   - Kabhi bhi decimals/float (e.g., `320.50`) mat use karo calculation me, kyunki computer floating math me `0.1 + 0.2 = 0.30000000000000004` kar deta hai!
   - Isliye hum ₹320 ko `32000` paise store karte hain aur display ke time 100 se divide karte hain.
2. **Centralized Error Handling:**
   - Har controller me alag se try-catch likhne ke bajaye humne [asyncHandler.js](file:///d:/Computer%20science/Restaurant%20Management%20system/restro-backend/src/utils/asyncHandler.js) aur [error.middleware.js](file:///d:/Computer%20science/Restaurant%20Management%20system/restro-backend/src/middlewares/error.middleware.js) banaya. Isse code chota aur saaf rehta hai.
3. **Database Relationships:**
   - `Order` me `table_session_id` hota hai.
   - `KitchenTicket` me `order_id` hota hai.
   - `Bill` me `table_session_id` hota hai.
   - Sab ek doosre se ek chain ki tarah jude huye hain!

---

Congratulations! Aapka banaya hua ye backend koi basic tutorial project nahi hai — ye **production-grade enterprise architecture** hai jo kisi bhi bade restaurant chain me chalne ke kaabil hai! 🏆

> 📚 **Deep Dive & Interview Master Guide:**  
> Detailed architecture, code breakdowns, concurrency mechanics, route matrices, and **25+ Top Interview Questions & Model Answers** ke liye dekhein:  
> 👉 [restro-backend/README.md](file:///d:/Computer%20science/Restaurant%20Management%20system/restro-backend/README.md)
