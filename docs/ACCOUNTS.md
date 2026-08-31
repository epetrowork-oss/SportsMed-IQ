# Logins, classes, and student anonymity

Added 2026-08-24 (owner request — supersedes the old "accounts permanently
out" scope line). SportMedIQ still has **no server and no online accounts**;
"login" here means device-local access control plus teacher-issued codes,
carried over the same copy/paste code machinery as everything else. It all
works offline, because nothing ever leaves the device except codes a person
chooses to share.

## The model at a glance

```
Admin (program owner's device)
  └─ issues → Teacher access code  SMIQT1.…   (one per teacher)
                └─ redeemed ONCE on the teacher's device, where the
                   teacher sets a device passcode; every later unlock
                   uses that passcode, never the code
                   Teacher creates classes there:
                     class = name + students + content controls
                     each student = login name (teacher-chosen) + ID (P3-01)
                                    + PIN (word + 2 digits, e.g. MAPLE42)
                     └─ generates → Class login code  SMIQC1.…  (one per class)
                                     └─ reaches students as a paste, a join
                                        link, or a QR code; then they sign
                                        in on /login with name + PIN
```

- **Only the teacher holds account data.** The teacher's device stores the
  roster with plain PINs (so credential slips can be reprinted). What
  students receive — the class login code — contains only login names,
  student IDs, **salted hashes** of PINs, and the class's content controls.
- **Student anonymity:** a student is a teacher-chosen login name (first
  name, nickname, or seat number) plus a generated ID. No email, no real
  full name, nothing personal is required or stored anywhere.
- **Per-student progress on shared devices:** logging in switches
  `progress.js` to a per-student storage profile
  (`sportmediq:progress:v1:<cid>:<sid>:<pk>`), so classmates on one Chromebook
  never see each other's work. No login → the legacy profile, so self-study
  devices behave exactly as before.
- **Nothing opens without a sign-in.** `RequireSignIn` (wired once, at the
  router) gates Home, the Library, every lesson, quiz and flashcard deck,
  Achievements and Sync. Only `/login` and `/teacher` answer without a
  session, and a signed-in teacher or admin passes the gate so they can read
  through lessons before opening them to a class. Where the visitor was
  headed is carried in navigation state and followed after sign-in — only
  in-app paths, so the login page cannot be turned into an open redirect.
- **Progress codes now carry the student ID** (optional `sid`/`cid` fields
  in SMIQ2 payloads; legacy codes unaffected), so the teacher roster matches
  a returning student by ID even if their display name changes.

### How the teacher roster decides which row a code belongs to

`addStudentFromCode` matches in this order, and the order is the whole point:

1. **By student ID**, when the code carries one. Two students called "Alex"
   in different classes are different people; a modern code never falls back
   to a bare name match, or the second import would overwrite the first one's
   row and progress.
2. **A legacy row, but only when the name is unambiguous.** Rows saved before
   class logins existed have no `sid` or `cid`, so without this the student's
   first modern code would add a second row and split their history. Such a
   row is adopted only when *exactly one* row on the roster carries that name
   and that row is itself a legacy one. A second row with the same name —
   legacy or identified — blocks the adoption: there is no way to tell whose
   old work it is, and a duplicate the teacher can see beats a silent merge of
   one student's semester into another's. When a merge does happen the teacher
   is told, so a wrong one can be undone by removing the row.
3. **By name**, for codes with no IDs at all, matching only rows that
   themselves have no ID. Unchanged behaviour for pre-login devices.

The decision is made inside the store's `commit`, against state re-read at
write time: decoding a code is async, and a namesake row saved by another tab
mid-import has to count.

## How changes reach students (no server, remember)

The class login code is the transport. When the teacher changes the roster
or the content controls, the stored code is invalidated and the Teacher tab
asks them to **generate a fresh code and re-share it**. Students paste the
new code and the device updates in place (same class ID = upsert). A student
removed from the class is logged out on import.

### Getting the code onto student devices

A class login code is a roster, not a password: a verifier and salt per
student plus the settings, which for thirty students is roughly 1,500
characters. Three ways out of the teacher's device, all the same code:

| Route | What it is | When it fits |
|---|---|---|
| **Copy code** | the raw `SMIQC1.…` string | messaging it, or a student who already has it in a doc |
| **Copy join link** | `<app>/#/login?c=<code>` | posting in Google Classroom or Teams — one tap, no typing |
| **QR code** | the same link, encoded (`src/lib/qr.js`) | the projector, or the printed join sheet |

Following a link or scanning the QR imports the class and lands on the
sign-in page with the name list loaded; the code is then stripped from the
address bar so a reload does not replay the import.

Two things worth knowing about the QR. It is **dense** — a thirty-student
class is a 149-module (version 33) symbol, so it needs size, not a corner of
a slide: it renders at 520px inline, has a full-screen mode for projecting,
and prints at 600px. And it is drawn **by our own encoder**, because a
hosted QR image or a CDN library would mean network calls; `npm run test:qr`
is the regression gate on it.

The printed join sheet deliberately carries **no PINs**. Credentials go home
on the credential slips, one student at a time — a poster with everyone's
PIN on it would hand every student every classmate's profile.

## Content controls (per class)

- **Library visibility** — whole library, or only the lessons the teacher
  has opened so far (so early-semester students aren't overwhelmed).
- **Quizzes open** — off blocks/hides quizzes until the teacher enables them.
- **Assignments visible** — off hides the My Lessons queue and class-code
  entry until the teacher starts using assignments (SMIQA1 codes,
  unchanged).

## Honest security scope

This is classroom access control, not cryptographic account security, and
the code says so where it matters:

- The Teacher tab lock keeps students on a shared device out of the
  dashboard. Anyone who clears localStorage gets a locked, empty device —
  there is nothing to steal, and no account recovery either (write the
  admin passcode down).
- PINs are deliberately easy to read aloud, so the space is small: 256 words
  x 90 numbers = 23,040. Because the class code hands every student a
  verifier for every classmate's PIN, that space is hashed with **PBKDF2-
  SHA256 at 150k iterations** rather than a plain digest — a full sweep of
  one student's PIN goes from milliseconds to ~10 minutes of ordinary CPU
  time, while login stays under 100ms and generating a class code for a
  roster stays about a second. This raises the cost of casual snooping; it
  is **not** proof against someone who deliberately sets up a cracking rig,
  and shrinking the word list or reverting to a fast hash would undo it.
- The admin passcode uses the same PBKDF2 derivation, so a weak passcode
  can't be recovered from localStorage with a quick dictionary run.
- Teacher access codes prove possession, not identity — with no server,
  revocation is bookkeeping on the admin device only.
- The join link and the QR carry the class code itself, so treat them as the
  code: anyone who sees the projected square gets the roster's login names
  and the PIN verifiers, exactly as if they had been handed the pasted code.
  That is the same exposure the design already accepts (see PBKDF2 above),
  but it is worth saying out loud before a code goes on a public slide deck
  or a hallway wall — a class join sheet belongs inside the classroom.
- The sign-in gate is a UI gate. It stops a student from browsing ahead of
  the class and makes the content controls mean something, but the lesson
  content ships inside the app bundle: anyone who can open devtools can read
  it. No client-only design changes that, and the material is a textbook,
  not a secret.

### Code forgery: what is closed, and what is not

Review (PR #63) found both code formats were shape-validated but unauthenticated.
Neither can be made unforgeable without a server — nothing here signs anything —
so both are handled by making a forged code *useless* rather than impossible:

1. **Teacher access codes.** The code says who a teacher is; it is not a
   secret. It is redeemed **once**, on a device with nothing on it yet, and the
   teacher sets a device passcode at that moment. Every later unlock needs the
   passcode, and a device that already holds a teacher record or an admin
   passcode **refuses redemption outright** while locked. So a hand-built
   `SMIQT1.` code opens nothing that matters: on a provisioned device it is
   rejected, and on a blank device it yields an empty dashboard. Handing a
   device to another teacher, or recovering a forgotten passcode, goes through
   *Release device* — available only to a signed-in teacher or the admin.
2. **Class login codes.** These can still be decoded, edited and re-imported;
   that part is unavoidable. What it no longer buys is impersonation. A
   student's progress profile is keyed partly by material derived from their
   PIN at login (`progress:v1:<cid>:<sid>:<pk>`), so substituting a verifier of
   your own choosing signs you in against an **empty** profile rather than your
   classmate's. Reaching the real one needs the real PIN, which is the
   ~10-minute-per-student PBKDF2 problem above.
   Lifting the *content controls* by editing a code is still possible — but
   that was never a security boundary anyway: signing out shows the whole
   library by design, so the controls are classroom management, not a lock.

A second review round closed three more holes in the fixes themselves, all
worth recording because each was a way *around* the passcode rather than
through it: first-run **admin setup** was a back door on a teacher's device
(no admin record exists there, so anyone could claim one and walk into the
dashboard — it is now refused unless a teacher or admin session is already
open); **teacher sign-out** did not reach other tabs, so a second tab kept
serving the dashboard; and a class code carrying a **`sid` shaped like
`<victim sid>:<victim pk>`** could aim one student's storage key at another's
profile, so ids are now charset-checked at import, key components are
validated before use, and automatic profile adoption was removed entirely —
nothing moves between profiles now except through the previous-PIN recovery
below.

A third round closed three more: **Release device** left the departing
teacher's classes and plaintext PINs on a device that then looked blank
(release now erases them when no admin remains, and redemption is refused
while any class data is present, so a missed clear locks the device rather
than exposing it); **redemption re-checks its guard after its awaits**, so a
request left pending in one tab cannot overwrite a teacher provisioned in
another; and the **teacher-side stores now sync across tabs**, so a stale
second tab can no longer write back an old roster and erase students, PINs or
settings saved from the first.

A fourth round found the same shape four more times, and it is worth stating
as a rule rather than four bullet points: **every async operation here
snapshots state, then commits after an await, and the cross-tab listeners can
replace that state in between.** Class-code generation could publish a code
built from a roster that had since changed (classes now carry a `rev`, checked
after the hashing); redemption's re-check read this tab's snapshot rather than
what was persisted (it now reads localStorage directly, since `storage` events
arrive asynchronously); a login could complete against a roster a newer class
code had already replaced (the student is re-resolved after the await); and
previous-PIN recovery could merge one student's work into whichever student
had since signed in (both the session and the destination key are re-checked).
Anything added here later must follow the same rule: re-validate after every
await, against persisted state where another tab could have written.

A fifth round found the same shape eight more times, which made it clear this
was one architectural flaw rather than a series of bugs: **every store read a
module-local snapshot, awaited something slow, then wrote a whole store object
back.** So the fix moved into the stores themselves. Each now exposes
`commit(updater)`, where the updater receives state **re-read from
localStorage** at write time and may throw to abort; nothing writes a captured
snapshot any more. That closes all eight at once — stale admin setup, teacher
login resurrecting a released teacher, code issuing restoring a stale unlocked
flag, class codes published after compression, logins validated against a
superseded roster, class imports erasing a concurrent one, and roster and
assignment upserts discarding another tab's entry — and it is the rule any new
store code must follow.

A sixth round finished the job the fifth started. **Release device** checked
its authorization against a module snapshot and the caller wiped the class data
*before* releasing, so a tab signed out elsewhere could erase everything — the
check moved inside the commit and the wipe now runs only after the release
succeeds. The student store wrote **two keys**, which another tab's write could
interleave between (and if the second write threw, the UI could name one
student while loading another's progress); classes and session are now one
record, so the write is atomic. And `progress.js` — which the previous round
left alone on the reasoning that its writes are synchronous — turned out to
have the same flaw, because being synchronous within a tab does not serialize
*across* tabs: one tab recording a quiz result and another recording reading
time would lose one of them. It now commits against the persisted profile too.

What remains, and is not fixable with localStorage: `commit` re-reads before
writing and redoes the update if anything landed in between, which turns the
common interleaving into a retry — but Web Storage has no compare-and-set, so
two writes landing in the same instant still resolve last-writer-wins. Closing
that needs `navigator.locks`, which would make every store mutation async. On a
classroom device the trade was not judged worth it; it is written down here
rather than pretended away.

A seventh round found two more, both smaller in kind — the first with no
security findings in it. Moving the *merge* inside the commit was not enough
for anything **cumulative**: `readSeconds + 10` computed from a stale snapshot
is an absolute number, and writing it over a newer stored value drags the total
backwards. Progress patches are now functions evaluated inside the commit, so
reading time, quiz attempts, best score and scroll depth are all derived from
what is actually stored. Second, combining the student record needed a
migration: a device on the previous split layout kept its session under the old
key, so the upgrade would have signed every student out and sent their next
work to the shared profile. Both `studentSession.js` and `progress.js` now fall
back to the legacy key — both, because `progress.js` initializes first and
reads the record independently.

An eighth round found two workflow bugs rather than concurrency ones. The
provisioning forms lived only on the locked sign-in screen, so two flows this
document claimed were supported actually deadlocked: a teacher-only device
could never gain an admin, and an admin-managed device could never take a
replacement teacher after a release. Both are now reachable from a **Device
setup** panel on the dashboard, shown to whichever signed-in role is allowed to
perform them. (Because a device can now hold both roles, *Sign out* ends the
whole session rather than demoting admin to teacher.) Second, every student
login overwrote the progress-code name, so a student who set their own name on
the Sync page lost it on next sign-in; the login now seeds that name only when
the profile has none.

A ninth round found three more single-user bugs, all in the identity plumbing
rather than the locks. Two students called "Alex" in different classes
collided: the teacher roster matched by student ID first but still fell back to
the name, so importing the second Alex's code replaced the first Alex's row and
progress — the name fallback now applies only to legacy codes, which carry no
ids to match on. A student whose only state was an imported assignment was
never offered PIN-reset recovery, because the "has work" test ignored
assignments that recovery would happily have migrated. And a student's chosen
name still lost to the teacher's nickname *through recovery*, because the new
profile is seeded at login and the merge keeps whatever the destination already
has; recovery now adopts the recovered profile's name.

A tenth round found one more data-loss path in the release flow: the decision
to wipe the class data was a render-time snapshot, so a tab that had not yet
seen another tab add an admin would erase every class, roster and PIN on a
device that was in fact still guarded. The wipe is now decided by what the
release operation actually committed (`forgetTeacher()` returns whether an
admin remains); the rendered value drives only the warning text.

**The honest floor:** whoever physically holds an unlocked device can read
localStorage with devtools. Everything above raises the cost of the in-app
paths; none of it defends against that, and no client-only design can.

### Moving progress when a PIN changes

Resetting a student's PIN changes their profile key, so their work would be
stranded. Recovery is deliberately *not* automatic — silently adopting any
profile filed under the same student ID would hand it to exactly the forger
case 2 describes, and an earlier revision that adopted a "legacy" un-keyed
profile was itself exploitable via a crafted `sid`, so that path is gone. Instead, the sign-in page notices work saved under an older
key and asks the student to type **their previous PIN**, which only they know;
that reproduces the old key and merges the work across (best-of-both rules,
same as a progress-code import), then deletes the old entry. Per-student salts
are permanent for this reason — a salt regenerated on every code build would
make the old key unreproducible. Profiles holding no actual work are ignored,
so an abandoned login never triggers a prompt the student cannot satisfy.

## Backing up a teacher's device (`src/lib/backup.js`)

Everything a teacher has lives in one browser's localStorage on one device.
With no server behind it, a wiped Chromebook or a replaced laptop takes the
classes, the rosters, the plain PINs and the settings with it, and there is
nothing to restore from. The backup file is the restore-from.

- **Encrypted with the device's own passcode** — AES-GCM, key derived by
  PBKDF2-SHA256 at the same 150k iterations as everything else here. A plain
  backup would be a file listing every student's login name and PIN sitting in
  a Downloads folder or a Drive share. Using the passcode the teacher already
  signs in with costs them no new secret to remember — at the cost that the
  file is only as hard to open as that passcode is to guess, which is why the
  panel names the storage the file belongs in and flags a short one.
- **All three stores come from one stable snapshot.** Three independent reads
  are three separate moments, and another tab's restore writes classes, then
  roster rows, then assignments — so reads taken either side of those writes
  assemble a device that never existed: the old class list beside the newly
  restored roster rows, whose students belong to a class the file does not
  contain. Restoring that onto a replacement device brings back orphaned
  progress rows without the class and PINs they belong to, and nothing about
  the session changed, so every other check passes and the file reports
  success.

  localStorage has no transaction, so `createBackup` uses the same
  compare-and-retry `commit` does: read, read again, accept only when nothing
  moved in between. It cannot see a write that landed and was reverted and
  does not pretend to. When a tab keeps writing, it refuses rather than
  returning a file whose contents were never simultaneously true.

  Two equal reads are still not proof that no multi-store operation is
  underway. A restoring tab *paused* between `mergeClasses()` and
  `mergeRoster()` presents the same intermediate state to both reads — stable
  because the writer stopped, not because the restore finished — and the file
  then holds the new classes with the old progress rows, which is the worst
  version of this bug because the teacher took that backup precisely to
  capture what they had just restored. So a restore says out loud that it is
  running (`sportmediq:restoreInProgress:v1`, raised across all three merges
  and lowered in a `finally`), and an export refuses while it is. A marker,
  not a lock: two tabs restoring at once is still last-writer-wins, and a
  timestamp expires the marker a crashed tab leaves behind. It closes the
  window it can see and does not pretend to be mutual exclusion.

  **The health flags are read at the snapshot, not at the end.** The file is
  made of the snapshot, so a strand that this payload really is missing must
  be reported even if it clears before the file is finished — another tab
  persisting exactly the stranded state during encryption clears it (see
  "stranded is not the same as unaccounted-for" below), and a late read would
  then report all-well about a file built from the older snapshot. Both
  readings are taken and OR-ed: a strand either side of the snapshot means the
  file lacks that change.


- **Two things are re-checked at every boundary where something actually
  happens, not only where they are checked.** The matched verifier, *and*
  **which session** is signed in — because they move independently, and each
  answers a question the other cannot.

  `signOut()` clears the unlocked flags and leaves the verifier record exactly
  as it was, so a credential comparison alone passes straight through a
  sign-out in another tab and hands the file to a locked device. And "is the
  device unlocked" is a *boolean*, which cannot tell "nothing happened" from
  "this teacher was released, the stores were wiped, and somebody else was set
  up here" — a restore checking only that would resume into the new teacher's
  device and write the old teacher's classes and plaintext PINs into it,
  undoing the release. So `sessionFingerprint()` names *who* is signed in, and
  a long-running operation is bound to the session that started it.

  **The session is read before the first await, not after it**, and by the
  caller when the caller has awaits of its own. Both halves matter and each
  was a separate hole. Capturing after `verifyDevicePasscode` meant a sign-out
  during the derivation — which leaves the credential perfectly valid, so
  verification succeeds — produced an *empty* fingerprint, and the check at
  the boundary compared empty with empty and passed, handing every class and
  plaintext PIN out of a signed-out device. So a non-empty session is a
  precondition, not an incidental — and the general form is worth stating on
  its own, because it is not specific to sessions: **a captured value that can
  be empty makes an equality check vacuous.** The check did not fail, it
  succeeded by comparing a value to itself. Every binding here therefore
  requires its captured value to be non-empty before it is worth comparing.

  **The same rule reaches the teacher-code paths**, which is where a sweep for
  it found two more. `redeemTeacherCode` re-runs its guard immediately before
  committing, and that guard asks *is a hand-over allowed now* — a question
  the wrong tab can answer. On a blank device two tabs both pass the first
  check; the first provisions its teacher **and unlocks the device**; the
  second then finds `teacherUnlocked` true and is waved through by the guard's
  own-session clause, satisfied by the other tab's brand-new session, and
  overwrites the teacher and passcode just set up. So the redemption is bound
  to the teacher record it started from: absent stays absent, and a
  hand-over an admin authorizes still works because that record does not move
  under it.

  And the binding has to cover the **whole** authorization state, not the part
  that looks relevant. A version that recorded only the teacher record was
  defeated by another tab finishing `setupAdmin()` during the derivation: the
  teacher record is absent on both sides, so the binding matched, while the
  new `adminUnlocked` made the guard return null through its own-session
  clause — and a stale redemption installed its teacher, with a passcode of
  the redeemer's choosing, on a device that had just acquired an admin.
  `authStateKey` compares both credential records and both unlocked flags.
  Choosing which fields matter is the same mistake the persistence checks made
  four times over.

  Both readings have to come from **one** read, too. Splitting them —
  `redemptionBlockedReason(load())` on one line and `teacherRecordKey(load())`
  on the next — leaves the binding describing a state the guard never saw: a
  tab provisioning between the two reads is captured as the state this
  redemption "started from", and the commit-time check then confirms that
  teacher and overwrites them. Deciding, and recording what was decided about,
  are one act.

  `issueTeacherCode` had the read-only version of the same thing. It filtered
  the issued list by `tid`, and two issuances for a name not seen before —
  a double-click, or two tabs — mint different tids, so the first entry
  survived and the admin's list showed one teacher twice against two different
  codes. It filters by normalized name as well now, which is what "re-issuing
  replaces the code" was always promising, and reads the existing entry from
  storage rather than this tab's snapshot. And the panel reads the file before it ever
  calls `restoreBackup`, so it passes its own reading in: a capture inside the
  library would bind to whoever had been provisioned during `file.text()`.

  The verifier fingerprint also comes back **from** the verification rather
  than being looked up after it. Looking it up is a second read of the same
  record, and another tab replacing the credential between the two reads
  leaves the caller holding a fingerprint of the replacement — which it would
  then confirm at the boundary, having established nothing at all about the
  record the passcode actually matched. Verifying, deriving the file key,
  compressing and encrypting are all awaits, and so is decrypting on the way
  back in — an admin releasing a teacher in another tab lands somewhere in
  there. So the export re-checks the matched verifier immediately before the
  file is handed over, and the restore re-checks that the device is still
  signed in immediately before its first write. The second one matters most:
  a release wipes the stores, and a restore continuing afterwards would
  repopulate them with classes and plaintext PINs that nothing guards — while
  redeeming a teacher code is then refused *because* class data exists, so the
  release would neither erase the data nor leave a device anyone can open.
- **The verification is confirmed after the derivation, not before.** Each
  PBKDF2 check takes long enough for another tab to release the teacher or
  change a passcode while it runs, and the caller downloads every class on the
  device — so answering "yes" against a record captured before the await would
  hand that data out on a credential the admin had just revoked. The match is
  checked against state re-read afterwards, and a record that moved under the
  check is refused outright.
- **The passcode is verified against the device's stored verifier before the
  file is written** (`verifyDevicePasscode` in `auth.js`, which checks without
  unlocking anything). A typo at export time would otherwise produce a file
  nobody could ever open.
- **It carries work, never credentials.** Classes, roster rows and saved
  assignments; not the auth record. Signing in on the replacement device stays
  a deliberate setup step — admin passcode, or a teacher access code — so a
  copied backup file can never provision an admin by itself. The restored
  device keeps its own passcode; the backup keeps opening with the old one.
- **A restore never removes and never rolls back.** A class the device does
  not have is taken whole; a class it does have keeps everything it already
  holds — its students, their current PINs, its settings — and gains back only
  the students the backup has that it lacks. Restoring Monday's backup on
  Wednesday therefore cannot delete the student added on Tuesday, cannot undo
  a PIN reset made since (the PIN on the slip in the student's pocket stays
  the one that works), and cannot regress the ID sequence into handing out an
  ID that is already on someone's slip. It *does* bring back a student who was
  deleted, which is the point.

  The three stores do **not** all merge the same way, and an earlier version
  of this sentence said they did. Classes merge, gaining the students they
  lack. **Roster rows are never overwritten** — add-only, whatever the
  timestamps say, for the reasons under "the roster's own rule" below. **Saved
  assignments are never overwritten either**, and a difference is reported
  rather than resolved.

  That last one used to take whichever copy had the later `createdAt`, and it
  was the one place a restore could roll something back. It cannot work. A
  restore is by definition cross-device, `createdAt` is the *source* device's
  wall clock, and there is no trusted clock between two Chromebooks: a device
  running ten minutes fast makes every assignment it holds look newer, so an
  older backup silently overwrites a genuinely newer local assignment — its
  units, its due date, and the code already handed out to students for it.
  Ordering by an untrusted timestamp is a guess, and guessing is precisely
  what the rest of this file stopped doing. The teacher knows which device
  they last edited on; the code does not, so the clash goes to them by name
  and this device's version is kept.

  When a class gains students its `rev` outruns both copies and its stored
  code is cleared, so a code generated before the restore cannot be handed
  out for the restored roster. The ID sequence merges even when no student is restored: a
  device that issued an ID and later deleted that student carries a `seq`
  higher than its roster shows, and leaving the lower one in place would hand
  the departed student's ID — which the teacher's roster still keys their
  progress rows by — to the next student added.
- **A student ID that means two different people is reported, not guessed
  about.** Two devices that both restored a class start from the same
  sequence, so each one's next student is issued the *same* ID. Matching on
  the ID alone would have let a restore drop the incoming student's name, PIN
  and salt without a word. Records are compared by their permanent per-student
  salt — the identity that survives a PIN reset, a rename and a trip through a
  backup file — and a genuine clash is named in the panel (which ID, who it is
  here, who it is in the backup) with nothing changed. No client-only rule can
  decide which student the teacher meant.

  The way out matters as much as the detection. Adding the left-out student on
  this device issues them a **new** student ID, and their progress lives under
  the old one (`…:<cid>:<sid>:<pk>`), so they would sign in to an empty profile
  with their work unreachable — the same invisible failure that ruled out
  re-issuing IDs automatically. Either keep that class on the device it came
  from, or have the student copy their progress code from Sync **on their own
  device, before their old login goes away**, and paste it back after signing
  in under the new ID. That path merges best-of-both and is the only one that
  carries the work across.

  A refusal in one store is a refusal in **all** of them. Roster rows key by
  the same (class, student) pair, so restoring the backup's row for a
  conflicted ID would file one student's name and progress under the other —
  settling in the roster the question the class merge deliberately declined.
  Those rows are held back and counted, and the panel says so.

  **Where the collision came from, and why it is now rare.** Two devices
  restored from one class shared its lineage *and* its counter, so each one's
  next student was issued exactly the same ID — and every store keyed by
  (class, student) then had two people behind one key. Containing that
  downstream took three review rounds, each finding a different store or
  message that settled the question the class merge had declined. New student
  IDs therefore end with **this device's own tag** — five letters drawn once
  and kept (`P3-04KMRWX`), so every ID a device issues shares it and two
  devices' IDs collide only if the two devices drew the same tag. That is a
  smaller probability, not zero, which is why the conflict guard above stays.

  Per device, not per student, and the difference is the whole point. Random
  letters *per student* were 24³ = 13,824 values redrawn every time, so two
  devices adding a student at the same sequence still collided at a real rate,
  growing with every pair added. A tag is drawn once: two devices share one
  only if five letters match (1 in ~8 million), and if they don't, no pair of
  their students can ever collide however many are added.

  Letters, not alphanumerics: a digit in the suffix merges with the sequence
  in front of it, so `P3-02` + `72A` reads as sequence 272 to anything parsing
  the leading digits, and the class's next ID leaps into the hundreds. I and O
  are left out too, since they read as 1 and 0 on a printed slip.

  The collision guard **stays**. IDs issued before this change have no tag, so
  two devices restored from one backup can still hold pre-change IDs that mean
  different people, and the guard is what keeps that visible instead of
  silent. Existing IDs are
  untouched — they are on slips in students' pockets and inside progress-
  profile keys — so the refusal above still matters for data issued before
  this, and stays.

- **Two students can end up sharing a login name, and the sign-in list says
  so.** `addStudent` forbids duplicate names within a class, but it only sees
  one device: two devices holding the same class can each add a "Sam", and
  with per-device ID tags both are legitimately restored. They may be one
  person added twice or two people who share a first name, and only the
  teacher knows which — so both are kept, the restore reports the clash
  naming the class and both IDs, and the sign-in list shows the student ID
  beside the name **only** for the names that collide. That is what lets each
  student pick their own entry using the slip in their hand, which carries
  exactly that ID.

  The roster's own rule is simpler than a refusal: **a row this device holds
  is never overwritten by a restore**, which needs no lineage reasoning and
  cannot be wrong in that direction. Consulting the class merge's conflicts
  covered the case where the device still had the class and missed a row
  retained for a class it had deleted; not overwriting covers both. The cost
  is that a genuinely newer row in the backup does not refresh an older one
  here — recoverable in one step, since these rows are a cache of a student's
  exported progress code and re-importing it is the normal way to update one.
- **A write that never landed is not reported as a restore.** `save()` records
  whether its own `setItem` reached localStorage, and a merge reports that
  directly. Nothing is inferred by re-reading and comparing: every comparison
  tried — the id is present, the ids and the sequence, the whole record — was
  a guess about which differences matter, and the first two were wrong.
- **Storage is the truth, and a refused write is surfaced, not compensated
  for.** The snapshots and merges read persisted state only. Unioning it with
  this tab's module state looks appealing — a write localStorage refused would
  still reach the backup — but it cannot work: a record in memory and not in
  storage is *either* a failed write here *or* one another tab deleted whose
  `storage` event has not arrived, and nothing in the two states tells those
  apart. Unioning resurrects the deletion, bringing back a class and its PINs
  the teacher removed on another tab.

  A second Teacher tab is the awkward case: a refused write fires no `storage`
  event — nothing was written — so that tab would show no warning and report a
  backup as complete while omitting the first tab's stranded changes. The
  answer is **not** to share failure health between tabs. That was tried and it
  does not end: it needs per-tab identity (two failing tabs, one recovers, and
  a shared set clears while the other is still stranded), then a join handshake
  (a tab opened after the failure hears nothing), then liveness (a stranded tab
  closes and the rest warn forever) — a consensus protocol growing inside an
  offline app to describe a browser-wide condition.

  Instead, **a backup says what it holds and never claims to hold everything.**
  Two things are knowable, and they are *not* the same claim, so they are kept
  apart rather than folded into one flag:

  | Signal | What it establishes | How it is said |
  |---|---|---|
  | A store in this tab had a write rejected **and what it tried to write differs from what storage holds** (`knownIncomplete`) | The snapshot is read from storage, so that change is **provably not** in the file | "a change in this tab failed to save, so it is NOT in this file" |
  | Storage refused a probe write just now (`storageRefusing`) | The browser is in trouble; nothing about **this** payload | "may have failed to save, and anything that did fail is not in this file" |

  The distinction is not pedantry: the probe is one byte and quota rejection is
  size-dependent, so it can fail while every real write landed, and pass while
  a large write elsewhere did not. A probe failure is a risk, and reporting it
  as a finding would be the same overclaim this whole section exists to avoid.
  Neither signal's absence certifies completeness either — what a tab is
  holding in memory after a rejected write is not observable from outside it.

  Note what the first row rests on. A rejected `setItem` is not by itself proof
  that anything was stranded: a write whose intent storage **already
  satisfies** — a merge that added nothing, a setting changed back to its
  current value, an empty store whose key was never written — lost nothing
  when it was refused. So each store's `save()` decides the outcome by what a
  reader will now get, not by whether `setItem` threw:

  ```js
  lastWriteOk = landed || JSON.stringify(load()) === payload
  ```

  Through `load()` rather than the raw string, because `load()` is how every
  reader here sees storage: an absent key and an empty store come out equal,
  as they must, since to a reader they are. That keeps `knownIncomplete`
  provable — the snapshot is read from storage, and the write that failed was
  trying to put something different there — and it keeps a restore that
  changed nothing from reporting itself unpersisted.

  **Stranded is not the same as unaccounted-for, and neither is the same as
  lost.** Every commit rebuilds state from storage, and so does the `storage`
  event handler when another tab writes. So a store holding a change
  localStorage refused stops holding it the moment any of that happens — a
  write that lands, a write that is refused, a restore that merges nothing,
  another tab saving.

  `src/lib/storageHealth.js` therefore tracks two things per store, and they
  are **not two values of one state** — that was the first attempt, and it made
  the warning vanish exactly when it mattered:

  | | what is established | what the banner asks for |
  |---|---|---|
  | `stranded` | a refused change is here in memory **right now**, and the snapshot is read from storage, so it is provably not in a backup taken now | save it: fix the storage problem, it is still rescuable |
  | `unverified` | a refused change this tab **can no longer account for** — history, which cannot un-happen | check that part of the dashboard, and redo whatever is missing |

  On one axis, the next write decided what the teacher was told about the
  previous one. A write that landed deleted the entry — banner gone, work
  gone, teacher never told. A write that was refused left the state reading
  "stranded", so the banner offered to rescue a change that was already gone
  while the thing being held was a different one.

  **`unverified`, not `lost`, because "lost" is a claim this code cannot
  make.** When state is replaced by something that is not the refused payload,
  what is known is that this tab can no longer account for that change — not
  that storage lacks it. A later write can carry it: refuse a merge adding Bo,
  then land a merge adding Bo *and* Cam, and Bo is in storage although the
  states never matched. Testing containment instead does not fix it, because
  the opposite case is equally real: refuse a **deletion**, and a later write
  that has the record again has undone it, which containment would call
  survival. Telling the two apart needs a diff of the *change*, not of the
  state — so the app reports what it knows and asks the teacher to look.

  That difference is carried through to the backup. `knownIncomplete` means
  `stranded` only, and licenses "it is NOT in this file". An unverified change
  gets its own weaker field and its own sentence: "it may or may not be in
  this file — check." The wording matters as much as the flag: an earlier
  draft said the tab "no longer has it", which is false in exactly the
  superset case above — the tab rebuilt from storage, and storage has it.

  **The equality that clears a store, as well as the one that marks it.** If
  the state a store is holding after a refused write turns out to equal what
  is in storage — because another tab saved that very state, or because a
  later refused write found storage already there — that change is saved, and
  the store has nothing outstanding. Both places that replace state check for
  it, so a stranded marker is cleared by the same total comparison that sets
  it. Without that, a backup went on reporting `knownIncomplete` for a change
  another tab had already written down.

  That question has to be asked **before** the replacement, not after. Another
  tab can persist exactly this tab's stranded state while its `storage` event
  is still queued; the next local commit then reads that matching state back
  out of storage and builds a larger payload on top of it, so the held state
  and the new payload differ even though storage already proves the change
  survived. `save()` therefore records `readRaw() === held` first, and only
  treats the replacement as a discard when neither that nor the payload
  matches.

  **An unverified change clears only when the teacher says so, per store** — an
  *I've checked this* button on each banner, and the banner names the part of
  the dashboard to check ("your classes, students and their PINs") rather than
  the store. Per store because a teacher who has checked their class list has
  established nothing about their imported progress, and one dismiss-all would
  clear a warning they never looked at. Nothing in the code can substitute for
  that check: a later successful write proves the store's current state is
  saved, not that the earlier change is in it. It stays bounded in a way round
  16's cross-tab warnings were not, because it lives in this tab's memory and
  dies with the tab.

  A restore reports the same way, **per store**. `persisted` is the AND of
  three writes, and a quota-limited browser can reject the large classes
  payload while accepting the two small ones — so a single "none of this was
  saved" would be false about the parts that were. The message names the parts
  that failed, in the teacher's words, and says the rest did save.

  So the success message describes the file ("1 class, 2 students with their
  PINs … that is what was saved on this device at the time") rather than
  pronouncing it complete. The honest limit: a second tab holding changes it
  could not save is invisible to a backup taken here, and only that tab's own
  warning will say so.

  A refused write is tracked **per store**, not as one flag: a quota-limited
  browser can reject a large class write and accept a small assignment write
  moments later, and a single flag would read that second success as "all
  clear" while the class change is still stranded. A store clears itself only
  by writing successfully — which, under this rule, is also the moment its
  stranded change is gone.

  So a refused write is reported instead (`src/lib/storageHealth.js`), and the
  teacher dashboard says plainly what it knows — in the two voices above, one
  banner for a write that actually failed here and a weaker one for a probe
  that did. The honest consequence, which the first message states: work done
  during that outage lives in the tab only, is missing from any backup taken
  then, and may be dropped once saving resumes. A teacher whose browser is
  refusing writes needs to know that, not to have one code path quietly paper
  over it.

There is still no account recovery, and now there is one more thing to write
down: **a backup is only as good as the passcode it was made with.** If both
the device and the passcode are gone, so is the data — by design.

That cuts the other way too, and the app says so rather than implying the
encryption is unconditional. The file holds every student's name and plain
PIN, and anyone holding it can try passcodes against it offline, at whatever
rate their hardware manages, with no lockout and nothing watching. 150k
PBKDF2 iterations slow each guess; they do not save a passcode short enough to
enumerate, and the minimum this app enforces is six characters. So a backup
is not a file to leave anywhere a link reaches: it belongs in storage only
staff can open, and the save panel warns when the passcode it was just made
with is short.

**Short, not weak, and the difference is the whole point of the name.** The
check is `secret.length < 12` and nothing else, because scoring composition
would mean claiming `Passw0rd!` is strong — the same overclaim in a new place.
A length threshold works in one direction: under it, the space is small enough
to be worth a warning whatever the characters are; over it, nothing follows,
since `passwordpassword` is sixteen characters and a random eleven-character
secret is not enumerable at all. So the flag is `shortPasscode`, its false
case means "this one check found nothing" rather than "fine", and the advice
that follows from it — keep the file where only staff can reach it — is in the
save message either way. Only the sentence naming the length is conditional.

## Office-suite exports (`src/lib/exports.js`)

Everything is CSV — the one dependency-free format Excel, Word, Google
Sheets/Docs, Teams, and Classroom all accept:

| Flavor | Encoding | For |
|---|---|---|
| Microsoft | UTF-8 **with BOM**, CRLF | double-click open in Excel, paste into Word, upload to a Teams assignment/OneDrive |
| Google | plain UTF-8, LF | import into Sheets/Docs, attach in Google Classroom |

Each flavor comes in two layouts: **detail** (the original wide per-unit
evidence table + standards reference) and **gradebook** (one row per
student: % complete per assignment, best quiz % per unit) shaped like the
grade columns Teams/Classroom gradebooks use. Neither LMS documents a
public bulk grade-import format, so "transfer" means paste or upload of a
matching table — the export is shaped so that takes no hand-reshaping.

## Store/key inventory added by this feature

| Key | Device | Contents |
|---|---|---|
| `sportmediq:auth:v1` | admin/teacher | admin passcode verifier, teacher identity + device-passcode verifier, per-role unlocked flags, issued-codes list |
| `sportmediq:classes:v1` | teacher | classes with rosters (plain PINs + permanent per-student salts), settings, last generated code |
| `sportmediq:studentClasses:v1` | student | imported class-code payloads (hashed PINs) |
| `sportmediq:studentSession:v1` | student | active `{cid, sid, name, pk}` — `pk` is PIN-derived; `progress.js` reads this to pick the profile |
| `sportmediq:progress:v1:<cid>:<sid>:<pk>` | student | per-student progress profile, keyed partly by the PIN |

Code prefixes now in the family: `SMIQ1`/`SMIQ2` progress, `SMIQA1`
assignment, `SMIQT1` teacher access, `SMIQC1` class login. Every decoder
detects the other prefixes and points the user at the right box.
