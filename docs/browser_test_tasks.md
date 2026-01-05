# Browser Test Task Lists: Multi-Perspective Simulation

## ⚠️ SCENARIO CONTEXT (READ THIS FIRST)

**Setting:** Hot summer afternoon in Bariloche, Argentina. It's 38°C (100°F). The rural hospital is overwhelmed—a bus accident earlier filled the ER. Staff are exhausted, frustrated, and rushing between patients.

**Patient:** Sarah van der Berg, 32, South African tourist. Found unconscious on a hiking trail. Possible head trauma. **Possibly pregnant** (unconfirmed 4-6 weeks). The doctor speaks only basic English. Sarah's husband David is 40km away, panicking.

**THE APP MUST:** Make critical info visible IMMEDIATELY. No hunting. No guessing. **Lives depend on this.**

---

## Perspective 1: Emergency Responder (Mountain Rescue)

**Context:** Found unconscious foreigner on remote trail. Phone is locked. Hot, dehydrated rescue team needs info NOW. No cell signal for 20 minutes.

### CRITICAL: What can they access without login?
```
1. Open app at /login page
2. DO NOT log in (locked phone)
3. URGENT CHECK: Is "Emergency Access" button visible and obvious?
4. Click Emergency Access - does modal open?
5. Does modal explain how to get critical info (QR scan, physical card)?
6. Is there a clear "Call 911" button?
7. Return: Can an exhausted, panicking rescuer find help in < 10 seconds?
```

### Expected: Emergency modal accessible, clear guidance to use wallet card

---

## Perspective 2: Doctor (Overwhelmed ER, Needs Info NOW)

**Context:** 12-hour shift, 4th trauma patient today. Just got Sarah in. Phone unlocked via Face ID. Has maybe 30 seconds to scan vital info before the next patient crashes.

### Pre-requisites
- Login: sarah.vanderberg@test.com / Test123!

### CRITICAL INFO DISCOVERY (Must complete in < 30 seconds)
```
1. Login and note which screen appears
2. TIMER START: Can you see ALLERGIES within 3 seconds? (Penicillin could kill her)
3. Can you see BLOOD TYPE within 5 seconds? (O- needed for transfusion)
4. Can you see EMERGENCY CONTACT within 10 seconds? (Must call husband David)
5. Navigate to Profile - is the allergies banner RED and impossible to miss?
6. Find "Important Notes" - does "POSSIBLY PREGNANT" jump out?
7. Does it warn NOT to X-ray without consent?
8. Return: Rate urgency-friendly design (1-5). Can a panicked doctor find life-saving info?
```

### MEDICATION HISTORY (Surgeon needs this)
```
9. Navigate to Timeline
10. Filter by Medication - can you see current meds? (Levothyroxine - affects anesthesia!)
11. Are medication CHANGES clearly dated?
12. Can you quickly see when she last took medication?
13. Return: How many clicks to find current meds?
```

### IMAGING FOR TRAUMA ASSESSMENT
```
14. Navigate to Vault
15. Filter by Imaging - are X-rays/MRIs here?
16. Can you open/view a document quickly?
17. Return: Was imaging findable in < 20 seconds?
```

---

## Perspective 3: Nurse (First Contact, Prepping for Doctor)

**Context:** Overworked nurse, 3 patients queued. Needs to get Sarah's info logged before the doctor arrives in 2 minutes. App is unfamiliar.

### Pre-requisites
- Login: sarah.vanderberg@test.com / Test123!

### QUICK ORIENTATION (No time to learn the app)
```
1. Login - can you figure out where things are in < 15 seconds?
2. Is navigation labeled clearly (not just icons)?
3. Navigate to Profile - is EmergencyReadinessCard visible?
4. Does it CLEARLY show what info is complete vs missing?
5. Return: Could a tired nurse orient in under 1 minute?
```

### VITAL SIGNS ENTRY (Needs to log readings FAST)
```
6. Find "Log Vitals" button - is it OBVIOUS on Home?
7. Open vitals modal
8. Enter: BP 90/60, HR 110, SpO2 94%, Temp 38.2°C
9. Submit - is there CLEAR confirmation it saved?
10. Navigate to Timeline - does "Vitals Recorded" appear immediately?
11. Return: Can vitals be logged in < 60 seconds?
```

### DOCUMENT UPLOAD (Hospital results)
```
12. Navigate to Vault
13. Find Upload button
14. Check: Is "Imaging" category available?
15. Check: Is category selection CLEAR and not confusing?
16. Return: Could you upload a CT scan result quickly?
```

---

## Perspective 4: Sarah (Young - Setting Up Before Trip)

**Context:** Day before departure. Setting up emergency info. Normal user, tech-comfortable.

### PROFILE COMPLETION
```
1. Navigate to Profile
2. Find EmergencyReadinessCard - shows completion %?
3. Navigate to Personal & Medical Info
4. Add allergy "Penicillin" - is the flow clear?
5. Add emergency contact David - does it save?
6. Set blood type O- - is there confirmation?
7. Return to Profile - did completion % increase?
8. Return: Is profile setup intuitive?
```

### EMERGENCY EXPORTS (For wallet card)
```
9. Find QR Code button - click it
10. Is QR code displayed large and clearly?
11. Click Download - does it work?
12. Find wallet card / Digital Key option
13. Generate PDF - check: are ALLERGIES in red banner at top?
14. Check: does "Important Notes" (pregnancy warning) appear on the card?
15. Return: Will this card save her life in Argentina?
```

---

## Perspective 5: Elderly Sarah (65 years old, Mild Dementia)

**⚠️ CRITICAL TEST: The "Grandma Test"**

**Context:** Sarah is now 65. She has mild dementia—forgets things easily, gets confused by complex UIs, has shaky hands and poor vision. She CANNOT afford to get lost in the app. Every extra tap is a failed test.

### VISUAL ACCESSIBILITY (Can she see anything?)
```
1. Load login page
2. Is the "Sign In" button LARGE (at least 44px tall)?
3. Is ALL text at least 14px minimum?
4. Is contrast high enough to read without squinting?
5. Are there any pale gray texts that disappear?
6. Login - can she tap the fields without missing?
7. Return: List EVERY element too small or low contrast
```

### NAVIGATION (Can she find her way?)
```
8. Look at bottom nav bar
9. Are icons LABELED with words (not just icons)?
10. Tap Profile - was the tap target big enough?
11. Navigate: Home → Timeline → Vault → Profile
12. At each screen - is it OBVIOUS which tab she's on?
13. Is there ANY confusion about where she is?
14. Return: Rate navigation for dementia patient (1-5)
```

### CRUD TEST: VITAL SIGNS (Can she log her blood pressure?)
```
15. Find "Log Vitals" on Home - is it obvious or hidden?
16. Open Log Vitals modal
17. Enter BP 130/85, HR 75
18. Is the number input EASY or confusing?
19. Submit - is there CLEAR "Saved!" confirmation?
20. Can she FIND the vitals she just logged? (Timeline)
21. Can she EDIT them if she made a mistake?
22. Can she DELETE a wrong entry without confusion?
23. Return: Rate vital sign CRUD for dementia user (1-5)
```

### CRUD TEST: IMPORTANT NOTES
```
24. Navigate to Profile
25. Find "Important Notes" section - is it visible?
26. Type: "Takes blood thinner daily"
27. Click away - does "Saved!" indicator appear?
28. Is there confirmation notes will appear on wallet card?
29. Navigate away and come back - is text still there?
30. Edit the text - does it save again?
31. Return: Could she manage Important Notes without help?
```

### ERROR RECOVERY (What if she makes a mistake?)
```
32. Try to submit form with missing data
33. Is error message LARGE, RED, and CLEAR?
34. Does it point to EXACTLY what's wrong?
35. Can she fix it without getting lost?
36. Return: Would error confuse or help her?
```

---

## Perspective 6: Design Consistency (Premium Feel Check)

**Context:** Ensuring the app looks polished and professional across all pages.

### LOGIN PAGE
```
1. Navigate to /login
2. Logo has gradient (teal → emerald)?
3. Sign In button has gradient + shadow?
4. Inputs are tall (h-12) and rounded?
5. Emergency Access button is visible?
6. Modal has premium styling?
7. Return: Rate login design (1-5)
```

### HEADER + NAV CONSISTENCY
```
8. Login, check Home header
9. Navigate Timeline, Vault, Profile
10. Is header IDENTICAL on all pages?
11. Is bottom nav styled consistently?
12. Return: Any inconsistencies found?
```

### PROFILE PAGE COMPONENTS
```
13. Check EmergencyReadinessCard styling
14. Check Important Notes has save indicators
15. Check QR modal has premium design
16. Check all buttons have consistent styling
17. Return: Rate overall polish (1-5)
```

---

## Success Metrics

| Perspective | Key Metric | Pass Condition |
|-------------|------------|----------------|
| Emergency | Emergency access | Modal opens in < 3 taps |
| Doctor | Critical info time | All in < 30 seconds |
| Nurse | Vitals logging | Complete in < 60 seconds |
| Young Sarah | Profile setup | Intuitive, < 5 minutes |
| Elderly Sarah | CRUD + Navigation | No confusion, all tasks work |
| Design | Consistency | 4+/5 on all checks |

---

## Test User
```
Email: sarah.vanderberg@test.com
Password: Test123!
Complete profile per Argentina scenario data
```
