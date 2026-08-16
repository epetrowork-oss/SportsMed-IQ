# Documents to pull from the ChatGPT side and upload here

**Why this list exists.** Everything below is blocked from the development
container — the proxy returns a 403 at the gateway for `aao.org`, `aafp.org`,
`nata.org`, `pmc.ncbi.nlm.nih.gov`, `journals.sagepub.com`, `link.springer.com`
and `cde.ca.gov` alike (tested 2026-08-15). Nothing here can be checked from a
session. **Upload the PDFs and every item below closes.**

Ten documents. They resolve **three separate open threads at once**: the
claim-level sourcing backlog, the standards verification pass, and two of the
content decisions being held for sign-off.

⚠ **These are candidates, not confirmed sources.** Seven of them come from the
reference list in `docs/CONTENT-REVIEW.md`, which mapped sources to claims
without anyone opening the documents. That is exactly the failure the warm-up
citations were stripped for on PR #47 and only restored once full bibliographic
records came back. **Nothing here gets attached to a unit until the PDF has been
searched against the specific sentence it is meant to support.** If a document
turns out not to cover its claim, the claim stays on the uncited table — that
outcome is fine and has happened before (the 2009 IOC textbook was declined for
exactly this reason).

---

## A. The eight uncited claims (7 documents)

Each row names the claim, the unit and band it lives in, and what the document
has to actually say for the citation to stick.

| # | Document | Closes | Must contain |
|---|---|---|---|
| 1 | **WMS, *Clinical Practice Guidelines for the Out-of-Hospital Evaluation and Treatment of Accidental Hypothermia: 2019 Update*** | cold-exposure **11-12**, two claims | The **"1-10-1" naming** for cold-water immersion, and a **conduction rate for water vs air** (the unit says ~25×) |
| 2 | **WMS, *Clinical Practice Guidelines for the Prevention and Treatment of Frostbite: 2024 Update*** | cold-exposure **11-12** | **Frostnip classified as a non-freezing injury.** Note the ACSM 2021 statement already cited never uses the word "frostnip", and sources genuinely differ on whether it is mildest frostbite or a separate entity. If this one is also silent, the claim stays uncited |
| 3 | **AAO *EyeNet*, *Treating Acute Chemical Injuries of the Cornea*** | eye-injuries **9-10 and 11-12** | **Flush duration** (the units teach 15–20 minutes) and **mandatory medical follow-up**. The two sources already on this strand have **0 hits** for "chemical", "alkali" or "acid burn" |
| 4 | **AAFP, *Management of Epistaxis*** | dental-facial-trauma **7-8 and 9-10** | **Nosebleed pinch duration and technique.** The NATA dental statement already cited has **0 hits** for "nosebleed" or "epistaxis". Also worth checking against the app's own ~10-minute figure |
| 5 | **Journal of ISAKOS 2021, *Taping and bracing in the prevention of ankle sprains: current concepts*** | taping-wrapping **11-12** | **Rigid tape's mechanical restriction decaying during activity** (the unit says much of it is gone within ~20–30 min). The NATA ankle statement's reference list was checked and does not address decay |
| 6 | **Shellock & Prentice, *Warming up and stretching for improved physical performance and prevention of sports-related injuries*, Sports Med 1985** | warmup-injury-prevention **11-12** | A **target muscle-temperature rise** (the unit says ~1–2 °C meaningfully shifts tissue properties). ⚠ If this lands, it becomes the **oldest source in the project** at 1985 — worth a look for something more recent first |
| 7 | **NATA, *Position Statement: Environmental Cold Injuries* (Cappaert et al.)** | cold-exposure, backup for row 2 | **Injury-type distinctions** — may cover the frostnip classification if the WMS frostbite guideline does not |

**The eighth claim has no candidate.** skin-conditions **7-8 and 9-10** tell
students *"if the blister is still closed, leave it alone."* Neither NATA
statement on that strand supports it — *Skin Diseases* is about infectious
disease, and *Acute Skin Trauma* runs the other way ("unbroken" appears 0 times;
its only roof guidance is a **clinician** performing sharp debridement). That is
an audience difference, not a contradiction, and the student-facing rule stands —
it is simply uncited. **If you have any sports first-aid text covering friction
blister care, that would close the last one.**

---

## B. Standards verification (2 documents)

This is decision #4 — "verify everything". It needs the same treatment: `cde.ca.gov`
is blocked, so I cannot check a single code from here.

| # | Document | Used for |
|---|---|---|
| 8 | **CTE Model Curriculum Standards — Health Science & Medical Technology**, Patient Care pathway ("B" standards) + the 11 cross-sector anchor standards | Every **9-10 and 11-12** unit's `standards` entries |
| 9 | **Health Education Content Standards for California Public Schools (2008)**, grades 7-8, *Injury Prevention and Safety* content area | Every **7-8** unit's entries |

With these I can do the whole pass mechanically: confirm each `officialCode`
exists and is exact, replace paraphrased `text` with official wording, fill the
several CA-HE entries currently marked **"TBD"**, flip `verified: false → true`
per entry, and check the four standards `docs/STANDARDS-VERIFICATION.md` expects
to exist but could not confirm (an emergency-response/first-aid standard, a
rehabilitation standard, 9-12 Health Ed injury-prevention, and a 7-8 first-aid
essential concept).

**Worth knowing before you pull these:** the app currently labels every alignment
a *draft*, and `TESTERS.md` tells teachers so. Verification removes that caveat —
it is the difference between "we think this maps to B4.5" and telling a teacher it
does.

---

## C. Settles two held content decisions (1 document)

| # | Document | Settles |
|---|---|---|
| 10 | **IADT, *Guidelines for the Management of Traumatic Dental Injuries: 2. Avulsion of Permanent Teeth* (Fouad et al., Dental Traumatology, 2020)** | **Both** dental items below |

This single guideline resolves the two `[NEEDS-EVAN]` items I am holding:

- **Student reinserting an avulsed permanent tooth** (9-10). The unit currently
  tells the student to *"try to reinsert it into the socket immediately."* That
  matches IADT guidance for a **bystander**, but it is the same class of question
  as the 102°F call you just decided — how much clinical action belongs in a
  student's hands. The guideline's own wording on who should replant, and under
  what conditions, is what should decide it.
- **Tooth storage ranking — saliva above sterile saline** (11-12 quiz Q2).
  Sources genuinely conflict on this ordering. **This one may require re-keying a
  quiz answer**, so it should not be changed on anything less than the primary
  guideline.

---

## What happens when these land

Upload any subset — they are independent, and partial progress is still useful.
Per document I will: search it against the exact sentence it is meant to support,
report what it does and does not cover (with hit counts, the way the REDs and
cold-exposure checks were done), attach it only to the bands that actually teach
the claim, and update the uncited-claims table in `docs/HANDOFF.md`.

For the two standards documents I will do the full verification pass and flip the
flags, then re-run `npm run validate:content`.
