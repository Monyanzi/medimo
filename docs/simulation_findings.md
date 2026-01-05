# Simulation Findings: Argentina Scenario

## Critical Issues (P0)

### 🔴 Emergency Access Modal - Missing Critical Data
**Severity**: CRITICAL (Life Safety)
**Location**: `LoginPage.tsx` > Emergency Access Modal
**Status**: ⚠️ Verified Missing

**Description**:
The current "Emergency Access" modal is static and instructional only. It fails to display the digital life-saving information required by the scenario when the phone is unlocked but the user is logged out (or if the responder clicks "Emergency Access").

**Missing Elements**:
1.  **Digital QR Code**: The modal asks to "Scan QR code on [physical] wallet card" but does not display a backup digital QR code on screen.
2.  **Core Medical Profile**: No immediate view of:
    *   **Allergies** (Penicillin - Critical)
    *   **Blood Type** (O- - Critical)
    *   **Emergency Contact** (David - Critical)
    *   **Important Notes** (Pregnancy warning)

**Expected Behavior**:
The modal should ideally display a "Digital Emergency Card" view (possibly read from local storage if previously logged in, or explicitly allowed via a "Guest/Emergency" mode if applicable). At minimum, if the device owner previously enabled "Emergency Access", this data should be visible without full password login (similar to iOS Health ID).

---

## Tracking List

- [ ] **Fix Emergency Modal**: Implement a "Digital Emergency Card" view in `LoginPage.tsx`.
- [ ] **Data Persistence**: Ensure critical emergency data is stored in `localStorage` for offline/logged-out access (if security policy allows).
- [ ] **QR Code Generation**: Generate and display the specific Argentina Scenario QR code in the modal.

### 🟡 Visual Hierarchy - "No X-Ray" Warning
**Severity**: WARNING (Medical Safety)
**Location**: `Profile` > Important Notes
**Status**: ⚠️ Present but could be missed

**Description**:
The critical "Do NOT give X-ray without consent" (Pregnancy warning) is visible in the "Important Notes" section, but it is presented as standard text within an amber alert. In a high-stress trauma situation (Doctor Perspective), this specific contraindication needs to be visually distinct from other notes to prevent accidental radiation exposure.

**Recommendation**:
- Use a **Red** or **High-Contrast** banner specifically for contraindications (No X-Ray, No MRI).
- Add specific icons for these warnings (e.g., specific 'Pregnant' or 'No Radiation' icon).

### 🟢 Nurse Workflow - Vitals & Upload
**Severity**: INFO (Success)
**Location**: `Dashboard` > Log Vitals / `Vault`
**Status**: ✅ Verified

**Description**:
The Nurse workflow for logging critical vitals and uploading documents is efficient and intuitive. Validation for abnormal vitals (HR > 100, Temp > 38) correctly triggered "Critical" warnings, and the "Save Critical Vitals" button provided clear feedback.

### 🟠 Elderly Accessibility - Font Sizes
**Severity**: MEDIUM (Usability)
**Location**: Global (Body Text, Inputs)
**Status**: ❌ Failed Criteria

**Description**:
The current base font size is **14px** for body text and inputs, which fails the **≥ 16px** requirement for elderly users (Perspective 5). Secondary headers (H2) are **20px**, failing the **≥ 24px** target. While contrast is sufficient, the small text size poses a readability barrier for users like Elderly Sarah.

**Recommendation**:
- Increase base `html` or `body` font size to 16px.
- Scale up H2 headers to 24px and Section Headers to 18-20px.
- Ensure textarea inputs are at least 16px to prevent auto-zoom on mobile and improve readability.

---

## Tracking List
