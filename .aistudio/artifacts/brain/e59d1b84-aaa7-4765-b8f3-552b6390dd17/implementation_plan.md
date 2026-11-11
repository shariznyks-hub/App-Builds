# Adaptive Timer, Custom Goals, Gamification & Learning Analytics for MCQ Answer Pad

A comprehensive upgrade to the MCQ Answer Pad introducing an adaptive cumulative time-bank timer, custom flexible session targets with non-destructive completion flows, an accomplishments-based XP and leveling system, question streaks, personal best records, mistake correction tracking, and extended TXT/CSV exports (including post-evaluation answer keys and an export of incorrect questions for re-importing), all while preserving full offline capability and mobile responsive layout on Android and desktop.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following core design decisions were confirmed during the interactive clarification phase:
> - **Adaptive Timer Display**: A compact dual-badge interface showing the current question countdown alongside the cumulative time-bank balance (`+`/`-` seconds), styled with high-contrast warning colors during overtime.
> - **Celebrations & Feedback**: Subtle visual celebrations (confetti particle bursts, level-up badges) paired with user-toggleable sound effects (synthesized via Web Audio API) and device haptic vibrations, configurable in Settings.
> - **Resume Session Prominence**: An active top banner on app opening showing test progress (e.g., "Resume Session — Question 26 / 200") with immediate "Resume Session" and "Start Fresh" buttons, preventing unintentional session loss.

---

### 1. Overview & Core Concept

- **What It Does**: Enhances the existing MCQ Answer Pad with a smart, pacing-aware study suite:
  1. An **Adaptive Time Bank Timer** where saved seconds on quick questions carry forward to harder questions, and overtime is subtracted from future questions without forcing auto-skips.
  2. A **Custom Session Target** (e.g. 5, 12, 37 questions) with dynamic mid-session adjustments and a non-destructive target completion dialog (Continue, Pause & Save, End Session).
  3. A **Gamification & Analytics Engine** awarding transparent XP, level progression, streaks that respect strategic skips, and a mistake-correction tracker for questions previously failed and later solved correctly.
  4. An **Enhanced Export Suite** providing full answer keys post-submission in CSV/TXT and a dedicated "Export Incorrect Questions Only (TXT)" in `[Q1]...[/Q1]` format that can be directly re-imported as a revision bank.
- **Target Audience / Persona**: Serious competitive exam candidates, students, and professionals practicing MCQs who need pacing discipline without arbitrary time penalties, accompanied by motivating progress tracking.
- **Key Value**: Replaces anxiety-inducing hard timers with an adaptive pacing time bank; eliminates rigid 10/20 question targets; reinforces active learning through mistake tracking and exportable revision decks.

---

### 2. User Experience & Visual Design

#### Key User Flows

1. **Attempting with Time Bank**:
   - The user opens the quiz. In the question header, next to the question index, sits the **Time Bank Widget**:
     - *Question Countdown*: Displays remaining seconds for this question (e.g., `00:48`).
     - *Bank Balance*: Displays cumulative surplus or deficit (e.g., `+00:24` in emerald, or `-00:15` in rose).
   - If countdown hits zero, it smoothly transitions to overtime (`+00:01`, `+00:02` in warning rose). The user is never interrupted or auto-skipped.
   - When moving to Next or selecting an answer after 40s (out of 60s base), the unused 20s is added to the Time Bank. Q2 now has $60 + 20 = 80\text{s}$.
2. **Setting & Adjusting Custom Targets**:
   - In Settings or via a quick target badge on the header, the user sets any positive integer (e.g., `15`).
   - While answering, a mini progress indicator shows `Target: 7 / 15` and `Streak: 🔥 7`.
   - If the user gets tired or motivated, clicking the target badge allows changing `15` to `10` or `30` on the fly without resetting answers or progress.
3. **Reaching Target (Target Completion Dialog)**:
   - Upon hitting question 15, a polite modal pops up: `🎯 Session Target Completed!`.
   - Displays summary: 15 questions processed (12 answered, 3 strategically skipped), XP earned, current streak, time bank balance.
   - User choices:
     - *Continue Target*: Enter a new target (e.g., +10 questions) and keep going seamlessly.
     - *Pause & Save*: Safely pauses the timer and saves session state.
     - *End Session*: Finishes current practice without auto-submitting the test (keeps answers ready for later review).
4. **Post-Submission Evaluation & Extended Export**:
   - Upon clicking "Submit Test", the test enters Evaluation Mode:
     - Correct option highlighted green; user's wrong answer highlighted red.
     - Correct Answer and Explanation clearly displayed.
     - Accuracy, XP bonuses (+5 for each correct answer), and Mistakes Fixed stats updated.
   - In the Export modal:
     - CSV & TXT include columns: `Question`, `Selected Answer`, `Correct Answer`, `Result` (`Correct` / `Incorrect` / `Unattempted`), `Explanation`.
     - New dedicated button: `Export Incorrect Questions Only (TXT)` generating clean `[Q1]...[/Q1]` format containing only failed questions for re-importing.

#### Visual Identity & Theme

- **Aesthetic Direction**: Utilitarian, dark-mode-first slate palette (`Slate950`, `Slate900`, `Slate800`) with surgical accents:
  - *Primary Blue* (`#3B82F6`): Question counters, primary selection highlights.
  - *Emerald Green* (`#10B981`): Time bank surplus, correct answers, submit CTAs, level-up highlights.
  - *Amber Warning* (`#F59E0B`): Strategic skips, unanswered alerts, streaks, milestone badges.
  - *Rose Danger* (`#EF4444`): Overtime deficit, wrong answers, clear confirmations.
- **Typography & Numbers**:
  - Headings in bold title-case.
  - All timer readouts, question numbers, time-bank balances, and percentages use tabular figures (`font-mono tabular-nums`).
- **Mobile Ergonomics (360px–430px)**:
  - All header actions fit dynamically with compact icon+label pairs.
  - No clipped text or broken lines (`whitespace-nowrap`, `min-w-0`, `flex-shrink`).
  - Answer buttons A, B, C, D maintain large touch hitboxes ($\ge 52\text{px}$ height, full width).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Elapsed-Time Delta Tracking vs. setInterval Accumulator**
  - *Chosen Approach*: Track `questionStartTime = Date.now()` and accumulate real milliseconds spent per question.
  - *Why*: Minimizes interval drift caused by mobile tab throttling, background pauses, or sleep modes.
  - *Alternatives Considered*: Standard `setInterval(() => count--, 1000)` was rejected because mobile browsers throttle background intervals, losing accurate time.
- **Decision 2: Answer-Key Privacy During Attempt Mode**
  - *Chosen Approach*: Exports initiated during Attempt Mode contain only user answers and question bounds; `Correct Answer` and `Result` columns are strictly populated only in Evaluation Mode (`isSubmitted === true`).
  - *Why*: Guarantees that students cannot inspect exported files or browser console payloads to cheat during active mock exam attempts.
- **Decision 3: Strategic Skips Count Towards Session Progress and Streaks**
  - *Chosen Approach*: Deliberate skips count towards session target completion and do not break active question streaks.
  - *Why*: In actual competitive exams (e.g. UPSC, GFR, SAT, GRE), tactical skipping of high-risk or time-sink questions is an essential skill and must be rewarded rather than penalized.
- **Decision 4: Question Fingerprinting for Mistake Tracking**
  - *Chosen Approach*: Maintain a local question history store keyed by a hash or stable composite key of `questionText` + `correctAnswer`.
  - *Why*: If a user imports a new question file or re-imports their mistakes deck, the app accurately recognizes previously failed questions and awards "Mistakes Fixed" bonuses when answered correctly.
- **Decision 5: Synchronized Android Native Compose & Web/PWA Code**
  - *Chosen Approach*: Mirror all core features, data structures, and views between React SPA and the native Jetpack Compose APK (`MCQViewModel.kt`, `MCQScreen.kt`, `androidProjectZip.ts`).
  - *Why*: Ensures that whether the user runs the PWA in Chrome or compiles an APK via GitHub Actions, they receive the exact same feature parity, styling, and data reliability.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MCQ Answer Pad Applet                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                         App Header                             │   │
│   │  [Title] · [Time Bank Badge] · [Target Badge] · [XP/Level]     │   │
│   │  [Quick Actions: Paste Qs · Submit · Export · Settings]        │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │                      Active Banner Area                        │   │
│   │  [Resume Session Prompt / Milestone Celebration Notification]  │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │                     Main Question Canvas                       │   │
│   │  [Question Text & Metadata]                                    │   │
│   │  [Option Cards A, B, C, D (Large touch hitboxes)]              │   │
│   │  [Evaluation Details: Correct Ans & Explanation (Post-Submit)] │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │                                    │
│   ┌───────────────────────────────┴────────────────────────────────┐   │
│   │                  Bottom Navigation & Controls                  │   │
│   │  [Prev] · [Clear / Jump / Unanswered] · [Skip] · [Next]        │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                         State Management Layer                         │
│  ┌───────────────────────┐ ┌────────────────────┐ ┌──────────────────┐ │
│  │   Adaptive Timer      │ │ Session Target &   │ │  Gamification &  │ │
│  │   Time Bank Engine    │ │ Question Streaks   │ │  Mistake History │ │
│  └───────────────────────┘ └────────────────────┘ └──────────────────┘ │
│                                   │                                    │
│                 localStorage Offline Persistence                       │
│      (Config, Answers, Timing, History, XP, Settings v2)               │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities

```typescript
// Timer & Pacing State
export interface QuestionTiming {
  questionNumber: number;
  timeSpentSeconds: number;
  baseAllocatedSeconds: number;
  visitedCount: number;
}

export interface TimeBankState {
  baseTimePerQuestion: number; // default 60s
  currentBankBalance: number;  // surplus (+) or deficit (-) in seconds
  questionTimings: Record<number, number>; // questionNumber -> seconds spent
  isPaused: boolean;
}

// Session Target & Gamification
export interface SessionTargetState {
  targetCount: number;       // custom number of questions
  processedQuestions: number[]; // unique questions answered or skipped
  isTargetReached: boolean;
  targetDismissedForSession: boolean;
}

export interface GamificationState {
  totalXP: number;
  sessionXP: number;
  level: number;
  currentStreak: number;
  personalBestStreak: number;
  unlockedAchievements: string[];
}

export interface QuestionHistoryRecord {
  questionKey: string; // hash or sanitized question text
  lastAnswer?: MCQOption;
  wasPreviouslyIncorrect: boolean;
  isFixed: boolean;
  attemptsCount: number;
}
```

#### Extended Export Formats

1. **Standard Full CSV (Evaluation Mode)**:
   ```csv
   Question,Selected Answer,Correct Answer,Result,Explanation
   1,B,B,Correct,"Original Work includes new construction..."
   2,A,C,Incorrect,"Under GFR Rule 199..."
   3,,A,Unattempted,"Direct purchase on GeM..."
   ```
2. **Incorrect Questions Only (TXT)**:
   ```text
   [Q1]
   Question: What is the maximum period for which a contract for hiring services can normally be executed under GFR?
   A: 1 Year
   B: 2 Years
   C: 3 Years
   D: 5 Years
   Correct: C
   Explanation: The normal duration for service contracts under standard rules is up to 3 years.
   [/Q1]
   ```

#### Component & Modal Mapping

- **Header.tsx**:
  - Integrate compact Time Bank pill (`00:45` | `+00:15`), Target progress indicator (`7/15`), Level/XP badge (`Lv 2 · 85 XP`), and Streak flame (`🔥 7`).
  - Maintain all existing actions: Paste Qs, Submit/Retake, Export, Settings, Clear.
- **AnswerPad.tsx**:
  - Integrate large option buttons with adaptive colors (attempt vs evaluation).
  - Show explanation card and correct answer card in evaluation mode.
- **NavigationControls.tsx**:
  - Responsive Previous, Clear Ans, and Next buttons with min-w-0 for narrow screens.
- **SetupModal.tsx**:
  - Add fields for Base Time Per Question (seconds, free input) and Custom Session Target (number of questions, free input).
  - Add audio & vibration toggle switches.
- **TargetCompletedModal.tsx**:
  - Dedicated modal triggered upon reaching session target offering "Continue (new target)", "Pause & Save", and "End Session".
- **PerformanceDashboardModal.tsx**:
  - Detailed stats: Total processed, Accuracy %, Mistakes Fixed, Personal Bests, Unlocked Achievements.
- **ExportModal.tsx**:
  - Format selector: Full TXT, Full CSV (with user vs correct answers), and Export Incorrect Questions Only.
