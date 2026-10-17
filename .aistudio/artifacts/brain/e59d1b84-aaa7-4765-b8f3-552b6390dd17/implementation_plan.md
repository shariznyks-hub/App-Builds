# Mobile Responsive Layout & Text Clipping Fix (Android APK & Web/PWA)

Make the existing **MCQ Answer Pad** interface fully responsive and resilient on narrow mobile and Android smartphone screens (360px–430px) without changing the visual identity, button tap ergonomics, or existing evaluation and export features.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following layout and responsiveness decisions were confirmed in Phase 1 interactive clarification:

- **Dual-Target Optimization**: Apply fixes across both the native Android Jetpack Compose code (`android/app/src/main/java/com/mcq/answerpad/ui/MCQScreen.kt`) and the React Web/PWA components (`index.html`, `src/components/Header.tsx`, `src/components/NavigationControls.tsx`, `src/components/AnswerPad.tsx`).
- **Single-Row Question & Badge**: "Question 1 / 200" and the "Unanswered" / "Saved: X" badge will remain on a single horizontal row on narrow screens, utilizing responsive font sizing, flexible weight constraints (`weight(1f, fill = false)` / `min-w-0 flex-shrink`), and no-wrap badge containers to completely eliminate word breaking (such as "Unans" / "wered").
- **Adaptive Bottom Navigation**: The three bottom buttons (Prev, Clear Ans, Next) will use adaptive horizontal padding, responsive font sizing, and compact label truncations/icons to prevent text clipping regardless of device display scaling.

---

### 1. Overview & Core Concept

- **What It Does**: Eliminates text overflow, awkward wrapping (e.g., breaking "Unanswered" across two lines), counter clipping, and bottom navigation truncation on physical Android smartphones while preserving 100% of the app's functionality, data flow, and visual styling.
- **Target Audience / Persona**: Students and professionals practicing timed multiple-choice exams on Android smartphones and tablets in both portrait and landscape orientations.
- **Key Value**: Flawless visual presentation and effortless single-thumb tapping on any screen size from 360dp compact phones up to 12-inch tablets.

---

### 2. User Experience & Visual Design

#### Key User Flows & Visual Polish

1. **Header & Progress Card Flow**:
   - The question indicator ("Question 1 / 200") dynamically adjusts its font size (from `28sp` down to `20sp`–`22sp` on narrow screens) so it never pushes the saved status badge out of view.
   - The status badge ("Unanswered" or "Saved: A") is guaranteed a single-line horizontal fit with `white-space: nowrap` (Web) and `maxLines = 1` with `softWrap = false` (Compose), preventing hyphenated or broken words.
   - The "Answered: X" and "Unanswered: Y" counters use flexible auto-wrapping or responsive gap spacing to stay legible on 360px screens without overlapping.

2. **MCQ Option Buttons (A, B, C, D) & Skip**:
   - Option buttons retain their generous touch targets ($\ge 64\text{dp}$ / `h-14` to `h-18`), satisfying mobile ergonomic thumb-zone guidelines.
   - Option letter labels (A/B/C/D) remain bold and prominent (at least `32sp`–`42sp`), easily tappable in both Attempt Mode and Post-Submission Evaluation Mode.
   - The SKIP button remains a full-width, single-tap prominent button (`height: 56dp–64dp`).

3. **Bottom Navigation Bar (Prev, Clear Ans, Next)**:
   - In Jetpack Compose: Sets button `contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)` instead of default large padding, scales text to `14sp` with `maxLines = 1`, and uses compact gap spacing (`6.dp`–`8.dp`).
   - In Web/PWA: Uses `min-w-0`, `flex-shrink`, and responsive padding (`px-2 sm:px-4`) with `truncate` so labels never spill outside button borders.

4. **Viewport & Android WebView Resilience**:
   - `index.html` viewport meta tag includes `viewport-fit=cover`.
   - Global CSS incorporates `-webkit-text-size-adjust: 100%; text-size-adjust: 100%;` to prevent aggressive Android WebView text autosizing from breaking fixed-ratio calculations.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native Compose Layout Constraints vs. Scrolling**:
  - *Chosen Approach*: Use flexible weights (`weight(1f, fill = false)`), `min-w-0`, and adaptive text sizes instead of making the header scroll horizontally.
  - *Why*: Horizontal scrolling in an exam header causes disorientation and accidental gestures during rapid answering.
  - *Alternatives Considered*: Stacking Question and Badge vertically was rejected in user clarification to preserve vertical screen real estate for the A/B/C/D buttons.

- **Decision 2: Preserving Button Ergonomics on Narrow Screens**:
  - *Chosen Approach*: Reduce excess internal button padding (from default 16dp/24dp down to 8dp/10dp) and reduce gap spacing before reducing font sizes.
  - *Why*: Keeps text large and legible without making the touch hitboxes any smaller.

- **Decision 3: Zero Disruption to Core Logic & Exports**:
  - *Chosen Approach*: Confine all edits strictly to layout, padding, constraints, and CSS/Compose modifier parameters.
  - *Why*: Guarantees that question parsing (`[Q1]...[/Q1]`), attempt tracking, submission scoring, and TXT/CSV export behavior remain 100% bug-free.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MCQ Answer Pad App                              │
├──────────────────────────────────┬─────────────────────────────────────┤
│      Android Jetpack Compose     │           React Web / PWA           │
├──────────────────────────────────┼─────────────────────────────────────┤
│  TopAppBar (Title & Actions)     │  Header (Title, Actions & Modals)   │
│  ▼                               │  ▼                                  │
│  Progress Card                   │  Status Card & Progress Bar         │
│  ├─ Question X / Y (auto-scale)  │  ├─ Question X / Y (responsive text)│
│  ├─ Status Badge (maxLines = 1)  │  ├─ Status Badge (whitespace-nowrap)│
│  └─ Answered/Unanswered Counters │  └─ Flex-wrap Counters & Progress   │
│  ▼                               │  ▼                                  │
│  Option Buttons A - D (weight 1) │  AnswerPad (A, B, C, D + Skip)      │
│  ▼                               │  ▼                                  │
│  Navigation Row                  │  NavigationControls Footer          │
│  ├─ Prev Button (compact pad)    │  ├─ Prev (px-2 sm:px-4, min-w-0)    │
│  ├─ Clear Ans (weight 1.1f)      │  ├─ Clear Ans / Status (truncate)   │
│  └─ Next Button (compact pad)    │  └─ Next (px-2 sm:px-4, min-w-0)    │
└──────────────────────────────────┴─────────────────────────────────────┘
```

#### Files to Update in Phase 3 Execution

1. **`android/app/src/main/java/com/mcq/answerpad/ui/MCQScreen.kt`**:
   - Line 95–130: Constrain "Question X / Y" with `weight(1f, fill = false)` and `fontSize = 22.sp` (or adaptive 24.sp max), set `maxLines = 1`, and configure the status badge with `maxLines = 1` and `softWrap = false` with compact horizontal padding (`8.dp` instead of `12.dp`).
   - Line 134–158: Optimize Answered/Unanswered row to fit cleanly on narrow widths without overlap.
   - Line 258–321: Update Prev, Clear Ans, and Next navigation buttons with `contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)`, `fontSize = 14.sp`, and appropriate icon sizing so all three buttons fit cleanly on 360dp widths.
2. **`src/components/Header.tsx` & `src/components/NavigationControls.tsx`**:
   - Ensure `whitespace-nowrap` on status badges and counter labels.
   - Set `min-w-0` and `flex-shrink` on flex child containers.
3. **`index.html` & `src/index.css`**:
   - Verify `viewport-fit=cover` and add `-webkit-text-size-adjust: 100%`.
4. **Git sync & APK compilation**:
   - Test compile with `compile_applet` and verify Gradle wrapper consistency.
