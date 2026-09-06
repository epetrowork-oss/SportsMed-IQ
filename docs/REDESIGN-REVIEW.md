# SportMedIQ application redesign

The application’s growing set of learning and classroom tools made the next action
hard to find. This change gives students a focused learning dashboard, gives teachers
separate work areas, and applies one responsive visual system throughout.

## Implemented

- Navy navigation, teal actions, white surfaces, consistent spacing/type/button styles,
  compact account menu, keyboard skip link, mobile card layouts, and print CSS.
- Student entry with class-join steps and a neutral welcome message.
- My learning with resume action, assignments, progress, optional setup, and exploration.
- Library filters for grade, topic, progress, and assigned work; accessible empty states.
- Shared Read / Quiz / Cards navigation and one next-action helper. Closed quizzes
  lead to available flashcards; waiting states explain why further work is unavailable.
- Lesson contents with section focus/scroll, secondary print menu, and diagrams that
  fit their containers. Existing medical content and accepted image assets are unchanged.
- Passing quiz results advance to the next requirement. Flashcards show an end-of-deck
  panel, including a one-card deck path. The existing completion rule is preserved.
- Teacher tabs: Overview, Classes, Assignments, Reports, Settings. Links retain the chosen
  area in the URL. Existing class/code/admin/report functionality remains available.
- One export menu with Excel/Teams as the default, plus existing Google formats.
- Sharing separates teacher submission, device transfer, and assignment import. Copying
  does not claim delivery; clipboard failure provides a manual-copy explanation.

No dependencies, storage schemas, remote services, authentication gates, lesson sources,
or completion thresholds were changed. The 70% best-quiz rule remains in effect.

## Verification

- `npm run build`: production bundle and PWA precache generation pass. Existing large
  bundle warning remains because all 54 lessons are available offline.
- `npm run validate:content`: all 54 unit files pass with zero errors.
- `npm run test:qr`: 16 capacities and 48 matrices pass.
- `npm run test:journey`: state and server-render checks cover signed-out gating,
  teacher views, student class restrictions, closed/reopened quiz progression,
  assignment/progress imports, all 162 lesson/quiz/card route renders, and print
  document generation including the blocked-popup return value.

The journey check supplies server snapshots to client-only stores inside its test
loader. It never modifies production authentication or storage. It is not browser QA:
CSS layout, actual clicks, focus behavior, clipboard permissions, service-worker
activation, offline reload, and print pagination are not proven by these checks.

## Remaining browser review before release

The supervised preview starts, but the cloud browser rejects the preview address with
`ERR_BLOCKED_BY_CLIENT`. No redesigned-screen screenshots were available in this session.

1. Open the branch preview at 375px, 768px, and 1280px, plus 200% text enlargement.
   Check the header, long names/titles, cards, filters, forms, and report rows for overflow.
2. Join a test class through its link/QR, choose a student, and sign in. Refresh and
   switch between two student profiles; verify each profile retains only its own work.
3. Complete a lesson, quiz, and cards through actual clicks. Confirm every next-action
   link and completion state, including failed quiz, prior best pass, and closed quiz.
4. Change class visibility and quiz availability, import the updated class login code,
   and confirm restricted lessons stay inaccessible and next-step controls update.
5. Create an assignment; import it on a student profile; filter the library; copy and
   import progress; check teacher report rows and each export format/layout.
6. Navigate every teacher tab by keyboard; verify form focus, menus, skip link, lesson
   contents links, and returning from a lesson. Review the account and sign-out paths.
7. Load the production PWA, wait for installation, disconnect the network, and reload.
   Confirm lesson text/images, quizzes, cards, and progress work offline.
8. Open lesson and practical print previews. Verify black-and-white readability,
   page breaks, response space, and popup-blocker messaging. Existing lesson packets
   use text descriptions for visual references; the screen print stylesheet retains images.

Keep this as a draft until those checks are complete. No production deployment was made.

## PR #67 review fixes

All five findings in the supplied fix brief are addressed:

1. Contents jumps and route resets use a shared scroll guard. It excludes the
   app's scroll burst until two quiet animation frames, restarting the drain on
   each suppressed scroll event.
2. Depth tracking samples only scroll events. Mount, resize and cleanup do not
   measure; cleanup only saves prior evidence, avoiding reads of a replacement DOM.
3. The continuation card has one coherent light-surface rule set, dark child text,
   and a border-only hover. Calculated contrast is at least 5.35:1 for the changed
   text colors on the pale card, and 6.91:1 for white on the teal action.
4. The home progress denominator intersects class access and focus assignments,
   matching the lesson scope shown in the library.
5. Home and the shot-list generator import one shared 4:3 image specification,
   including description and alt text. Existing artwork is retained.

Checks executed after these fixes: production build; content validation (54 files,
zero errors); redesign self-test (194 checks); scroll-depth self-test (7 simulated
scroll/frame lifecycle scenarios); image-slot generator; numeric color-contrast
calculation; and `git diff --check`. No new dependencies were added.

The scroll tests simulate events and animation frames; they are not real browser
interaction tests. All four browser QA groups above remain open, including visual
layout, real click-throughs, installed-PWA offline reload, and print pagination.
The existing build-size warning remains. Keep PR #67 in draft.
