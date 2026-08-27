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
                                     └─ students paste it once on /login,
                                        then sign in with name + PIN
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
- **Progress codes now carry the student ID** (optional `sid`/`cid` fields
  in SMIQ2 payloads; legacy codes unaffected), so the teacher roster matches
  a returning student by ID even if their display name changes.

## How changes reach students (no server, remember)

The class login code is the transport. When the teacher changes the roster
or the content controls, the stored code is invalidated and the Teacher tab
asks them to **generate a fresh code and re-share it**. Students paste the
new code and the device updates in place (same class ID = upsert). A student
removed from the class is logged out on import.

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
