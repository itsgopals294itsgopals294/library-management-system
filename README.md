# Athena Library Management System (Enterprise MERN Stack)

> **Athena LMS** is an enterprise-grade, modern Library Management System built with MongoDB, Express.js, React (Vite + Tailwind CSS), and Node.js. It conducts extensive domain research into real-world library challenges and solves every operational, circulation, inventory, and policy issue in modern academic and public libraries.

---

## 📌 Real-World Problems Solved by Athena LMS

| Problem in Traditional Systems | Impact / Failure Point | Athena LMS Solution |
| :--- | :--- | :--- |
| **"Ghost Book" Inventory Mismatch** | Tracking books only by title or ISBN leads to inventory loss when individual copies are damaged, lost, or checked out. | **Multi-Copy Asset Model (`Book` vs `BookCopy`)**: Distinguishes bibliographic works from physical assets. Every copy has a unique Barcode (Code128), condition grade (New/Good/Worn/Damaged), and shelf location (Building, Floor, Aisle, Shelf, Call Number). |
| **Manual Cataloging Bottleneck** | Staff spend hours manually typing titles, authors, publishers, synopses, and categories, causing typos and catalog backlogs. | **Automated ISBN Lookup Service**: Integrates with Google Books API & Open Library API. Entering an ISBN auto-populates title, subtitle, authors, publisher, year, page count, synopsis, category, tags, and high-res cover artwork. |
| **Circulation Line Congestion** | Manual entry of 13-digit ISBNs and membership card numbers at the circulation desk causes long queues. | **Dual Barcode/QR Engine**: Instant checkout/checkin via hardware USB scanners or in-browser camera scanners. Printable physical spine labels and patron membership cards with live SVG barcodes. |
| **Unfair or Unenforced Fine Policies** | Inconsistent fines, lack of grace periods, and manual fee disputes cause patron dissatisfaction and uncollected revenue. | **Tiered Policy & Fine Engine**: Configurable grace periods (e.g. 1 day free), daily rate ($2.00/day), fine caps ($50 max), digital payment receipts with barcode audit, and administrative waiver logs with justification requirements. |
| **Hold Queue Chaos** | Patrons have no visibility into when a checked-out book will be available; returned books sit on shelves instead of going to waiting patrons. | **FIFO Hold Queue & Auto-Allocation**: Patrons place holds with real-time queue position. When a copy is checked in, system automatically reserves it for the next waiting patron with a 48-hour pickup window and notifications. |
| **Lost or Damaged Book Disputes** | Patrons dispute condition changes upon return or lost books remain as active loans indefinitely. | **Condition Lifecycle & Lost Item Billing**: System tracks checkout condition vs. return condition. Damaged items automatically bill damage fees; marking an item lost bills the asset replacement cost and updates copy status to `Lost`. |
| **Stale Catalogs & Low Discovery** | Patrons cannot find relevant books due to exact-match search and lack of community feedback. | **Full-Text OPAC Search & Verified Reviews**: Compound text indexing across titles, authors, ISBNs, and tags. Verified borrower review system with 1-5 star ratings and automated average updates. |
| **Financial & Inventory Discrepancies** | Lack of accountability for cash collections, manual fine waiving, and missing books. | **Tamper-Proof System Audit Logging**: Every checkout, check-in, fine payment, waiver, book addition, and copy status change is timestamped with actor name, role, IP address, and payload details. |

---

## 🏗️ Architecture & Technology Stack

```
LibraryManagementSystem/
├── backend/
│   ├── config/             # Database connection & runtime configuration
│   ├── controllers/        # Business logic for Auth, Books, Copies, Circulation, Holds, Fines, Users, Analytics
│   ├── middleware/         # JWT verification, Role-based authorization (RBAC), Centralized Error Handler, Audit Logger
│   ├── models/             # Mongoose schemas (User, Book, BookCopy, Circulation, Reservation, Fine, Review, AuditLog, Settings)
│   ├── routes/             # REST API routes
│   ├── services/           # Google Books / Open Library ISBN service, Fine calculator, Hold queue promoter
│   ├── utils/              # Database seeder with rich demo records
│   ├── server.js           # Express app initialization
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client with JWT interceptor & auto error extraction
│   │   ├── components/     # Reusable UI (Navbar, Sidebar, Barcode SVG, Barcode Scanner, Receipt Modal, Member Card Modal)
│   │   ├── context/        # AuthContext with 1-click Demo Account Switcher
│   │   ├── pages/          # Dashboard, OPAC Catalog, Circulation Desk, Inventory, Holds, Fines, Members, Patron Portal, Audits, Settings
│   │   ├── App.jsx         # Client routing with role guards
│   │   ├── main.jsx
│   │   └── index.css       # Tailwind CSS styling & print stylesheets
│   ├── vite.config.js
│   └── package.json
└── package.json            # Root orchestrator (npm run dev, npm run seed)
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- **Node.js**: v18 or later
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas connection URI

### 1. Installation
In the project root:
```bash
npm run install:all
```
*(Or install inside `backend` and `frontend` individually using `npm install`)*

### 2. Seed Database with Realistic Data
Populates categories, demo users, real-world books, physical copies with barcodes, active circulations, overdue loans, holds, fines, and audit logs:
```bash
npm run seed
```

### 3. Run the Development Server
Starts both Backend (`http://localhost:5000`) and Frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

---

## 👥 Demo Accounts (1-Click Switcher in UI)

| Persona / Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@athena.edu` | `Admin@123` | Full system access, audit logs, policy configuration, staff management |
| **Head Librarian** | `librarian@athena.edu` | `Lib@123` | Circulation desk (checkout/return), ISBN cataloging, barcode sheets, fines |
| **Student Member** | `student@athena.edu` | `Student@123` | OPAC search, place holds, renew active loans, view digital card & receipts |
| **Faculty Member** | `faculty@athena.edu` | `Faculty@123` | Extended borrowing quota (10 books / 30 days), hold placement, book reviews |

> 💡 *Note: The navigation bar includes a built-in "Switch Demo Role" bar allowing immediate switching between roles with one click!*

---

## 📋 Comprehensive Feature Checklist

### 1. Online Public Access Catalog (OPAC)
- [x] Instant fuzzy search across titles, authors, ISBNs, Dewey numbers, and tags.
- [x] Multi-faceted filtering: Genre (CS, AI, Literature, Physics, Math), Format (Paperback, Hardcover, E-Book), and Availability toggle ("Available Now Only").
- [x] Shelf Locator: Shows building, floor, aisle, and shelf coordinates.
- [x] Physical copies breakdown with individual asset status.
- [x] Verified patron review system with 1-5 star ratings.
- [x] Digital resource previews (e-books/PDFs).

### 2. Circulation Desk Cockpit
- [x] **Fast Scan Issue (Checkout)**: Validate patron quotas and unpaid fine holds; calculate role-based due dates; atomic copy status update to `Issued`.
- [x] **Quick Return & Check-in**: Automatic overdue days & fine calculation with grace period application; hold queue fulfillment; condition degradation assessment.
- [x] **Active Loans Manager**: Filter by All, Overdue, or Due Today; 1-click renewal enforcing hold reservation checks.
- [x] **Lost Book Recovery**: Mark as lost -> auto-bills replacement fee to borrower account.

### 3. Inventory & ISBN Auto-Fetch
- [x] Instant ISBN metadata lookup via Google Books and Open Library API.
- [x] Automatic physical copy generation with Code128 barcodes upon book creation.
- [x] Printable Spine Label Sticker Sheet generator for pasting on physical book spines.
- [x] On-demand physical copy additions to existing bibliographic records.

### 4. Hold Queues & Reservations
- [x] First-Come-First-Served (FIFO) reservation queues.
- [x] Automated allocation upon book check-in with 48-hour pickup window.
- [x] Patron hold cancellation and status tracking.

### 5. Fine Ledger & Revenue Management
- [x] Automated fine accrual on overdue items.
- [x] Digital payment collection (Cash, Card, UPI, Online).
- [x] Official printable transaction receipts with receipt barcodes.
- [x] Administrative waivers with mandatory justification logs.

### 6. Member & Patron Directory
- [x] Role-based borrowing quotas (Student: 4 books, Faculty: 10 books).
- [x] Account suspension/activation toggles.
- [x] Printable official digital library ID passes with patron barcode.

### 7. Governance, Analytics & Auditing
- [x] Executive dashboard KPIs and live Recharts circulation trends.
- [x] Tamper-proof system audit logs recording action, actor, IP, and timestamp.
- [x] Configurable library policies (loan durations, fine rates, grace periods).
