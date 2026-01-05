
# MediMove - Personal Health Management

A comprehensive health management application for tracking medical information, appointments, medications, and vital signs with a focus on user experience and data security.

## Application Tabs & Features

### 🏠 Home Tab
#### Digital Health Key Card
- Displays emergency medical information with quick access
- Shows blood type, allergies, and medical conditions
- Emergency contacts with direct call functionality
- QR code access to critical health information
- Organ donor status indicator

#### Medication Reminders
- Real-time medication schedule tracking
- Visual indicators for overdue and pending medications
- Dosage and timing information
- Quick access to medication details
- Notification system for missed doses

#### Today's Health Dashboard
- Daily medication schedule overview
- Upcoming appointment notifications
- Health task completion tracking
- Quick access to common actions
  - Log vitals
  - Record symptoms
  - Add new medications

#### Vital Signs Tracker
- Blood pressure monitoring with visual trends
- Blood glucose level tracking
- Weight and BMI progress
- Customizable measurement frequency
- Exportable reports for healthcare providers

#### Health Progress
- Visual health score calculation
- Medication adherence tracking
- Appointment attendance history
- Goal setting and achievement tracking
- Weekly/Monthly progress reports

### 📅 Timeline Tab
#### Event Overview
- Chronological display of all health events
  - Medical appointments
  - Medication changes
  - Vital sign measurements
  - Document uploads
- Color-coded event categories
- Expandable event details

#### Advanced Filtering
- Search by keyword across all event fields
- Filter by event type (medication, appointment, vitals, documents)
- Date range selection (today, 7 days, 30 days, custom)
- Category-specific filters
- Sort by date (newest/oldest first)

#### Event Management
- Add new health events with rich details
- Edit existing events with change history
- Delete or archive past events
- Bulk export to PDF
- Share individual events with providers

### 📂 Vault Tab
#### Document Management
- Secure storage for medical documents
- Support for multiple file types (PDF, JPG, PNG, DOCX)
- Automatic document categorization
- File preview functionality
- Bulk upload/download options

#### Advanced Search & Filter
- Full-text search across document contents
- Filter by document type (reports, prescriptions, scans)
- Category-based organization
- Date-based filtering
- Tagging system for quick retrieval

#### Document Security
- Role-based access control
- Audit trail for document access
- Automatic backup and sync
- Encryption at rest and in transit
- Version history for documents

### 👤 Profile Tab
#### Personal Information
- Contact details management
- Emergency contacts configuration
- Insurance information storage
- Healthcare provider directory
- Personal health records access

#### Account Settings
- Notification preferences
- Privacy and security settings
- Data export options
- Account recovery settings
- Two-factor authentication

#### Digital Health Key
- Emergency medical information
- QR code generation
- Access permissions management
- Information sharing controls
- Activity log

## Core Features

### 🔐 Security & Privacy
- End-to-end encryption for all health data
- Biometric authentication
- Automatic session timeout
- Activity logging
- Compliance with healthcare regulations (HIPAA, GDPR)

### 🔄 Data Management
- Automatic cloud backup
- Cross-device synchronization
- Data export in multiple formats
- Bulk operations
- Data retention policies

### 🔔 Notifications
- Customizable alerts for medications
- Appointment reminders
- Health check-in prompts
- System notifications
- Email/SMS integration

### 📊 Reporting
- Health trend analysis
- Medication adherence reports
- Appointment history
- Vitals tracking
- Custom report generation

### 🏠 Dashboard
- **Personalized Health Overview**
  - Dynamic greeting with user's name
  - Health score visualization
  - Medication adherence streak counter
  - Upcoming appointments summary
  - Health trends and insights

- **Digital Health Key**
  - Emergency medical information access
  - QR code for quick access to critical data
  - Blood type, allergies, and conditions display
  - Emergency contacts with direct call functionality

- **Health Progress**
  - Visual tracking of health metrics over time
  - Goal setting and achievement tracking
  - Customizable health indicators

### 📅 Medical Timeline
- **Comprehensive Event Tracking**
  - Chronological display of all health-related events
  - Color-coded event categories (medications, appointments, vitals)
  - Detailed event cards with relevant information

- **Advanced Filtering**
  - Filter by event type (medication, appointment, vitals)
  - Date range selection
  - Search functionality across all events
  - Custom tag support for categorization

- **Event Management**
  - Add new health events with rich details
  - Edit existing events with version history
  - Delete or archive events
  - Export timeline as PDF for sharing with healthcare providers

### 💊 Health Tracking
- **Medication Management**
  - Medication inventory with dosage tracking
  - Customizable medication schedules
  - Refill reminders and tracking
  - Adherence monitoring and reports
  - Medication interaction warnings

- **Appointment Tracking**
  - Calendar view of all healthcare appointments
  - Appointment reminders and notifications
  - Healthcare provider directory
  - Visit notes and follow-up tracking

- **Vital Signs**
  - Log and track vital measurements (BP, glucose, weight, etc.)
  - Visual trend analysis
  - Customizable vital thresholds
  - Exportable reports for healthcare providers

- **Document Vault**
  - Secure storage for medical documents
  - PDF, image, and document support
  - Organization with folders and tags
  - Quick access to important documents

### 👤 User Profile
- **Personal Information**
  - Contact details
  - Emergency contacts
  - Insurance information
  - Preferred healthcare providers

- **Medical Profile**
  - Current medications
  - Known allergies and reactions
  - Medical conditions
  - Surgical history
  - Family medical history

- **Account Settings**
  - Notification preferences
  - Privacy controls
  - Data backup and sync options
  - Two-factor authentication

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Technologies Used
- React with TypeScript
- Tailwind CSS for styling
- React Query for data management
- Date-fns for date handling
- React Router for navigation

## License
MIT

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

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

