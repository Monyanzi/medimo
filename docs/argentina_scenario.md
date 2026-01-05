# Argentina Emergency Scenario: Solo Traveler Medical Crisis

## Scenario Overview

**Subject:** Sarah van der Berg, 32, South African citizen  
**Location:** Remote hiking trail near Bariloche, Argentina  
**Situation:** Solo hike, husband David at hotel 40km away  
**Status:** Unconscious after fall, possible head trauma  
**Complication:** Possibly pregnant (suspected, not confirmed)

---

## Sarah's Medical Profile (Test Data)

| Field | Value |
|-------|-------|
| **Name** | Sarah van der Berg |
| **DOB** | 1993-04-15 (32 years old) |
| **Blood Type** | O- (Universal donor, rare - critical for transfusion) |
| **Allergies** | Penicillin (severe), Sulfa drugs, Latex |
| **Conditions** | Asthma (mild), Hypothyroidism |
| **Current Medications** | Levothyroxine 50mcg daily, Ventolin inhaler PRN |
| **Emergency Contact** | David van der Berg (Husband) +27 82 555 1234 |
| **Important Notes** | "Possible early pregnancy (4-6 weeks, unconfirmed). Do NOT give X-ray without consent. Latex allergy - use nitrile gloves only." |
| **Organ Donor** | Yes |
| **Insurance** | Discovery Health International - Member ID: DH29481726 |

---

## The Emergency Timeline

```
14:00 - Sarah starts solo hike (David knows her route)
15:30 - Fall on rocky section, hits head, loses consciousness
16:45 - Another hiker finds Sarah, calls emergency services
17:00 - Mountain rescue arrives (basic first aid only)
17:30 - Arrives at rural clinic in San Martín de los Andes
18:00 - Spanish-speaking doctor needs to make treatment decisions
18:30 - Hospital in Bariloche contacted for possible transfer
19:00 - David contacted and en route
```

---

## Verification Checklist: How Medimo Saves Sarah's Life

### Phase 1: First Responder Discovery (Mountain Rescue)
> *Sarah is unconscious. Rescuers find her phone and a wallet card.*

| Check | Action | Medimo Feature | Pass? |
|-------|--------|----------------|-------|
| 1.1 | Find wallet card in Sarah's belongings | **Wallet Card PDF** | ☐ |
| 1.2 | See allergies banner immediately | Red "⚠ ALLERGIES" at top | ☐ |
| 1.3 | Read "Penicillin, Sulfa, Latex" clearly | Wallet card front | ☐ |
| 1.4 | Find emergency contact phone number | David +27 82 555 1234 | ☐ |
| 1.5 | Call David (international call works) | Phone number on card | ☐ |

---

### Phase 2: Rural Clinic (Low-Tech Environment)
> *Doctor speaks Spanish, clinic has no internet, just basic equipment.*

| Check | Action | Medimo Feature | Pass? |
|-------|--------|----------------|-------|
| 2.1 | Doctor reads physical wallet card | **Printed card works offline** | ☐ |
| 2.2 | Understands blood type is O- | Blood type on card | ☐ |
| 2.3 | Knows NOT to use latex gloves | Important Notes shows "Latex allergy" | ☐ |
| 2.4 | Avoids antibiotics in Penicillin family | Allergy banner | ☐ |
| 2.5 | Sees "possible pregnancy" warning | Important Notes section | ☐ |
| 2.6 | Delays X-ray decision per notes | Important Notes: "Do NOT give X-ray without consent" | ☐ |
| 2.7 | Sees current medications | Back of wallet card | ☐ |
| 2.8 | Knows she has asthma (prepare bronchodilator) | Conditions list | ☐ |

---

### Phase 3: QR Code Scan (With Internet)
> *Ambulance transfer to Bariloche hospital. Paramedic has smartphone.*

| Check | Action | Medimo Feature | Pass? |
|-------|--------|----------------|-------|
| 3.1 | Scan QR code on wallet card | **QR Code** links to profile | ☐ |
| 3.2 | Full medical profile loads | QR contains encrypted health data | ☐ |
| 3.3 | Timeline shows recent vitals | **Timeline View** | ☐ |
| 3.4 | Can see last recorded blood pressure | Vitals in timeline | ☐ |
| 3.5 | Appointment history visible | Past doctor visits | ☐ |

---

### Phase 4: Hospital Specialist Questions
> *Neurologist at Bariloche hospital needs detailed history. Sarah regains consciousness but is confused.*

| Check | Action | Medimo Feature | Pass? |
|-------|--------|----------------|-------|
| 4.1 | "Any previous head injuries?" | **Timeline View** - filter by category | ☐ |
| 4.2 | "Previous surgeries?" | Timeline search | ☐ |
| 4.3 | "Last MRI or CT scan?" | **Vault: Imaging** category | ☐ |
| 4.4 | Doctor views actual CT scan from 2024 | Vault document viewer | ☐ |
| 4.5 | "History of blood clots?" | Conditions or timeline | ☐ |
| 4.6 | Review last 6 months medication changes | Timeline filtered by Medication | ☐ |

---

### Phase 5: Blood Transfusion Decision
> *Sarah needs emergency surgery. Blood type is critical.*

| Check | Action | Medimo Feature | Pass? |
|-------|--------|----------------|-------|
| 5.1 | Confirm blood type O- | Card, QR, and PDF all show O- | ☐ |
| 5.2 | Hospital blood bank confirms compatible | Blood type correct | ☐ |
| 5.3 | Husband David confirms blood type verbally | Emergency contact reached | ☐ |
| 5.4 | Surgery proceeds with correct blood type | Life saved | ☐ |

---

### Phase 6: Family Notification & Follow-up
> *David arrives at hospital, needs to understand what happened.*

| Check | Action | Medimo Feature | Pass? |
|-------|--------|----------------|-------|
| 6.1 | David accesses Sarah's profile (with her permission) | Future: Share Link feature | ☐ |
| 6.2 | Reviews timeline of what was logged | Timeline view | ☐ |
| 6.3 | Uploads hospital discharge documents | **Vault: Medical Records** | ☐ |
| 6.4 | Adds "Head trauma - Dec 2024" to conditions | Profile update | ☐ |
| 6.5 | Exports full medical PDF for insurance claim | **PDF Export** | ☐ |

---

## Critical Data Points That MUST Be Immediately Visible

### On Wallet Card (Offline Readable)
1. ⚠️ **ALLERGIES** - Red banner, first thing seen
2. Blood Type - O- (rare, critical for transfusion)
3. Emergency Contact - David's phone with country code
4. Current Medications - Levothyroxine, Ventolin
5. Important Notes - Pregnancy warning, latex note, X-ray caution

### On QR Scan / App
1. Full allergy list with severity
2. Complete medication list with dosages
3. Medical timeline (last 12 months)
4. Document vault with imaging

---

## Test Execution Steps

### Setup Test User
```
1. Create new user: sarah.vanderberg@test.com
2. Complete profile with ALL data above
3. Add 3-4 timeline events (doctor visits, medication changes)
4. Upload 2 test documents to Vault (fake lab result, fake CT scan placeholder)
5. Generate QR code
6. Export wallet card PDF
7. Print wallet card (or save PDF)
```

### Execute Scenario
```
1. Open wallet card PDF - verify allergies visible
2. Scan QR code with phone - verify profile loads
3. Navigate to Timeline - filter by Medication, by Vitals
4. Open Vault - find Imaging category
5. Export full PDF - verify allergies at top
6. Verify Important Notes appears in all exports
```

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Time to see allergies (wallet card) | < 3 seconds |
| Time to see emergency contact | < 10 seconds |
| QR code scan to profile load | < 5 seconds |
| Important notes visible in all exports | 100% |
| All critical fields complete indicator | Show on profile |

---

## What This Scenario Tests

- ✅ **P0 Features:** PDF export, wallet card, QR code, allergies-first
- ✅ **Data Completeness:** Emergency readiness indicator in Profile
- ✅ **Timeline:** Filtering, searching medical history
- ✅ **Vault:** Document storage, Imaging category
- ✅ **Offline Access:** Printed wallet card works without internet
- ✅ **International Emergency:** Contact number with country code
- ✅ **Pregnancy Edge Case:** Important Notes handling sensitive info

---

## Notes for Future Enhancements

1. **Multi-language support** - Spanish translation of wallet card
2. **Share Link** - Allow David to access profile remotely
3. **Emergency Mode** - One-tap hospital view with critical data only
4. **Caregiver Access** - Pre-authorized view for family members
