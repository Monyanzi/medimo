# Testing Documentation

This document outlines test cases for core application features.

## Table of Contents
- [Authentication](#authentication)
  - [Registration](#registration)
  - [Login](#login)
  - [Logout](#logout)
  - [AuthGuard](#authguard)
- [HomeScreen & Dashboard](#homescreen--dashboard)
- [Timeline](#timeline)
  - [Event Display](#event-display)
  - [Filtering](#filtering)
  - [Export](#export)
- [Vault](#vault)
  - [Document Listing](#document-listing)
  - [Search and Filters](#search-and-filters)
  - [Document Operations (Conceptual)](#document-operations-conceptual)
- [Profile](#profile)
  - [User Information Display](#user-information-display)
  - [QR Code Functionality](#qr-code-functionality)
  - [Data Export](#data-export)
  - [Navigation](#navigation)
- [Data Management (Conceptual)](#data-management-conceptual)
  - [Medications Management](#medications-management)
  - [Appointments Management](#appointments-management)
  - [Vitals Logging](#vitals-logging)
  - [General Data Reflection](#general-data-reflection)

## Authentication

### Registration

#### TC-AUTH-REG-01: Successful New User Registration
- **Feature/Component:** RegistrationPage, AuthContext, MockAuthService
- **Test Scenario Description:** A new user attempts to register with valid and unique information.
- **Steps to Reproduce:**
    1. Navigate to the `/register` page.
    2. Enter a unique email (e.g., `newuser@medimo.com`) in the email field.
    3. Enter a strong password (e.g., `Password123!`) in the password field.
    4. Confirm the password in the confirm password field.
    5. Enter a first name (e.g., "New").
    6. Enter a last name (e.g., "User").
    7. Select a date of birth.
    8. Click the "Register" or "Sign Up" button.
- **Expected Result:**
    - Registration is successful.
    - A new user account is created in the backend (simulated by MockAuthService).
    - `AuthContext` is updated with the newly registered and authenticated user's data.
    - User is redirected to the onboarding process or `HomeScreen`.
    - A success toast notification is displayed.
- **Potential Issues/Notes:**
    - Password strength requirements (if any) should be validated on the client-side and server-side.
    - Email uniqueness check should be robust.
    - Error handling for existing email should be clear to the user.

#### TC-AUTH-REG-02: Registration with Existing Email
- **Feature/Component:** RegistrationPage, MockAuthService
- **Test Scenario Description:** A user attempts to register with an email address that already exists.
- **Steps to Reproduce:**
    1. Navigate to the `/register` page.
    2. Enter an existing email (e.g., `user@medimo.com`) in the email field.
    3. Fill in other required fields.
    4. Click the "Register" or "Sign Up" button.
- **Expected Result:**
    - Registration fails.
    - An error message is displayed indicating that the email is already in use.
    - User remains on the registration page.
- **Potential Issues/Notes:**
    - Ensure the error message is user-friendly and specific.

#### TC-AUTH-REG-03: Registration with Mismatched Passwords
- **Feature/Component:** RegistrationPage
- **Test Scenario Description:** A user attempts to register with passwords that do not match.
- **Steps to Reproduce:**
    1. Navigate to the `/register` page.
    2. Enter valid information for all fields except password confirmation.
    3. Enter a password (e.g., `Password123!`) in the password field.
    4. Enter a different password (e.g., `Password456?`) in the confirm password field.
    5. Click the "Register" or "Sign Up" button.
- **Expected Result:**
    - Registration fails.
    - An error message is displayed indicating that the passwords do not match.
    - User remains on the registration page, ideally with an indicator near the password fields.
- **Potential Issues/Notes:**
    - Client-side validation should catch this before submitting to the server.

#### TC-AUTH-REG-04: Registration with Missing Required Fields
- **Feature/Component:** RegistrationPage
- **Test Scenario Description:** A user attempts to register without filling in all required fields (e.g., missing email or first name).
- **Steps to Reproduce:**
    1. Navigate to the `/register` page.
    2. Leave one or more required fields blank (e.g., email).
    3. Fill in other fields.
    4. Click the "Register" or "Sign Up" button.
- **Expected Result:**
    - Registration fails.
    - Error messages are displayed for each missing required field, or a general message is shown.
    - User remains on the registration page.
    - Input fields that failed validation are highlighted.
- **Potential Issues/Notes:**
    - Ensure all mandatory fields are correctly validated.

### Login

#### TC-AUTH-LOGIN-01: Successful Login with Valid Credentials
- **Feature/Component:** LoginPage, AuthContext, MockAuthService
- **Test Scenario Description:** A registered user attempts to log in with their correct email and password.
- **Steps to Reproduce:**
    1. Navigate to the `/login` page.
    2. Enter a valid registered email (e.g., `user@medimo.com`) in the email field.
    3. Enter the corresponding correct password (e.g., `password123`) in the password field.
    4. Click the "Login" button.
- **Expected Result:**
    - Login is successful.
    - `AuthContext` is updated with the authenticated user's data.
    - User is redirected to the `HomeScreen` (or onboarding if applicable).
    - A success toast notification is displayed.
    - QR code data is generated/loaded for the user in `AuthContext`.
- **Potential Issues/Notes:**
    - Ensure redirection logic after login correctly handles new vs. returning users (onboarding).
    - Verify `MockAuthService` correctly returns user data in the expected format.

#### TC-AUTH-LOGIN-02: Login with Invalid Email
- **Feature/Component:** LoginPage, MockAuthService
- **Test Scenario Description:** A user attempts to log in with an email address that is not registered.
- **Steps to Reproduce:**
    1. Navigate to the `/login` page.
    2. Enter an unregistered email (e.g., `nonexistent@medimo.com`) in the email field.
    3. Enter any password in the password field.
    4. Click the "Login" button.
- **Expected Result:**
    - Login fails.
    - An error message is displayed (e.g., "Invalid email or password" or "User not found").
    - User remains on the login page.
    - `AuthContext` is not updated.
- **Potential Issues/Notes:**
    - Avoid messages that explicitly state "Email not found" for security reasons (to prevent email enumeration). A generic "Invalid credentials" is often preferred.

#### TC-AUTH-LOGIN-03: Login with Incorrect Password
- **Feature/Component:** LoginPage, MockAuthService
- **Test Scenario Description:** A registered user attempts to log in with a correct email but an incorrect password.
- **Steps to Reproduce:**
    1. Navigate to the `/login` page.
    2. Enter a valid registered email (e.g., `user@medimo.com`) in the email field.
    3. Enter an incorrect password (e.g., `wrongpassword`) in the password field.
    4. Click the "Login" button.
- **Expected Result:**
    - Login fails.
    - An error message is displayed (e.g., "Invalid email or password").
    - User remains on the login page.
    - `AuthContext` is not updated.
- **Potential Issues/Notes:**
    - Consider implementing account lockout mechanisms after multiple failed attempts.

#### TC-AUTH-LOGIN-04: Login with Empty Email Field
- **Feature/Component:** LoginPage
- **Test Scenario Description:** A user attempts to log in without entering an email.
- **Steps to Reproduce:**
    1. Navigate to the `/login` page.
    2. Leave the email field empty.
    3. Enter any password in the password field.
    4. Click the "Login" button.
- **Expected Result:**
    - Login fails.
    - An error message is displayed prompting for the email.
    - User remains on the login page.
    - The email input field is highlighted as invalid.
- **Potential Issues/Notes:**
    - Client-side validation should prevent form submission if possible.

#### TC-AUTH-LOGIN-05: Login with Empty Password Field
- **Feature/Component:** LoginPage
- **Test Scenario Description:** A user attempts to log in without entering a password.
- **Steps to Reproduce:**
    1. Navigate to the `/login` page.
    2. Enter a valid email in the email field.
    3. Leave the password field empty.
    4. Click the "Login" button.
- **Expected Result:**
    - Login fails.
    - An error message is displayed prompting for the password.
    - User remains on the login page.
    - The password input field is highlighted as invalid.
- **Potential Issues/Notes:**
    - Client-side validation should prevent form submission.

### Logout

#### TC-AUTH-LOGOUT-01: Successful Logout
- **Feature/Component:** Application (e.g., Navbar, ProfilePage), AuthContext, MockAuthService
- **Test Scenario Description:** An authenticated user attempts to log out of the application.
- **Steps to Reproduce:**
    1. User is logged in to the application.
    2. User clicks on the "Logout" button (typically in a user menu or profile section).
- **Expected Result:**
    - Logout is successful.
    - `AuthContext` is cleared (user data, token, authentication status set to false).
    - Any session-related data (e.g., tokens in localStorage/sessionStorage) is cleared.
    - User is redirected to the `LoginPage` or a public landing page.
    - A success toast notification for logout may be displayed.
- **Potential Issues/Notes:**
    - Ensure all sensitive user data is cleared from the client-side upon logout.
    - `MockAuthService` should handle any backend logout simulation if necessary (e.g., token invalidation if applicable).

### AuthGuard

#### TC-AUTH-GUARD-01: Accessing Protected Route without Authentication
- **Feature/Component:** AuthGuard, Routing Mechanism
- **Test Scenario Description:** A non-authenticated user attempts to access a route protected by `AuthGuard`.
- **Steps to Reproduce:**
    1. User is not logged in (or has logged out).
    2. User attempts to navigate directly to a protected route URL (e.g., `/home`, `/profile`).
- **Expected Result:**
    - Access to the protected route is denied.
    - User is redirected to the `LoginPage`.
    - Optionally, a message like "You need to log in to access this page" might be stored and displayed on the login page.
- **Potential Issues/Notes:**
    - Verify that all routes requiring authentication are correctly covered by the `AuthGuard`.

#### TC-AUTH-GUARD-02: Accessing Protected Route with Authentication
- **Feature/Component:** AuthGuard, Routing Mechanism
- **Test Scenario Description:** An authenticated user attempts to access a route protected by `AuthGuard`.
- **Steps to Reproduce:**
    1. User is logged in.
    2. User navigates to a protected route (e.g., clicks a link to `/home` or types the URL).
- **Expected Result:**
    - Access to the protected route is allowed.
    - The requested page/component is rendered correctly.
- **Potential Issues/Notes:**
    - Ensure `AuthContext` correctly provides authentication status to the `AuthGuard`.

#### TC-AUTH-GUARD-03: Accessing Login Page when already Authenticated
- **Feature/Component:** AuthGuard (or similar logic on LoginPage), Routing Mechanism
- **Test Scenario Description:** An authenticated user attempts to navigate to the `LoginPage` or `RegistrationPage`.
- **Steps to Reproduce:**
    1. User is logged in.
    2. User attempts to navigate directly to `/login` or `/register`.
- **Expected Result:**
    - User is redirected away from the login/registration page, typically to the `HomeScreen` or dashboard.
    - Prevents confusion and unnecessary login/registration attempts.
- **Potential Issues/Notes:**
    - This might be handled by a specific guard on the auth routes or within the page components themselves.

## HomeScreen & Dashboard

#### TC-HD-DATA-01: Accurate Display of Upcoming Appointments
- **Feature/Component:** HomeScreen, Dashboard, AppointmentsWidget, HealthDataContext
- **Test Scenario Description:** Verify that upcoming appointments are accurately displayed on the HomeScreen/Dashboard.
- **Steps to Reproduce:**
    1. Log in as a user with known upcoming appointments in `HealthDataContext`.
    2. Navigate to the HomeScreen/Dashboard.
    3. Observe the appointments widget/section.
- **Expected Result:**
    - The correct number of upcoming appointments is displayed.
    - Details for each appointment (e.g., doctor name, specialty, date, time) are accurate.
    - Appointments are typically sorted by date/time, with the soonest displayed prominently.
    - If there are no upcoming appointments, a message like "No upcoming appointments" is shown.
- **Potential Issues/Notes:**
    - Definition of "upcoming" (e.g., next 7 days, today only) should be clear and consistently applied.
    - Timezone handling for appointment times.
    - UI should gracefully handle long names or many appointments.

#### TC-HD-DATA-02: Accurate Display of Current Medications
- **Feature/Component:** HomeScreen, Dashboard, MedicationsWidget, HealthDataContext
- **Test Scenario Description:** Verify that current medications are accurately displayed.
- **Steps to Reproduce:**
    1. Log in as a user with known current medications in `HealthDataContext`.
    2. Navigate to the HomeScreen/Dashboard.
    3. Observe the medications widget/section.
- **Expected Result:**
    - The correct list of current medications is displayed.
    - Details for each medication (e.g., name, dosage, frequency) are accurate.
    - If there are no current medications, a message like "No current medications" is shown.
- **Potential Issues/Notes:**
    - Definition of "current" medications (e.g., not expired, currently prescribed).
    - UI should handle long medication names or dosages.

#### TC-HD-DATA-03: Accurate Display of Active Reminders
- **Feature/Component:** HomeScreen, Dashboard, RemindersWidget, HealthDataContext
- **Test Scenario Description:** Verify that active reminders (e.g., medication reminders, appointment reminders) are accurately displayed.
- **Steps to Reproduce:**
    1. Log in as a user with known active reminders in `HealthDataContext`.
    2. Navigate to the HomeScreen/Dashboard.
    3. Observe the reminders widget/section.
- **Expected Result:**
    - All active reminders are displayed.
    - Details for each reminder (e.g., reminder text, due time, related item like medication/appointment) are accurate.
    - If there are no active reminders, a message like "No active reminders" is shown.
- **Potential Issues/Notes:**
    - How completed or dismissed reminders are handled (should not appear in "active").
    - Timeliness of reminder notifications if part of this widget.

#### TC-HD-UI-01: UI Elements Visibility - Empty State
- **Feature/Component:** HomeScreen, Dashboard
- **Test Scenario Description:** Verify that UI elements (widgets for appointments, medications, reminders) display appropriate "empty state" messages when no data is available.
- **Steps to Reproduce:**
    1. Log in as a new user or a user with no appointments, medications, or reminders in `HealthDataContext`.
    2. Navigate to the HomeScreen/Dashboard.
- **Expected Result:**
    - Appointments widget shows a "No upcoming appointments" (or similar) message.
    - Medications widget shows a "No current medications" (or similar) message.
    - Reminders widget shows a "No active reminders" (or similar) message.
    - The overall dashboard layout remains consistent and does not break.
- **Potential Issues/Notes:**
    - Consistency in empty state messaging and design across different widgets.

#### TC-HD-UI-02: UI Elements Visibility - With Data
- **Feature/Component:** HomeScreen, Dashboard
- **Test Scenario Description:** Verify that UI elements correctly display data and calls to action when data is present.
- **Steps to Reproduce:**
    1. Log in as a user with data for appointments, medications, and reminders.
    2. Navigate to the HomeScreen/Dashboard.
- **Expected Result:**
    - Widgets are populated with the respective data.
    - Any "View All" or "Add New" buttons/links within widgets are visible and correctly linked.
    - Data is presented in a readable and organized manner.
- **Potential Issues/Notes:**
    - Check for data truncation issues or layout problems with larger amounts of data.
    - Interactivity of elements within the widgets (e.g., clicking an appointment to see details - though this might be a separate test case for navigation).

#### TC-HD-NAV-01: Navigation from Dashboard Widgets
- **Feature/Component:** HomeScreen, Dashboard, Navigation
- **Test Scenario Description:** Verify that "View All" or similar links/buttons on dashboard widgets navigate to the correct detailed sections/pages.
- **Steps to Reproduce:**
    1. Log in as a user.
    2. Navigate to the HomeScreen/Dashboard.
    3. Click the "View All Appointments" (or similar) link/button.
    4. Click the "View All Medications" (or similar) link/button.
    5. Click the "View All Reminders" (or similar) link/button.
- **Expected Result:**
    - Clicking "View All Appointments" navigates to the main appointments listing page (e.g., Timeline filtered by appointments or a dedicated appointments page).
    - Clicking "View All Medications" navigates to the main medications listing page.
    - Clicking "View All Reminders" navigates to a page where all reminders can be managed.
- **Potential Issues/Notes:**
    - Ensure the navigation targets are correct and functional.

## Timeline

### Event Display

#### TC-TL-ED-01: Correct Display of All Event Types
- **Feature/Component:** TimelinePage, HealthDataContext
- **Test Scenario Description:** Verify that all types of health events (appointments, medication administrations, vital logs, documents added, etc.) are displayed on the timeline.
- **Steps to Reproduce:**
    1. Log in as a user with a variety of health events recorded in `HealthDataContext`.
    2. Navigate to the Timeline page.
- **Expected Result:**
    - Each event is displayed with relevant information (e.g., appointment: doctor, date; medication: name, dosage; vital: type, value, date).
    - Icons or visual cues correctly differentiate event types.
    - Data displayed for each event is accurate and matches the source data.
- **Potential Issues/Notes:**
    - Ensure all event types supported by `HealthDataContext` have a corresponding UI representation on the timeline.
    - Handling of events with missing optional data.

#### TC-TL-ED-02: Chronological Order of Events
- **Feature/Component:** TimelinePage, HealthDataContext
- **Test Scenario Description:** Verify that events are displayed in reverse chronological order by default (most recent first).
- **Steps to Reproduce:**
    1. Log in as a user with multiple events spanning different dates and times.
    2. Navigate to the Timeline page.
- **Expected Result:**
    - Events are sorted with the newest events at the top of the list.
    - If multiple events occur on the same day, their order should be consistent (e.g., by time of day, or by event type if time is not specific).
- **Potential Issues/Notes:**
    - Correct handling of timezones if events can be logged in different timezones.
    - Consistent sorting for events that might only have a date but no specific time.

#### TC-TL-ED-03: Display of Event Details
- **Feature/Component:** TimelinePage
- **Test Scenario Description:** Verify that clicking on an event (if applicable) expands to show more details or navigates to a detail page.
- **Steps to Reproduce:**
    1. Log in and navigate to the Timeline page.
    2. Find an event that is expected to have more details (e.g., an appointment).
    3. Click on the event item.
- **Expected Result:**
    - Additional details for the event are displayed (either inline expansion or navigation to a specific page for that event).
    - All relevant details are shown and are accurate.
- **Potential Issues/Notes:**
    - Consistency in how users access more details for different event types.
    - Performance if loading details dynamically.

#### TC-TL-ED-04: Empty State for Timeline
- **Feature/Component:** TimelinePage
- **Test Scenario Description:** Verify that an appropriate message is shown if there are no events to display.
- **Steps to Reproduce:**
    1. Log in as a new user with no health events.
    2. Navigate to the Timeline page.
- **Expected Result:**
    - A message like "No health events recorded yet" or "Your timeline is empty" is displayed.
    - No errors occur, and the page is laid out correctly.
- **Potential Issues/Notes:**
    - The message should be user-friendly and possibly guide the user on how to add events.

### Filtering

#### TC-TL-FILTER-01: Filter by Keyword Search
- **Feature/Component:** TimelinePage, SearchFilter
- **Test Scenario Description:** Verify that timeline events can be filtered by a keyword search.
- **Steps to Reproduce:**
    1. Log in as a user with various events.
    2. Navigate to the Timeline page.
    3. Enter a relevant keyword (e.g., a doctor's name, medication name, part of a note) into the search bar.
    4. Apply the search.
- **Expected Result:**
    - Only events containing the keyword in their relevant fields are displayed.
    - Search is case-insensitive by default (common usability).
    - If no events match, an appropriate "No results found" message is shown.
    - Clearing the search term restores the full list of events (respecting other active filters).
- **Potential Issues/Notes:**
    - Which fields are included in the search (e.g., event title, description, names, notes).
    - Performance with a large number of events.
    - Handling of special characters in search terms.

#### TC-TL-FILTER-02: Filter by Event Category
- **Feature/Component:** TimelinePage, CategoryFilter
- **Test Scenario Description:** Verify that timeline events can be filtered by category (e.g., Appointments, Medications, Vitals).
- **Steps to Reproduce:**
    1. Log in and navigate to the Timeline page.
    2. Select one or more event categories from the filter options (e.g., "Appointments").
    3. Apply the filter.
- **Expected Result:**
    - Only events belonging to the selected category/categories are displayed.
    - If multiple categories are selected, events from all selected categories are shown.
    - The filter UI clearly indicates which categories are currently active.
    - Deselecting a category removes it from the filter criteria.
- **Potential Issues/Notes:**
    - Ensure all event types are correctly mapped to filterable categories.
    - Logic for combining multiple category selections (AND vs OR - typically OR).

#### TC-TL-FILTER-03: Filter by Date Range
- **Feature/Component:** TimelinePage, DateFilter
- **Test Scenario Description:** Verify that timeline events can be filtered by a specific date range.
- **Steps to Reproduce:**
    1. Log in and navigate to the Timeline page.
    2. Select a start date and an end date using the date filter controls.
    3. Apply the filter.
- **Expected Result:**
    - Only events that occurred within the selected date range (inclusive) are displayed.
    - The filter UI clearly indicates the active date range.
    - Clearing the date range filter restores events from all dates (respecting other active filters).
- **Potential Issues/Notes:**
    - Correct handling of single-day selections (start date = end date).
    - Timezone considerations if event timestamps include time.
    - Usability of the date picker component.

#### TC-TL-FILTER-04: Sort Order Change
- **Feature/Component:** TimelinePage, SortControl
- **Test Scenario Description:** Verify that the sort order of timeline events can be changed (e.g., from newest first to oldest first).
- **Steps to Reproduce:**
    1. Log in and navigate to the Timeline page.
    2. Locate the sort control (e.g., a dropdown or toggle button).
    3. Change the sort order (e.g., to "Oldest First").
- **Expected Result:**
    - The order of events on the timeline updates according to the selected sort criteria.
    - If filtering is also applied, sorting applies to the filtered results.
- **Potential Issues/Notes:**
    - Available sort options (e.g., date, event type).
    - Default sort order is clear.

#### TC-TL-FILTER-05: Combining Multiple Filters
- **Feature/Component:** TimelinePage, AllFilters
- **Test Scenario Description:** Verify that multiple filters (e.g., category and date range and search keyword) can be applied simultaneously.
- **Steps to Reproduce:**
    1. Log in and navigate to the Timeline page.
    2. Select an event category (e.g., "Appointments").
    3. Select a date range.
    4. Enter a search keyword relevant to appointments within that date range.
    5. Apply all filters.
- **Expected Result:**
    - Only events that match ALL active filter criteria are displayed.
    - The UI clearly indicates all active filters.
    - Removing one filter correctly re-evaluates the remaining active filters.
- **Potential Issues/Notes:**
    - The logic for combining filters (typically AND).
    - UI complexity when many filters are active.
    - Performance when combining multiple complex filters.

#### TC-TL-FILTER-06: Reset Filters
- **Feature/Component:** TimelinePage, FilterControls
- **Test Scenario Description:** Verify functionality to reset all active filters to their default states.
- **Steps to Reproduce:**
    1. Log in and navigate to the Timeline page.
    2. Apply one or more filters (category, date, search).
    3. Click the "Reset Filters" or "Clear All" button.
- **Expected Result:**
    - All filters are cleared (search term removed, category selections reset, date range reset).
    - The timeline displays all events, sorted by the default order.
    - The filter controls are updated to reflect their default states.
- **Potential Issues/Notes:**
    - Ensure all filter types are correctly reset.

### Export

#### TC-TL-EXPORT-01: Initiate PDF Export
- **Feature/Component:** TimelinePage, PDFExportButton
- **Test Scenario Description:** Verify that the PDF export process for the timeline can be initiated.
- **Steps to Reproduce:**
    1. Log in and navigate to the Timeline page.
    2. Optionally, apply filters to the timeline view.
    3. Click the "Export to PDF" or "Download PDF" button.
- **Expected Result:**
    - A PDF generation process is initiated.
    - (Conceptual) A file download should begin, or a notification should appear indicating the PDF is being prepared.
    - The exported PDF should reflect the currently filtered view of the timeline (if filters are applied and this is the intended behavior).
    - If no filters are applied, the entire timeline (or a reasonable default range) is exported.
- **Potential Issues/Notes:**
    - This test case primarily covers the initiation. Actual PDF content validation would be a more in-depth test.
    - How are very long timelines handled in PDF export (pagination, performance)?
    - Naming convention of the downloaded PDF file.
    - User feedback during the export process, especially if it takes time.

## Vault

### Document Listing

#### TC-VAULT-LIST-01: Display of Uploaded Documents
- **Feature/Component:** VaultPage, HealthDataContext (or DocumentService)
- **Test Scenario Description:** Verify that all uploaded documents for the user are listed.
- **Steps to Reproduce:**
    1. Log in as a user with multiple uploaded documents of various types (e.g., PDF, JPG, PNG).
    2. Navigate to the Vault page.
- **Expected Result:**
    - All user's documents are listed.
    - Each document entry displays key information such as filename, document type (or icon), upload date, and possibly category.
    - Documents are displayed in a consistent order (e.g., by upload date descending, or alphabetically by filename).
- **Potential Issues/Notes:**
    - Handling of long filenames (truncation, wrapping).
    - Display of thumbnails for image files, or generic icons for other file types.
    - Performance if a user has a very large number of documents.

#### TC-VAULT-LIST-02: Empty State for Vault
- **Feature/Component:** VaultPage
- **Test Scenario Description:** Verify that an appropriate message is shown if there are no documents uploaded.
- **Steps to Reproduce:**
    1. Log in as a new user or a user who has not uploaded any documents.
    2. Navigate to the Vault page.
- **Expected Result:**
    - A message like "No documents uploaded yet" or "Your vault is empty" is displayed.
    - A clear call to action (e.g., "Upload Document" button) is visible.
- **Potential Issues/Notes:**
    - The message should be user-friendly and guide the user.

#### TC-VAULT-LIST-03: Document Preview/View
- **Feature/Component:** VaultPage, DocumentViewer
- **Test Scenario Description:** Verify that clicking a document allows the user to view or preview it.
- **Steps to Reproduce:**
    1. Log in and navigate to the Vault page.
    2. Click on a document entry (e.g., a PDF or an image).
- **Expected Result:**
    - For supported file types (e.g., PDF, common image formats), a preview is displayed within the application (e.g., in a modal or a dedicated view).
    - For unsupported file types, clicking might initiate a download.
    - The correct document content is displayed.
- **Potential Issues/Notes:**
    - Range of supported file types for in-app preview.
    - Security considerations for rendering documents.
    - Usability of the document viewer (zoom, pan, download from preview).

### Search and Filters

#### TC-VAULT-FILTER-01: Filter by Document Category
- **Feature/Component:** VaultPage, CategoryFilter
- **Test Scenario Description:** Verify that documents can be filtered by user-defined or predefined categories (e.g., "Lab Reports", "Prescriptions", "Insurance").
- **Steps to Reproduce:**
    1. Log in as a user with documents assigned to various categories.
    2. Navigate to the Vault page.
    3. Select one or more categories from the filter options.
- **Expected Result:**
    - Only documents belonging to the selected category/categories are displayed.
    - The filter UI clearly indicates the active category filter(s).
- **Potential Issues/Notes:**
    - How categories are assigned during upload or editing.
    - Consistency of category options.

#### TC-VAULT-FILTER-02: Filter by Document Type (File Extension)
- **Feature/Component:** VaultPage, TypeFilter
- **Test Scenario Description:** Verify that documents can be filtered by their file type (e.g., PDF, JPG, DOCX).
- **Steps to Reproduce:**
    1. Log in as a user with documents of different file types.
    2. Navigate to the Vault page.
    3. Select one or more file types from the filter options (e.g., "PDF").
- **Expected Result:**
    - Only documents of the selected file type(s) are displayed.
    - The filter UI clearly indicates the active type filter(s).
- **Potential Issues/Notes:**
    - Accuracy of file type detection (e.g., based on extension or MIME type).
    - Range of file types available for filtering.

#### TC-VAULT-FILTER-03: Sort Documents
- **Feature/Component:** VaultPage, SortControl
- **Test Scenario Description:** Verify that documents can be sorted by different criteria (e.g., filename, upload date, category).
- **Steps to Reproduce:**
    1. Log in and navigate to the Vault page.
    2. Locate the sort control.
    3. Select a sort criterion (e.g., "Filename A-Z", "Upload Date - Newest First").
- **Expected Result:**
    - The list of documents is re-sorted according to the selected criterion.
    - Default sort order is clear (e.g., upload date descending).
- **Potential Issues/Notes:**
    - Available sort options and their correct implementation.

#### TC-VAULT-FILTER-04: Search Documents by Name/Keyword
- **Feature/Component:** VaultPage, SearchBar
- **Test Scenario Description:** Verify that documents can be searched by their filename or keywords within their metadata (if applicable).
- **Steps to Reproduce:**
    1. Log in as a user with several documents.
    2. Navigate to the Vault page.
    3. Enter a search term (e.g., part of a filename, a tag) in the search bar.
- **Expected Result:**
    - Only documents matching the search term in their filename or relevant metadata are displayed.
    - If no documents match, an appropriate "No results found" message is shown.
- **Potential Issues/Notes:**
    - Scope of search (filename only, or also tags, descriptions if available).
    - Case sensitivity of the search.

#### TC-VAULT-FILTER-05: Combining Filters and Search in Vault
- **Feature/Component:** VaultPage, AllFilters, SearchBar
- **Test Scenario Description:** Verify that multiple filters (category, type, sort) and search can be applied simultaneously.
- **Steps to Reproduce:**
    1. Log in and navigate to the Vault page.
    2. Select a category (e.g., "Lab Reports").
    3. Select a file type (e.g., "PDF").
    4. Enter a search term.
    5. Change the sort order.
- **Expected Result:**
    - Only documents that match ALL active filter and search criteria are displayed, in the specified sort order.
    - The UI clearly indicates all active filters and search terms.
- **Potential Issues/Notes:**
    - Correct interaction logic between different filter types.

### Document Operations (Conceptual)

#### TC-VAULT-OP-01: Document Upload (Conceptual)
- **Feature/Component:** VaultPage, UploadModal/Form, HealthDataContext (or DocumentService)
- **Test Scenario Description:** Conceptually test the document upload process.
- **Steps to Reproduce:**
    1. Navigate to the Vault page.
    2. Click the "Upload Document" button.
    3. (Conceptually) Select a file from the local system.
    4. (Conceptually) Enter metadata if required (e.g., title, category, date).
    5. (Conceptually) Click "Upload" or "Save".
- **Expected Result:**
    - The document is "uploaded" (i.e., its metadata is added to `HealthDataContext` or a mock service).
    - The new document appears in the Vault document list.
    - A success notification is displayed.
    - The document might also appear as an event on the Timeline.
- **Potential Issues/Notes:**
    - File type restrictions and validation (e.g., max file size, allowed extensions).
    - Handling of upload errors (e.g., network issue, file too large).
    - Metadata assignment and its accuracy.

#### TC-VAULT-OP-02: Document Deletion (Conceptual)
- **Feature/Component:** VaultPage, HealthDataContext (or DocumentService)
- **Test Scenario Description:** Conceptually test the document deletion process.
- **Steps to Reproduce:**
    1. Navigate to the Vault page.
    2. Select a document to delete.
    3. Click the "Delete" button/icon for that document.
    4. Confirm the deletion in a confirmation dialog.
- **Expected Result:**
    - The document is "deleted" (i.e., removed from `HealthDataContext` or a mock service).
    - The document no longer appears in the Vault document list.
    - A success notification is displayed.
    - The corresponding event on the Timeline might be updated or removed.
- **Potential Issues/Notes:**
    - Confirmation step to prevent accidental deletion.
    - What happens to associated data if a document is deleted.
    - Error handling if deletion fails.

## Profile

### User Information Display

#### TC-PROF-DISP-01: Correct Display of User Information
- **Feature/Component:** ProfilePage, AuthContext
- **Test Scenario Description:** Verify that the user's profile information is correctly displayed on the Profile page.
- **Steps to Reproduce:**
    1. Log in as a user with known profile details (e.g., name, email, DOB, etc., stored in `AuthContext`).
    2. Navigate to the Profile page.
- **Expected Result:**
    - The user's full name, email address, date of birth, and any other relevant profile information (e.g., contact number, address if applicable) are displayed accurately.
    - Data matches the information stored in `AuthContext` or the user's record.
    - Profile picture (if any) is displayed.
- **Potential Issues/Notes:**
    - Formatting of data (e.g., date formats).
    - Handling of missing optional profile fields (should display gracefully, e.g., "Not set").
    - How changes to profile information (tested elsewhere) are reflected here.

#### TC-PROF-DISP-02: Edit Profile Information (Navigation)
- **Feature/Component:** ProfilePage
- **Test Scenario Description:** Verify that there is a clear way to navigate to an "Edit Profile" page or that fields are editable in place.
- **Steps to Reproduce:**
    1. Log in and navigate to the Profile page.
    2. Look for an "Edit Profile" button or individual edit icons next to profile fields.
- **Expected Result:**
    - An "Edit Profile" button/link is present and navigates to a form for editing profile details.
    - OR, profile fields have clear indicators that they can be edited in-place.
- **Potential Issues/Notes:**
    - Actual editing functionality will be covered under "Data Management" or specific edit profile tests. This focuses on the UI affordance for editing.

### QR Code Functionality

#### TC-PROF-QR-01: QR Code Modal Opening
- **Feature/Component:** ProfilePage, QRCodeModal, AuthContext
- **Test Scenario Description:** Verify that a modal containing a QR code (presumably for sharing user/health info) can be opened.
- **Steps to Reproduce:**
    1. Log in and navigate to the Profile page.
    2. Click on the "Show QR Code" or similar button/icon.
- **Expected Result:**
    - A modal window appears.
    - The modal displays a QR code.
    - The QR code is generated based on user data from `AuthContext` (e.g., a link to a web profile, or stringified emergency info).
    - The modal has a close button.
- **Potential Issues/Notes:**
    - Content/data encoded in the QR code should be verified (though this might be a deeper test).
    - Accessibility of the modal.
    - What happens if QR code generation fails.

#### TC-PROF-QR-02: QR Code Modal Closing
- **Feature/Component:** ProfilePage, QRCodeModal
- **Test Scenario Description:** Verify that the QR code modal can be closed.
- **Steps to Reproduce:**
    1. Open the QR code modal (as per TC-PROF-QR-01).
    2. Click the close button (e.g., "X" icon, "Close" button) on the modal.
    3. Alternatively, press the Escape key (if standard modal behavior).
- **Expected Result:**
    - The QR code modal is dismissed.
    - The user is returned to the Profile page view.
- **Potential Issues/Notes:**
    - Ensure all standard methods for closing modals work.

### Data Export

#### TC-PROF-EXPORT-01: Initiate Data Export
- **Feature/Component:** ProfilePage, DataExportService
- **Test Scenario Description:** Verify that the user can initiate an export of their health data.
- **Steps to Reproduce:**
    1. Log in and navigate to the Profile page.
    2. Find and click the "Export My Data" or "Download Health Record" button.
    3. (If applicable) Select export format options (e.g., JSON, PDF summary).
- **Expected Result:**
    - A data export process is initiated.
    - (Conceptual) A file download should begin (e.g., JSON, CSV, or a PDF report), or a notification should appear indicating the data is being prepared.
    - User receives feedback that the export has started.
- **Potential Issues/Notes:**
    - This test case primarily covers the initiation. Actual file content validation would be more in-depth.
    - Format of the exported data.
    - Security/privacy considerations for the exported data.
    - Handling of large data exports (asynchronous processing might be needed).
    - User notification upon completion if it's an asynchronous process.

### Navigation

#### TC-PROF-NAV-01: Navigation to Account Settings
- **Feature/Component:** ProfilePage, Navigation
- **Test Scenario Description:** Verify navigation to an "Account Settings" sub-page (e.g., for changing password, managing email preferences).
- **Steps to Reproduce:**
    1. Log in and navigate to the Profile page.
    2. Click on an "Account Settings" or "Manage Account" link/button.
- **Expected Result:**
    - User is navigated to the Account Settings page.
    - The Account Settings page displays relevant options.
- **Potential Issues/Notes:**
    - Correctness of the navigation path.
    - AuthGuard protection for the settings page.

#### TC-PROF-NAV-02: Navigation to App Settings/Preferences
- **Feature/Component:** ProfilePage, Navigation
- **Test Scenario Description:** Verify navigation to an "App Settings" or "Preferences" sub-page (e.g., for notification settings, theme preferences).
- **Steps to Reproduce:**
    1. Log in and navigate to the Profile page.
    2. Click on an "App Settings," "Preferences," or "Display Settings" link/button.
- **Expected Result:**
    - User is navigated to the App Settings/Preferences page.
    - The page displays relevant application-specific settings.
- **Potential Issues/Notes:**
    - Correctness of the navigation path.

#### TC-PROF-NAV-03: Navigation to Help/Support Page
- **Feature/Component:** ProfilePage, Navigation
- **Test Scenario Description:** Verify navigation to a "Help" or "Support" page.
- **Steps to Reproduce:**
    1. Log in and navigate to the Profile page.
    2. Click on a "Help," "Support," or "FAQ" link/button.
- **Expected Result:**
    - User is navigated to the Help/Support page or an external support site.
- **Potential Issues/Notes:**
    - Correctness of the link, especially if it's an external URL.

## Data Management (Conceptual)
These tests are conceptual, focusing on the expected interactions and data flow when users add, edit, or delete health-related information via FABs (Floating Action Buttons), modals, or dedicated forms.

### Medications Management

#### TC-DM-MED-01: Add New Medication (Conceptual)
- **Feature/Component:** AddMedicationModal/Form, HealthDataContext, TimelinePage
- **Test Scenario Description:** Conceptually test adding a new medication.
- **Steps to Reproduce:**
    1. User clicks a FAB or "Add Medication" button.
    2. An "Add Medication" modal/form appears.
    3. User enters medication details (name, dosage, frequency, start date, notes, etc.).
    4. User saves the medication.
- **Expected Result:**
    - The new medication is added to the user's medication list in `HealthDataContext`.
    - A success notification is displayed.
    - The new medication appears on relevant UI sections (e.g., MedicationsWidget, dedicated medications list).
    - An event for "Medication Started" or "Medication Added" appears on the Timeline for the specified start date.
- **Potential Issues/Notes:**
    - Validation of required fields (name, dosage).
    - Correct parsing and storage of dates and times.
    - Handling of medication end dates or "ongoing" status.

#### TC-DM-MED-02: Edit Existing Medication (Conceptual)
- **Feature/Component:** EditMedicationModal/Form, HealthDataContext, TimelinePage
- **Test Scenario Description:** Conceptually test editing an existing medication.
- **Steps to Reproduce:**
    1. User navigates to a medication list or detail view.
    2. User selects to edit an existing medication.
    3. An "Edit Medication" modal/form appears, pre-filled with existing data.
    4. User modifies medication details (e.g., changes dosage, updates notes).
    5. User saves the changes.
- **Expected Result:**
    - The medication details are updated in `HealthDataContext`.
    - A success notification is displayed.
    - Updated information is reflected in all relevant UI sections.
    - An event on the Timeline related to the medication might be updated or a new event "Medication Updated" might be logged.
- **Potential Issues/Notes:**
    - Ensure all fields are editable.
    - Impact of changes on existing reminders or logs related to this medication.

#### TC-DM-MED-03: Delete Medication (Conceptual)
- **Feature/Component:** MedicationsList/Page, HealthDataContext, TimelinePage
- **Test Scenario Description:** Conceptually test deleting a medication.
- **Steps to Reproduce:**
    1. User navigates to a medication list or detail view.
    2. User selects to delete an existing medication.
    3. A confirmation dialog appears.
    4. User confirms deletion.
- **Expected Result:**
    - The medication is removed from `HealthDataContext`.
    - A success notification is displayed.
    - The medication is removed from all relevant UI sections.
    - An event "Medication Stopped" or "Medication Deleted" might appear on the Timeline.
    - Associated reminders might be automatically deactivated or deleted.
- **Potential Issues/Notes:**
    - Handling of historical logs for a deleted medication (should they remain?).
    - User confirmation to prevent accidental deletion.

### Appointments Management

#### TC-DM-APP-01: Add New Appointment (Conceptual)
- **Feature/Component:** AddAppointmentModal/Form, HealthDataContext, TimelinePage
- **Test Scenario Description:** Conceptually test adding a new appointment.
- **Steps to Reproduce:**
    1. User clicks a FAB or "Add Appointment" button.
    2. An "Add Appointment" modal/form appears.
    3. User enters appointment details (doctor name, specialty, date, time, location, notes).
    4. User saves the appointment.
- **Expected Result:**
    - The new appointment is added to `HealthDataContext`.
    - A success notification is displayed.
    - The new appointment appears in upcoming appointments lists and on the Dashboard.
    - An "Appointment Scheduled" event appears on the Timeline for the appointment date.
- **Potential Issues/Notes:**
    - Date and time validation.
    - Location input/saving (free text vs. structured).
    - Creation of associated reminders.

#### TC-DM-APP-02: Edit Existing Appointment (Conceptual)
- **Feature/Component:** EditAppointmentModal/Form, HealthDataContext, TimelinePage
- **Test Scenario Description:** Conceptually test editing an existing appointment.
- **Steps to Reproduce:**
    1. User navigates to an appointment list or detail view.
    2. User selects to edit an existing appointment.
    3. An "Edit Appointment" modal/form appears, pre-filled.
    4. User modifies details (e.g., reschedules, changes doctor, adds notes).
    5. User saves the changes.
- **Expected Result:**
    - The appointment details are updated in `HealthDataContext`.
    - A success notification is displayed.
    - Updated information is reflected in UI and on the Timeline.
    - Associated reminders are updated.
- **Potential Issues/Notes:**
    - Logic for handling past appointments (can they be edited?).

#### TC-DM-APP-03: Delete/Cancel Appointment (Conceptual)
- **Feature/Component:** AppointmentsList/Page, HealthDataContext, TimelinePage
- **Test Scenario Description:** Conceptually test deleting/canceling an appointment.
- **Steps to Reproduce:**
    1. User navigates to an appointment list or detail view.
    2. User selects to delete/cancel an existing appointment.
    3. A confirmation dialog appears.
    4. User confirms.
- **Expected Result:**
    - The appointment is removed or marked as canceled in `HealthDataContext`.
    - A success notification is displayed.
    - The appointment is removed from UI lists (or shown as canceled).
    - The Timeline event is updated to "Appointment Canceled" or removed.
    - Associated reminders are deactivated/deleted.
- **Potential Issues/Notes:**
    - Distinction between deleting and canceling if needed.

### Vitals Logging

#### TC-DM-VITALS-01: Log New Vitals (Conceptual)
- **Feature/Component:** LogVitalsModal/Form, HealthDataContext, TimelinePage
- **Test Scenario Description:** Conceptually test logging new vital signs.
- **Steps to Reproduce:**
    1. User clicks a FAB or "Log Vitals" button.
    2. A "Log Vitals" modal/form appears.
    3. User selects vital type (e.g., blood pressure, heart rate, weight), enters value(s), date, and time.
    4. User saves the vital log.
- **Expected Result:**
    - The new vital reading is added to `HealthDataContext`.
    - A success notification is displayed.
    - The new vital log appears on charts or vital history lists.
    - A "Vitals Logged" event appears on the Timeline.
- **Potential Issues/Notes:**
    - Support for different units of measurement.
    - Validation of vital values (e.g., realistic ranges).
    - Input for complex vitals like blood pressure (systolic/diastolic).

#### TC-DM-VITALS-02: Edit Vital Log (Conceptual)
- **Feature/Component:** EditVitalsModal/Form, HealthDataContext, TimelinePage
- **Test Scenario Description:** Conceptually test editing a previously logged vital sign.
- **Steps to Reproduce:**
    1. User navigates to a vitals history list or a specific vital log.
    2. User selects to edit an existing vital log.
    3. Modal/form appears pre-filled.
    4. User modifies values or date/time.
    5. User saves changes.
- **Expected Result:**
    - The vital log is updated in `HealthDataContext`.
    - A success notification is displayed.
    - Updated information is reflected in charts and on the Timeline.
- **Potential Issues/Notes:**
    - Ensuring historical accuracy vs. correction capability.

#### TC-DM-VITALS-03: Delete Vital Log (Conceptual)
- **Feature/Component:** VitalsHistoryPage, HealthDataContext, TimelinePage
- **Test Scenario Description:** Conceptually test deleting a vital log.
- **Steps to Reproduce:**
    1. User navigates to a vitals history list.
    2. User selects to delete a vital log.
    3. Confirmation dialog appears.
    4. User confirms.
- **Expected Result:**
    - The vital log is removed from `HealthDataContext`.
    - A success notification is displayed.
    - The log is removed from charts and the Timeline event is removed.
- **Potential Issues/Notes:**
    - Impact on trend calculations if a log is removed.

### General Data Reflection

#### TC-DM-REFLECT-01: Data Changes in HealthDataContext reflected in UI
- **Feature/Component:** All data entry points, HealthDataContext, All relevant UI views
- **Test Scenario Description:** Verify that any data added, edited, or deleted via modals/FABs is correctly updated in `HealthDataContext` and these changes are immediately reflected in all relevant parts of the UI without requiring a manual refresh.
- **Steps to Reproduce:**
    1. Perform any CUD (Create, Update, Delete) operation on a piece of data (e.g., add a medication, edit an appointment, delete a vital).
    2. Immediately navigate to or observe other sections of the app that display this data (e.g., Dashboard widgets, Timeline, detailed lists).
- **Expected Result:**
    - The UI components re-render to show the most current data from `HealthDataContext`.
    - No stale data is displayed.
    - State management correctly propagates changes.
- **Potential Issues/Notes:**
    - Reactivity of the system. This is a crucial test for the overall consistency of the application.
    - Potential for race conditions or delays in UI updates.

#### TC-DM-REFLECT-02: Timeline Event Creation/Update/Deletion
- **Feature/Component:** All data entry points, HealthDataContext, TimelinePage
- **Test Scenario Description:** Verify that CUD operations on health data (medications, appointments, documents, vitals) correctly create, update, or delete corresponding events on the Timeline.
- **Steps to Reproduce:**
    1. Add a new medication/appointment/document/vital.
    2. Edit an existing medication/appointment/document/vital.
    3. Delete an existing medication/appointment/document/vital.
    4. After each operation, navigate to the Timeline page.
- **Expected Result:**
    - Adding data creates a new, accurate event on the Timeline.
    - Editing data updates the corresponding Timeline event (or creates a new one if appropriate, e.g., "Appointment Rescheduled").
    - Deleting data removes the corresponding event from the Timeline or updates it to reflect deletion/cancellation.
    - Timeline events are chronologically correct and contain accurate summary information.
- **Potential Issues/Notes:**
    - Logic for determining what constitutes a new Timeline event versus an update.
    - Correct timestamping and ordering of these events.
    - Consistency in how different data types are represented on the Timeline.The "Data Management (Conceptual)" section is now complete, covering the expected behavior for adding, editing, and deleting medications, appointments, and vitals, along with how these changes should reflect in the `HealthDataContext` and on the Timeline.

All requested sections (Authentication, HomeScreen & Dashboard, Timeline, Vault, Profile, and Data Management) have been drafted with various test cases. The document `TESTING_DOCUMENTATION.md` should now be comprehensive based on the initial requirements.

I will now submit the subtask report.
