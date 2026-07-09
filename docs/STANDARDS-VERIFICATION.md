# Standards catalog — human verification checklist

`src/content/standards.json` maps SportMedIQ units to California standards.
Every entry currently has `"verified": false` because the catalog was
drafted from secondary sources — the official CDE documents were not
reachable from the development environment. **Until an entry is verified,
the app labels it a draft alignment.** This pass needs a teacher with the
official documents (10-20 minutes).

## The two source documents

1. **CTE Model Curriculum Standards — Health Science & Medical Technology**
   (Patient Care pathway, the "B" standards, plus the 11 anchor standards):
   <https://www.cde.ca.gov/ci/ct/sf/documents/healthmedical.pdf>
2. **Health Education Content Standards for California Public Schools
   (2008)** — grades 7-8, "Injury Prevention and Safety" content area (S):
   <https://www.cde.ca.gov/be/st/ss/documents/healthstandmar08.pdf>

## What to check, per entry in `standards.json`

- [ ] The `officialCode` exists in the document and is exactly right
      (several CA-HE entries have sub-numbers marked "TBD" — fill in the
      real ones, e.g. `1.3.S`).
- [ ] The `text` matches the official wording (feel free to replace the
      paraphrase with the exact official text).
- [ ] Flip `"verified": false` → `true` once both are confirmed.

## Likely-relevant standards NOT yet in the catalog (add if they exist)

These were expected but could not be confirmed from secondary sources —
check the Patient Care pathway list for:

- [ ] An **emergency response / first aid** pathway standard (several
      units teach EAP, CPR/AED awareness, bleeding control — a direct
      alignment would be stronger than the generic B1.0).
- [ ] A **rehabilitation / therapeutic response** standard (return-to-play
      and rehab content).
- [ ] Grades **9-12 Health Ed** Injury Prevention & Safety standards, if
      you want the 9-10/11-12 bands double-tagged with Health Ed in
      addition to CTE.
- [ ] The 7-8 **first aid** essential concept (wound care, ankle sprain
      7-8 units) — the 2008 doc likely has one; add its real code.

## Added 2026-07-09 for the professional-skills strands

Five more CTE anchor standards (2.0 Communications, 3.0 Career Planning,
5.0 Problem Solving, 8.0 Ethics & Legal, 9.0 Leadership & Teamwork) were
added for the content expansion's clinical-skills and profession strands
(careers, legal/ethical, documentation, sports-medicine team, etc.). The
eleven anchor standards are shared across all CA CTE sectors, so the
codes are near-certain, but verify the paraphrased text against the HSMT
document like every other entry.

After editing, run `npm run validate:content` (it checks every unit's
standards references against the catalog) and commit.
