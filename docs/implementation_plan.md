# Medimo Complete Implementation Plan

A comprehensive 5-phase plan to complete the Medimo health app according to your vision document, fixing data flow issues and adding missing features.

---

## User Review Required

> [!IMPORTANT]
> **Database Decision: Neon PostgreSQL** ✅
> 
> **Scaling Path for 6-Month Growth:**
> | Users | Monthly Cost | Plan | Notes |
> |-------|-------------|------|-------|
> | 0-100 | **$0** | Free | 100 CU-hours, 0.5GB storage, scale-to-zero |
> | 100-1K | **~$19-40** | Launch | Pay per usage, up to 16 CU |
> | 1K-10K | **~$69-150** | Scale | 30-day history, up to 56 CU |
> | 10K+ | Custom | Business | Dedicated support, SLA |
>
> **Why Neon works for your timeline:**
> - Free tier lasts 6+ months for development + early users
> - Auto-scales to zero when idle (no waste)
> - PostgreSQL = easy migration to any host later
> - Serverless = no DevOps overhead

> [!NOTE]
> **Backend Stack: Hono + Drizzle ORM** ✅
> - **Hono**: Fastest Node.js framework, edge-ready, minimal overhead
> - **Drizzle**: Type-safe ORM, compile-time data isolation checks
> - **Neon + Hono**: Both edge-optimized for lowest latency
>
> **Healthcare Security Layer:**
> - Row-Level Security (RLS) in PostgreSQL - user A can never query user B's data
> - JWT authentication with `userId` binding
> - Field-level encryption for sensitive data (allergies, conditions, medications)
> - Audit logging for compliance awareness
>
> **OCR: Tesseract.js** - Offline document scanning, no API costs

> [!WARNING]
> **Timeline Edit Bug Identified**: Events without `relatedId` fall back to unstructured inline editing (free text). This happens for system-generated events and orphaned records.

---

## Phase 1: Data Architecture & Timeline Fix

### Root Cause Analysis

The timeline becomes "free text" when editing because of this logic in [TimelineEventCard.tsx](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/components/timeline/TimelineEventCard.tsx#L77-L89):

```typescript
const handleEditClick = () => {
  if (event.category === 'Medication' && event.relatedId) {
    setIsEditMedicationModalOpen(true);
  } else if (event.category === 'Appointment' && event.relatedId) {
    setIsEditAppointmentModalOpen(true);
  } else if (event.category === 'Vitals' && event.relatedId) {
    setIsEditVitalsModalOpen(true);
  } else {
    // ⚠️ FALLBACK: opens inline free-text editing
    setIsEditingInline(true);
  }
};
```

**Problem**: System events (threshold alerts, summaries), manually added events, and orphaned events have no `relatedId`, causing them to fall into free-text mode.

---

### Proposed Changes

#### [MODIFY] [TimelineEventCard.tsx](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/components/timeline/TimelineEventCard.tsx)
- Add structured edit modal for generic timeline events
- Make system events (`isSystem: true`) read-only or show info modal
- Always show structured fields (title, details, category, date)

#### [NEW] [EditGenericTimelineModal.tsx](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/components/modals/EditGenericTimelineModal.tsx)
- New modal with structured form (Title, Details, Category dropdown, Date picker)
- Handles Document and Other categories properly
- Validates required fields

#### [MODIFY] [HealthDataContext.tsx](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/contexts/HealthDataContext.tsx)
- Add `validateTimelineEvent()` helper
- Add data migration for orphaned events
- Add debug logging for data flow issues

---

## Phase 2: P0 Emergency Ready Features

### Proposed Changes

#### [MODIFY] [pdfExportService.ts](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/services/pdfExportService.ts)
- **Page 1**: Emergency Summary (allergies FIRST in red, conditions, blood type, emergency contact)
- **Page 2+**: Medications, vitals, timeline history
- Add "Important Notes" section prominently

#### [MODIFY] [qrCodeService.ts](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/services/qrCodeService.ts)
- Already includes allergies, conditions, medications, emergency contact ✅
- Verify `importantNotes` is included in all code paths

#### [MODIFY] [walletCardService.ts](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/services/walletCardService.ts)
- Already has allergy banner ✅
- Add `importantNotes` to back of card if space permits

---

## Phase 3: P1 Tab Harmony

### Proposed Changes

#### [MODIFY] [types/index.ts](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/types/index.ts)
- Expand Document category union:
```diff
- category: 'Medical Records' | 'Lab Results' | 'Prescriptions' | 'Insurance' | 'Images' | 'Other'
+ category: 'Medical Records' | 'Lab Results' | 'Prescriptions' | 'Insurance' | 'Imaging' | 'Images' | 'Other'
```

#### [MODIFY] [VaultScreen.tsx](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/pages/VaultScreen.tsx)
- Add "Imaging" filter option (X-rays, MRIs, CT scans)
- Optionally deprecate generic "Images" or rename to "Photos"

#### [MODIFY] [UploadDocumentModal.tsx](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/components/modals/UploadDocumentModal.tsx)
- Add "Imaging" category option

---

## Phase 4: P2 Integration Features

### Proposed Changes

#### [NEW] [shareLinkService.ts](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/services/shareLinkService.ts)
- Generate encrypted share links with expiry
- Options: full-access, emergency-only, medication-only
- Store share tokens in localStorage (later: backend required)

#### [NEW] [ShareProfileModal.tsx](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/components/modals/ShareProfileModal.tsx)
- UI for generating and managing share links
- Copy link, set expiry, revoke access

#### [MODIFY] [SmartScanModal.tsx](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/components/modals/SmartScanModal.tsx)
- Replace simulated OCR with Tesseract.js integration
- Extract text from lab results, prescriptions

~~ShowDoctorView.tsx~~ - **Deprioritized** (focus on core doctor needs first)

---

## Phase 5: Testing Setup

### Proposed Changes

#### [NEW] [vitest.config.ts](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/vitest.config.ts)
- Set up Vitest for unit testing

#### [NEW] [src/services/qrCodeService.test.ts](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/services/qrCodeService.test.ts)
- Test QR data includes all required fields

#### [NEW] [src/services/pdfExportService.test.ts](file:///c:/Users/Monya/Documents/05%20RESOURCES/CODE%20AND%20APPS/Medimo/src/services/pdfExportService.test.ts)
- Test allergies appear in first section

---

## Verification Plan

### Automated Tests

1. **Unit Tests** (to be created):
   ```bash
   npm run test
   ```
   - QR Code generation includes all required fields
   - PDF export has allergies in first section
   - Timeline event validation

### Manual Verification

> [!NOTE]
> Since there are no existing tests, manual browser testing is required.

**Test 1: Timeline Edit Flow**
1. Run `npm run dev`
2. Navigate to Timeline tab
3. Click Edit on any event
4. Verify structured modal opens (not free-text input)
5. Try saving changes, verify they persist after refresh

**Test 2: Emergency Export Flow (Argentina Scenario)**
1. Go to Profile → QR Code → Scan with phone
2. Verify data includes: Name, Blood Type, Allergies, Medications, Emergency Contact
3. Generate PDF export → Check allergies are on page 1
4. Generate Wallet Card → Check it includes critical info

**Test 3: Vault Categories**
1. Upload a document as "Imaging" category
2. Verify it appears in Imaging filter
3. Search/filter works correctly

---

## Priority Order

| Phase | Priority | Effort | Risk |
|-------|----------|--------|------|
| **1** | 🔴 Critical | Medium | High - Data integrity |
| **2** | 🔴 Critical | Low | Low - Mostly ordering |
| **3** | 🟡 Medium | Low | Low - UI only |
| **4** | 🟢 Later | High | Medium - New features |
| **5** | 🟡 Medium | Medium | Low - Infrastructure |

**Recommended execution order**: Phase 1 → Phase 2 → Phase 5 → Phase 3 → Phase 4

---

## Decisions Made ✅

| Decision | Choice |
|----------|--------|
| **Database** | Neon PostgreSQL (serverless) |
| **Backend** | Hono + Drizzle ORM |
| **OCR** | Tesseract.js (offline) |
| **Show Doctor Mode** | Deprioritized - focus on core experience |
