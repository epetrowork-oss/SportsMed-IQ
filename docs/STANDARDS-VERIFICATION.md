# Standards catalog — verification record

# ✅ DONE 2026-08-16. All 14 entries verified against the official CDE documents.

`src/content/standards.json` maps SportMedIQ units to California standards. Every
entry now carries `"verified": true`, checked line by line against the two
official PDFs (supplied by the owner; `cde.ca.gov` is blocked from the
development container, so this could not be done from a session until they
arrived).

**This was not a rubber stamp. 7 of 8 CTE entries and 3 of 6 CA-HE entries were
wrong**, and the three most relevant 7-8 standards in the entire document were
missing from the catalog.

## Source documents

1. **CTE Model Curriculum Standards — Health Science & Medical Technology**
   (Patient Care pathway "B" standards + anchor standards)
2. **Health Education Content Standards for California Public Schools (2008)**,
   Grades Seven and Eight, *Injury Prevention and Safety*

---

## What was wrong — CTE (7 of 8 entries)

The drafted text was paraphrase, and **the paraphrase drifted consistently in one
direction: toward injury language**, making each standard look like a better fit
for this app's content than the official wording supports. That is precisely the
failure mode an unverified catalog has, and it is the reason this pass mattered.

| Code | Drafted (wrong) | Official (now used) |
|---|---|---|
| **Anchor 6.0** | "…health and safety practices, policies, and procedures, **including the prevention of injury**" | "…health and safety procedures, regulations, and personal health practices **and determine the meaning of symbols, key terms, and domain-specific words and phrases**…" — **contains no injury-prevention language at all** |
| **B1.0** | "…prevention, diagnosis, pathology, treatment, **and rehabilitation**" | "…prevention, diagnosis, pathology, and treatment." — **no rehabilitation** |
| **B2.4** | "…diagnosis and treatment of disease and **injury**" | "…disease and **disorders**." |
| **B1.2** | "Understand the range **of care from** prevention **through** diagnosis…" | "Understand the range **between** prevention, diagnosis, pathology, and treatment **procedures**." |
| **B2.3** | "Recognize common **diseases** and disorders…" | "Recognize common **disease** and disorders of the human body." |
| **B4.5** | "…connect patient data to **the** appropriate system of care" | "…connect patient data to appropriate system of care." |
| **B5.0** | "…appropriate terminology in **health care**" | "…appropriate terminology in **the health care setting**." |
| B2.0 | — | ✅ already exact |

---

## What was wrong — CA-HE 7-8 (3 of 6 entries had no real counterpart)

All six drafted entries carried `officialCode` values reading *"exact sub-number
TBD"*. Checked against the real Grades Seven and Eight *Injury Prevention and
Safety* list:

**Three mapped cleanly and are now resolved:**

| Entry | Real code | Official text |
|---|---|---|
| `Environment` | **1.11.S** | "Identify ways to prevent climate-related physical conditions such as exhaustion, sunburn, heat stroke, and hypothermia." |
| `ValidInfo` | **3.1.S** | "Analyze sources of information regarding injury and violence prevention." |
| `SafetyPlan` | **6.2.S** | "Create a personal-safety plan." |

**Three corresponded to no 7-8 standard and were replaced.** The drafted text was
plausible-sounding but invented — the real Standard 5 (Decision Making) at this
grade band is entirely about gangs, dating violence, bullying and assault, not
injury.

| Removed (invented) | Replaced with | Why |
|---|---|---|
| `SelfOthers` — *"Analyze the role of self and others in causing or preventing injuries"* | **`SportsInjury` (1.15.S)** | The genuine sports-injury standard for this band |
| `Decisions` — *"Use a decision-making process to determine a safe course of action in risky situations"* | **`TellAdult` (4.1.S)** | "Report to a trusted adult situations that could lead to injury or harm" — what these units actually teach |
| `Behaviors` — *"Analyze personal behaviors that may lead to injuries or cause harm"* | folded into **`SportsInjury`** | No 7-8 equivalent exists |

---

## The standard that should have been there all along

**1.15.S — "Explain ways to reduce the risk of injuries (including oral injuries)
that can occur during sports and recreational activities."**

This is *the* sports-injury standard for grades 7-8 in the California framework,
it names oral injuries explicitly (this app has a dental-trauma strand), and it
was **absent from the catalog entirely**. It is now joint most-cited at **17
units** (see the correction section below — it was 18 until a bad alignment on
`sports-psychology-ms` was removed).

Two more relevant standards were also missing and have been added:

- **7.1.S** — "Practice first aid and emergency procedures." Initially added to
  8 units, then **cut to 4** — see the correction section below. It applies only
  where the student actually performs a procedure: `wound-care-ms`,
  `dental-facial-trauma-ms`, `ankle-sprain-ms`, `emergency-action-plan-ms`.
- **4.1.S** — "Report to a trusted adult…", which is the spine of every 7-8 unit.

---

## Final state

| Entry | Code | Units |
|---|---|---|
| `CAHE.7-8.S.SportsInjury` | 1.15.S | 17 |
| `CAHE.7-8.S.TellAdult` | 4.1.S | 17 |
| `CAHE.7-8.S.SafetyPlan` | 6.2.S | 10 |
| `CAHE.7-8.S.FirstAid` | 7.1.S | 4 |
| `CAHE.7-8.S.ValidInfo` | 3.1.S | 3 |
| `CAHE.7-8.S.Environment` | 1.11.S | 2 |

### ⚠ The first mapping pass was mechanical, and mechanical was wrong

The remap above initially just swapped each retired id for its replacement and
tagged first aid by topic. Codex flagged three bad alignments on PR #62; sweeping
all 18 units rather than fixing only those three found **eight** units needing
correction.

**7.1.S was over-applied to half the units that got it.** The standard says
*"Practice first aid and emergency procedures"* — it requires the student to
actually **do** something. The 7-8 band is deliberately built the opposite way,
and says so in its own words:

- `heat-illness-ms` — *"your job is simple: recognize it and tell a trusted adult right away. You are not expected to decide how serious it is."*
- `fractures-dislocations-ms` — *"your job has two parts, and that's it: Do not touch it, move it, or try to straighten it."*
- `eye-injuries-ms` — *"Your job is not to fix an eye injury."* Even its rinse is *"An adult can also gently rinse the eye."*
- `cold-exposure-ms` — *"your job in cold weather isn't to treat anyone."*

All four lost the tag. **It was kept on the four units that genuinely have the
student perform a procedure**: `wound-care-ms` (its own section is headed
*"self-care steps — your own scrape"*), `dental-facial-trauma-ms` (tooth handling
and a 10-minute nosebleed pinch), `ankle-sprain-ms` (*"know the basic first
steps"* — rest, ice 15-20 min wrapped, elevate), and `emergency-action-plan-ms`
(the student practises a defined role in an emergency response, which is the
"emergency procedures" half of the standard).

**1.15.S was wrong on `sports-psychology-ms`.** The mechanical swap gave a
mental-health unit a *reduce-physical-sports-injury* alignment. Its content is
feelings (×19), listening (×8) and trusted adults (×16), with physical injury
appearing only as context. Removed; the unit keeps `TellAdult` and `ValidInfo`,
which fit it exactly.

**4.1.S was under-applied.** The remap only converted units that had carried the
retired `Decisions` id, so five units that teach reporting heavily but never had
that tag were missed: `cold-exposure-ms` (23 reporting cues), `heat-illness-ms`
(11), `skin-conditions-ms` (13), `overuse-injuries-ms` (8), `hydration-nutrition-ms`
(5). All five added — `TellAdult` is now joint-most-used at 17.

**The lesson:** a standards remap cannot be done by find-and-replace. Each unit
has to be read against what the standard asks the student to *do*, and this band
in particular is built around explicitly *not* doing things.

**14 catalog entries, all `verified: true`. 161 references across 54 units**
(was 159; the dedupe removed 6 duplicate references where two invented entries
both collapsed onto 1.15.S, and first-aid tagging added 8). Every 7-8 unit
carries at least one standard. `npm run validate:content` — 54 files, 0 errors.

⚠ **Note on scope.** Only the **grades 7-8** Health Education standards were
verified, because that is the only Health Ed band the catalog uses. The 9-10 and
11-12 units are tagged against CTE only. If you ever want those bands
double-tagged with Health Ed as well, the grades 9-12 *Injury Prevention and
Safety* section of the same 2008 document is the place to look — it was not
examined in this pass.

⚠ **What this does not cover.** Verification confirms each code exists and each
text is quoted correctly. **It does not confirm that the mapping from unit to
standard is pedagogically right** — that is a teacher's judgment. The remapping
above was done on the principle the owner set on 2026-08-16: *change the standards
alignment to fit the content, not the content to fit the standards.*
