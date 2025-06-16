# Fix Plan

This document outlines the plan for addressing issues identified in `TESTING_RESULTS.md`, prioritized by severity.

## Critical Issues

*(No critical issues were identified in `TESTING_RESULTS.md`)*

## Major Issues

### Issue: Settings not persisted (SettingsNotificationsPage.tsx)
- **File(s):** `src/pages/SettingsNotificationsPage.tsx`, potentially a new context `src/contexts/AppSettingsContext.tsx` or modifications to `src/contexts/NotificationContext.tsx` (though less ideal for non-notification settings).
- **Severity:** Major
- **Problem:** Notification preferences, language, and region settings selected in `SettingsNotificationsPage.tsx` are managed with local component state (`useState`) and are not persisted across user sessions. The `handleSave` function currently only logs to the console.
- **Proposed Fix:**
    1.  **Create `AppSettingsContext.tsx`:**
        *   Define a context to manage notification settings (medicationReminders, appointmentReminders, vitalSignsReminders, caregiverAlerts, pushNotifications, emailNotifications), language, region, timeFormat, and dateFormat.
        *   Include functions in the context to update these settings.
        *   Implement `localStorage` persistence within these update functions (e.g., `localStorage.setItem('appSettings', JSON.stringify(newSettings))`).
        *   Initialize the context state from `localStorage` on application load (e.g., in the provider's `useEffect`). Provide sensible defaults if no settings are found in `localStorage`.
    2.  **Integrate `AppSettingsContext` in `SettingsNotificationsPage.tsx`:**
        *   Replace local `useState` hooks for settings with values from `AppSettingsContext`.
        *   Call the context's update functions in the `onCheckedChange` (for Switches) and `onValueChange` (for Selects) handlers, or within the `handleSave` function.
        *   The `handleSave` function should call the context's update functions to persist all settings at once if preferred, and then can provide a `toast.success('Settings saved!')`.
    3.  **Update `NotificationContext.tsx` (Optional but Recommended):**
        *   If notification *preferences* (e.g., whether to receive medication reminders at all) are moved to `AppSettingsContext`, then `NotificationContext` would focus solely on managing the *list* of currently active/generated notifications. The generation logic within `NotificationContext` (or services it uses) might then consult `AppSettingsContext` to decide if a notification should be generated/displayed.

### Issue: Data Persistence for Profile & Settings - General
- **File(s):** `src/pages/SettingsNotificationsPage.tsx` (as above), potentially other areas if new settings are introduced.
- **Severity:** Major
- **Problem:** Notification, Language, and Region settings are not persisted across user sessions. This is a specific instance of a broader potential for settings not being saved.
- **Proposed Fix:**
    *   This issue is largely covered by the fix for "Settings not persisted (SettingsNotificationsPage.tsx)". The core idea is to establish a pattern for settings persistence, likely using a dedicated context (`AppSettingsContext`) and `localStorage` for the mock environment.
    *   For any future settings, ensure they are integrated into a context that handles persistence, rather than relying on local component state if they need to survive sessions.

## Minor Issues

*(Fix plans are optional for minor issues at this stage, but some simple ones are included.)*

-   **Issue:** `AuthGuard.tsx` redirects to `/welcome` instead of `/login` for unauthenticated users.
    -   **File(s):** `src/components/auth/AuthGuard.tsx` (Line: `redirectTo = '/welcome'`)
    -   **Severity:** Minor
    -   **Suggestion:** Change the default `redirectTo` prop to `/login` for `requireAuth={true}` scenarios.

-   **Issue:** Potential unnecessary QR code generation on login in `AuthContext.tsx`.
    -   **File(s):** `src/contexts/AuthContext.tsx` (Lines: `login` function ~91, `useEffect` ~60)
    -   **Severity:** Minor
    -   **Suggestion:** Refactor logic to ensure `generateQRCodeForUser` in `login` is only called if `useEffect`'s QR loading/generation didn't already cover it, or if critical data has changed that necessitates immediate regeneration post-login.

-   **Issue:** Hardcoded `criticalFields` list for QR regeneration in `AuthContext.tsx`.
    -   **File(s):** `src/contexts/AuthContext.tsx` (Line: ~140)
    -   **Severity:** Minor
    -   **Suggestion:** Consider deriving this list dynamically or using a more robust method if user profile fields become highly dynamic. For now, ensure it's kept up-to-date with any changes to the `User` type.

-   **Issue:** `MedicationReminderCard` in `HomeScreen.tsx` "+X more medications" count logic might be confusing if overdue reminders are shown.
    -   **File(s):** `src/pages/HomeScreen.tsx` (Lines: ~77-88)
    -   **Severity:** Minor
    -   **Suggestion:** Adjust the logic for calculating and displaying the "more medications" count to be accurate regardless of whether overdue or pending reminders are prioritized for display.

-   **Issue:** "Mark All Taken" button in `TodaysHealthDashboard.tsx` is not implemented.
    -   **File(s):** `src/components/features/TodaysHealthDashboard.tsx` (Line: ~195)
    -   **Severity:** Minor
    -   **Suggestion:** Implement the `onClick` handler to iterate through `pendingMedications` and call `markMedicationTaken` for each.

-   **Issue:** `calculateCheckInScore` in `HealthProgress.tsx` uses a fixed `idealCheckIns`.
    -   **File(s):** `src/components/features/HealthProgress.tsx` (Line: ~41)
    *   **Severity:** Minor
    *   **Suggestion:** For a real app, this would need to be configurable or based on a more dynamic goal. For mock, it's acceptable.

-   **Issue:** Penalty for critical vitals in `HealthProgress.tsx` is a fixed value.
    -   **File(s):** `src/components/features/HealthProgress.tsx` (Line: ~74)
    *   **Severity:** Minor
    *   **Suggestion:** For a real app, this logic would need clinical input. For mock, it's a placeholder.

-   **Issue:** `safetyCheckInInterval` in `QuickCheckIn.tsx` is not user-configurable.
    -   **File(s):** `src/components/features/QuickCheckIn.tsx` (Line: ~15)
    *   **Severity:** Minor
    *   **Suggestion:** If this needs to be user-configurable, add UI in caregiver settings and persist via context.

-   **Issue:** "911" button in `EmergencyContactCard.tsx` triggers an in-app mode, not an actual call.
    -   **File(s):** `src/components/features/EmergencyContactCard.tsx` (Line: ~70)
    *   **Severity:** Minor
    *   **Suggestion:** Clarify button label (e.g., "Activate Emergency Mode") or, for a real app, implement `tel:911`.

-   **Issue:** `updateMedication` in `HealthDataContext.tsx` only creates timeline events for "discontinued" status.
    -   **File(s):** `src/contexts/HealthDataContext.tsx` (Line: ~153)
    *   **Severity:** Minor
    *   **Suggestion:** Expand to create timeline events for other significant changes like dosage or frequency modifications.

-   **Issue:** `updateAppointment` and `updateVitalSigns` in `HealthDataContext.tsx` do not generate timeline events for updates.
    -   **File(s):** `src/contexts/HealthDataContext.tsx` (Lines: `updateAppointment` ~215, `updateVitalSigns` ~313)
    *   **Severity:** Minor
    *   **Suggestion:** Implement timeline event generation for updates to appointments and vital signs if changes should be logged.

-   **Issue:** Free-text "Frequency" input in `AddMedicationModal.tsx` and `EditMedicationTimelineModal.tsx`.
    -   **File(s):** `src/components/modals/AddMedicationModal.tsx` (Line: ~92), `src/components/modals/EditMedicationTimelineModal.tsx` (Line: ~107)
    *   **Severity:** Minor
    *   **Suggestion:** Replace with a dropdown of common frequencies or a more structured input method to ensure consistency for the `medicationReminderService`.

-   **Issue:** `prescriptionDays` input in `AddMedicationModal.tsx` lacks positive integer validation.
    -   **File(s):** `src/components/modals/AddMedicationModal.tsx` (Line: ~101)
    *   **Severity:** Minor
    *   **Suggestion:** Add validation to ensure `prescriptionDays` is a positive integer if a value is entered.

-   **Issue:** `EditMedicationTimelineModal.tsx` changes the original timeline event's title/details upon medication update.
    -   **File(s):** `src/components/modals/EditMedicationTimelineModal.tsx` (Lines: ~84-90)
    *   **Severity:** Minor
    *   **Suggestion:** Consider creating a *new* timeline event like "Medication Details Updated" instead of overwriting the original event that linked to the medication, to preserve historical accuracy.

-   **Issue:** Simplified adherence score calculation in `MedicationAdherenceContext.tsx`.
    -   **File(s):** `src/contexts/MedicationAdherenceContext.tsx` (Lines: ~74, ~87)
    *   **Severity:** Minor
    *   **Suggestion:** For a real app, the score should be based on the actual number of prescribed doses for the day versus taken doses.

-   **Issue:** `calculateStreaks` in `MedicationAdherenceContext.tsx` depends on potentially flawed adherence score.
    -   **File(s):** `src/contexts/MedicationAdherenceContext.tsx` (Line: ~106)
    *   **Severity:** Minor
    *   **Suggestion:** Improving adherence score calculation will make streaks more accurate.

-   **Issue:** `parseFrequencyToTimes` in `medicationReminderService.ts` has fixed times and limited frequency support.
    -   **File(s):** `src/services/medicationReminderService.ts` (Line: ~53)
    *   **Severity:** Minor
    *   **Suggestion:** For a real app, allow user-customized reminder times and support more complex schedules.

-   **Issue:** Potential edge case in `medicationReminderService.ts` if medication schedule changes mid-day.
    -   **File(s):** `src/services/medicationReminderService.ts` (Line: ~38)
    *   **Severity:** Minor
    *   **Suggestion:** Review logic for `generateDailyReminders` to better handle merging or replacing reminders if a medication's schedule is altered during the day.

-   **Issue:** Use of `alert()` for PDF export errors in `TimelineScreen.tsx`.
    -   **File(s):** `src/pages/TimelineScreen.tsx` (Line: 41)
    *   **Severity:** Minor
    *   **Suggestion:** Replace `alert()` with `toast.error()` for consistency.

-   **Issue:** Use of `window.confirm()` for delete confirmation in `TimelineEventCard.tsx`.
    -   **File(s):** `src/components/timeline/TimelineEventCard.tsx` (Line: 60)
    *   **Severity:** Minor
    *   **Suggestion:** Replace `window.confirm()` with a custom `AlertDialog` for UI consistency.

-   **Issue:** Mock download path in `DocumentItem.tsx` might be inconsistent.
    -   **File(s):** `src/components/vault/DocumentItem.tsx` (Line: ~61)
    *   **Severity:** Minor
    *   **Suggestion:** Ensure mock download links are handled consistently (e.g., always `href="#"` or a placeholder if `storagePath` isn't a real URL).

-   **Issue:** Client-side file type/size validation not strictly enforced in `UploadDocumentModal.tsx`.
    -   **File(s):** `src/components/modals/UploadDocumentModal.tsx` (Line: ~90)
    *   **Severity:** Minor
    *   **Suggestion:** Implement client-side checks for file type and size if these are firm requirements, even in a mock.

-   **Issue:** Basic notification generation logic in `NotificationContext.tsx`.
    *   **File(s):** `src/contexts/NotificationContext.tsx` (Lines: 40-73)
    *   **Severity:** Minor
    *   **Suggestion:** For a real app, notification generation would be more robust and likely tied to actual reminder times or events rather than just data presence on load.

-   **Issue:** `localStorage` parsing/setting without explicit `try...catch` in some contexts.
    -   **File(s):** `MedicationAdherenceContext.tsx` (Line: ~31), `medicationReminderService.ts`
    *   **Severity:** Minor
    *   **Suggestion:** Wrap `JSON.parse()` calls from `localStorage.getItem()` in `try...catch` blocks to prevent crashes if data is corrupted.
```
