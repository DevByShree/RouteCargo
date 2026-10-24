# RouteCargo — Project Work Context & State

This document tracks the current system state, architecture, authentication flow, and changelog of work performed.

---

## 1. System Overview

- **Frontend:** React 19, React Router v7, Tailwind CSS v4, Vite 8, `lucide-react`, `react-icons`.
- **Backend:** Node.js, Express 5, Mongoose 9 (MongoDB), JWT (`jsonwebtoken`), cookies (`cookie-parser`), CORS (`cors`).
- **Database:** MongoDB via Mongoose connection (`MONGO_URI`).

---

## 2. Authentication & Routing Architecture

### A. Registration / Signup Flow (`/signup`)
1. User provides `name`, `email`, `password`, and `role` (`customer` or `driver`).
2. Frontend calls `authAPI.signup(...)` -> `POST /api/auth/signup`.
3. Backend checks if the email already exists in MongoDB:
   - If already registered: returns `400 Email already registered`.
   - If valid: hashes password (via Mongoose pre-save hook) and creates User record.
   - Responds with `201 Account created successfully. Please sign in.` without issuing an active session cookie.
4. Frontend receives success, does **not** store an active session in `localStorage`, and redirects to `/signin` with flash state:
   `navigate("/signin", { state: { message: "Account created successfully! Please sign in." } })`.

### B. Sign-In Flow (`/signin`)
1. If redirected from signup, a green success banner informs the user to sign in.
2. User submits `email` and `password`.
3. Frontend calls `authAPI.signin(...)` -> `POST /api/auth/signin`.
4. Backend handles authentication:
   - **User does not exist in MongoDB:** Returns `404` status with `message: "User does not exist"`.
   - **Password incorrect:** Returns `401` status with `message: "Invalid email or password"`.
   - **Credentials valid:** Signs JWT token (7d expiration), sets `httpOnly` cookie, and returns `{ success: true, token, user }`.
5. Frontend saves `token` and `role` to `localStorage` for UI state.
6. Frontend navigates to role-specific dashboard:
   - Customer: `/dashboard`
   - Driver: `/driver-dashboard`

### C. Protected Customer Routes (`CustomerLayout`)
- [`CustomerLayout.jsx`](file:///c:/Users/shree/OneDrive/Desktop/RouteCargo/frontend/src/Layout/CustomerLayout.jsx) wraps all customer routes (`/dashboard`, `/Find`, `/Booking`, `/track`, `/address`, `/payment`, `/profile`, `/shipment`, `/parcel`).
- If `localStorage.getItem("token")` is missing (unauthenticated user), `CustomerLayout` automatically redirects to `/signin`.

### D. Logout Flow
- Located exclusively as a **single button at the bottom-left of the sidebar** ([`Sidebar.jsx`](file:///c:/Users/shree/OneDrive/Desktop/RouteCargo/frontend/src/Layout/Sidebar.jsx)).
- Styled with sleek dark black/gray tones (`text-gray-800 hover:text-black hover:bg-gray-200/80`), collapsing cleanly when the sidebar is collapsed.
- When clicked:
  1. Calls `authAPI.signout()` (`POST /api/auth/signout`), which clears the server-side `httpOnly` cookie.
  2. Removes `token` and `role` from `localStorage`.
  3. **Redirects the user directly to the Landing Page (`/`)**.

---

## 3. Verified API Inventory

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Backend Health Check | No |
| `POST` | `/api/auth/signup` | Register a new user (`customer` or `driver`) | No |
| `POST` | `/api/auth/signin` | Authenticate user & issue JWT | No |
| `GET` | `/api/auth/me` | Fetch currently logged in user info | Yes (JWT) |
| `POST` | `/api/auth/signout` | Clear JWT session cookie | Yes (JWT) |

---

## 4. Changelog of Work Done

### Session: Route Corrections, Authentication, Logout & Light Mode Consolidation

1. **Signup to Signin Route Redirection:**
   - **Problem:** New accounts were previously auto-logged in and redirected straight to `/dashboard`.
   - **Fix:** Updated `frontend/src/Pages/Authentication/Signup.jsx` to navigate to `/signin` upon successful registration.
   - **Update:** Updated `backend/src/controllers/authController.js` to return `201 Created` without issuing an auth cookie on signup.
   - **Update:** Added green confirmation banner to `frontend/src/Pages/Authentication/signin.jsx` acknowledging account creation.

2. **MongoDB Credential Verification & "User does not exist" Error:**
   - **Problem:** Sign-in failed with generic error when an unregistered email was entered.
   - **Fix:** In `backend/src/controllers/authController.js` (`exports.signin`), if the user is not found in MongoDB, return `404 { success: false, message: "User does not exist" }`.
   - Frontend `signin.jsx` displays this exact error in a red alert banner.

3. **Customer Route Protection:**
   - **Fix:** Added authentication check in `frontend/src/Layout/CustomerLayout.jsx`. Unauthenticated users attempting to visit `/dashboard` or other customer routes are redirected to `/signin`.

4. **Consolidated Logout Button & Landing Page Redirect:**
   - **Fix:** Removed the two previous logout buttons from `DashboardNavbar.jsx` and `dashboard.jsx`.
   - **Fix:** Added a single, clean Logout button to the **bottom-left of the sidebar** in `Sidebar.jsx`, styled in black/gray.
   - **Fix:** Updated logout navigation to redirect directly to the **Landing Page (`/`)**.

5. **Complete Dark Theme Removal:**
   - **Fix:** Removed theme toggle button and state from `DashboardNavbar.jsx`.
   - **Fix:** Removed `@custom-variant dark` and all `.dark` CSS overrides from `frontend/src/index.css`.
   - **Fix:** Cleaned up all `dark:` classes across `CustomerLayout.jsx`, `DashboardNavbar.jsx`, `Sidebar.jsx`, `dashboard.jsx`, and `LandingPage.jsx`.
   - Application consistently renders in clean, high-performance light mode everywhere.
