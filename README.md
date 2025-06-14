
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6cf26425-1c91-47c9-8967-4adc6c9c2efd

This application is a personal health management tool designed to help users track their medical information, appointments, medications, and overall well-being.

## Key Features

**1. Dashboard & Home Screen:**
    *   **Personalized Greeting:** Welcomes the user.
    *   **Digital Health Key:** Displays critical emergency medical information including conditions, allergies, blood type, emergency contact, and insurance details. Includes a QR code for quick access.
    *   **Today's Health Dashboard:** Provides an overview of daily health tasks:
        *   Upcoming appointments.
        *   Active medication reminders (pending and taken).
        *   Ability to mark medications as taken.
        *   Quick access to log vitals.
    *   **Health Score:** Calculates and displays an overall health score based on medication adherence, profile data completeness, and regular check-ins.
    *   **Medication Streak:** Tracks and displays the number of consecutive days medications have been taken correctly.
    *   **Quick Check-In:** (Functionality for quick health status updates).

**2. Medical Timeline:**
    *   Chronological view of all medical events (medications, appointments, documents, vitals, tests, other).
    *   **Event Management:** Add, delete, and edit timeline events.
        *   Editing for 'Medication' and 'Appointment' categories opens a detailed modal matching the add-event interface.
        *   Other categories allow for inline editing of title and details.
    *   **Filtering & Sorting:** Filter events by search term, category, date range, and sort by date.
    *   **PDF Export:** Generate and download a PDF summary of the filtered timeline.

**3. Medication Management:**
    *   Track active medications, including dosage and frequency.
    *   Contextual medication adherence tracking.
    *   Reminders and ability to mark medications as taken.

**4. Appointment Tracking:**
    *   Manage upcoming and past appointments.
    *   View appointment details (type, doctor, date/time, location).

**5. Document Vault (Implied):**
    *   A section for storing and managing health-related documents.

**6. Vitals Logging (Implied):**
    *   Functionality to log and track vital signs.

**7. Profile Management (Implied):**
    *   Users can manage their personal and medical information.

**8. Notifications (Implied):**
    *   System for health-related notifications and reminders.

**9. User Authentication:**
    *   Secure access to personal health data.

**10. Quick Actions:**
    *   Floating Action Button (FAB) for quickly adding new health data (e.g., medications, appointments, documents, vitals).

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6cf26425-1c91-47c9-8967-4adc6c9c2efd) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6cf26425-1c91-47c9-8967-4adc6c9c2efd) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

