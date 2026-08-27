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
                └─ unlocks the Teacher tab on the teacher's device
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
  (`sportmediq:progress:v1:<cid>:<sid>`), so classmates on one Chromebook
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

### Two limits that are inherent to having no server

Both were raised in review (PR #63) and are real. Neither is fixable by
better client-side code alone, because every secret a student device could
check against is already on that student's device:

1. **Teacher access codes are unforgeable only by convention.** Redemption
   validates the code's shape, not its issuer, so someone who knows the
   format can hand-build a `SMIQT1.` code and unlock the Teacher tab on a
   device that has teacher data on it. Closing this needs either a
   credential the student can't reproduce (e.g. the teacher also setting a
   passcode on their device at first redemption, so later unlocks need it)
   or a server to sign codes.
2. **Class login codes can be edited and re-imported.** A student can decode
   `SMIQC1.`, change the settings or substitute a PIN hash for one they
   chose, re-encode, and import it — lifting their own content restrictions,
   or logging into a classmate's progress profile on a shared device. Same
   root cause: offline verification means the verifier travels with the data.

Treat the content controls as classroom management (they shape what a
cooperating student sees), not as a security boundary against a determined
student.

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
| `sportmediq:auth:v1` | admin/teacher | salted admin passcode hash, admin-unlocked flag, redeemed teacher identity, issued-codes list |
| `sportmediq:classes:v1` | teacher | classes with rosters (plain PINs), settings, last generated code |
| `sportmediq:studentClasses:v1` | student | imported class-code payloads (hashed PINs) |
| `sportmediq:studentSession:v1` | student | active `{cid, sid, name}` — read directly by `progress.js` to pick the progress profile |
| `sportmediq:progress:v1:<cid>:<sid>` | student | per-student progress profile |

Code prefixes now in the family: `SMIQ1`/`SMIQ2` progress, `SMIQA1`
assignment, `SMIQT1` teacher access, `SMIQC1` class login. Every decoder
detects the other prefixes and points the user at the right box.
