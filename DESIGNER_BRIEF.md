# Turnly SaaS - Complete Web Designer Brief & Page Specification

This document provides a comprehensive list, wireframe layout, user goals, and required UI components for every page in the **Turnly Virtual Queuing SaaS platform**. 

Send this document to your web/UI/UX designer so they can design complete Figma / Adobe XD mockups for the application.

---

## 📌 Project Overview

- **Product Name**: Turnly
- **Product Type**: Multi-Tenant Virtual Queuing SaaS
- **Target Users**:
  1. **Business Owners / Staff**: Restaurants, Dental/Doctor Clinics, Salons, Government Offices, Banks.
  2. **End-Customers**: Guests scanning QR codes at physical venues to join virtual queues on their smartphones.
- **Design Formats Needed**:
  - **Desktop Web (1440px)**: SaaS Landing Page, Auth, Staff Dispatch Dashboard, Settings, QR Poster.
  - **Mobile Web / PWA (375px)**: Customer QR Join Portal, Customer Live Ticket Tracker.
  - **Fullscreen TV / Kiosk (1920x1080)**: Waiting Room TV Scoreboard Display.

---

## 📄 Complete Page Specification List (9 Pages)

---

### PAGE 1: SaaS Marketing Home Page
- **URL Route**: `/`
- **Device Target**: Desktop & Mobile Web
- **Page Purpose**: Convert visiting business owners into registered SaaS subscribers.
- **Key Sections & UI Elements**:
  1. **Navigation Bar**: Turnly Logo, Live Demo Links, `[ Business Login ]` button, `[ Get Started ]` CTA button.
  2. **Hero Section**:
     - Main Headline (e.g. *"Smart Digital Queues for Modern Businesses"*).
     - Subheadline & Value Proposition.
     - Primary CTA button: `[ Register Your Business ]`.
     - High-level 3D dashboard illustration or hero preview card.
     - Micro-badges: `Zero App Downloads`, `Atomic Duplicate Lock`, `Realtime Chime Sync`.
  3. **Live Business Demo Showcase**:
     - Interactive preview cards for Clinics (`/b/apex-dental`) and Restaurants (`/b/burger-house`).
     - Buttons to open live customer portal or TV kiosk demo.
  4. **Features Bento Grid**:
     - Card 1: Custom Branded URLs & QR Posters.
     - Card 2: Party Size & Group Tracking (1-5+ People).
     - Card 3: Real-Time Audio Chimes & Web Push Alerts.
  5. **Footer**: Copyright, links, and system status indicator.

---

### PAGE 2: Business Registration
- **URL Route**: `/auth/register`
- **Device Target**: Desktop & Mobile Web
- **Page Purpose**: Onboard a new business owner and create their custom URL slug (e.g., `/b/downtown-clinic`).
- **Required Form Fields & UI Elements**:
  1. **Header**: Turnly Logo & Back to Home link.
  2. **Registration Card**:
     - Business / Venue Name Input (`e.g., Downtown Dental Clinic`) *Required*.
     - Industry Category Dropdown (`Healthcare / Clinic`, `Restaurant / Cafe`, `Salon / Spa`, `Office / Bank`).
     - Manager Work Email Input *Required*.
     - Account Password Input *Required*.
     - Submit CTA Button: `[ Create Business Portal ]`.
  3. **Footer**: Link to Login page (`Already have an account? Log in`).

---

### PAGE 3: Business Staff Login
- **URL Route**: `/auth/login`
- **Device Target**: Desktop & Mobile Web
- **Page Purpose**: Allow business managers and counter operators to log into their dispatch dashboard.
- **Required Form Fields & UI Elements**:
  1. **Login Card**:
     - Work Email Input.
     - Password Input.
     - Submit Button: `[ Access Dashboard ]`.
  2. **Footer**: Link to Registration page (`Need a business account? Register`).

---

### PAGE 4: Customer Branded Join Portal
- **URL Route**: `/b/[businessSlug]` (e.g., `/b/apex-dental` or `/b/burger-house`)
- **Device Target**: Mobile Web / Smartphone PWA (Primary) & Desktop
- **Page Purpose**: Customer scans physical QR code at venue entrance and fills out details to enter line.
- **Required UI Elements**:
  1. **Branded Header Banner**:
     - Business Name & Industry Category.
     - Custom Business Logo / Avatar.
     - Welcome Message (e.g. *"Welcome to Apex Dental. Please join the queue for consultation."*).
     - Live Indicator: `[ Currently Waiting: X Guests ]`.
  2. **Customer Join Form**:
     - Queue / Service Selector (If venue has multiple lines e.g. *Dining Table* vs *Takeaway*).
     - Customer Full Name Input *Required*.
     - Phone Number Input (Optional for SMS alerts).
     - **Party Size Selector Pills**: Selectable options `[ 1 Person ]`, `[ 2 People ]`, `[ 3 People ]`, `[ 4 People ]`, `[ 5+ People ]`.
     - Submit CTA Button: `[ Join Queue & Receive Token ]`.

---

### PAGE 5: Customer Live Ticket Tracker
- **URL Route**: `/b/[businessSlug]/ticket/[ticketId]`
- **Device Target**: Mobile Web / Smartphone PWA
- **Page Purpose**: Customer monitors their real-time line position, estimated wait time, and receives alerts.
- **Required UI Elements**:
  1. **Header Bar**: Business Name, Back link, Party Size Tag (`Party of 4`).
  2. **Main Live Ticket Display Card**:
     - **Token Number**: Prominent large display (e.g. **`A-042`**).
     - **Status Badge Pill**: `[ Waiting ]`, `[ Your Turn! ]`, `[ Serving ]`, `[ Completed ]`.
     - **Customer Name & Party Size**.
     - **Counter Call Alert Banner**: Flashes when called (`Please proceed to Counter 01`).
  3. **Live Queue Metrics Grid**:
     - Card 1: **Guests Ahead in Queue** (e.g., `3 Guests`).
     - Card 2: **Estimated Wait Time** (e.g., `~12 Mins`).
  4. **Interactive Controls**:
     - Chime Audio Toggle button (`[ Chime: Enabled ]` / `[ Chime: Muted ]`).
     - Push Notifications Permission button (`[ Enable Push Notifications ]`).
     - Cancel Ticket Button (`[ Cancel / Leave Queue ]`).
     - Post-Service Star Feedback Rating (`⭐⭐⭐⭐⭐` stars) when status is `Completed`.
  5. **Pass QR Code Card**: Shareable digital ticket pass QR code.

---

### PAGE 6: Secured Merchant Dispatch Dashboard
- **URL Route**: `/dashboard`
- **Device Target**: Desktop & Tablet Web (Staff Operators)
- **Page Purpose**: Staff members dispatch waiting customers, assign counters, and monitor daily analytics.
- **Required UI Elements**:
  1. **Top Navigation Header**:
     - Active Business Portal Badge (`PORTAL: APEX DENTAL CLINIC`).
     - Links: `Dispatch Console`, `Settings`, `Print QR Poster`, `TV Display Kiosk`, `View Customer Page`, `Logout`.
  2. **Counter Selector Tabs**:
     - Selectable counter pills (e.g. `[ Counter 01 (Dr. Smith) ]`, `[ Counter 02 (Dr. Jones) ]`).
  3. **Main Active Token Call Console**:
     - Large active token card showing currently called guest (`TOKEN #A-042`, Guest Name, Party Size `4 People`).
     - **Big Action Buttons**:
       - `[ Call Next Customer ]` (Primary action, triggers audio chime).
       - `[ Start ]` (Marks serving).
       - `[ Done ]` (Marks completed).
       - `[ Mark No-Show ]` (Handles absent guests).
  4. **Queue Statistics KPI Cards**:
     - Total Waiting Guests count.
     - Total Served Today count.
     - Average Handling Time.
  5. **Waiting Queue Line Table**:
     - Columns: `Position #`, `Token Number`, `Guest Name`, `Party Size`, `Status Badge`.

---

### PAGE 7: Queue & Counter Configuration Manager
- **URL Route**: `/dashboard/settings`
- **Device Target**: Desktop & Tablet Web
- **Page Purpose**: Business manager creates custom service queues, prefix codes, and manages active counters.
- **Required UI Elements**:
  1. **Top Dashboard Header**: (Same as Page 6).
  2. **Create New Service Queue Card**:
     - Queue Name Input (e.g. `VIP Express Desk`).
     - Token Prefix Code Input (e.g. `V`, `DR`, `A`).
     - Average Serve Time Mins Input (e.g. `5` mins).
     - Submit Button: `[ Create Queue Module ]`.
  3. **Configured Queues List Cards**:
     - Displays list of active queues with edit actions and test link.

---

### PAGE 8: Printable Reception Desk QR Poster
- **URL Route**: `/dashboard/qr-poster`
- **Device Target**: Desktop / Printer Layout
- **Page Purpose**: Printable poster for physical reception counters, acrylic stands, or entrance doors.
- **Required UI Elements**:
  1. **Top Control Bar**: Back to Dashboard link, `[ Print Poster ]` CTA button (hidden when printing).
  2. **Printable Poster Frame**:
     - Business Name & Tagline.
     - Large, high-resolution QR code pointing to `https://turnly.app/b/[businessSlug]`.
     - 3-Step Visual Customer Instructions:
       1. *Scan QR with camera*
       2. *Select party size & get ticket*
       3. *Receive chime when turn arrives*

---

### PAGE 9: Fullscreen TV Waiting Room Kiosk Scoreboard
- **URL Route**: `/display/[businessSlug]` (e.g. `/display/apex-dental`)
- **Device Target**: Fullscreen Smart TV / Kiosk Display Monitor (1920x1080)
- **Page Purpose**: Mounted TV in waiting rooms announcing called tokens with loud chimes.
- **Required UI Elements**:
  1. **Kiosk Header Bar**: Business Name, Date/Time, `[ STATUS: LIVE ]` indicator.
  2. **Massive "NOW SERVING" Banner**:
     - Extra-large token display (e.g. **`TOKEN #A-042`**).
     - Counter direction text: **`PROCEED TO: COUNTER 01`**.
  3. **Active Counters Status Sub-Grid**:
     - Grid showing status across all active counters (Counter 1, Counter 2, Room 3).
  4. **Side-by-Side Walk-in QR Code Banner**:
     - High-visibility QR code for new walk-in guests sitting in the waiting room to scan and join line.
     - Total Guests Waiting count ticker.

---

## 🎨 Summary Table for Designer

| Page # | Page Name | Route | Core User | Primary Goal |
| :--- | :--- | :--- | :--- | :--- |
| **1** | SaaS Landing Page | `/` | Business Owners | Convert to registered users |
| **2** | Business Registration | `/auth/register` | Business Owners | Register & claim custom URL slug |
| **3** | Staff Login | `/auth/login` | Staff / Operators | Log in to dispatch dashboard |
| **4** | Branded Join Portal | `/b/[businessSlug]` | Customers (Mobile) | Fill form with Party Size & join line |
| **5** | Customer Ticket Tracker | `/b/[slug]/ticket/[id]` | Customers (Mobile) | Track live turn, ETA & chime alert |
| **6** | Dispatch Dashboard | `/dashboard` | Staff Operators | Call next tokens & manage line |
| **7** | Queue Settings | `/dashboard/settings` | Business Managers | Configure queues, prefixes & counters |
| **8** | Printable QR Poster | `/dashboard/qr-poster` | Business Managers | Print physical reception QR poster |
| **9** | TV Kiosk Display | `/display/[businessSlug]` | Waiting Room TV | Large scoreboard with audio chime |
