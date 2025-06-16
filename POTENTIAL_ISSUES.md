# Potential Issues Log

This document lists potential issues identified based on code analysis and the test cases documented in `TESTING_DOCUMENTATION.md`.

---

### PI-AUTH-001: Case-Sensitive Email Check During Login
- **Feature/Component:** `LoginPage.tsx`, `AuthContext.tsx`, `services/MockAuthService.ts`
- **Description of Potential Issue:** Users might be unable to log in if the case of their entered email does not exactly match the case used during registration, even if the email address is otherwise correct.
- **Reasoning/Code Pointer:** The `MockAuthService.ts` in `login` and `register` functions likely performs a direct string comparison for emails (e.g., `mockUser.email === email` or `existingUser => existingUser.email === email`). Standard email address handling is typically case-insensitive. This was noted in TC-AUTH-LOGIN-02's "Potential Issues/Notes" (implicitly).
- **Severity (Hypothetical):** Minor
- **Suggested Verification Steps:**
    1. Register a user with an email like `User@example.com`.
    2. Attempt to log in with `user@example.com` (lowercase).
    3. Observe if login fails. If it does, the email check is case-sensitive.

---

### PI-AUTH-002: Incomplete Client-Side Validation for Registration
- **Feature/Component:** `RegistrationPage.tsx`
- **Description of Potential Issue:** The registration form might rely heavily on server-side validation, leading to a poor user experience if basic checks (e.g., password mismatch, missing required fields) are not caught client-side first.
- **Reasoning/Code Pointer:** Test cases TC-AUTH-REG-03 (Mismatched Passwords) and TC-AUTH-REG-04 (Missing Required Fields) note that client-side validation *should* catch these. If `RegistrationPage.tsx` does not implement robust local checks before calling `AuthService.register`, users might experience delays or unnecessary server requests.
- **Severity (Hypothetical):** Minor
- **Suggested Verification Steps:**
    1. Navigate to the registration page.
    2. Attempt to submit the form with mismatched passwords or missing required fields.
    3. Observe if errors are shown immediately without a network request, or if there's a delay and a server error.

---

### PI-HD-001: Dashboard Data Stale After Background Update
- **Feature/Component:** `HomeScreen.tsx`, `Dashboard.tsx`, `HealthDataContext.tsx`
- **Description of Potential Issue:** If health data (appointments, medications) is updated in the background (e.g., by another device or a scheduled process not directly triggered by the current user session), the HomeScreen/Dashboard might not automatically refresh to show the latest information.
- **Reasoning/Code Pointer:** `HealthDataContext.tsx` might fetch data on initial load or specific triggers. If it doesn't have a mechanism like polling, WebSockets, or a global state update listener for all data changes, the displayed data could become stale. TC-HD-DATA-01/02/03 rely on data being accurate.
- **Severity (Hypothetical):** Major
- **Suggested Verification Steps:**
    1. Log in and view the dashboard.
    2. Through a separate mechanism (e.g., simulate a backend update directly in `MockHealthService` if possible, or if a companion admin tool exists), add a new appointment or medication for the user.
    3. Observe if the dashboard on the primary device updates automatically within a reasonable time, or if it remains unchanged until a manual refresh or navigation.

---

### PI-TL-001: Timeline Client-Side Filtering Performance
- **Feature/Component:** `TimelineScreen.tsx`, `HealthDataContext.tsx`
- **Description of Potential Issue:** The Timeline feature might fetch all events for a user and then perform filtering (by keyword, category, date) on the client-side. With a very large number of health events, this could lead to significant UI lag and poor performance.
- **Reasoning/Code Pointer:** The "Potential Issues/Notes" for TC-TL-FILTER-01 (Keyword Search) and TC-TL-FILTER-05 (Combining Filters) mention performance. If `TimelineScreen.tsx` fetches an unfiltered list from `HealthDataContext.getTimelineEvents()` and then applies filters using JavaScript, this can be inefficient for large datasets.
- **Severity (Hypothetical):** Major
- **Suggested Verification Steps:**
    1. Populate a test user account with a very large number of diverse timeline events (e.g., thousands).
    2. Navigate to the Timeline page.
    3. Attempt to apply various filters (keyword search, category, date range).
    4. Observe UI responsiveness and the time taken to display filtered results.

---

### PI-TL-002: Incorrect PDF Export of Filtered Timeline
- **Feature/Component:** `TimelineScreen.tsx`, PDF Export Service
- **Description of Potential Issue:** The PDF export functionality for the Timeline might always export all events, rather than respecting the currently applied filters.
- **Reasoning/Code Pointer:** TC-TL-EXPORT-01 states "The exported PDF should reflect the currently filtered view...". If the export function directly calls a service to generate PDF from all data in `HealthDataContext` without passing current filter parameters from `TimelineScreen.tsx`'s state, this could occur.
- **Severity (Hypothetical):** Minor
- **Suggested Verification Steps:**
    1. Navigate to the Timeline page and apply filters (e.g., a specific date range or category).
    2. Initiate the PDF export.
    3. Review the generated PDF to see if it contains only the filtered events or all events.

---

### PI-VAULT-001: Inefficient Large File Handling in Vault (Conceptual)
- **Feature/Component:** `VaultPage.tsx`, Document Upload/Download Service
- **Description of Potential Issue:** Uploading or downloading very large files in the Vault might lead to UI freezes, timeouts, or excessive memory consumption if not handled with streaming or chunking.
- **Reasoning/Code Pointer:** TC-VAULT-OP-01 (Document Upload) notes "max file size" and "handling of upload errors". While conceptual, if the underlying `DocumentService` reads entire files into memory before upload or after download, large files could cause issues.
- **Severity (Hypothetical):** Major
- **Suggested Verification Steps:**
    1. Attempt to upload a very large file (e.g., >100MB, or whatever exceeds typical limits) to the Vault.
    2. Observe application responsiveness during upload.
    3. If successful, attempt to download it and observe responsiveness.

---

### PI-PROF-001: QR Code Data Exposure
- **Feature/Component:** `ProfilePage.tsx`, `QRCodeModal.tsx`, `AuthContext.tsx`
- **Description of Potential Issue:** The QR code generated on the profile page might contain sensitive user information directly embedded, which could be easily scanned and read by anyone with access to the screen, potentially leading to privacy concerns.
- **Reasoning/Code Pointer:** TC-PROF-QR-01 notes the QR code is "generated based on user data from AuthContext". If this data (e.g., full name, DOB, email, or even a persistent ID that can be easily looked up) is directly encoded rather than being a short-lived, single-use token or a link to a secure endpoint requiring further authentication, it's a risk.
- **Severity (Hypothetical):** Major
- **Suggested Verification Steps:**
    1. Open the QR code modal on the Profile page.
    2. Use a standard QR code scanning app to read the content of the QR code.
    3. Analyze the scanned data to see what information is directly embedded.

---

### PI-DM-001: Lack of Undo for Deletion Operations
- **Feature/Component:** Medications, Appointments, Vitals, Vault management sections
- **Description of Potential Issue:** The application might not offer an "undo" or "soft delete" (trash) functionality for deleted items (medications, appointments, documents, vitals), making accidental deletions permanent and potentially causing data loss.
- **Reasoning/Code Pointer:** Test cases like TC-DM-MED-03 (Delete Medication), TC-DM-APP-03 (Delete Appointment), TC-VAULT-OP-02 (Document Deletion), and TC-DM-VITALS-03 (Delete Vital Log) involve confirmation dialogs but don't mention undo. If the deletion directly removes records from `HealthDataContext`, recovery is impossible.
- **Severity (Hypothetical):** Minor (can be Major depending on the criticality of the deleted data)
- **Suggested Verification Steps:**
    1. Delete a medication, appointment, document, or vital log entry.
    2. After confirming deletion, check if there is any UI option to undo the action or restore the item from a "trash" or "recently deleted" section.

---

### PI-GLOBAL-001: Inconsistent Error Handling and User Feedback
- **Feature/Component:** Entire Application
- **Description of Potential Issue:** Error handling across different modules might be inconsistent, or user feedback for operations (success, failure, loading) might be missing or unclear.
- **Reasoning/Code Pointer:** Many test cases mention expected "success notifications" or "error messages". If a centralized error handling mechanism or a consistent UI pattern for notifications/toasts (e.g., via a `NotificationContext`) is not strictly enforced across all components making service calls (e.g., in `LoginPage.tsx`, `TimelineScreen.tsx`, `VaultPage.tsx`), the user experience can be jarring.
- **Severity (Hypothetical):** Minor
- **Suggested Verification Steps:**
    1. Perform various actions that could succeed or fail (login with wrong password, try to upload an invalid file type, disconnect network and try to save data).
    2. Observe the type, clarity, and consistency of error messages and success notifications.
    3. Check if loading states are clearly indicated during long operations.

---

### PI-NAV-001: AuthGuard Redirect Loop Potential
- **Feature/Component:** `AuthGuard.tsx`, `App.tsx` (Routing setup)
- **Description of Potential Issue:** If there's a misconfiguration in routing or `AuthGuard` logic, it might be possible to enter a redirect loop, for example, if a protected page redirects to login, but the login page (if already authenticated) redirects back to the protected page under certain conditions.
- **Reasoning/Code Pointer:** TC-AUTH-GUARD-03 (Accessing Login Page when already Authenticated) expects redirection to `HomeScreen`. If `AuthGuard` protecting `/home` has an issue, or if the logic for "already authenticated" on `/login` has a flaw, it could potentially redirect back and forth. This is a common issue in SPA routing.
- **Severity (Hypothetical):** Major
- **Suggested Verification Steps:**
    1. Log in.
    2. Try to navigate to `/login` (should redirect to `/home`).
    3. Manually clear authentication (e.g. token in local storage) then try to access `/home` (should redirect to `/login`).
    4. Test edge cases around session expiry while on a protected page. Look for rapid, repeated redirects in the browser's address bar or network log.
