# Content accuracy review — teacher checklist

Every unit in `src/content/units/` was LLM-authored. The automated gate
(`npm run validate:content`) checks structure, quiz integrity, and schema —
**not medical accuracy**. This document is the human pass: the objective,
checkable claims from all 54 units, extracted and deduplicated so a
sports-medicine teacher can verify them efficiently before the content is
treated as student-ready.

## How to use this document

- Work **strand by strand** (one strand = the same topic at all three grade
  bands). Claims that appear in more than one band are listed once with
  every location — verify the fact once, and it's checked everywhere.
- Location shorthand: `9-10 §"Heading"` = that band's unit, that lesson
  section; `quiz Q3` = 3rd quiz question; `flashcard "Front"` = the card
  with that front text. Band ↔ file mapping: `7-8` = `<strand>-ms.json`,
  `9-10` = `<strand>.json`, `11-12` = `<strand>-adv.json`.
- **⚠ marks the claims to check first** — the ones where wrong guidance
  could plausibly cause harm. If you only have 30 minutes, do every ⚠ line
  in the "Do these first" strands below.
- When a claim is wrong or you want it phrased differently, add a line
  directly under it: `> FIX: <what it should say>`. Don't edit the unit
  JSON by hand unless you want to — hand this file back to a Claude
  session and it will apply every FIX, run the validator, and re-verify in
  the browser.
- Tick a unit's checkbox when you're satisfied with it; tick-marks are the
  record of how far the pass has gotten.
- "Answer-key spot-checks" flag quiz questions whose keyed answer a
  knowledgeable student could argue with (a defensible distractor, or a
  "best answer" that leans on a simplification). Judgment call: reword,
  re-key, or leave as is.

## What's already been checked (don't re-do)

- `npm run validate:content` is green with zero warnings: schema, quiz
  answer integrity and position spread, flashcard counts, standards
  references, grade-band/strand uniqueness.
- The **sports-psychology crisis content** (suicide/self-harm disclosure,
  all three bands) was read word-for-word during authoring review and
  holds the recognize/support/refer line. Its claims are still listed
  below — a second set of eyes on that material is welcome, not wasted.
- Each unit was checked at authoring time for grade-band fit (7-8 genuinely
  simpler, 11-12 genuinely deeper) — that's a pedagogy check, not an
  accuracy check, which is why this pass exists.
- The 13 original `9-10` units (the pre-spiral core) went through more
  review rounds than the 41 spiral units and already had one quiz error
  caught and fixed (hydration fluid-replacement range). Their claims are
  included for completeness; expect fewer surprises there.

## Flags raised during extraction — start here

The extraction pass itself turned up a handful of items worth your
attention before anything else. Each also appears in its strand's list
below; this is the short version.

**Internal inconsistencies to reconcile (pick one standard per topic):**

- **Tourniquet placement is taught two different ways** — 9-10 wound-care
  says "2-3 inches above the wound (not over a joint)"; 11-12 says "high
  and tight," as close to the limb/torso junction as possible. Both exist
  in real-world guidance (classic first-aid vs. Stop the Bleed / field
  care); students should get one consistent answer.
- **Heat-stroke cooling stop-target drifts across bands** — 9-10 says cool
  "until core temperature drops to about 102°F"; 11-12 says "stop active
  cooling around 100-102°F." Also, the humid-day comparison uses a dry
  95°F day in 9-10 but a dry 98°F day in 11-12.
- **Nosebleed pinch duration drifts** — "about 10 minutes" (dental 7-8,
  wound-care) vs. "10-15 minutes, re-check at 15-20" (dental 9-10).
- **10%-per-week rule vs. ACWR** — 9-10 overuse presents the 10% rule as a
  reasonable guardrail; 11-12 deliberately critiques it in favor of
  acute:chronic workload ratio. Intentional spiral build, but confirm the
  two bands don't leave students with conflicting takeaways.

**Claims flagged as possibly overstated or contested — verify carefully:**

- Second impact syndrome stated with strong certainty (mechanism,
  "nearly exclusively adolescents," very high mortality) — the literature
  is more contested than the prose suggests (concussion 11-12).
- "Every U.S. state has a law requiring removal + written clearance" —
  broadly true for youth concussion statutes, but scope varies by state
  (concussion 9-10/11-12).
- 9-10 dental instructs the student first-aider to **personally reinsert
  an avulsed permanent tooth** — matches dental-trauma guidance but is
  aggressive for this audience's scope of practice; wants explicit
  sign-off.
- Tooth storage hierarchy keys **saliva above sterile saline** — some
  references rank them the other way (dental 11-12 quiz Q2).
- Female ACL tear rate "2-8x" — unusually wide range; high end may be
  overstated (knee-acl).
- Shoulder dislocation recurrence "70-90% under age 20" — high-end figure,
  cohort-dependent (shoulder-injuries 11-12).
- Caffeine flatly called "a mild diuretic" — current sports-nutrition
  consensus is more nuanced for habitual users (hydration 9-10).
- Commotio cordis "10-30 millisecond" window, myositis ossificans 2-4 week
  timelines, tape restriction fading "within 20-30 minutes," FIFA 11+
  "reduce injuries by one-third to one-half" — precise, quotable numbers
  worth confirming against sources.
- Minor: warmup 11-12 renders "1-2°C" as "about 2-4°F" (precisely
  1.8-3.6°F).

## Action items — labeled for the GPT/Claude working split

The flags above sort into three buckets by **who should act**. The guiding
rule: an LLM may apply an *objective* fix that a cited source already
settles, but it must **not** decide a medical, legal, or scope-of-practice
question by rewriting the claim — those are the whole reason this document
routes to a human. Labels:

- **`[GPT-READY]`** — objective or mechanical, the fix is fully specified
  and (where relevant) backed by a source in the References section. Safe
  for a GPT/Claude pass to apply directly, then `npm run validate:content`
  + `npm run build` + a browser spot-check. Safety-critical wording still
  gets an Evan skim before it ships.
- **`[NEEDS-EVAN]`** — a medical / legal / scope-of-practice judgment. Do
  **not** have an LLM decide it. Evan (or a teacher) picks the direction;
  once decided, applying it becomes a `[GPT-READY]`-style mechanical edit.
- **`[LOW-PRI]`** — precise numbers the sourcing didn't contradict; a quick
  confirm-against-source, not a known problem.

### `[GPT-READY]` — spec'd fixes a GPT/Claude pass can apply

1. **Tourniquet placement — make both bands consistent.** Source resolved
   it: ACS Stop the Bleed teaches "2-3 inches above the wound" as the
   *default*, with "high and tight" reserved for active-threat or
   untrained-responder scenes. Update `wound-care-adv` (11-12) so it leads
   with the 2-3-inch default and frames high-and-tight as the exception,
   matching `wound-care` (9-10). *(Safety-critical — Evan skims the
   reworded callout.)* Source: wound-care ref #1.
2. **Female ACL ratio "2-8x" → sourced range.** Change to ~2-6x (Montalvo
   2019 meta-analysis reports ~2-5.5x). Locations: `knee-acl` (9-10)
   §"How ACL tears happen" + quiz Q8 + flashcard "ACL risk in female
   athletes"; `knee-acl-adv` (11-12) §"The female athlete disparity".
   Source: knee-acl ref (Montalvo 2019).
3. **Caffeine "mild diuretic" — soften the flat claim.** Zhang 2015
   meta-analysis: caffeine's diuretic effect is minor and negated by
   exercise. Reword `hydration-nutrition` (9-10) §"Water vs. sports drinks"
   callout to reflect that nuance rather than a blanket "diuretic." Source:
   hydration ref #7.
4. **Heat-stroke cooling stop-target — align the two bands.** `heat-illness`
   (9-10) says cool "until ~102°F"; `heat-illness-adv` (11-12) says "stop
   around 100-102°F." Pick one phrasing consistent with the NATA statement
   and use it in both. *(Safety-critical — Evan approves the value.)*
   Source: heat-illness ref #1 (NATA EHI 2015).
5. **Heat humid-day comparison temp.** Illustrative only, no correctness
   stake: 9-10 compares a humid day to a "dry 95°F day," 11-12 to a "dry
   98°F day." Make them the same number.
6. **Nosebleed pinch duration — one value across strands.** Drifts between
   "about 10 minutes" and "10-15 minutes, re-check at 15-20"
   (`dental-facial-trauma-ms`/`-`/wound-care). Pick one (source guidance is
   ~5-15 min continuous) and use it everywhere.
7. **°C/°F rounding (trivial).** `warmup-injury-prevention-adv` (11-12)
   §"Why warm tissue survives more" renders "1-2°C" as "about 2-4°F";
   precise is 1.8-3.6°F. Change to "about 2-3.5°F" (or state °C only).

### `[NEEDS-EVAN]` — medical/legal/scope calls; don't let an LLM decide

1. **Second impact syndrome certainty** (`concussion-adv`, 11-12) — the prose
   states mechanism, "nearly exclusively adolescents," and very high
   mortality with more certainty than the contested literature supports.
   Evan decides how much to hedge; then it's a mechanical reword.
2. **Student reinserting an avulsed permanent tooth** (`dental-facial-trauma`,
   9-10) — matches IADT guidance but is aggressive for this audience's
   scope of practice. Needs explicit teacher sign-off to keep, soften, or
   cut.
3. **Tooth storage: saliva ranked above sterile saline** (`dental-facial-
   trauma-adv`, 11-12 quiz Q2) — sources genuinely conflict. Teacher picks
   the ranking; may require re-keying the quiz answer.
4. **Shoulder recurrence "70-90% under age 20"** (`shoulder-injuries-adv`,
   11-12) — high-end and cohort-dependent. Confirm against the cited KSSTA
   review; keep, narrow, or re-source.
5. **"Every U.S. state has a law…"** (`concussion` 9-10 / `-adv` 11-12) —
   broadly true for youth concussion statutes but scope varies. Evan
   decides whether to soften to "nearly every state" etc.
6. **10%-rule vs. ACWR across bands** (`overuse-injuries` 9-10 vs `-adv`
   11-12) — likely an intentional spiral build, but confirm the two bands
   don't leave students with conflicting takeaways. Pedagogy call.

### `[LOW-PRI]` — confirm-against-source, not known problems

- Commotio cordis "10-30 ms" window (`emergency-action-plan-adv`),
  myositis ossificans 2-4 week timelines (`muscle-strains-adv`), tape
  restriction fading "within 20-30 minutes" (`ankle-sprain-adv` /
  `taping-wrapping-adv`), FIFA 11+ "reduce injuries by one-third to
  one-half" (`warmup-injury-prevention-adv`). The sourcing pass did not
  contradict these; treat as a quick confirm against the cited source.

**Working split, so the two of us don't collide:** GPT can take the
`[GPT-READY]` list as a spec (validate + build + browser-verify each, small
PR, Evan skims the safety-critical wording). The `[NEEDS-EVAN]` and the full
219-claim strand-by-strand pass stay with Evan / a teacher — that judgment
is the point of this document and isn't an LLM's to make. When Evan settles
a `[NEEDS-EVAN]` item, note the decision as a `> FIX:` line under that claim
below and it becomes GPT-applicable.

## Suggested order

1. **Do these first (safety-critical):** concussion, heat-illness,
   emergency-action-plan, cold-exposure, sports-psychology, wound-care,
   fractures-dislocations, eye-injuries, dental-facial-trauma,
   skin-conditions.
2. **Then the rest:** ankle-sprain, knee-acl, muscle-strains,
   overuse-injuries, shoulder-injuries, hydration-nutrition,
   taping-wrapping, warmup-injury-prevention.

The strand blocks below are listed in that order. Totals: 219 claims
across 18 strands (66 marked ⚠), one answer-key spot-check. A
**References by strand** section at the very bottom maps ~128
authoritative sources to the claim numbers they cover, so a claim and the
document to check it against sit one page-jump apart.

Rough budget: ~10 minutes per strand doing every claim, well under that if
you triage by ⚠ first. The whole pass is doable in 2-3 sittings, and each
strand is independently useful — partial progress still de-risks those
units.

**Separate, smaller pass:** standards alignment verification (10-20 min
against the official CDE PDFs) lives in `docs/STANDARDS-VERIFICATION.md`.

---

# Strand checklists

## concussion

- [ ] 7-8 — "Concussions: What Every Athlete Should Know" (`concussion-ms`)
- [ ] 9-10 — "Concussions" (`concussion`)
- [ ] 11-12 — "Concussions: Assessment and Recovery Science" (`concussion-adv`)

**Claims to verify**

1. "A concussion does not require a direct hit to the head — a hard hit to the body can also shake the brain enough to cause one." — 7-8 §"What is a concussion?", quiz Q2; 9-10 §"What a concussion is", quiz Q5; 11-12 §"Biomechanics of a concussive hit"
2. "Loss of consciousness occurs in fewer than 10% of concussions; most concussed athletes never black out." — 9-10 §"What a concussion is", quiz Q2, flashcard f2
3. ⚠ "Second impact syndrome: a second hit before the brain heals can cause loss of cerebral blood vessel autoregulation and rapid, often fatal brain swelling; adolescents are the highest-risk/nearly exclusive group; reported mortality is extremely high and near-fatal cases usually leave permanent disability." — 7-8 §"Why you should never hide symptoms"; 9-10 §"Second impact syndrome", quiz Q4; 11-12 §"Second impact syndrome", quiz Q4
4. ⚠ "Every U.S. state has a law requiring same-day removal from play and written clearance from a licensed healthcare provider before return (the 'three pillars': education, removal, clearance)." — 9-10 §"Sideline response"; 11-12 §"Policy and the athletic training student's role", quiz Q7
5. ⚠ "Return-to-play stepwise progression — light aerobic exercise → sport-specific exercise → non-contact drills → full-contact practice → competition — with each stage at least 24 hours apart and symptom-free." — 9-10 §"Recovery and return to play", quiz Q6; 11-12 §"Recovery science: return-to-play and return-to-learn", quiz Q5
6. "Most concussions resolve in 1-4 weeks, with adolescents typically taking longer than adults." — 9-10 §"Recovery and return to play"; 11-12 §"Recovery science...", flashcard f11 (PPCS)
7. "Recovery starts with 24-48 hours of relative rest — light activity is fine; total dark-room isolation is outdated." — 9-10 §"Recovery and return to play"
8. ⚠ "Rotational/angular forces are actually a more important driver of concussion injury than straight-line (linear) force." — 11-12 §"Biomechanics of a concussive hit"
9. "A concussion is a functional injury, not a structural one — standard CT/MRI look normal, so imaging is not used to diagnose it; diagnosis is clinical." — 11-12 §"Biomechanics of a concussive hit", flashcard f1
10. "Neurometabolic cascade: potassium leaves cells and calcium floods in, ATP-dependent pumps work overtime causing a glucose-demand spike while cerebral blood flow actually drops (the 'energy crisis'), a mismatch that can persist days to weeks — outlasting symptoms." — 11-12 §"The neurometabolic cascade", quiz Q1
11. "Maddocks questions are used instead of standard orientation questions ('what's today's date?') because orientation answers are overlearned and can be recalled correctly even with a concussion." — 9-10 §"Observable signs on the field"; 11-12 §"Sideline assessment...", quiz Q2
12. "SCAT-style symptom inventory covers roughly 22 symptoms." — 11-12 §"Sideline assessment: what a SCAT-style evaluation covers"
13. "CTE can currently only be diagnosed after death by examining brain tissue directly; there is no validated way to diagnose it in a living person, and the exact dose-response relationship is not yet established." — 11-12 §"The honest long view on repetitive head impacts"
14. "Baseline testing (e.g., ImPACT) measures memory, reaction time, and balance before the season so post-injury scores can be compared to the athlete's own normal rather than a population average." — 9-10 §"Recovery and return to play" callout, quiz Q8

## heat-illness

- [ ] 7-8 — "Beating the Heat: Staying Safe in Hot Weather" (`heat-illness-ms`)
- [ ] 9-10 — "Heat Illness" (`heat-illness`)
- [ ] 11-12 — "Exertional Heat Illness: Physiology and Prevention Science" (`heat-illness-adv`)

**Claims to verify**

1. ⚠ "Exertional heat stroke is one of the leading causes of sudden death in high school sports, and it is almost always survivable when recognized and cooled immediately." — 9-10 §"Why heat illness matters"
2. "Heat exhaustion: core temperature typically below 104°F with normal/only mildly altered mental status. Heat stroke: core temperature above 104°F WITH central nervous system dysfunction — this is the dividing line." — 9-10 §"Heat exhaustion", §"Heat stroke — a true emergency", quiz Q3, Q8; 11-12 §"The full spectrum...", quiz Q8
3. "Heat stroke victims may still be sweating heavily — skin can be wet or dry; sweating never rules out heat stroke." — 7-8 §"Heat stroke: the most dangerous sign"; 9-10 §"Heat stroke — a true emergency", quiz Q1; 11-12 §"The full spectrum...", flashcard f7
4. ⚠ "Definitive treatment for exertional heat stroke is immediate whole-body cold water immersion ('cool first, transport second'); survival is excellent when cooling starts within 10 minutes." — 9-10 §"Heat stroke — a true emergency", quiz Q2; 11-12 §"Evidence-based cooling: cool first, transport second"
5. ⚠ "Clinical cooling target: get core temperature below about 104°F within roughly 30 minutes of collapse; stop active cooling around 100-102°F to avoid overshoot into hypothermia." — 11-12 §"Evidence-based cooling...", flashcard f8 (9-10 states cooling continues "until core temperature drops to about 102°F" — note the slightly different threshold across bands)
6. "Rectal temperature is the clinical gold standard for core temperature in suspected EHS; oral, tympanic, axillary, and skin-surface measurements are all unreliable in this setting." — 11-12 §"Why temperature is measured the way it's measured", quiz Q5
7. "Losing more than 2% of body weight in a session indicates significant dehydration and should prompt rehydration before the next session; losses of 3-5%+ are a bigger flag." — 9-10 §"Prevention", quiz Q6, Q8; 11-12 §"Prevention science...", flashcard
8. "Cold-water immersion is the gold-standard cooling method because it maximizes conductive/convective heat transfer across the whole body; spot cooling (ice bags at neck/armpits/groin or towels) is a distant, much slower fallback." — 9-10 §"Heat stroke — a true emergency" callout; 11-12 §"Evidence-based cooling...", quiz Q6
9. "Exertional sickling in athletes with sickle cell trait presents as sudden diffuse muscle weakness/pain (not cramping), with mental status usually staying normal (unlike EHS); it does not respond to the stretching/sodium approach used for cramps and is a medical emergency." — 11-12 §"Differential thinking...", quiz Q3
10. "Exercise-associated hyponatremia can mimic heat exhaustion/EHS, but the tell is a normal or only mildly elevated temperature and body weight that stayed the same or went UP; giving more water makes it worse." — 11-12 §"Differential thinking...", quiz Q4
11. "WBGT (wet bulb globe temperature) combines air temperature, humidity, sun, and wind, weighted heavily toward humidity, and is a better risk gauge than air temperature alone." — 9-10 §"How the body handles heat" callout, quiz Q4; 11-12 §"Prevention science...", quiz Q1
12. "A humid ~88°F day can be more dangerous than a dry, hotter day because humidity blocks evaporative cooling (shrinks the vapor-pressure gradient)." — 9-10 §"How the body handles heat" (compares to a dry 95°F day); 11-12 §"How the body actually sheds heat" (compares to a dry 98°F day — note the inconsistent comparison temperature between bands)

## emergency-action-plan

- [ ] 7-8 — "What to Do in an Emergency" (`emergency-action-plan-ms`)
- [ ] 9-10 — "Emergency Action Plans & CPR/AED Awareness" (`emergency-action-plan`)
- [ ] 11-12 — "Running the Emergency: EAP Design and Team Response" (`emergency-action-plan-adv`)

**Claims to verify**

1. "Survival from sudden cardiac arrest drops by roughly 7-10% for every minute defibrillation is delayed (with no bystander action)." — 9-10 §"Why every venue needs a plan before it needs one"; 11-12 §"Why a young athlete's heart stops", quiz Q5
2. ⚠ "Hands-only CPR: 100-120 compressions per minute, about 2 inches deep, center of the chest/lower half of breastbone, full recoil between compressions; switch rescuers every 2 minutes." — 9-10 §"Hands-only CPR", quiz Q5; 11-12 §"High-quality CPR and AED nuances"
3. "Agonal gasping/snorting/gurgling sounds after collapse are NOT normal breathing — they are a sign of cardiac arrest, not evidence of adequate breathing, and should not be waited out." — 7-8 §"What a real emergency looks like", quiz Q3; 9-10 §"Recognizing sudden cardiac arrest", quiz Q2
4. "An AED analyzes the heart rhythm itself and will only advise/deliver a shock for a 'shockable' rhythm — a rescuer cannot cause harm by attaching and using it correctly." — 7-8 §"What is an AED?", quiz Q6; 9-10 §"Using the AED", quiz Q6
5. "Getting an AED attached and a shock delivered within about 3-5 minutes of collapse dramatically increases survival." — 9-10 §"Using the AED"
6. ⚠ "AED pad placement: one pad upper-right chest below the collarbone, one pad lower-left ribcage/side of chest." — 9-10 image/diagram description; 11-12 §"High-quality CPR and AED nuances"
7. "Chest compression fraction target: above 60%, with well-run teams pushing above 80%." — 11-12 §"High-quality CPR and AED nuances"
8. ⚠ "Commotio cordis: cardiac arrest from a blunt, relatively low-energy chest blow landing during a roughly 10-30 millisecond vulnerable window in the heart's electrical cycle, occurring in a structurally normal heart." — 11-12 §"Why a young athlete's heart stops", quiz Q4
9. "Structural vs. electrical causes of SCA in young athletes: hypertrophic cardiomyopathy and anomalous coronary arteries (structural) vs. long QT syndrome and Wolff-Parkinson-White syndrome (electrical)." — 11-12 §"Why a young athlete's heart stops"
10. ⚠ "30-30 rule for lightning: evacuate immediately if the flash-to-bang gap is 30 seconds or less; remain sheltered until 30 minutes have passed since the last lightning/thunder." — 11-12 §"Beyond cardiac: other emergencies your EAP must cover", quiz Q8
11. "For heat stroke, 'cool first, transport second' — whole-body cold-water immersion should begin on-site immediately, with EMS transport arranged in parallel." — 11-12 §"Beyond cardiac: other emergencies your EAP must cover"
12. "Good Samaritan laws in every state protect bystanders (including trained student aides) who act in good faith within their training; many states have AED access laws requiring registration with local EMS dispatch." — 11-12 §"Legal protection, access laws, and after the response"
13. "Suspected spinal injury: spinal motion restriction — do not move, sit up, or remove a helmet to 'check' the injury; log-rolling as a unit is only for an immediate life threat (e.g., starting CPR on a non-breathing athlete)." — 11-12 §"Beyond cardiac...", quiz Q7, warning callout

## cold-exposure

- [ ] 7-8 — "Staying Safe in Cold Weather" (`cold-exposure-ms`)
- [ ] 9-10 — "Cold Exposure & Hypothermia" (`cold-exposure`)
- [ ] 11-12 — "Cold Physiology and Field Management of Cold Injury" (`cold-exposure-adv`)

**Claims to verify**

1. "Wet-and-windy conditions are more dangerous than dry cold at the same temperature — wind strips the warm air layer next to skin (convection) and water conducts heat away much faster than air (conduction)." — 7-8 §"Dressing right so you don't get too cold"; 9-10 §"How the body loses heat in the cold", quiz Q4
2. "Shivering stopping is a worsening sign, not recovery — as hypothermia progresses, shivering fails from glycogen depletion plus the hypothalamus losing the ability to coordinate it, typically below roughly 90°F (32°C) core." — 7-8 §"Warning signs your body is getting too cold", quiz Q4; 9-10 §"Moderate to severe hypothermia", quiz Q3; 11-12 §"Heat conservation under cold stress...", quiz Q1
3. ⚠ "Never give fluids to someone who is confused, drowsy, or not fully alert; handle moderate/severe hypothermia very gently — rough handling of a cold, electrically irritable heart can trigger ventricular fibrillation." — 9-10 §"Moderate to severe hypothermia" warning callout; 11-12 §"Staging hypothermia: field markers and the cardiac risk", quiz Q3
4. ⚠ "Frostbite: never rub or massage the area (grinds ice crystals into cells), never use a direct heat source, rewarm with skin-to-skin contact or lukewarm (not hot) water, and never fully rewarm if refreezing is possible before reaching guaranteed warm shelter." — 9-10 §"Responding to frostbite", quiz Q5, Q6, Q7; 11-12 §"Frostbite science..."
5. ⚠ "A hypothermic patient is not presumed dead until rewarmed and still showing no signs of life ('not dead until warm and dead') — CPR should be started/continued even without a detectable pulse or breathing." — 11-12 §"Resuscitation logic and the rewarming-drinks myths", quiz Q4
6. "Water conducts heat away from the body roughly 25 times faster than air at the same temperature." — 11-12 §"Cold water immersion: the 25x multiplier and the 1-10-1 principle"
7. "1-10-1 principle for cold-water immersion: ~1 minute to control the gasp/hyperventilation response, ~10 minutes of useful muscle movement before swim failure, ~1 hour before hypothermia causes unconsciousness." — 11-12 §"Cold water immersion...", quiz Q2
8. "The cold shock response (first ~60 seconds of cold-water immersion) — not hypothermia itself — is the leading cause of death in cold-water immersion incidents." — 11-12 §"Cold water immersion..."
9. ⚠ "Hypothermia staging by core temperature: mild ~90-95°F/32-35°C (shivering present), moderate ~82-90°F/28-32°C (shivering fails, possible paradoxical undressing), severe below ~82°F/28°C (unconscious, faint vitals)." — 11-12 §"Staging hypothermia: field markers and the cardiac risk"
10. "Alcohol makes hypothermia worse despite feeling warm (dilates peripheral vessels, accelerates heat loss, blunts shivering/judgment); caffeine has no proven rewarming benefit." — 11-12 §"Resuscitation logic and the rewarming-drinks myths"
11. "Definitive frostbite rewarming: circulating water bath at about 98-102°F (37-39°C) for roughly 15-30 minutes." — 11-12 §"Frostbite science: freezing versus non-freezing cold injury"
12. "Frostnip, chilblains, trench foot, and true frostbite are distinguished by freezing vs. non-freezing mechanism (only true frostbite involves actual ice-crystal formation in tissue)." — 11-12 §"Frostbite science...", quiz Q6
13. "Superficial frostbite: tissue underneath still feels soft/pliable when pressed. Deep frostbite: hard and cold throughout, may blister, mottled/blue-white — a medical emergency needing hospital care." — 9-10 §"Frostbite — when tissue actually freezes"

## sports-psychology

- [ ] 7-8 — "Feelings, Teammates, and Getting Help" (`sports-psychology-ms`)
- [ ] 9-10 — "Mental Health in Sport: What Every Athlete Should Know" (`sports-psychology`)
- [ ] 11-12 — "Sports Psychology: Differential Recognition, RED-S, and the Referral Network" (`sports-psychology-adv`)

**Claims to verify**

1. ⚠ "Missed or irregular menstrual cycles are a medical sign of significantly low energy availability — never a lifestyle detail or a badge of hard training; recurrent bone stress injuries (a second or third stress fracture with no obvious high-impact mechanism) are the parallel red flag from the overuse-injury side. Together these are a RED-S pattern requiring prompt medical referral, never a discipline/willpower conversation." — 9-10 §"Burnout and disordered eating: recognizing the pattern"; 11-12 §"RED-S: the medical urgency behind the pattern", quiz Q4
2. "National surveys of college athletes commonly find around a third report clinically meaningful symptoms of anxiety or depression at some point in their athletic career." — 11-12 §"Destigmatizing with real numbers", quiz Q6
3. ⚠ "Any mention of suicide or self-harm — direct or indirect, however phrased, even as a joke — must always be taken seriously, never kept secret, and escalated to a trusted adult immediately; confidentiality never covers safety concerns." — 7-8 §"When it's a crisis", quiz Q7; 9-10 §"When it's a crisis: talk of suicide or self-harm", quiz Q6; 11-12 §"Confidentiality has real limits...", "Crisis recognition, reinforced", quiz Q7, Q8
4. ⚠ "Expanded suicide-risk warning signs: withdrawal that's more abrupt than gradual quietness, giving away meaningful possessions with no ordinary reason, and a sudden sense of calm/relief after a visible period of crisis (which can mean a decision has been made) — any one of these alone is reason enough to escalate." — 11-12 §"Crisis recognition, reinforced: the fuller warning-sign picture", quiz Q8
5. "Burnout is linked to both higher injury rates and higher rates of anxiety and depression in young athletes." — 9-10 §"Why mental health matters in sports"
6. "Fear of re-injury is a well-documented psychological barrier that can persist even after an athlete is fully medically cleared to return to play." — 9-10 §"The psychological side of injury and recovery", quiz Q7
7. "A season-ending or career-ending injury can trigger a genuine identity crisis and is described as a predictable part of many athletic careers ending (by injury, being cut, or aging out)." — 9-10 §"The psychological side of injury and recovery"; 11-12 §"Transition and identity...", quiz Q5
8. "Biopsychosocial model: physical, psychological, and social/team factors interact in injury recovery — a gap in one (e.g., feeling forgotten by the team) can stall recovery even when the others look fine." — 11-12 §"The biopsychosocial model of injury recovery", quiz Q2
9. "Differential signal for normal adjustment vs. needing professional evaluation: duration mismatched with recovery trajectory, severity out of proportion to the loss, or real functional impairment (can't sleep, eat, or engage with school/people)." — 11-12 §"Normal adjustment or a clinical concern?", quiz Q1
10. "A sport psychology consultant (performance mental-skills work: imagery, goal-setting, confidence/self-talk) is a distinct professional role from a clinical psychologist or psychiatrist who diagnoses and treats mental health disorders." — 11-12 §"What a sport psychology consultant actually does", quiz Q3

## wound-care

- [ ] 7-8 — "Cuts and Scrapes: Basic Wound Care" (`wound-care-ms`)
- [ ] 9-10 — "Wound Care & Bleeding Control" (`wound-care`)
- [ ] 11-12 — "Advanced Wound Management and Bleeding Control" (`wound-care-adv`)

**Claims to verify**

1. ⚠ Tourniquet placement is taught two different ways across bands: "applied 2–3 inches above the wound (not over a joint)" vs. "'High and tight' means placing the tourniquet as close to the junction of the limb and torso as possible (not directly over the wound)." — 9-10 §"Controlling bleeding", quiz Q8, flashcard "Tourniquet rules"; 11-12 §"Tourniquets: lay-rescuer scope", quiz Q3.
2. ⚠ "An adult has roughly 5 liters of blood. Losing about 15-20% of it (roughly 1 liter) starts to produce measurable signs of shock… Losing closer to 40% is life-threatening within minutes." — 11-12 §"Why uncontrolled bleeding kills fast".
3. ⚠ "Closure works best within a golden window, often cited as roughly 6-8 hours after injury for most body sites (bacterial colonization increases sharply after this)." — 11-12 §"Deciding whether a wound needs closure", quiz Q4, flashcard "Closure golden window".
4. Tetanus booster logic: booster needed if "more than 10 years since the last one" for a clean wound, dropping to "5 years" for a dirty/high-risk wound. — 9-10 §"Special situations", flashcard "Tetanus booster rule"; 11-12 §"Infection surveillance and tetanus logic", flashcard "Tetanus booster windows".
5. "Direct pressure is the first and most effective step for almost all external bleeding… Most bleeding stops within several minutes of firm, continuous pressure." — 9-10 §"Controlling bleeding".
6. Never peel off blood-soaked gauze — add new layers on top; peeling "tears away the forming clot" / resets hemostasis. — 9-10 §"Controlling bleeding", quiz Q2; 11-12 §"Why uncontrolled bleeding kills fast" (hemostasis/fibrin mesh).
7. "Avoid pouring hydrogen peroxide or alcohol INTO the wound; they damage healing tissue." — 9-10 §"Cleaning and dressing minor wounds", quiz Q5.
8. Nosebleed technique: sit up, lean slightly forward (never tilt back), pinch the soft part of the nose for a full 10 minutes. — 7-8 §"Nosebleeds", quiz Q7; 9-10 §"Special situations", flashcard "Nosebleed care".
9. Intact blister = "a sterile dressing — leave it, pad around it… never remove the roof of skin." — 9-10 §"Special situations", flashcard "Blister care".
10. Bite wounds are generally NOT closed immediately even when they look closable; often left open (secondary intention) or given prophylactic antibiotics instead. — 11-12 §"Deciding whether a wound needs closure", quiz Q5.
11. Herpes gladiatorum: athlete with a suspected outbreak "held from ALL contact activity until a physician has examined and cleared them." — 11-12 §"Skin conditions that complicate the picture", quiz Q8.

## fractures-dislocations

- [ ] 7-8 — "Broken Bones and Dislocated Joints" (`fractures-dislocations-ms`)
- [ ] 9-10 — "Fractures & Dislocations" (`fractures-dislocations`)
- [ ] 11-12 — "Fracture Patterns, Splinting Science, and Joint Injury Management" (`fractures-dislocations-adv`)

**Claims to verify**

1. ⚠ Compartment syndrome "5 P's": "pain out of proportion to the injury… is the earliest and most reliable sign" (before pallor/paresthesia/pulselessness/paralysis); "a surgical emergency measured in hours, not days." — 11-12 §"Complications that change the urgency", quiz Q4, callout.
2. ⚠ True knee (tibiofemoral) dislocation is "a vascular emergency" via the popliteal artery, "even in dislocations that partially reduce on their own before you arrive," versus patellar dislocation being "rarely limb-threatening." — 11-12 §"Dislocations: why reduction stays physician-only…", quiz Q5, image description.
3. ⚠ Posterior hip dislocation position ("flexed, adducted…, and internally rotated… leg looking shorter") described as a time-sensitive "load-and-go emergency" for the femoral head's blood supply. — 11-12 §"Dislocations…", quiz Q8.
4. Fat embolism syndrome from long-bone (especially femur)/pelvic fractures "typically 24-72 hours after injury." — 11-12 §"Complications that change the urgency".
5. Capillary refill check: "press a nail bed or fingertip pad, release, and confirm color returns within about 2 seconds." — 11-12 §"Assessment: CSM done right".
6. Avascular necrosis high-risk sites named as the scaphoid and femoral neck, because "their blood supply runs through the injury zone itself." — 11-12 §"Complications…", quiz Q7, flashcard "Avascular necrosis risk sites".
7. Traction splints used specifically for suspected mid-shaft femur fracture to counter thigh-muscle spasm; application is "an EMS-level skill." — 11-12 §"Splint types by region", flashcard "Traction splint".
8. "Splint in the position found unless circulation is absent" — the stated exception where a trained provider may attempt one gentle realignment specifically to restore blood flow. — 11-12 §"Splinting science: principles…".
9. Never attempt to reduce a dislocation on the field — physician-only, "even for a finger," due to nerve/vessel and unseen-fracture risk. — 9-10 §"Never try to relocate a joint yourself", quiz Q4, callout; 11-12 §"Dislocations…".
10. Splinting rule: immobilize the joint above AND below the fracture/dislocation site. — 9-10 §"Immediate response"; 11-12 §"Splinting science…".
11. Open fracture care: cover the wound, apply gentle pressure around (not on top of) exposed bone, never push bone back under the skin. — 9-10 §"Open vs. closed", quiz Q3, flashcard "Open fracture bleeding control".
12. Growth plate (physis) claim: cartilage is "mechanically weaker than the bone and ligaments around it," so a force that sprains a ligament in an adult can fracture the physis in an adolescent; such injuries "always" get imaged even if it "only" looks like a sprain. — 11-12 §"Stress fractures and growth-plate injuries", quiz Q2.

## eye-injuries

- [ ] 7-8 — "Eye Injuries: Spot It, Don't Touch It, Get Help" (`eye-injuries-ms`)
- [ ] 9-10 — "Eye Injuries: Recognition and Response" (`eye-injuries`)
- [ ] 11-12 — "Eye Injuries: Classification, Differentials, and Urgent Referral" (`eye-injuries-adv`)

**Claims to verify**

1. ⚠ Hyphema re-bleed risk is "typically in the first 3-5 days after injury" and "tends to be worse than the original bleed"; activity restrictions include no aspirin/NSAIDs and head elevation; athlete "does not return to play that day, full stop." — 11-12 §"Hyphema: what's actually happening…", quiz Q2, flashcards "Hyphema — what it is and why it's urgent" / "Hyphema activity restrictions — why".
2. ⚠ Orbital blowout fracture / entrapment: double vision that "appears or worsens specifically when the athlete looks up or down" implicates the inferior rectus muscle caught in a floor fracture; framed as "a surgical urgency… especially in younger athletes." — 11-12 §"Orbital blowout fracture…", quiz Q3, callout.
3. ⚠ Retinal detachment triad (sudden flashes/photopsia, new floaters, a curtain/shadow over vision) is "a same-day ophthalmology emergency" even with a completely normal-looking eye. — 11-12 §"Retinal detachment: symptoms that mean same-day…", quiz Q5, callout.
4. ⚠ Alkali vs. acid chemical burns: alkalis "dissolve fatty tissue and keep penetrating deeper into the eye as long as contact continues," while acids "coagulate the surface tissue they touch," which "partly limits how much deeper the injury spreads." — 11-12 §"Chemical exposure…", quiz Q4.
5. "Sports account for a large share of all eye injuries in teenagers, and racquet sports, basketball, and baseball are consistently among the highest-risk activities." — 9-10 §"Why eye injuries deserve their own protocol".
6. Chemical eye exposure: flush continuously for "at least 15-20 minutes," longer for a known/suspected alkali, with ER/ophthalmology follow-up regardless of how the eye feels afterward. — 9-10 §"Minor irritation: what's safe to try", callout; 11-12 §"Chemical exposure…", quiz Q1/Q8.
7. Embedded object technique: tape a rigid shield (e.g., cup bottom) over the surrounding bone, never a flat patch, because a patch "could press on the globe." — 9-10 §"Immediate response to a serious injury", quiz Q5.
8. Subconjunctival hemorrhage "resolves on its own over one to two weeks." — 11-12 §"Differential: the red eye after trauma".
9. Racquetball/squash injury risk explained by the ball being "close to the same size as the orbit opening," so it drives straight into the eye instead of being deflected by bone. — 9-10 §"How eye injuries happen", quiz Q2.
10. Which sports "commonly require certified protective eyewear by rule" (racquetball, squash, hockey, lacrosse) vs. sports that "don't always mandate it" (basketball, baseball, soccer). — 9-10 §"Prevention: protective eyewear".
11. Cornea described as "one of the most nerve-dense tissues in the body." — 9-10 §"Quick anatomy", quiz Q1.

## dental-facial-trauma

- [ ] 7-8 — "Knocked-Out Teeth and Face Injuries: What to Do" (`dental-facial-trauma-ms`)
- [ ] 9-10 — "Dental and Facial Injuries: What to Do" (`dental-facial-trauma`)
- [ ] 11-12 — "Dental and Facial Trauma: Classification, Storage Science, and Escalation" (`dental-facial-trauma-adv`)

**Claims to verify**

1. ⚠ Student first-aider instructed to actively reinsert an avulsed permanent tooth themselves: "try to reinsert it into the socket immediately, pushing it gently back into place, then have the athlete bite down softly on a clean cloth." — 9-10 §"The headline skill: a knocked-out permanent tooth", image callout.
2. Re-implantation time window: get tooth + athlete to a dentist/ER "within 30-60 minutes"; periodontal ligament cells "start dying within about an hour" outside the mouth. — 9-10 §same section, quiz Q3, flashcard "Re-implantation time window"; 11-12 §"Building on what you already know".
3. Storage medium hierarchy: "Hank's Balanced Salt Solution (best) > cold milk > athlete's own saliva > sterile saline > NEVER tap water," explained via osmolality; tap water is hypotonic and PDL cells "swell, and rupture… within minutes." — 11-12 §"Storage medium hierarchy…", quiz Q2, flashcards "Storage medium hierarchy for an avulsed tooth" / "Why tap water destroys…".
4. ⚠ Mandible "ring" concept: a fracture at one point "often transmits enough energy… to crack it in a second place too, frequently on the opposite side from the direct impact." — 11-12 §"Mandible fractures: recognition and the 'ring' concept", quiz Q4.
5. ⚠ Airway compromise: heavy intraoral bleeding, rapidly expanding tongue/floor-of-mouth swelling, or a "flail mandible" letting the tongue fall backward can physically block the airway, especially with reduced alertness — described as an EAP/EMS-activation event, not a dental referral. — 11-12 §"When facial trauma becomes more than a facial injury", quiz Q6.
6. Mental nerve numbness (lower lip/chin) as a specific sign of a mandible fracture through the nerve canal — described as "easy to miss" if not actively checked. — 11-12 §"Mandible fractures…", quiz Q5, flashcard "Mental nerve numbness".
7. Crown fracture severity: pulp exposure ("pink or actively bleeding spot") is "a same-day dental emergency"; dentin exposure needs a dentist "within a day or two"; enamel-only is "usually painless." — 11-12 §"Crown fracture severity…", quiz Q1.
8. Luxation severity spectrum (concussion → subluxation → lateral luxation → intrusion → extrusion → avulsion), with intrusion called "often the most damaging luxation for the root and surrounding bone." — 11-12 §"Luxation injuries: avulsion is only the most severe end", quiz Q3.
9. Nosebleed pinch duration differs by band: "about 10 minutes" (7-8) vs. "a full 10-15 minutes… if bleeding hasn't slowed after 15-20 minutes" (9-10). — 7-8 §"Nosebleeds"; 9-10 §"Nosebleeds".
10. Lip/soft-tissue laceration thresholds for stitches: "a cut through the lip border… a gash longer than about half an inch, or a deep tongue laceration usually needs stitches." — 9-10 §"Chipped teeth and soft-tissue cuts".
11. Mouthguard evidence claim: "the fit gap between a well-fitted boil-and-bite guard and a custom one is smaller than most people assume," and compliance, not guard type, is "the bigger driver of real-world protection." — 11-12 §"Mouthguard evidence: fit matters, but compliance decides outcomes", quiz Q8.
12. Baby (primary) tooth avulsion should never be reinserted, in every band, because it "can damage the permanent tooth developing underneath." — 7-8 §"A knocked-out tooth…" callout; 9-10 §same section callout.

**Answer-key spot-checks**

- 11-12 quiz Q2 keys the ranking "HBSS > cold milk > saliva > saline > tap water" for tooth storage. Some clinical references rank sterile saline above saliva (saliva carries more bacterial contamination risk, as the unit's own body text acknowledges), so the keyed ordering of saliva over saline may be worth a second look even though the underlying osmolality reasoning is sound.

## skin-conditions

- [ ] 7-8 — "Skin Changes: When to Tell an Adult" (`skin-conditions-ms`)
- [ ] 9-10 — "Skin Infections: Recognition and Prevention" (`skin-conditions`)
- [ ] 11-12 — "Skin Infections: Pathogens, Clearance, and Outbreak Control" (`skin-conditions-adv`)

**Claims to verify**

1. ⚠ Real return-to-play clearance requires, among other things, "no new lesions… in the last 48-72 hours" as proof the infection "has plateaued, not just improved." — 11-12 §"Real return-to-play clearance criteria", quiz Q7.
2. ⚠ Herpes gladiatorum clearance requires "a minimum number of consecutive symptom-free days… combined with a course of antiviral medication, both completed" before physician sign-off. — 11-12 §"Herpes gladiatorum: a virus that governs its own clearance rules".
3. ⚠ MRSA abscess: incision and drainage (I&D) is "the primary treatment" because pus in a "walled-off pocket… is largely inaccessible to antibiotics carried through the bloodstream"; "wait for the antibiotics to work" is called the wrong plan. — 11-12 §"MRSA: resistance, culture, and why 'just give amoxicillin' fails", quiz Q4.
4. ⚠ "Wrestling, in particular, has one of the highest rates of skin infection outbreaks of any high school sport." — 9-10 §"Why skin infections matter in sports", quiz Q5.
5. MRSA resistance mechanism described as "a genetic mechanism — an altered target protein the antibiotic normally binds to." — 11-12 §"MRSA: resistance, culture…", quiz Q2.
6. CA-MRSA vs. HA-MRSA distinction: HA-MRSA "tends to be even more drug-resistant" than the community-acquired strain relevant to athletics. — 11-12 §"MRSA…", quiz Q3.
7. Ringworm/athlete's foot/jock itch caused by dermatophytes that "digest keratin," which is given as the reason tinea infections "stay superficial… rather than invading deeper tissue." — 11-12 §"How ringworm is actually confirmed, not guessed".
8. KOH prep and fungal culture described as the way a clinician confirms tinea versus visual mimics like eczema or psoriasis. — 11-12 §same section, quiz Q6.
9. Impetigo's distinguishing sign given as a "honey-colored (yellowish) crust" over broken-open sores. — 9-10 §"Bacterial infections: impetigo and MRSA", quiz Q2.
10. Covering a lesion is "often not enough" for contact-sport return; many sports "require formal clearance from a physician or athletic trainer regardless of covering." — 9-10 §"Return-to-play rules for skin infections", quiz Q6.
11. Culture-and-sensitivity testing described as growing a swabbed sample and exposing it "to a panel of different antibiotics to see which ones actually stop its growth." — 11-12 §"MRSA: resistance, culture…".

## ankle-sprain

- [ ] 7-8 — "Rolled Ankles: What to Do" (`ankle-sprain-ms`)
- [ ] 9-10 — "Ankle Sprains" (`ankle-sprain`)
- [ ] 11-12 — "Ankle Injuries: Evaluation Concepts and Rehabilitation Science" (`ankle-sprain-adv`)

**Claims to verify**

1. "Ankle sprains are the single most common injury in high school sports, accounting for roughly 15% of all athletic injuries." — 9-10 §"Why ankle sprains matter"
2. "The ATFL is the weakest and the most commonly sprained ligament in the body." — 9-10 §"Anatomy review", quiz Q1; 11-12 §"Lateral ligament complex", flashcard "ATFL mechanism of failure"
3. "About 85% of ankle sprains are inversion sprains." — 9-10 §"Mechanism of injury", quiz Q2; 11-12 §"Lateral ligament complex"
4. ⚠ "Eversion sprains are rarer... the deltoid ligament is strong and the fibula physically blocks extreme eversion... under a high eversion or external-rotation force, the fibula itself may fracture before the deltoid tears" (Maisonneuve fracture). — 9-10 §"Mechanism of injury", quiz Q6; 11-12 §"Lateral ligament complex", quiz Q2, flashcard "Maisonneuve fracture"
5. Grade I/II/III return-to-play timelines: Grade I "often 1–2 weeks", Grade II "commonly 3–6 weeks", Grade III "can take several months". — 9-10 §"Grading sprains"
6. ⚠ Ottawa Ankle Rules exact criteria: bony tenderness along the distal 6 cm of the posterior edge or tip of either malleolus, tenderness at the base of the 5th metatarsal/navicular, or inability to bear weight for 4 steps immediately and at evaluation → X-ray indicated. — 9-10 callout "Ottawa Ankle Rules", quiz Q4; 11-12 callout "exact criteria", quiz Q4
7. ⚠ High ankle (syndesmotic) sprain recovery is "about two to three times longer... a Grade I-II lateral sprain might be 2-6 weeks, while a syndesmotic sprain often runs 6-12+ weeks." — 11-12 §"The syndesmosis", flashcard "High ankle sprain recovery time"; 9-10 §"Mechanism of injury" (says "heals slowly" without exact figures)
8. Balance/proprioceptive training (e.g., wobble-board single-leg stands) is "the best-proven"/"single best-supported" intervention to reduce re-sprains. — 9-10 §"Immediate care", quiz Q8; 11-12 §"Proprioception and functional testing"
9. Limb symmetry index of "roughly 90% or better" (hop-test performance vs. uninjured side) before clearing return to play. — 11-12 §"Proprioception and functional testing", quiz Q6
10. Athletic tape "loses a substantial amount of its mechanical restriction within about 20-30 minutes of activity," while semi-rigid braces maintain support through a full practice/game and are comparably or more effective at reducing re-sprain. — 11-12 §"Prevention: what the evidence actually supports"
11. ⚠ "The Ottawa Ankle Rules were validated primarily in adults and don't fully account for" growth-plate (Salter-Harris) injuries in skeletally immature athletes. — 11-12 §"Differential diagnosis", callout "Refer beyond 'it's just a sprain'"
12. Ice application specifics: 15-20 minutes at a time, never directly on skin, "roughly every 2 hours while awake" during the acute phase. — 7-8 §"What to do right away" (no interval specified); 9-10 §"Immediate care", quiz Q3, Q5
13. Acute-care evolution PRICE → POLICE → PEACE & LOVE, including "Avoid anti-inflammatory medications and modalities as a routine crutch" during the acute phase. — 11-12 §"The evolution of acute care", quiz Q8


## knee-acl

- [ ] 7-8 — "Knee Injuries: What to Watch For" (`knee-acl-ms`)
- [ ] 9-10 — "Knee Injuries: ACL & Friends" (`knee-acl`)
- [ ] 11-12 — "The Knee: Injury Mechanics, Evaluation, and the ACL Epidemic" (`knee-acl-adv`)

**Claims to verify**

1. "Around 70% of ACL tears are non-contact." — 9-10 §"How ACL tears happen", quiz Q1; 11-12 §"How the ACL actually fails" ("roughly 70%")
2. "Female athletes tear their ACLs at roughly 2–8 times the rate of male athletes in comparable sports." — 9-10 §"How ACL tears happen", quiz Q8, flashcard "ACL risk in female athletes"; 11-12 §"The female athlete disparity"
3. ⚠ Rapid swelling "usually within 2 hours" (hemarthrosis) points to ACL/ligament/fracture, vs. slower overnight swelling more typical of meniscus irritation. — 9-10 §"How ACL tears happen", §"Recognizing a serious knee injury", flashcard "Rapid swelling vs. overnight swelling"; 11-12 §"Building a differential" ("roughly two hours")
4. "Unhappy triad" = torn ACL + MCL + medial meniscus, from a strong valgus (outside-of-knee) blow to a planted knee. — 9-10 §"How ACL tears happen", quiz Q2/Q3, flashcard "Unhappy triad"
5. MCL is "most commonly injured by a blow to the OUTSIDE of the knee" (valgus mechanism); PCL from a direct blow to the front of a bent knee ("dashboard injury"). — 9-10 §"Anatomy: four ligaments"; 11-12 §"Building a differential" contrasts PCL mechanism/test
6. Lachman test is "the most reliable clinical exam for ACL laxity," more sensitive than anterior drawer because at 90° (anterior drawer position) hamstring co-contraction can mask laxity, unlike at the Lachman's 20-30°. — 9-10 §"Recognizing a serious knee injury", quiz Q7; 11-12 §"Building a differential", quiz Q3
7. ⚠ Complete ACL tears in cutting/pivoting athletes "usually require surgical reconstruction... followed by 9–12 months of rehabilitation. Returning before roughly 9 months sharply raises re-tear risk in adolescents"; 11-12 adds "being under about 20 years old" as an added risk factor. — 9-10 §"Treatment and return"; 11-12 §"The management fork", §"Rehab and return", quiz Q7
8. ⚠ A tibiofemoral knee dislocation "can tear the popliteal artery" — "even after the joint has already reduced itself back into place" — a limb-threatening emergency. — 9-10 §"Recognizing a serious knee injury" callout, quiz Q5, flashcard "Knee dislocation danger"; 11-12 §"Recognizing the true emergencies" callout
9. Isolated MCL sprains "usually heal WITHOUT surgery" (good blood supply) vs. ACL's poor intra-articular healing capacity. — 9-10 §"Treatment and return", quiz Q6, flashcard "MCL vs. ACL healing"
10. ACL injury "measurably raises the risk of knee osteoarthritis decades later," regardless of operative vs. non-operative treatment. — 11-12 §"The management fork"
11. Neuromuscular training programs (e.g., FIFA 11+) "measurably cut ACL injury rates" (9-10) / "reduce non-contact ACL injury rates by roughly half" (11-12). — 9-10 §"Treatment and return", quiz Q8; 11-12 §"Prevention science", quiz Q8
12. "Position of no return" biomechanics: knee near full extension (<30° flexion), dynamic valgus collapse, tibial rotation, and trunk lean toward the injured side. — 11-12 §"How the ACL actually fails", quiz Q1, flashcard "'Position of no return'"
13. Quad strength limb symmetry index (~90% benchmark) predicts re-injury risk better than time since surgery alone. — 11-12 §"Rehab and return: criteria, not a calendar"


## muscle-strains

- [ ] 7-8 — "Pulled Muscles: What to Know" (`muscle-strains-ms`)
- [ ] 9-10 — "Muscle Strains" (`muscle-strains`)
- [ ] 11-12 — "Muscle Injury Science: From Fiber to Field" (`muscle-strains-adv`)

**Claims to verify**

1. Muscles most often strained cross TWO joints (hamstrings, rectus femoris, groin/adductors, gastrocnemius), exposing them to stretch at both ends. — 9-10 §"Where and why strains happen", quiz Q3; 11-12 §"musculotendinous junction" elaborates on the two-joint mechanical disadvantage
2. Grade I/II/III strain timelines: "Days to ~2 weeks" / "Weeks to 2 months" / needs physician, may require surgery. — 9-10 §"Grading strains"
3. ⚠ HARM acronym — avoid Heat, Alcohol, Running, Massage in the first 48–72 hours because all "increase bleeding and swelling inside the muscle in the acute phase." — 9-10 §"Immediate care", quiz Q5, flashcard "HARM"
4. "The single biggest risk factor for a muscle strain is a previous strain of the same muscle." — 9-10 §"Why re-injury happens", quiz Q7; 11-12 §"Hamstring strain injury science" ("several times the injury risk")
5. Nordic hamstring curl programs, "run consistently through a season," have "documented reductions in hamstring strain incidence in multiple studies." — 9-10 flashcard "Nordic hamstring curl"; 11-12 §"Hamstring strain injury science"
6. Bruising from a torn muscle "tracks downward with gravity between tissue layers," e.g. a hamstring tear bruising behind the knee days later. — 9-10 §"Why re-injury happens" callout, quiz Q6
7. Musculotendinous junction (MTJ) is where most strains occur because compliant muscle meets stiff, inextensible tendon, concentrating mechanical stress there. — 11-12 §"The musculotendinous junction", quiz Q3
8. ⚠ Terminal swing phase of the running gait cycle (just before foot strike, not push-off/ground contact) is "why the hamstring injury clock ticks fastest" — peak musculotendinous length plus peak eccentric force converge there. — 11-12 §"The canonical case: hamstring strain during terminal swing", quiz Q1
9. Three-phase muscle healing timeline: Inflammation (first several days) → Repair/regeneration (day 3 through several weeks) → Remodeling (weeks to months); re-injury clusters at the old injury site because the scar-muscle interface stays mechanically weaker. — 11-12 §"How torn muscle actually heals"
10. ⚠ Myositis ossificans "typically becomes clinically apparent two to four weeks after the injury"; "X-ray calcification usually isn't visible until roughly three to four weeks after injury," so a normal early X-ray doesn't rule it out. — 11-12 §"The contusion trap: myositis ossificans", quiz Q7
11. ⚠ Complete rupture/avulsion red flags (felt/heard pop, immediate and profound loss of function, palpable gap, balled-up muscle) mean "stop activity, protect/immobilize, and get the athlete to a physician" — not manage in the field. — 9-10 §"Grading strains" callout, quiz Q4; 11-12 §"Recognizing complete rupture and avulsion", quiz Q8
12. H:Q ratio — eccentric hamstring strength relative to concentric quadriceps strength (not simple raw H:Q) is the mechanistically relevant pairing during terminal swing. — 11-12 §"Hamstring strain injury science", flashcard "H:Q ratio and hamstring strain risk"


## overuse-injuries

- [ ] 7-8 — "When Pain Builds Up Over Time" (`overuse-injuries-ms`)
- [ ] 9-10 — "Overuse Injuries" (`overuse-injuries`)
- [ ] 11-12 — "Load, Adaptation, and Overuse: The Science of Training Injuries" (`overuse-injuries-adv`)

**Claims to verify**

1. Four-stage overuse pain progression: (1) pain after activity only, (2) pain during activity, not limiting, (3) pain during activity, limiting performance, (4) pain with daily life/at rest/night — stop and refer. — 9-10 §"The pain progression", quiz Q3, flashcard "Four-stage overuse pain progression"
2. Shin splints (diffuse ache along inner tibia, eases with warm-up) vs. stress fracture (pinpoint pain, worsens through activity, possible night ache/hop pain) as the key exam distinction. — 9-10 §"Shin splints", quiz Q1/Q6
3. "10% per week" rule as a training-load increase guardrail. — 9-10 §"Prevention: manage the load"; 11-12 §"Beyond the 10% rule" frames it as having "a blind spot" relative to acute:chronic workload ratio
4. Stress fracture X-rays are "often normal for the first 2–3 weeks"; MRI or bone scan confirms earlier. — 9-10 §"Stress fractures", quiz Q6; 11-12 §"Bone stress injury: a spectrum"
5. ⚠ High-risk stress fracture sites — femoral neck, tarsal navicular, anterior tibial cortex (the "dreaded black line") — are prone to progressing to complete/displaced fracture or nonunion due to tension-side/watershed blood supply, vs. low-risk compression-side sites (posteromedial tibia, fibula, most metatarsal shafts). — 9-10 §"Stress fractures" callout; 11-12 §"Bone stress injury: a spectrum", quiz Q5, callout "High-risk site + progressing pain"
6. ⚠ RED-S (formerly "female athlete triad"): low energy availability → menstrual dysfunction + low bone density, in athletes of any sex; recurrent stress fractures + menstrual changes should trigger screening, not just fracture treatment. — 9-10 §"Stress fractures" callout; 11-12 §"RED-S" full section, quiz Q7
7. Replace running shoes "before they're dead (roughly 300–500 miles)." — 9-10 §"Prevention: manage the load"
8. ⚠ Tendinopathy is NOT primarily inflammatory — biopsies show "disorganized collagen fibers, increased ground substance... neovascularization... and nerve ingrowth," a failed-healing/degenerative picture; cortisone injections into major tendons are avoided because they "weaken tendon tissue and risk rupture." — 9-10 §"Tendinopathy"; 11-12 §"Tendinopathy: the failed-healing model", quiz Q3/Q4
9. ⚠ In young throwers, medial elbow pain is usually benign self-limited apophysitis ("Little League elbow"), but pain on the LATERAL side "raises concern for osteochondritis dissecans (OCD) of the capitellum" — a lesion that "does not reliably self-resolve and can require surgery if missed." — 11-12 §"Growth-plate apophysitis", quiz Q6
10. Acute:chronic workload ratio (ACWR): "sweet spot" of roughly 0.8–1.3; a ratio spiking above "about 1.5" sharply raises injury risk regardless of absolute volume. — 11-12 §"Beyond the 10% rule", quiz Q2
11. Cardiovascular fitness improves within 1–2 weeks of training, while bone's remodeling cycle "takes roughly 3–4 months to fully turn over" and tendon collagen turnover is slower still. — 11-12 §"Tissue adaptation", quiz Q1
12. Specialization guidance: keep weekly training hours at or below the athlete's age in years, at least 1 day off per week, and 2–3 months off per year from a single sport. — 11-12 §"Specialization vs. diversification"
13. Pain-monitoring model for tendinopathy rehab: pain during loading ≤3-4/10 that doesn't climb during the session and resolves by next morning is "acceptable" and training should continue at that load. — 11-12 §"Tendinopathy" callout, quiz Q4


## shoulder-injuries

- [ ] 7-8 — "Shoulder Injuries: What to Watch For" (`shoulder-injuries-ms`)
- [ ] 9-10 — "Shoulder Injuries" (`shoulder-injuries`)
- [ ] 11-12 — "The Shoulder: Instability, Overhead Athletes, and Evaluation Concepts" (`shoulder-injuries-adv`)

**Claims to verify**

1. "Roughly 95% of shoulder dislocations are anterior." — 9-10 §"Shoulder dislocation and subluxation", flashcard "Anterior shoulder dislocation"
2. ⚠ "Never attempt to reduce a shoulder on the field" — forcing it back into place without imaging "risks tearing nearby nerves and blood vessels (including the axillary nerve)" and "can turn a dislocation into a fracture-dislocation." — 7-8 §"What to do right away" callout, quiz Q2/Q5; 9-10 §"Shoulder dislocation" callout, quiz Q4; 11-12 §"instability spectrum" callout, §"Evaluation flow", quiz Q7
3. AC sprain vs. dislocation distinguishing signs: in an AC sprain the ball stays seated (arm looks/moves roughly normally, step-off bump at the AC joint) vs. a dislocation (arm held away/guarded, "squared-off" contour). — 9-10 §"AC joint sprain" and callout "Dislocation or separation?", quiz Q3/Q5
4. Rotator cuff (SITS: supraspinatus, infraspinatus, teres minor, subscapularis) functions as the joint's "dynamic stabilizer"/"compressor" rather than a prime mover for arm motion. — 9-10 §"Anatomy", quiz Q2; 11-12 §"Static vs. dynamic stabilizers"
5. ⚠ First-time anterior dislocation recurrence risk is "high" in young athletes (9-10); 11-12 specifies "commonly cited in the 70-90% range for athletes under 20 who return to sport, dropping substantially in older, less active patients." — 9-10 §"Return to play and prevention", quiz Q8; 11-12 §"The instability spectrum", flashcard "Recurrence risk after first dislocation, under 20"
6. Bankart lesion (anterior-inferior labrum torn off the glenoid rim) and Hill-Sachs lesion (compression divot in the posterior humeral head) as companion injuries from anterior dislocation that explain high recurrence. — 11-12 §"The instability spectrum", quiz Q1, flashcards "Bankart lesion"/"Hill-Sachs lesion"
7. TUBS (Traumatic, Unidirectional, Bankart, Surgery) vs. AMBRI (Atraumatic, Multidirectional, Bilateral, Rehab-first, Inferior capsular shift) instability classification. — 11-12 §"The instability spectrum", quiz Q2
8. Scapulohumeral rhythm — "roughly every 2 degrees of motion at the glenohumeral joint... the scapula rotates about 1 degree" (2:1 ratio); breakdown = scapular dyskinesis. — 11-12 §"Static vs. dynamic stabilizers"
9. The humeral head's articular surface "contacts only about a quarter to a third of the glenoid" at any given moment (the "golf ball on a tee" comparison). — 11-12 §"Static vs. dynamic stabilizers"
10. Internal impingement (posterior cuff undersurface vs. posterior-superior labrum in maximal abduction/external rotation — throwing-specific) is distinct from classic subacromial impingement (cuff vs. acromion during overhead reaching — more typical in swimmers). — 11-12 §"The overhead athlete's shoulder", quiz Q5
11. ⚠ Little League shoulder = a stress injury/epiphysiolysis of the proximal humeral growth plate from repetitive throwing torque in skeletally immature athletes; "managed with rest from throwing, not by pitching through it." — 11-12 §"Youth pitching load and Little League shoulder", quiz Q3, callout
12. ⚠ Posterior sternoclavicular (SC) dislocation is "a true emergency" — the medial clavicle displaces backward toward the trachea, esophagus, and great vessels; difficulty breathing/swallowing or voice change after a chest blow signals this injury. — 11-12 §"AC joint and clavicle: grading further and the SC joint distinction", quiz Q6
13. Clavicle fractures are "most common in the middle third of the bone." — 11-12 §"AC joint and clavicle"

## hydration-nutrition

- [ ] 7-8 — "Fueling Up: Water and Food for Young Athletes" (`hydration-nutrition-ms`)
- [ ] 9-10 — "Hydration & Sports Nutrition" (`hydration-nutrition`)
- [ ] 11-12 — "Performance Nutrition: Fueling Science for Serious Athletes" (`hydration-nutrition-adv`)

**Claims to verify**

1. ⚠ "Each pound of body weight lost during exercise is roughly 16 oz (2 cups) of sweat; replace fluids at roughly 20-24 oz of fluid per pound lost." — 9-10 §"Dehydration: recognizing it early"; §"Practical hydration guidelines"; quiz Q2; flashcard "Fluid replacement after weigh-in"
2. "An athlete's body is roughly 60% water." — 9-10 §"Why hydration and fueling matter"
3. "A body weight loss of more than 2% during exercise … is linked to measurable drops in performance and rising heat-illness risk (e.g., a 150 lb athlete losing 3+ lbs)." — 9-10 §"Dehydration: recognizing it early"; flashcard "2% body weight loss rule"
4. "During activity, take fluid breaks roughly every 15-20 minutes, more often in heat." — 9-10 §"Practical hydration guidelines"
5. "Sports drinks earn their place when a session runs longer than about 60 minutes, or with heavy sweat losses; otherwise water plus normal meals covers it." — 9-10 §"Water vs. sports drinks"; quiz Q3, Q4
6. ⚠ "Overhydration/hyponatremia from drinking far beyond fluid losses can cause confusion, nausea, swelling, seizures, and in rare severe cases can be fatal; giving more water makes it worse." — 9-10 §"Overhydration and hyponatremia — a real but different danger"; quiz Q5; adv §"Hyponatremia, fully: mechanism and the thirst-vs-programmed debate"
7. "Caffeine is a mild diuretic, and energy drinks are not designed or tested for use during exercise." — 9-10 §"Water vs. sports drinks" callout
8. ⚠ "Deliberate rapid dehydration to 'cut weight' … has caused wrestler deaths; even with rapid same-day rehydration, measurable costs to strength, reaction time, and cardiovascular capacity persist into competition." — 9-10 §"Myths worth unlearning"; quiz Q8; adv §"Body composition, weight-class sports, and knowing when to refer"; adv quiz Q4
9. "Pre/post-activity meal timing: 3-4 hours before = larger balanced meal; 1-2 hours before = light carb-focused snack; within about 30-60 minutes after = combined carb+protein snack." — 9-10 §"Timing: before and after activity"; quiz Q7
10. "Carbohydrate is stored as glycogen — roughly 80-100 g in the liver and 300-500 g in muscle." — adv §"Fuel use across the intensity spectrum"
11. "Athletes in regular training generally do well around 1.2-2.0 g of protein per kg of body weight per day, vs. roughly 0.8 g/kg for the general population." — adv §"Protein: synthesis, timing, and realistic targets"; flashcard "Realistic athlete protein target"
12. "Sweat rate varies enormously between athletes — anywhere from roughly 0.5 to over 2.5 liters per hour." — adv §"Measuring your own sweat rate"
13. ⚠ "Carbo-loading provides real, measurable benefit mainly for continuous events lasting roughly 90 minutes or more that can meaningfully deplete glycogen." — adv §"Periodized eating: fueling the work you're actually doing"; quiz Q1

## taping-wrapping

- [ ] 7-8 — "What Tape and Wraps Are For" (`taping-wrapping-ms`)
- [ ] 9-10 — "Taping & Wrapping Basics" (`taping-wrapping`)
- [ ] 11-12 — "Taping and Bracing: Technique Mastery and the Evidence" (`taping-wrapping-adv`)

**Claims to verify**

1. ⚠ "Never tape or wrap: an acute injury not yet evaluated, a suspected fracture or dislocation, an open wound/active bleeding/road rash/fresh blister/suture line under where tape would sit, or a joint an athlete wants taped specifically to hide pain." — 9-10 §"When NOT to tape or wrap"; adv §"Skin integrity: allergy, removal, and wounds"; adv quiz Q5; ms §"Taping is an adult's job — not yours yet"
2. ⚠ "Signs a wrap is too tight: capillary refill slower than 2 seconds, numbness/tingling, pale/blue/cool skin, or increasing throbbing pain — normal capillary refill is under 2 seconds." — 9-10 §"After you wrap: the circulation check"; quiz Q3; ms §"Too tight? Speak up right away"; flashcards both bands
3. ⚠ "Compression wraps must always go distal to proximal (start farthest from the heart); wrapping the other direction can trap fluid and make swelling worse." — 9-10 §"Elastic wraps: spirals and figure-8s"; quiz Q2; flashcard "Distal to proximal"
4. "Closed basket weave build order: two anchor strips, then alternating stirrups and horseshoes (each overlapping about half its width), finished with figure-8s and heel locks." — 9-10 §"Ankle taping: the closed basket weave"; adv §"Effective vs. decorative: what a good tape job actually requires"; adv quiz Q1
5. "A well-applied rigid ankle tape job loses a substantial share of its initial motion restriction within about 20-30 minutes of activity, even when applied correctly." — adv §"The evidence layer: how long does taping actually work?"; quiz Q6; flashcard "Mechanical restriction decay"
6. "Systematic reviews of kinesiology tape find weak, inconsistent evidence for pain/swelling/performance claims beyond placebo; it provides no meaningful mechanical restriction, unlike rigid tape." — adv §"Materials science: what each product actually does"; quiz Q3; flashcard
7. "Semi-rigid ankle braces are comparably effective to tape at reducing sprain recurrence across a season, and hold their mechanical properties through a full session in a way tape does not." — adv §"The evidence layer"; quiz Q4; flashcard "Tape vs. brace — comparative evidence"
8. "Evidence for prophylactic (blanket) ankle taping is strongest in athletes with a prior sprain history, not for taping every healthy ankle as routine policy." — adv §"Clinical reasoning: tape, brace, or nothing?"; flashcard "Prophylactic taping debate"
9. "Contact dermatitis (rash tracing the tape's exact outline, appearing hours to about a day after application) is distinct from a friction blister (localized to one pressure/crossover point, appearing during activity) and needs a different fix." — adv §"Skin integrity"; quiz Q7; flashcard
10. "Correct tape removal: peel back slowly with the underlying skin supported, or cut with tape scissors — ripping tape off can tear the epidermis, a real cumulative risk over a season of daily taping." — adv §"Skin integrity"; quiz Q8; flashcard "Correct tape removal technique"
11. "Turf toe taping limits hyperextension at the first MTP joint; thumb spica taping restricts thumb abduction/extension to protect the UCL; McConnell-style patellar taping influences kneecap tracking and is thought to work mainly via pain modulation/cueing rather than permanent mechanical realignment." — adv §"Beyond the basic weave: advanced patterns at a glance"

## warmup-injury-prevention

- [ ] 7-8 — "Why Warming Up Matters" (`warmup-injury-prevention-ms`)
- [ ] 9-10 — "Warming Up Right: The Science of Injury Prevention" (`warmup-injury-prevention`)
- [ ] 11-12 — "Warm-Up Physiology and Injury-Prevention Program Design" (`warmup-injury-prevention-adv`)

**Claims to verify**

1. "Warm-up length guidance differs by band: ms says a warm-up 'only takes about 10 minutes'; 9-10 says 'roughly 10-15 minutes'; FIFA 11+ (adv) runs about 20 minutes total." — ms §"Skipping it is a bad trade"; 9-10 §"Putting it into practice"; adv §"Inside a program like FIFA 11+"
2. ⚠ "Cold muscles are stiffer and more injury-prone, so warm-ups matter MORE, not less, in cold weather — never shorten or skip them for that reason." — ms §"Skipping it is a bad trade" callout; 9-10 §"Putting it into practice" callout; adv §"Individualizing the warm-up" callout
3. "Warming up raises muscle temperature, which makes muscle fibers more elastic — improving both power output and the tissue's ability to absorb force without tearing." — 9-10 §"What a warm-up actually does to the body"
4. ⚠ "Static stretching immediately before intense activity does not reduce injury risk and can cause a brief, temporary dip in muscular power; it belongs after activity/in the cool-down." — 9-10 §"Dynamic vs. static stretching — order matters"; quiz Q3, Q7; ms §"Don't stretch and hold cold muscles"; adv §"What the research actually shows"; flashcards
5. "Effective warm-up structure moves general → specific: general cardio, then dynamic stretching/mobility, then sport-specific movement." — 9-10 §"Building an effective warm-up: three phases"; quiz Q4
6. ⚠ "Structured injury-prevention programs like FIFA 11+ reduce lower-extremity injury rates by roughly one-third to one-half in teams using them consistently; non-contact ACL injury reductions run closer to half." — adv §"What the research actually shows"
7. "FIFA 11+ specific structure: Part 1 running exercises (~8 min), Part 2 strength/plyometric/balance exercises (six core exercises, three progressive difficulty levels, ~10 min), Part 3 running exercises again at higher speed (~2 min); about 20 minutes total." — adv §"Inside a program like FIFA 11+: the actual three-part structure"; quiz Q5
8. "Research points to raising muscle temperature by roughly 1-2°C (about 2-4°F) above resting to meaningfully shift tissue properties; a few light jogging strides don't reliably get there." — adv §"Why warm tissue survives more: viscoelasticity and the stress-strain curve"; flashcard "Target muscle temperature rise for a warm-up"
9. "The post-activation potentiation (PAP) window is roughly 5-12 minutes after a sufficiently intense activating bout." — adv §"Neuromuscular activation and post-activation potentiation"; flashcard "PAP window"
10. "RAMP (Raise, Activate, Mobilize, Potentiate) is the framework used at the collegiate and professional level to build a warm-up." — adv §"RAMP: a working framework for building the warm-up"
11. "Sustained static stretching can trigger autogenic inhibition via the Golgi tendon organ, dampening the stretched muscle's own contraction signal, which is why it can reduce power right before intense activity." — adv §"What the research actually shows"; quiz Q4
12. ⚠ "Heavy-load or maximal-effort potentiation exercises (loaded jumps, heavy squats, sprint-out efforts) carry their own injury risk if form/load isn't appropriate — this is coach/strength-coach/AT programming territory, not something a student aide should introduce independently." — adv §"Neuromuscular activation and post-activation potentiation" callout

---

# References by strand

Authoritative sources a teacher can verify each strand's claims against —
position and consensus statements (NATA, AMSSM, IOC, AHA, Wilderness
Medical Society, IADT), clinical-body guidance (CDC, AAOS OrthoInfo, AAO,
ACS Stop the Bleed), and peer-reviewed reviews/meta-analyses. No blogs,
Wikipedia, or commercial health sites. Each source lists the claim
numbers (from that strand's checklist above) it covers.

**How to read this section:** find your strand, then the source whose
"Covers claims" list includes the number you're checking. Where a claim
has no authoritative match, it's marked *"No strong source found —
teacher's judgment"* rather than propped up with a weak citation; those
are hands-on clinical-skill points (e.g. taping technique) that live in
textbooks/skills courses rather than position statements, or scope-of-
practice judgments, not empirical claims.

**Caveats on the links.** URLs were captured from web searches in July
2026 and can drift as organizations reorganize their sites — if one
404s, search the document title. A few publisher sites (AAFP, NCSL, Stop
the Bleed) block automated fetching but open fine in a browser. Continuously
updated references (StatPearls, AAOS OrthoInfo) are labeled with an
approximate current-edition year rather than a fixed publication date.

**What the sourcing already resolved.** Two of the flagged items above now
have answers from the sources: (1) current ACS Stop the Bleed guidance
still teaches **"2-3 inches above the wound"** as the default, reserving
"high and tight" for active-threat or untrained-responder scenes — so the
two bands aren't contradictory but should say *when* each applies; and
(2) a 2019 meta-analysis puts the female:male ACL injury ratio nearer
**~2-5.5x**, not the units' "2-8x" — the high end is likely overstated.
Both are worth a content fix.


### concussion

- International Conference on Concussion in Sport. *Amsterdam International Consensus Statement on Concussion in Sport* (2023, BJSM). Covers claims 1, 3, 5, 6, 8, 9, 10, 11, 12, 13: biomechanics, SIS, RTP, SCAT/Maddocks, CTE limits. https://pubmed.ncbi.nlm.nih.gov/37316210/
- CDC. *HEADS UP* concussion program (current). Covers claims 1, 2, 3, 5, 6, 7, 11: basics, LOC rarity, RTP steps, sideline signs. https://www.cdc.gov/heads-up/index.html
- Sports medicine legal review. *The Legal Landscape of Concussion: Implications for Sports Medicine Providers* (peer-reviewed). Covers claim 4: state removal/clearance law structure. https://pmc.ncbi.nlm.nih.gov/articles/PMC5010135/
- NATA. *Bridge Statement: Management of Sport-Related Concussion* (2024 update to 2014 position statement). Covers claims 5, 7, 11, 14: RTP progression, rest, baseline testing. https://pmc.ncbi.nlm.nih.gov/articles/PMC10976336/
- Peer-reviewed neuropathology consensus. *Chronic Traumatic Encephalopathy (CTE): Criteria for Neuropathological Diagnosis and Relationship to Repetitive Head Impacts* (2023, Acta Neuropathologica). Covers claim 13: autopsy-only diagnosis, no living-person test. https://pmc.ncbi.nlm.nih.gov/articles/PMC10020327/

### heat-illness

- NATA. *Position Statement: Exertional Heat Illnesses* (Casa et al., J Athl Train 2015). Covers claims 2, 3, 4, 5, 6, 7, 8, 11, 12: EHS/exhaustion thresholds, cooling protocol, rectal temp, WBGT. https://www.nata.org/sites/default/files/2025-08/exertional_heat_illnesses.pdf
- NATA. *Position Statement: Preventing Sudden Death in Sports* (Casa et al., 2012). Covers claims 1, 9: EHS as leading cause of sudden death, exertional sickling overlap. https://www.nata.org/sites/default/files/Preventing-Sudden-Death-Position-Statement_1.pdf
- NATA. *Consensus Statement: Sickle Cell Trait and the Athlete*. Covers claim 9: exertional sickling presentation and emergency response. https://www.nata.org/sites/default/files/2025-08/sicklecelltraitandtheathlete.pdf
- Wilderness Medical Society. *Clinical Practice Guidelines for the Management of Exercise-Associated Hyponatremia: 2019 Update*. Covers claim 10: EAH vs. EHS differential, fluid overload risk. https://journals.sagepub.com/doi/10.1016/j.wem.2019.11.003

### emergency-action-plan

- NATA. *Position Statement: Emergency Action Plan Development and Implementation in Sport* (2024, supersedes 2002 statement). Covers claims 1, 5, 6, 7, 11: EAP structure, AED timing/pad placement, compression fraction, heat-emergency response. https://pmc.ncbi.nlm.nih.gov/articles/PMC11220767/
- American Heart Association. *2020 Guidelines for CPR and Emergency Cardiovascular Care — Adult Basic Life Support* (Circulation). Covers claims 2, 3, 4: compression rate/depth, agonal breathing, AED safety mechanism. https://www.ahajournals.org/doi/10.1161/CIR.0000000000000916
- NATA. *Position Statement: Lightning Safety for Athletics and Recreation*. Covers claim 10: the 30-30 rule. https://www.nata.org/sites/default/files/2025-08/lightning_safety_for_athletics_and_recreation.pdf
- JACC state-of-the-art review. *Sudden Cardiac Death in Young Athletes* (2023, Journal of the American College of Cardiology). Covers claims 1, 8, 9: minute-by-minute survival drop, commotio cordis mechanism, structural vs. electrical causes. https://www.jacc.org/doi/10.1016/j.jacc.2023.10.032
- NATA. *Position Statement: Acute Management of the Cervical Spine-Injured Athlete*. Covers claim 13: spinal motion restriction, helmet non-removal, log-roll exception. https://pmc.ncbi.nlm.nih.gov/articles/PMC2681208/
- National Conference of State Legislatures. *Laws on Cardiac Arrest and Defibrillators (AEDs)*. Covers claim 12: Good Samaritan protection, AED registration/EMS-dispatch laws. https://www.ncsl.org/research/health/laws-on-cardiacarrest-and-defibrillators-aeds

### cold-exposure

- NATA. *Position Statement: Environmental Cold Injuries* (Cappaert et al., J Athl Train). Covers claims 1, 2, 3, 4, 9, 12, 13: heat-loss mechanisms, shivering failure, gentle handling, frostbite field care, staging, injury-type distinctions. https://pmc.ncbi.nlm.nih.gov/articles/PMC2582557/
- Wilderness Medical Society. *Clinical Practice Guidelines for the Out-of-Hospital Evaluation and Treatment of Accidental Hypothermia: 2019 Update*. Covers claims 2, 3, 5, 6, 7, 8, 9, 10: shivering-failure threshold, cardiac fragility, "not dead until warm," cold-water immersion physiology (1-10-1, cold shock, conduction rate), staging, alcohol/caffeine myths. https://journals.sagepub.com/doi/10.1016/j.wem.2019.10.002
- Wilderness Medical Society. *Clinical Practice Guidelines for the Prevention and Treatment of Frostbite: 2024 Update*. Covers claims 4, 11, 12: field frostbite care, definitive rewarming protocol, freezing vs. non-freezing injury distinction. https://journals.sagepub.com/doi/10.1177/10806032231222359

### sports-psychology

- International Olympic Committee. *Mental Health in Elite Athletes: IOC Consensus Statement* (2019, BJSM). Covers claims 5, 6, 7, 8, 9, 10: burnout/injury links, fear of reinjury, identity transition, biopsychosocial model, differential referral, consultant role. https://stillmed.olympics.com/media/Documents/Athletes/Medical-Scientific/Consensus-Statements/2019_Mental-health-in-elite-athletes.pdf
- International Olympic Committee. *2023 IOC Consensus Statement on Relative Energy Deficiency in Sport (REDs)*. Covers claim 1: menstrual dysfunction and bone-stress-injury pattern as medical red flags. https://www.olympics.com/ioc/news/ioc-publishes-new-consensus-statement-on-relative-energy-deficiency-in-sport-reds-to-protect-athlete-health
- NATA. *Interassociation Recommendations for Developing a Plan to Recognize and Refer Student-Athletes With Psychological Concerns at the Secondary School Level: A Consensus Statement* (2015). Covers claims 3, 4: crisis escalation duty, expanded warning signs. https://pmc.ncbi.nlm.nih.gov/articles/PMC4477918/
- SAMHSA / Vibrant Emotional Health. *988 Suicide & Crisis Lifeline*. Covers claims 3, 4: crisis escalation resource. https://988lifeline.org/
- NCAA. *Student-Athlete Well-Being Study* (ongoing survey series). Covers claim 2: roughly one-in-three prevalence of clinically meaningful anxiety/depression symptoms. https://www.ncaa.org/news/2023/12/13/media-center-student-athletes-report-fewer-mental-health-concerns.aspx
- Association for Applied Sport Psychology. *Certified Mental Performance Consultant (CMPC) Certification*. Covers claim 10: sport psychology consultant scope vs. licensed clinical psychologist/psychiatrist. https://appliedsportpsych.org/certification/become-certified/

### wound-care

- American College of Surgeons. *Stop the Bleed: 2-3 Inches vs High and Tight — Tourniquet Placement* (2024). Covers claims 1: tourniquet placement distance vs high-and-tight. https://www.stopthebleedofficial.com/nar-blog/2-3-inches-vs-high-and-tight.html
- NCBI Bookshelf (StatPearls). *Hemorrhagic Shock* (2023). Covers claims 2: blood volume, % loss and shock onset. https://www.ncbi.nlm.nih.gov/books/NBK470382/
- Systematic review, *European Journal of Emergency Medicine* (via PMC). *Is the use of a specific time cut-off or "golden period" for primary closure of acute traumatic wounds evidence based?* (2022). Covers claims 3: laceration closure "golden window" timing. https://pmc.ncbi.nlm.nih.gov/articles/PMC8771236/
- CDC. *Clinical Guidance for Wound Management to Prevent Tetanus* (2024). Covers claims 4: tetanus booster timing by wound type. https://www.cdc.gov/tetanus/hcp/clinical-guidance/index.html
- American Red Cross. *Bleeding (Life-Threatening External)* (2024). Covers claims 5-6: direct pressure technique, adding gauze layers. https://www.redcross.org/take-a-class/resources/learn-first-aid/bleeding-life-threatening-external
- AAFP. *Caring for Cuts, Scrapes, and Wounds* (2002, current clinical recommendation). Covers claims 7: avoiding hydrogen peroxide/alcohol in wounds. https://www.aafp.org/pubs/afp/issues/2002/0715/p315.html
- AAFP. *Management of Epistaxis* (2005, current clinical recommendation). Covers claims 8: nosebleed positioning and pinch technique. https://www.aafp.org/afp/2005/0115/p305
- American Academy of Dermatology. *How to Prevent and Treat Blisters* (2024). Covers claims 9: leaving intact blister roof in place. https://www.aad.org/public/everyday-care/injured-skin/burns/prevent-treat-blisters
- AAFP. *Dog and Cat Bites* (2014). Covers claims 10: bite wounds left open vs closed. https://www.aafp.org/pubs/afp/issues/2014/0815/p239.html
- NFHS. *Sports-Related Skin Infections Position Statement and Guidelines* (2018). Covers claims 11: herpes gladiatorum exclusion from contact activity. https://assets.nfhs.org/umbraco/media/1014740/sports_related_skin_infections_position_statement_and_guidelines_-final-april-2018.pdf

### fractures-dislocations

- AAOS. *OrthoInfo: Compartment Syndrome* (2024 edition). Covers claims 1: pain out of proportion, surgical-emergency timeline. https://orthoinfo.aaos.org/en/diseases--conditions/compartment-syndrome/
- Peer-reviewed review, *Journal of Clinical Medicine* (MDPI). *Popliteal Artery Injury Following Knee Dislocation: Anatomy, Diagnosis, Treatment, and Outcomes* (2025). Covers claims 2: knee dislocation as popliteal-artery vascular emergency. https://www.mdpi.com/2038-9582/14/1/2
- NCBI Bookshelf (StatPearls). *Posterior Hip Dislocation* (2023). Covers claims 3: posterior hip dislocation position and emergency reduction. https://www.ncbi.nlm.nih.gov/books/NBK459319/
- PMC (peer-reviewed review). *Emergency Management of Fat Embolism Syndrome* (2008). Covers claims 4: fat embolism syndrome onset timing. https://pmc.ncbi.nlm.nih.gov/articles/PMC2700578/
- MedlinePlus (NIH/NLM). *Capillary Nail Refill Test* (2023). Covers claims 5: capillary refill technique and 2-second benchmark. https://medlineplus.gov/ency/article/003394.htm
- AAOS. *OrthoInfo: Scaphoid Fracture of the Wrist* (patient education PDF). Covers claims 6: scaphoid retrograde blood supply and avascular necrosis risk. https://orthoinfo.aaos.org/PDFs/A00012.pdf
- AAOS. *OrthoInfo: Osteonecrosis of the Hip* (2024 edition). Covers claims 6: femoral neck avascular necrosis mechanism. https://orthoinfo.aaos.org/en/diseases--conditions/osteonecrosis-of-the-hip/
- NCBI Bookshelf (StatPearls). *EMS Traction Splint* (2023). Covers claims 7: traction splint use for femur fracture. https://www.ncbi.nlm.nih.gov/books/NBK507842/
- NCBI Bookshelf (StatPearls). *EMS Bone Immobilization* (2023). Covers claims 8: splinting-position exception for absent circulation. https://www.ncbi.nlm.nih.gov/books/NBK507778/
- American Red Cross. *Muscle, Bone and Joint Injury* (2024). Covers claims 9-10: never realign a joint, splint above and below site. https://www.redcross.org/take-a-class/resources/learn-first-aid/muscle-bone-joint-injury
- AAOS. *OrthoInfo: Open Fractures* (2024 edition). Covers claims 11: open-fracture wound care, no pressure on bone. https://orthoinfo.aaos.org/en/diseases--conditions/open-fractures/
- AAOS. *OrthoInfo: Growth Plate Fractures* (2024 edition). Covers claims 12: physis vulnerability and imaging need in adolescents. https://www.orthoinfo.org/en/diseases--conditions/growth-plate-fractures/

### eye-injuries

- American Academy of Ophthalmology. *YO Need to Know: 5 Pearls for Managing Hyphema* (2023). Covers claims 1: hyphema rebleed window and activity restrictions. https://www.aao.org/young-ophthalmologists/yo-info/article/yo-need-to-know-5-pearls-managing-hyphema
- American Academy of Ophthalmology, *EyeNet*. *Blowout! Managing the Orbital Floor Fracture*. Covers claims 2: orbital blowout fracture, inferior rectus entrapment urgency. https://www.aao.org/eyenet/article/blowout-managing-orbital-floor-fracture
- American Academy of Ophthalmology. *YO Need to Know: Retinal Detachment — What to Know Before Calling Retina*. Covers claims 3: retinal detachment same-day-emergency symptom triad. https://www.aao.org/young-ophthalmologists/yo-info/article/yo-need-to-know-retinal-detachment-what-to-know
- American Academy of Ophthalmology, *EyeNet*. *Treating Acute Chemical Injuries of the Cornea*. Covers claims 4, 6: alkali vs. acid mechanism, flush duration. https://www.aao.org/eyenet/article/treating-acute-chemical-injuries-of-cornea
- American Academy of Ophthalmology. *Sports Eye Safety* (2024). Covers claims 5, 9, 10: sports eye-injury epidemiology and eyewear-by-rule mandates. https://www.aao.org/eye-health/tips-prevention/injuries-sports
- American Academy of Ophthalmology. *Recognizing and Treating Eye Injuries* (2024). Covers claims 7: embedded-object rigid shield technique. https://www.aao.org/eye-health/tips-prevention/injuries
- American Academy of Ophthalmology. *What Is a Subconjunctival Hemorrhage?* (2024). Covers claims 8: subconjunctival hemorrhage self-resolution timeline. https://www.aao.org/eye-health/diseases/what-is-subconjunctival-hemorrhage
- Peer-reviewed review, *Frontiers in Cellular Neuroscience* (via PMC). *Morphological and Functional Changes of Corneal Nerves...* (2020). Covers claims 11: cornea as most nerve-dense tissue. https://pmc.ncbi.nlm.nih.gov/articles/PMC7758484/

### dental-facial-trauma

- International Association of Dental Traumatology. *Guidelines for the Management of Traumatic Dental Injuries: 2. Avulsion of Permanent Teeth* (Fouad et al., *Dental Traumatology*, 2020). Covers claims 1, 2, 3: reinsertion technique, time window, storage-medium hierarchy. https://onlinelibrary.wiley.com/doi/10.1111/edt.12573
- International Association of Dental Traumatology. *Guidelines for the Management of Traumatic Dental Injuries: 1. Fractures and Luxations of Permanent Teeth* (Bourguignon et al., *Dental Traumatology*, 2020). Covers claims 7, 8: crown fracture severity, luxation spectrum. https://onlinelibrary.wiley.com/doi/10.1111/edt.12578
- NCBI Bookshelf (StatPearls). *Mandible Fracture* (2023). Covers claims 4, 5, 6: mandible ring concept, airway compromise, mental nerve numbness. https://www.ncbi.nlm.nih.gov/books/NBK507705/
- AAFP. *Management of Epistaxis* (2005, current clinical recommendation). Covers claims 9: nosebleed pinch-duration guidance. https://www.aafp.org/afp/2005/0115/p305
- International Association of Dental Traumatology. *Guidelines for the Management of Traumatic Dental Injuries: 3. Injuries in the Primary Dentition* (Day et al., *Dental Traumatology*, 2020). Covers claims 12: primary tooth avulsion never reinserted. https://onlinelibrary.wiley.com/doi/10.1111/edt.12576
- American Dental Association. *Athletic Mouth Protectors (Mouthguards)* (2024). Covers claims 11: mouthguard fit vs. compliance evidence. https://www.ada.org/resources/ada-library/oral-health-topics/athletic-mouth-protectors-mouthguards
- No strong source found for claims 10 — teacher's judgment.

### skin-conditions

- NFHS. *Sports-Related Skin Infections Position Statement and Guidelines* (2018). Covers claims 1, 4, 10: return-to-play lesion criteria, wrestling outbreak risk, formal clearance requirement. https://assets.nfhs.org/umbraco/media/1014740/sports_related_skin_infections_position_statement_and_guidelines_-final-april-2018.pdf
- National Athletic Trainers' Association. *Position Statement: Skin Diseases* (2010). Covers claims 1, 9, 10: clearance criteria, impetigo presentation, covering-not-sufficient rule. https://www.nata.org/sites/default/files/2025-08/skin_diseases.pdf
- NFHS/OSAA. *Herpes Gladiatorum Position Statement and Guidelines*. Covers claims 2: herpes gladiatorum antiviral-course clearance rule. https://www.osaa.org/docs/health-safety/herpes.pdf
- NCBI Bookshelf (StatPearls). *Incision and Drainage* (2023). Covers claims 3: I&D as primary abscess treatment over antibiotics alone. https://www.ncbi.nlm.nih.gov/books/NBK556072/
- CDC. *Athletes: MRSA Prevention and Control* (2024). Covers claims 3, 4: MRSA in athletics, wound care and exclusion practices. https://www.cdc.gov/mrsa/prevention/athletes.html
- Peer-reviewed review (PMC). *A Comparative Analysis of Community Acquired and Hospital Acquired Methicillin Resistant Staphylococcus Aureus*. Covers claims 5, 6: mecA/PBP resistance mechanism, CA-MRSA vs. HA-MRSA resistance. https://pmc.ncbi.nlm.nih.gov/articles/PMC3749631/
- AAFP. *Dermatophyte Infections* (2003, current clinical recommendation). Covers claims 7, 8: keratin digestion/superficial spread, KOH prep and culture confirmation. https://www.aafp.org/pubs/afp/issues/2003/0101/p101.html
- CDC. *About Impetigo* (Group A Strep) (2024). Covers claims 9: honey-colored crust as diagnostic sign. https://www.cdc.gov/group-a-strep/about/impetigo.html
- MedlinePlus (NIH/NLM). *Bacteria Culture Test* (2023). Covers claims 11: culture-and-sensitivity antibiotic panel testing. https://medlineplus.gov/lab-tests/bacteria-culture-test/

### ankle-sprain

- NATA. *National Athletic Trainers' Association Position Statement: Conservative Management and Prevention of Ankle Sprains in Athletes* (2013). Covers claims 5, 8, 9, 10, 12, 13: grading timelines, balance training, bracing/taping, ice, acute-care evolution. https://pmc.ncbi.nlm.nih.gov/articles/PMC3718356/
- BMC Sports Science, Medicine and Rehabilitation. *Understanding acute ankle ligamentous sprain injury in sports* (2009). Covers claims 1, 2, 3, 4: injury incidence, ATFL vulnerability, inversion vs. eversion mechanisms. https://bmcsportsscimedrehabil.biomedcentral.com/articles/10.1186/1758-2555-1-14
- Systematic review and meta-analysis. *Diagnostic accuracy of the Ottawa ankle rule to exclude fractures in acute ankle injuries in adults* (2022). Covers claim 6: Ottawa Ankle Rules exact criteria. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9502997/
- Systematic review and meta-analysis. *Return to Play after High Ankle Sprains in Athletes* (2022). Covers claim 7: syndesmotic sprain recovery time vs. lateral sprains. https://pmc.ncbi.nlm.nih.gov/articles/PMC9679836/
- CMAJ. *Low-risk ankle injuries in children* (2018). Covers claim 11: Ottawa Ankle Rules' limits in skeletally immature/growth-plate injuries. https://pmc.ncbi.nlm.nih.gov/articles/PMC5871441/
- Dubois B, Esculier JF. *Soft-tissue injuries simply need PEACE and LOVE* (British Journal of Sports Medicine, 2020). Covers claim 13: acute-care acronym evolution PRICE/POLICE to PEACE and LOVE. https://www.researchgate.net/publication/334949162_Soft-tissue_injuries_simply_need_PEACE_and_LOVE

### knee-acl

- NATA. *National Athletic Trainers' Association Position Statement: Prevention of Anterior Cruciate Ligament Injury* (2018). Covers claims 2, 11, 12: sex-based risk disparity, neuromuscular training programs, "position of no return" biomechanics. https://www.nata.org/sites/default/files/2025-08/prevention_of_anterior_cruciate_ligament_acl_injury_position_statement.pdf
- AAOS. *Anterior Cruciate Ligament (ACL) Injuries* (OrthoInfo, 2024). Covers claims 1, 5, 6: non-contact mechanism, MCL/PCL mechanisms, Lachman test reliability. https://www.orthoinfo.org/en/diseases--conditions/anterior-cruciate-ligament-acl-injuries/
- AAOS. *Combined Knee Ligament Injuries* (OrthoInfo, 2024). Covers claims 4, 9: unhappy triad, MCL nonsurgical healing vs. ACL. https://orthoinfo.aaos.org/en/diseases--conditions/combined-knee-ligament-injuries/
- Montalvo AM, et al. *Anterior Cruciate Ligament Injury Risk in Sport: A Systematic Review and Meta-Analysis of Injury Incidence by Sex and Sport Classification* (2019). Covers claim 2: female:male ACL injury rate ratio (flagged as possibly overstated at "2-8x"). https://pmc.ncbi.nlm.nih.gov/articles/PMC6602364/
- Soligard T, et al. *Comprehensive warm-up programme to prevent injuries in young female footballers: cluster randomised controlled trial* (BMJ, 2008). Covers claim 11: FIFA 11+ effectiveness. https://pubmed.ncbi.nlm.nih.gov/19066253/
- StatPearls (NCBI Bookshelf). *Knee Dislocation* (2023). Covers claim 8: popliteal artery injury risk even after spontaneous reduction. https://www.ncbi.nlm.nih.gov/books/NBK470595/
- Systematic review and meta-analysis. *Anterior cruciate ligament injury and radiologic progression of knee osteoarthritis* (2014). Covers claim 10: long-term osteoarthritis risk after ACL injury regardless of treatment. https://pubmed.ncbi.nlm.nih.gov/24214929/
- Review. *A Review of Current Management of Knee Hemarthrosis in the Non-Hemophilic Population* (2022). Covers claim 3: rapid hemarthrosis timing vs. slower meniscal swelling. https://pmc.ncbi.nlm.nih.gov/articles/PMC8808899/
- Journal of Orthopaedic & Sports Physical Therapy. *Young Athletes Who Return to Sport Before 9 Months After Anterior Cruciate Ligament Reconstruction Have a Rate of New Injury 7 Times That of Those Who Delay Return* (2020). Covers claim 7: 9-month rehab benchmark and re-tear risk in adolescents. https://www.jospt.org/doi/10.2519/jospt.2020.9071
- Grindem H, et al. *Simple decision rules can reduce reinjury risk by 84% after anterior cruciate ligament reconstruction: the Delaware-Oslo ACL cohort study* (British Journal of Sports Medicine, 2016). Covers claim 13: quad strength limb symmetry index (~90%) as a return-to-play criterion. https://pmc.ncbi.nlm.nih.gov/articles/PMC4912389/

### muscle-strains

- Review. *Muscle Injury: Physiopathology, Diagnosis, Treatment and Clinical Presentation* (2015). Covers claims 2, 7, 9, 11: grading/return-to-play timelines, musculotendinous junction, three-phase healing, rupture/avulsion red flags. https://pmc.ncbi.nlm.nih.gov/articles/PMC4799202/
- Systematic review and meta-analysis. *Recalibrating the risk of hamstring strain injury (HSI): risk factors for index and recurrent hamstring strain injury in sport* (2020). Covers claim 4: previous strain as strongest risk factor. https://pubmed.ncbi.nlm.nih.gov/32299793/
- van Dyk N, Behan FP, Whiteley R. *Including the Nordic Hamstring Exercise in Injury Prevention Programmes Halves the Rate of Hamstring Injuries: A Systematic Review and Meta-Analysis of 8459 Athletes* (British Journal of Sports Medicine, 2019). Covers claim 5: Nordic hamstring curl reduces strain incidence. https://www.researchgate.net/publication/331367089_Including_the_Nordic_hamstring_exercise_in_injury_prevention_programmes_halves_the_rate_of_hamstring_injuries_A_systematic_review_and_meta-analysis_of_8459_athletes
- Sports Medicine Australia. *Soft Tissue Injuries* (injury fact sheet, 2023). Covers claim 3: HARM acronym (avoid heat, alcohol, running, massage) in the acute phase. https://sma.org.au/resources/injury-fact-sheets/soft-tissue-injuries-2/
- Review. *Mechanism of hamstring muscle strain injury in sprinting* (2018). Covers claims 1, 8: two-joint muscle vulnerability, terminal swing phase as peak-risk window. https://pmc.ncbi.nlm.nih.gov/articles/PMC6188997/
- Review. *Hamstring Strains: Classification and Management* (2024). Covers claim 12: eccentric hamstring vs. concentric quadriceps strength ratio. https://pmc.ncbi.nlm.nih.gov/articles/PMC11195849/
- StatPearls (NCBI Bookshelf). *Hamstring Injury* (2023). Covers claim 6: bruising tracking downward with gravity (e.g., behind the knee). https://www.ncbi.nlm.nih.gov/books/NBK558936/
- Review. *Revisiting Myositis Ossificans: A Comprehensive Stage-by-Stage Imaging Review* (2024). Covers claim 10: clinical onset and X-ray calcification timeline. https://www.mdpi.com/2813-0413/5/2/27

### overuse-injuries

- NATA. *National Athletic Trainers' Association Position Statement: Prevention of Pediatric Overuse Injuries* (2011). Covers claims 1, 3, 12: pain-progression staging, training-load guardrails, specialization limits. https://pmc.ncbi.nlm.nih.gov/articles/PMC3070508/
- AMSSM. DiFiori JP, et al. *Overuse Injuries and Burnout in Youth Sports: A Position Statement from the American Medical Society for Sports Medicine* (2014). Covers claims 1, 6, 12: recognizing overuse progression, RED-S/triad awareness, specialization guidance. https://pubmed.ncbi.nlm.nih.gov/24463910/
- IOC. *International Olympic Committee (IOC) Consensus Statement on Relative Energy Deficiency in Sport (RED-S): 2018 Update*. Covers claim 6: RED-S definition, screening, applies to any sex. https://journals.humankinetics.com/view/journals/ijsnem/28/4/article-p316.xml
- Gabbett TJ. *The training-injury prevention paradox: should athletes be training smarter and harder?* (British Journal of Sports Medicine, 2016). Covers claims 3, 10: blind spot in flat "10% rule," acute:chronic workload ratio sweet spot/danger zone. https://efsma.org/images/pdf/publications/Br-J-Sports-Med-2016-Gabbett-273-80.pdf
- StatPearls (NCBI Bookshelf). *Medial Tibial Stress Syndrome* (2023). Covers claim 2: shin splints vs. stress fracture exam distinction. https://www.ncbi.nlm.nih.gov/books/NBK538479/
- American Family Physician. *Stress Fractures: Diagnosis, Treatment, and Prevention* (2011). Covers claim 4: X-rays often normal in the first 2-3 weeks. https://www.aafp.org/pubs/afp/issues/2011/0101/p39.html
- Review. *High-Risk Stress Fractures: Diagnosis and Management* (2016). Covers claim 5: tension-side/watershed blood-supply sites prone to nonunion. https://pubmed.ncbi.nlm.nih.gov/26972260/
- Cook JL, Purdam CR. *Revisiting the continuum model of tendon pathology: what is its merit in clinical practice and research?* (British Journal of Sports Medicine, 2016). Covers claim 8: tendinopathy as a failed-healing/degenerative process, not primarily inflammatory. https://pmc.ncbi.nlm.nih.gov/articles/PMC5118437/
- Silbernagel KG, et al. *Continued Sports Activity, Using a Pain-Monitoring Model, during Rehabilitation in Patients with Achilles Tendinopathy* (American Journal of Sports Medicine, 2007). Covers claim 13: pain-monitoring load threshold for tendinopathy rehab. https://journals.sagepub.com/doi/abs/10.1177/0363546506298279
- AAOS. *Throwing Injuries in the Elbow in Children* (OrthoInfo, 2024). Covers claim 9: medial apophysitis vs. lateral-side OCD of the capitellum in young throwers. https://orthoinfo.aaos.org/en/diseases--conditions/throwing-injuries-in-the-elbow-in-children/
- Review. *How do tendons adapt? Going beyond tissue responses to understand positive adaptation and pathology development* (2019). Covers claim 11: differing adaptation/turnover timelines across cardiovascular, bone, and tendon tissue. https://pmc.ncbi.nlm.nih.gov/articles/PMC6737558/
- No strong source found for claim 7 (running shoe replacement mileage guidance) — teacher's judgment.

### shoulder-injuries

- AAOS. *Shoulder Trauma (Fractures and Dislocations)* (OrthoInfo, 2024). Covers claims 1, 2, 13: anterior dislocation prevalence, danger of field reduction, clavicle fracture location. https://orthoinfo.aaos.org/en/diseases--conditions/shoulder-trauma-fractures-and-dislocations/
- StatPearls (NCBI Bookshelf). *Anterior Shoulder Instability* (2023). Covers claims 6, 7: Bankart/Hill-Sachs lesions, TUBS vs. AMBRI classification. https://www.ncbi.nlm.nih.gov/books/NBK538234/
- Shanmugaraj A, et al. *Surgical stabilization of pediatric anterior shoulder instability yields high recurrence rates: a systematic review* (Knee Surgery, Sports Traumatology, Arthroscopy, 2021). Covers claim 5: recurrence risk after first dislocation in under-20 athletes (flagged 70-90% figure). https://esskajournals.onlinelibrary.wiley.com/doi/10.1007/s00167-020-05913-w
- Gasbarro G, et al. *Clinical anatomy and stabilizers of the glenohumeral joint* (Annals of Joint, 2019). Covers claims 4, 8, 9: rotator cuff as dynamic stabilizer, scapulohumeral rhythm, humeral head/glenoid contact area. https://aoj.amegroups.org/article/view/3864/html
- Review. *Evaluation and treatment of internal impingement of the shoulder in overhead athletes* (2016). Covers claim 10: internal impingement vs. classic subacromial impingement. https://pmc.ncbi.nlm.nih.gov/articles/PMC5155252/
- StatPearls (NCBI Bookshelf). *Proximal Humeral Epiphysiolysis* (Little League Shoulder) (2023). Covers claim 11: growth-plate stress injury from repetitive throwing, managed with rest. https://www.ncbi.nlm.nih.gov/books/NBK534301/
- StatPearls (NCBI Bookshelf). *Sternoclavicular Joint Injury* (2023). Covers claim 12: posterior SC dislocation as a true emergency near mediastinal structures. https://www.ncbi.nlm.nih.gov/books/NBK507894/
- StatPearls (NCBI Bookshelf). *Acromioclavicular Joint Injury* (2023). Covers claim 3: AC sprain vs. dislocation distinguishing signs. https://www.ncbi.nlm.nih.gov/books/NBK493188/

### hydration-nutrition

- NATA. *Fluid Replacement for the Physically Active* (McDermott et al., 2017). Covers claims 1, 2, 3, 4, 5, 12: sweat loss/replacement ratios, body water %, %BW loss thresholds, fluid-break timing, sports-drink threshold, sweat-rate range. https://www.nata.org/sites/default/files/2025-08/fluid_replacement_for_the_physically_active.pdf
- Academy of Nutrition and Dietetics, Dietitians of Canada, ACSM. *Nutrition and Athletic Performance* (2016). Covers claims 9, 10, 11, 13: meal timing, glycogen storage amounts, protein g/kg targets, carbo-loading threshold. https://pubmed.ncbi.nlm.nih.gov/26891166/
- NATA. *Safe Weight Loss and Maintenance Practices in Sport and Exercise* (2011). Covers claims 8: rapid weight-loss risks in weight-class sports. https://pmc.ncbi.nlm.nih.gov/articles/PMC3419563/
- CDC. *Hyperthermia and Dehydration-Related Deaths Associated With Intentional Rapid Weight Loss in Three Collegiate Wrestlers* (MMWR, 1998). Covers claims 8: wrestler deaths from rapid weight cutting. https://www.cdc.gov/mmwr/preview/mmwrhtml/00051388.htm
- Hew-Butler T, et al. *Statement of the Third International Exercise-Associated Hyponatremia Consensus Development Conference, Carlsbad, California, 2015*. Covers claims 6: overhydration/hyponatremia mechanism and danger. https://journals.lww.com/cjsportsmed/fulltext/2015/07000/statement_of_the_third_international.2.aspx
- Zhang Y, et al. *Caffeine and diuresis during rest and exercise: A meta-analysis* (J Sci Med Sport, 2015). Covers claims 7: caffeine's diuretic effect is minor and negated by exercise. https://pubmed.ncbi.nlm.nih.gov/25154702/

### taping-wrapping

- NATA. *Conservative Management and Prevention of Ankle Sprains in Athletes* (Kaminski et al., 2013). Covers claims 7, 8: brace-vs-tape comparative evidence, prophylactic taping strongest in prior-sprain athletes. https://www.nata.org/sites/default/files/2025-08/ankle-sprains.pdf
- Journal of ISAKOS. *Taping and bracing in the prevention of ankle sprains: current concepts* (2021). Covers claims 5: rigid tape's motion-restriction decay during activity. https://www.jisakos.com/article/S2059-7754(21)00176-0/fulltext
- Parreira PCS, et al. *Current evidence does not support the use of Kinesio Taping in clinical practice: a systematic review* (J Physiother, 2014). Covers claims 6: kinesiology tape evidence weak/inconsistent vs. placebo. https://www.sciencedirect.com/science/article/pii/S1836955314000095
- Chang WD, et al. *Effects of Kinesio Taping versus McConnell Taping for Patellofemoral Pain Syndrome: A Systematic Review and Meta-Analysis* (Evidence-Based Complementary and Alternative Medicine, 2015). Covers claims 11: McConnell patellar taping mechanism and evidence (patellar-tracking portion only). https://onlinelibrary.wiley.com/doi/10.1155/2015/471208
- No strong source found for claims 1, 2, 3, 4, 9, 10 — teacher's judgment.

### warmup-injury-prevention

- Soligard T, et al. *Comprehensive warm-up programme to prevent injuries in young female footballers: cluster randomised controlled trial* (BMJ, 2008). Covers claims 6: FIFA 11+ injury-rate reduction magnitude (32% overall in the trial). https://pmc.ncbi.nlm.nih.gov/articles/PMC2600961/
- Bizzini M, Dvorak J. *FIFA 11+: an effective programme to prevent football injuries in various player groups worldwide — a narrative review* (Br J Sports Med, 2015). Covers claims 1, 6, 7: program duration (~20 min), pooled injury/ACL reduction magnitude, three-part structure. https://pmc.ncbi.nlm.nih.gov/articles/PMC4413741/
- Behm DG, Chaouachi A. *A review of the acute effects of static and dynamic stretching on performance* (Eur J Appl Physiol, 2011). Covers claims 4, 11: static stretching's acute power deficit and its neural (autogenic inhibition) mechanism. https://link.springer.com/article/10.1007/s00421-011-1879-2
- Wilson JM, et al. *Meta-Analysis of Postactivation Potentiation and Power: Effects of Conditioning Activity, Volume, Gender, Rest Periods, and Training Status* (J Strength Cond Res, 2013). Covers claims 9: PAP window (effect greatest at 7-10 min, within the 5-12 min range). https://journals.lww.com/nsca-jscr/fulltext/2013/03000/meta_analysis_of_postactivation_potentiation_and.39.aspx
- Jeffreys I. *Warm-up revisited: the ramp method of optimizing warm-ups* (Professional Strength and Conditioning, 2007). Covers claims 5, 10: general-to-specific warm-up progression, RAMP framework. https://www.scottishathletics.org.uk/wp-content/uploads/2014/04/Warm-up-revisted-.pdf
- Shellock FG, Prentice WE. *Warming up and stretching for improved physical performance and prevention of sports-related injuries* (Sports Med, 1985). Covers claims 2, 3, 8: cold-muscle injury risk, warm-up effects on elasticity/force absorption, target temperature rise. https://link.springer.com/article/10.2165/00007256-198502040-00004
- No strong source found for claims 12 — teacher's judgment.
