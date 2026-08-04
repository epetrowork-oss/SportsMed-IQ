# SportMedIQ — alpha tester kit

Thanks for trying this. It's a **learning app for high school sports medicine
students** — lessons, quizzes, and flashcards across 18 topics at three grade
bands, with a teacher view for tracking who's done what.

**It runs entirely in your browser.** No account, no login, no server. Your
progress is saved on your own device, and the only way anything moves between
devices is a code you copy and paste. That's deliberate: it means it works
offline, on a school Chromebook, with no student data leaving the building.

**Please try it on a phone.** Most students will use it that way, and it's the
hardest case for us to get right.

---

## Start here (student)

1. Open the app.
2. Go to **Sync** and put your name in. This is only used to label your own
   progress code — nothing is sent anywhere.
3. Go to **Lessons**, pick anything that looks interesting, and read it.
4. Tap **"I've read this lesson"** at the bottom.
5. Do the **flashcards**, then take the **quiz**.
6. Go back to the unit — it should now show as complete.

A unit counts as done when you've read the lesson, been through the
flashcards, and scored **70% or better** on the quiz. You can retake the quiz;
your best score is what counts.

### Then try moving your progress

1. On **Sync**, copy your progress code (it starts with `SMIQ2.`).
2. Open the app in a private/incognito window — that's a clean device as far
   as the app is concerned.
3. Paste the code into **"Load a code"**.

Your name and progress should come across. If you've done work in *both*
places, importing merges them rather than replacing one with the other.

**How the merge resolves conflicts — worth knowing before you report a bug:**

- **Completion and scores keep the better of the two.** If one device says you
  read the lesson and the other doesn't, you've read it. If you scored 80% on
  one and 60% on the other, you keep 80%. Nothing here is ever lost.
- **Written practical reflections keep the newer text, and the older text is
  discarded.** If you wrote a reflection on your phone and a *different* one
  for the same activity on a laptop, the more recently edited one wins and the
  other is gone. That's intentional — there's no way to merge two pieces of
  prose automatically — but it does mean you can lose writing this way.

So: **losing reflection text after editing the same activity in two places is
expected.** Losing a completed lesson, a flashcard set, or a quiz score is
**not** — if that happens, tell us straight away, with what you did on each
device.

---

## Start here (teacher)

Go to **Teacher**. Two things to try:

**1. Build a class code.** Name an assignment, tick some lessons, and generate
a code (it starts with `SMIQA1.`). Give that to students and they paste it
into **Sync → class code**. It shows up for them as assigned work.

**2. Build a roster.** Students send you their progress codes; paste each into
**"Add student"**. You get a table of who's completed what, with drill-down per
student, and a CSV export.

### Demo codes — paste these to see it populated

All four are verified working. Use them if you'd rather not create data by hand.

**Class code** — three 7th–8th units (paste into Sync → class code):

```
SMIQA1.JY1BCsIwFAWvEt46kW8FkewKbtwLguIipB9bTH5Cky5EBA_hCT2JtMKshoF5QlxkWLQh907tOSb1fX_Uifmu1tCYZKiHrsBe4JP4qZQhiYkFGj27aoYQhEv5G4483lj8wzhf5y4Ht8RXjZi6-ZMyCzT8yK5y11ZYNNRsDe0MbY5EdmFFRGe8fg
```

**Three demo students** at different stages (paste into Teacher → Add student).
Add all three to see a realistic mixed roster:

*Avery Diaz — two units done, one partway:*

```
SMIQ1.eyJuYW1lIjoiQXZlcnkgRGlheiIsInVuaXRzIjp7ImNvbmN1c3Npb24tbXMiOnsibGVzc29uUmVhZCI6dHJ1ZSwiZmxhc2hjYXJkc1Jldmlld2VkIjp0cnVlLCJiZXN0UXVpelNjb3JlIjowLjg3NSwicXVpekF0dGVtcHRzIjoxLCJyZWFkU2Vjb25kcyI6NDIwLCJzY3JvbGxQY3QiOjEwMH0sImhlYXQtaWxsbmVzcy1tcyI6eyJsZXNzb25SZWFkIjp0cnVlLCJmbGFzaGNhcmRzUmV2aWV3ZWQiOnRydWUsImJlc3RRdWl6U2NvcmUiOjAuODc1LCJxdWl6QXR0ZW1wdHMiOjEsInJlYWRTZWNvbmRzIjo0MjAsInNjcm9sbFBjdCI6MTAwfSwiZW1lcmdlbmN5LWFjdGlvbi1wbGFuLW1zIjp7Imxlc3NvblJlYWQiOnRydWUsImZsYXNoY2FyZHNSZXZpZXdlZCI6ZmFsc2UsImJlc3RRdWl6U2NvcmUiOjAuNSwicXVpekF0dGVtcHRzIjoyLCJyZWFkU2Vjb25kcyI6MjYwLCJzY3JvbGxQY3QiOjg4fX19
```

*Sam Okafor — one done, one partway:*

```
SMIQ1.eyJuYW1lIjoiU2FtIE9rYWZvciIsInVuaXRzIjp7ImNvbmN1c3Npb24tbXMiOnsibGVzc29uUmVhZCI6dHJ1ZSwiZmxhc2hjYXJkc1Jldmlld2VkIjp0cnVlLCJiZXN0UXVpelNjb3JlIjowLjg3NSwicXVpekF0dGVtcHRzIjoxLCJyZWFkU2Vjb25kcyI6NDIwLCJzY3JvbGxQY3QiOjEwMH0sImhlYXQtaWxsbmVzcy1tcyI6eyJsZXNzb25SZWFkIjp0cnVlLCJmbGFzaGNhcmRzUmV2aWV3ZWQiOmZhbHNlLCJiZXN0UXVpelNjb3JlIjowLjUsInF1aXpBdHRlbXB0cyI6MiwicmVhZFNlY29uZHMiOjI2MCwic2Nyb2xsUGN0Ijo4OH19fQ
```

*Riley Chen — opened one lesson, barely engaged (this is what a
click-through looks like on the teacher side):*

```
SMIQ1.eyJuYW1lIjoiUmlsZXkgQ2hlbiIsInVuaXRzIjp7ImNvbmN1c3Npb24tbXMiOnsibGVzc29uUmVhZCI6dHJ1ZSwiZmxhc2hjYXJkc1Jldmlld2VkIjpmYWxzZSwiYmVzdFF1aXpTY29yZSI6bnVsbCwicXVpekF0dGVtcHRzIjowLCJyZWFkU2Vjb25kcyI6MzUsInNjcm9sbFBjdCI6MjJ9fX0
```

Riley is worth a look. **Click that row to open the per-student view** — the
app tracks time on the lesson and how far down the page you got, so Riley
shows **0:35** and **22%** against a lesson that takes several minutes to
read. Someone who tapped "I've read this" without reading looks different
from someone who didn't, and that's the whole point. Those two numbers are in
the CSV export as well.

---

## What we most want to know

- **Does it make sense on a phone?** Especially the diagrams.
- **Is anything wrong?** This is medical content for teenagers. If something
  reads as inaccurate, unclear, or like it might get someone hurt, tell us —
  that outranks every other kind of feedback.
- **Does the copy-paste code flow actually work** in your real setup — your
  LMS, your email, your students' phones? This is the part most likely to be
  annoying in practice, and we'd rather find out now.
- **Does the reading level fit?** Each topic exists at 7–8, 9–10, and 11–12.
  Tell us if a band feels off.

---

## Known gaps — please don't report these

We already know about all of these.

**Some diagrams are too dense to read on a phone.** Fourteen are confirmed:
mostly the multi-column comparison tables in the 11th–12th units, where cell
text ends up around 4–5 px tall on a phone screen. They're correct, just too
small. A redesign round is planned. **We're not certain the list of fourteen is
complete**, so if you hit a diagram you can't read, that *is* worth reporting —
it may be one we missed.

**All eighteen topics now cite a source** — position statements from NATA,
ACSM, AMSSM and the IOC, plus AAOS and a sports medicine reference text. Two
one caveat worth knowing: citing a source for a topic doesn't mean every
sentence in it is individually cited. (The **eye injuries** units lean on a
2005 textbook chapter for the injury-management content — that's the reference
the topic was written from — now paired with the 2013 AAP/AAO protective
eyewear policy for the prevention sections.)

**Eight individual claims inside otherwise-sourced topics are still
uncited**, listed here in full rather than summarised, because we got this
count wrong twice:

- **Eye injuries, 9th–10th and 11th–12th** — the chemical-splash guidance
  (flush 15–20 minutes, then still see a doctor)
- **Skin conditions, 7th–8th and 9th–10th** — specifically the advice to
  *leave an intact blister alone*. The rest of blister care (clean it, cover
  it, watch for infection) is now cited.
- **Dental and facial trauma, 7th–8th and 9th–10th** — the nosebleed guidance
- **Cold exposure, 11th–12th** — classifying frostnip as a non-freezing
  injury; the "water conducts heat 25× faster than air" figure; and the
  "1-10-1" naming (the underlying physiology *is* sourced)
- **Taping and wrapping, 11th–12th** — that most of rigid tape's motion
  restriction is gone within 20–30 minutes of activity
- **Warm-up and injury prevention, 11th–12th** — that raising muscle
  temperature by 1–2 °C meaningfully changes tissue properties

None of these are believed wrong; they're well established. They just don't
yet have a citation attached that we've verified against the source.

**The standards alignments are unverified.** Each unit lists standards it's
meant to map to; nobody has checked those against the official documents yet.
Don't rely on them for reporting.

**There's no account recovery, because there are no accounts.** If a student
clears their browser data, their progress is gone unless they saved a code.
That's the tradeoff for having no server and no student data. Worth knowing
before you hand it to a class.

**iOS "Add to Home Screen" is lightly tested.** It should install as an app and
work offline. If it doesn't, tell us what device and iOS version.

---

## Reporting something

Most useful, in order:

1. **What you did**, step by step, so we can reproduce it.
2. **Device and browser** — "iPhone 13, Safari" is enough.
3. **A screenshot**, especially for anything about a diagram or layout.
4. For a wrong answer or bad content: **which unit, which question or
   section**, and what you think it should say.

Content and safety issues jump the queue over anything cosmetic.
