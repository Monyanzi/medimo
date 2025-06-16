# Feature Analysis

This document outlines the key features of the Medimo application and their expected functionalities based on the analysis of the source code.

## Pages

### 1. Home Screen (`src/pages/HomeScreen.tsx`)

*   **Feature Name:** Home Screen
*   **Purpose:** To provide users with a quick overview of their current health status, upcoming events, and access to key features.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   Welcome message with user's name.
        *   Digital Health Key (critical information).
        *   Medication Reminders (pending and overdue).
        *   Today's Health Dashboard (upcoming appointments, active medications).
        *   Vital Signs Tracker summary.
        *   Health Progress (gamified health metrics).
        *   Quick Check-in.
    *   **User Actions:**
        *   Navigate to other sections of the app via Header and Bottom Navigation.
        *   Access detailed views of the displayed feature cards (e.g., Digital Health Key, Vitals).
        *   Interact with the Floating Action Button (FAB) for quick actions (e.g., adding data).
    *   **Interactions:**
        *   Uses `AuthContext` for user information.
        *   Uses `HealthDataContext` to fetch appointments, medications.
        *   Uses `NotificationContext` to add notifications.
        *   Uses `MedicationAdherenceContext` for medication tracking.
        *   `medicationReminderService` is used to generate and display medication reminders.
    *   **UI Elements:**
        *   Header, Bottom Navigation, FAB.
        *   Cards for each feature module.
        *   Icons for visual cues (Bell for notifications, Pill for medications).

### 2. Timeline Screen (`src/pages/TimelineScreen.tsx`)

*   **Feature Name:** Medical Timeline
*   **Purpose:** To provide a chronological view of the user's medical events, including appointments, medications, and documents.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   A list of timeline events, grouped by date.
        *   Details for each event (type, date, description).
    *   **User Actions:**
        *   Filter events by search term, category, date range.
        *   Sort events (e.g., newest first, oldest first).
        *   Export the timeline as a PDF.
        *   Delete an existing timeline event.
        *   Edit an existing timeline event.
        *   Add new events (likely via FAB).
    *   **Interactions:**
        *   Uses `HealthDataContext` to fetch, delete, and update timeline events.
        *   Uses `AuthContext` for user information (needed for PDF export).
        *   `generateTimelinePDF` service for PDF export functionality.
        *   `useTimelineFilters` hook to manage filtering and sorting logic.
    *   **UI Elements:**
        *   Header, Bottom Navigation, FAB.
        *   Card layout for the timeline display.
        *   Filter controls (input fields, select dropdowns).
        *   Buttons for export, edit, delete.
        *   `TimelineEventGroup` component to display events for a specific date.

### 3. Vault Screen (`src/pages/VaultScreen.tsx`)

*   **Feature Name:** Health Vault
*   **Purpose:** To allow users to securely store, organize, and manage their health-related documents.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   A list of uploaded documents.
        *   Document details (name, type, size, upload date, description, tags).
        *   Storage statistics (total documents, total size used, number of categories).
    *   **User Actions:**
        *   Search documents by name, description, or tags.
        *   Filter documents by category and type.
        *   Sort documents by name, date, or size (ascending/descending).
        *   Clear active filters.
        *   View individual document details (likely by clicking on `DocumentItem`).
        *   Upload new documents (likely via FAB).
        *   Delete or edit existing documents (functionality within `DocumentItem` or context menu).
    *   **Interactions:**
        *   Uses `HealthDataContext` to fetch documents.
        *   `DocumentItem` component to render each document.
    *   **UI Elements:**
        *   Header, Bottom Navigation, FAB.
        *   Cards for overall stats and document listing.
        *   Input field for search.
        *   Select dropdowns for filters and sorting.
        *   Skeletons for loading state.
        *   Informational card with tips for organizing documents.

### 4. Profile Screen (`src/pages/ProfileScreen.tsx`)

*   **Feature Name:** Profile Screen
*   **Purpose:** To provide users access to their personal information, settings, and app-related actions like logout and data export.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   User's avatar, name, and ID.
        *   Indication if caregiver safety monitoring is enabled.
        *   Navigation links to:
            *   Personal & Medical Info
            *   Settings & Notifications
            *   Legal & Support
    *   **User Actions:**
        *   Access Digital Health Key (summary).
        *   View/Generate QR Code for emergency medical info (opens `QRCodeModal`).
        *   Export health data (simulated PDF report).
        *   Log out of the application (with confirmation dialog).
        *   Navigate to detailed settings pages.
    *   **Interactions:**
        *   Uses `AuthContext` for user data and logout functionality.
        *   Navigates to other profile-related sub-pages.
        *   Opens `QRCodeModal`.
        *   Uses `toast` for notifications (e.g., export success/failure).
    *   **UI Elements:**
        *   Header, Bottom Navigation.
        *   User identity card with avatar and basic info.
        *   Action buttons for Digital Key, QR Code, Export.
        *   List of settings items with icons and descriptions.
        *   Logout button with an alert dialog for confirmation.

### 5. Personal & Medical Info Page (`src/pages/PersonalMedicalPage.tsx`)

*   **Feature Name:** Personal & Medical Information Page
*   **Purpose:** To allow users to view and edit their detailed personal, medical, emergency contact, insurance, and caregiver information.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   Form fields for:
            *   Basic Information (name, email, DOB, blood type, organ donor status).
            *   Medical Information (allergies, medical conditions - dynamic arrays).
            *   Emergency Contact (name, phone, relationship).
            *   Caregiver Settings (enable, contact details, check-in settings).
            *   Insurance Information (enable, provider, policy number, member ID).
    *   **User Actions:**
        *   Edit and save changes to their profile information.
        *   Add/remove allergies and medical conditions.
        *   Enable/disable insurance information section and fill details.
        *   Enable/disable caregiver monitoring and configure caregiver contact and check-in settings (frequency, reminder time).
    *   **Interactions:**
        *   Uses `AuthContext` to fetch initial user data and `updateUser` to save changes.
        *   Uses `react-hook-form` and `zod` for form validation.
        *   Navigates back to the profile screen.
    *   **UI Elements:**
        *   Header with back button and title.
        *   Form organized into cards for different sections.
        *   Input fields, select dropdowns, switches.
        *   Buttons to add/remove items in arrays (allergies, conditions).
        *   Save Changes button.

### 6. Settings & Notifications Page (`src/pages/SettingsNotificationsPage.tsx`)

*   **Feature Name:** Settings & Notifications Page
*   **Purpose:** To allow users to configure notification preferences, language, region, and other app-specific settings.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   Toggles for various notification types (medication, appointment, vital signs, caregiver alerts).
        *   Toggles for notification methods (push, email).
        *   Select dropdowns for language, region, time format, and date format.
    *   **User Actions:**
        *   Enable/disable different types of notifications.
        *   Choose preferred notification delivery methods.
        *   Select app language, region, and display formats for time and date.
        *   Save the configured settings.
    *   **Interactions:**
        *   State is managed locally within the component.
        *   A `handleSave` function is present (console logs, actual saving logic not fully implemented).
        *   Navigates back to the profile screen.
    *   **UI Elements:**
        *   Header with back button and title.
        *   Cards for Notification Settings and Language & Region.
        *   Switches for toggling settings.
        *   Select dropdowns for choices.
        *   Save Settings button.

### 7. Legal & Support Page (`src/pages/LegalSupportPage.tsx`)

*   **Feature Name:** Legal & Support Page
*   **Purpose:** To provide users access to legal documents (Terms of Service, Privacy Policy) and support resources (FAQ, contact, user guide).
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   Sections for Legal Documents and Help & Support.
        *   Summaries of Terms of Service and Privacy Policy.
        *   Links/buttons for FAQ, Contact Support, User Guide, Report a Bug, Feature Request.
        *   App Information (version, last updated, developer).
    *   **User Actions:**
        *   View details of legal documents (simulated "Read Full Document").
        *   Access various support channels (actions currently log to console).
    *   **Interactions:**
        *   Navigates back to the profile screen.
        *   Actions for support items currently log to the console, implying future navigation or modal views.
    *   **UI Elements:**
        *   Header with back button and title.
        *   Cards for Legal Documents, Help & Support, and App Information.
        *   Buttons with icons for legal and support items.

### 8. Welcome Page (`src/pages/WelcomePage.tsx`)

*   **Feature Name:** Welcome Page
*   **Purpose:** To introduce new users to the app's key features and provide options to sign up or log in. This page is shown to unauthenticated users.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   App name/logo ("Medimo").
        *   A welcoming headline and brief description of the app.
        *   A list of key app features with icons and descriptions (Health Tracking, Emergency Ready, Medication Reminders, Caregiver Support).
    *   **User Actions:**
        *   Navigate to the Registration page ("Create Account").
        *   Navigate to the Login page ("Sign In").
    *   **Interactions:**
        *   Uses `AuthGuard` to ensure it's shown only to unauthenticated users.
        *   Navigates to `/register` or `/login`.
    *   **UI Elements:**
        *   App logo and name in the header.
        *   Feature highlights presented in cards.
        *   Buttons for "Create Account" and "Sign In".

### 9. Login Page (`src/pages/LoginPage.tsx`)

*   **Feature Name:** Login Page
*   **Purpose:** To allow existing users to authenticate and access their accounts.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   App name/logo ("Medimo").
        *   Login form with fields for email and password.
        *   Option to show/hide password.
        *   Link to the Registration page for users without an account.
        *   Test account credentials for easy testing.
    *   **User Actions:**
        *   Enter email and password.
        *   Submit the login form.
        *   Toggle password visibility.
        *   Navigate to the registration page.
    *   **Interactions:**
        *   Uses `react-hook-form` and `zod` for form validation.
        *   Calls `MockAuthService.login` for authentication.
        *   On successful login, navigates to the Home screen (`/`) if onboarding is complete, or to Onboarding Setup (`/onboarding/setup`) otherwise.
        *   Displays error messages from the auth service or for unexpected errors.
        *   Uses `toast` for success notifications.
    *   **UI Elements:**
        *   App logo and name in the header.
        *   Card containing the login form.
        *   Input fields, submit button.
        *   Alert for displaying login errors.

### 10. Register Page (`src/pages/RegisterPage.tsx`)

*   **Feature Name:** Register Page
*   **Purpose:** To allow new users to create an account.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   App name/logo ("Medimo").
        *   Registration form with fields for full name, email, password, and confirm password.
        *   Option to show/hide password and confirm password.
        *   Link to the Login page for users who already have an account.
    *   **User Actions:**
        *   Enter full name, email, password, and confirm password.
        *   Submit the registration form.
        *   Toggle password visibility.
        *   Navigate to the login page.
    *   **Interactions:**
        *   Uses `react-hook-form` and `zod` for form validation, including password complexity and matching.
        *   Calls `MockAuthService.register` to create a new user account.
        *   On successful registration, navigates to the Onboarding Setup page (`/onboarding/setup`).
        *   Displays error messages from the auth service or for unexpected errors.
        *   Uses `toast` for success notifications.
    *   **UI Elements:**
        *   App logo and name in the header.
        *   Card containing the registration form.
        *   Input fields, submit button.
        *   Alert for displaying registration errors.

### 11. Onboarding Setup Page (`src/pages/OnboardingSetupPage.tsx`)

*   **Feature Name:** Onboarding Setup Page
*   **Purpose:** To guide new users through the initial setup of their profile after registration.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   A multi-step form (3 steps).
        *   Progress bar indicating current step.
        *   Step 1: Personal Information (Full Name, Email, Date of Birth).
        *   Step 2: Medical Information (Blood Type).
        *   Step 3: Emergency Contact (Name, Phone, Relationship).
    *   **User Actions:**
        *   Fill in the information for each step.
        *   Navigate to the next/previous step.
        *   Submit the form upon completion of all steps.
    *   **Interactions:**
        *   Uses `react-hook-form` and `zod` for form validation per step.
        *   Uses `AuthContext.updateUser` to save the collected information to the user's profile.
        *   Navigates to `/onboarding/complete` upon successful submission.
        *   Manages current step and completed steps locally.
    *   **UI Elements:**
        *   Header with back button (navigates to previous step or `/welcome`), title, and step indicator.
        *   Progress bar.
        *   Card containing the form for the current step.
        *   Input fields, select dropdowns.
        *   Navigation buttons ("Next", "Complete Setup").

### 12. Onboarding Complete Page (`src/pages/OnboardingCompletePage.tsx`)

*   **Feature Name:** Onboarding Complete Page
*   **Purpose:** To confirm successful profile setup and suggest next steps for the user.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   Success message ("Welcome to Medimo!").
        *   Recommended next steps (e.g., Add Appointment, Upload Documents, Generate QR Code).
    *   **User Actions:**
        *   Navigate to the main dashboard.
        *   Navigate to suggested next step sections (Timeline, Vault, Profile).
    *   **Interactions:**
        *   Calls `MockAuthService.updateUserOnboardingStatus` to mark onboarding as complete for the user.
        *   Navigates to various parts of the application based on user clicks.
    *   **UI Elements:**
        *   Large success icon (CheckCircle).
        *   Cards for recommended next steps with icons.
        *   Button to go to the Dashboard.

## Feature Components

### 1. Digital Health Key (`src/components/features/DigitalHealthKey.tsx`)

*   **Feature Name:** Digital Health Key
*   **Purpose:** To display a summary of the user's most critical medical information for quick access in emergencies.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   User's name, blood type, conditions, allergies.
        *   Emergency contact information (name, relationship, phone).
        *   Insurance information (provider, member ID) if available.
        *   Count of critical information items.
        *   Indication if emergency contact is set.
    *   **User Actions:**
        *   Expand/collapse to show more/less detail.
        *   "Show QR Code" button (opens `QRCodeModal`).
        *   "Quick Share" button (functionality not fully defined, likely for sharing key info).
    *   **Interactions:**
        *   Receives `user` object as a prop.
        *   Opens `QRCodeModal`.
    *   **UI Elements:**
        *   Card with prominent "EMERGENCY" badge and Shield icon.
        *   Expandable section for detailed information.
        *   Badges for conditions and allergies.
        *   Buttons for QR code and sharing.

### 2. Today's Health Dashboard (`src/components/features/TodaysHealthDashboard.tsx`)

*   **Feature Name:** Today's Health Dashboard
*   **Purpose:** To provide a summary of today's health-related tasks and information, such as pending medications and upcoming appointments.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   Priority message based on overdue items, expiring medications, or upcoming appointments.
        *   Medications expiring soon (within 7 days).
        *   Medications due today (pending).
        *   Medications already taken today.
        *   Details of the next upcoming appointment (if any).
        *   "All caught up" message if no pending tasks.
    *   **User Actions:**
        *   Mark individual medications as taken.
        *   "Mark All Taken" for pending medications.
        *   "Log Vitals" (likely navigates to a vital logging screen).
    *   **Interactions:**
        *   Receives `upcomingAppointment` and `activeMedications` as props.
        *   Uses `MedicationAdherenceContext` to check if medication is taken and to mark it as taken.
        *   Uses `toast` for notifications (e.g., medication marked as taken).
        *   Calculates days until appointment/expiry.
    *   **UI Elements:**
        *   Card with sections for expiring meds, meds due, meds taken, and appointments.
        *   Badges to indicate status (e.g., pending, expiring, days left).
        *   Buttons for actions.
        *   Icons for visual cues (Pill, Calendar, AlertTriangle, CheckCircle2).

### 3. Health Progress (`src/components/features/HealthProgress.tsx`)

*   **Feature Name:** Health Progress / Gamification
*   **Purpose:** To motivate users by providing a gamified overview of their health management efforts, including adherence, profile completeness, and check-ins.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   Overall health score (percentage).
        *   Level based on score (e.g., Excellent, Good, Needs Attention).
        *   Medication streak (current and best).
        *   Indication if today's medications are complete.
        *   Progress dots for the last 7 days of medication adherence.
        *   Breakdown of scores: Medication Adherence, Data Completeness, Check-ins.
        *   Alert if critical vital signs are detected.
    *   **User Actions:**
        *   None directly within this component; it's primarily for display.
    *   **Interactions:**
        *   Uses `MedicationAdherenceContext` for streak and adherence scores.
        *   Uses `HealthDataContext` for documents and vital signs (to calculate completeness and check-in scores, and detect critical vitals).
        *   Uses `AuthContext` for user data (to calculate completeness).
        *   `checkVitalInRange` utility to assess vital signs.
    *   **UI Elements:**
        *   Card with Trophy icon.
        *   Prominent display of the total health score with a progress bar.
        *   Section for medication streak with emoji and progress dots.
        *   Grid displaying individual metric scores (Medication, Data Complete, Check-ins).
        *   Alert message for critical vitals.

### 4. Quick Check-In (`src/components/features/QuickCheckIn.tsx`)

*   **Feature Name:** Quick Check-In
*   **Purpose:** To allow users to quickly log their mood and symptoms, and to manage safety check-ins for caregivers.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   Sliders for mood (1-5) and symptoms (1-4) with corresponding icons/labels.
        *   Option to enable/disable "Safety Check-in".
        *   Indication if safety check-in is overdue.
        *   Confirmation message if check-in is already complete for the day (and not overdue).
    *   **User Actions:**
        *   Adjust mood and symptom sliders.
        *   Submit the check-in.
        *   Enable/disable safety check-in.
    *   **Interactions:**
        *   Saves check-in status (`lastDailyCheckIn`) and safety settings (`safetyCheckInSettings`) to `localStorage`.
        *   Notifies caregiver (simulated via `toast`) if safety check-in is enabled and completed.
        *   Alerts user if safety check-in is overdue.
        *   Uses `toast` for notifications.
    *   **UI Elements:**
        *   Card that changes appearance if safety check-in is overdue (red border, different title).
        *   Sliders for mood and symptoms.
        *   Switch to toggle safety check-in.
        *   "Complete Check-in" button.
        *   Confirmation view if already checked in.

### 5. Vital Tracker (`src/components/features/VitalTracker.tsx`)

*   **Feature Name:** Vital Signs Tracker (Summary/Trend Display)
*   **Purpose:** To display trends and the latest readings of the user's vital signs.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   Latest readings for Heart Rate, Blood Pressure, Temperature, and Weight.
        *   Line charts showing trends for Blood Pressure (systolic/diastolic) and Heart Rate over time.
        *   Message if no vital signs data is available.
    *   **User Actions:**
        *   None directly; this component is for displaying data. Logging vitals would happen elsewhere.
    *   **Interactions:**
        *   Uses `HealthDataContext` to fetch `vitalSigns`.
        *   Uses `recharts` library to render line charts.
        *   Formats dates for chart display.
    *   **UI Elements:**
        *   Card with Activity icon.
        *   Summary grid of latest vitals with icons.
        *   Responsive line charts for trends.

### 6. Medication Streak (`src/components/features/MedicationStreak.tsx`)

*   **Feature Name:** Medication Streak (Standalone Component)
*   **Purpose:** To display the user's current and best medication adherence streaks, motivating them to continue taking medications as prescribed.
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   Current medication streak in days.
        *   Best medication streak achieved.
        *   An emoji representing the current streak length.
        *   Indication if today's medications are complete or pending.
        *   Progress dots for the last 7 days of adherence.
    *   **User Actions:**
        *   None; this is a display-only component.
    *   **Interactions:**
        *   Uses `MedicationAdherenceContext` to get streak data and today's adherence status.
    *   **UI Elements:**
        *   Card with Flame icon.
        *   Prominent display of current streak days and emoji.
        *   Text indicating best streak and today's completion status.
        *   Row of dots visualizing the last 7 days.

### 7. Emergency Contact Card (`src/components/features/EmergencyContactCard.tsx`)

*   **Feature Name:** Emergency Contact Card
*   **Purpose:** To provide quick actions to contact the user's designated emergency contact and to activate an "emergency mode."
*   **Key Functionalities (Expected):**
    *   **Displays:**
        *   Emergency contact's name, relationship, and phone number.
        *   Message if no emergency contact is set up.
        *   Indication if "emergency mode" is active (visual cues like pulsing dot, changed border).
    *   **User Actions:**
        *   Call the emergency contact.
        *   Send an SMS to the emergency contact (pre-filled with an emergency message).
        *   Activate "911" / "Emergency Mode" (simulated: notifies contacts, might share location in a real app).
    *   **Interactions:**
        *   Receives `user` object (containing emergency contact details) as a prop.
        *   Uses `window.open` with `tel:` and `sms:` protocols to initiate calls/SMS.
        *   Simulates emergency mode activation with a timeout to deactivate.
        *   Uses `toast` for notifications.
    *   **UI Elements:**
        *   Card that changes appearance in emergency mode.
        *   Buttons for "Call", "SMS", and "911"/Emergency.
        *   Alert message if no emergency contact is configured.
        *   Visual cues for active emergency mode.
