# Remaining image batches — 10 images max each

Generated 2026-07-11 from `npm run images:shotlist` minus the 12 assets already landed (PR #29). **Batches 1–2 landed (2026-07-12), so 139 images across batches 3–20 remain.** Work the batches in order — thumbnails are the most visible, and the first four diagram batches are the safety-critical strands. Mark each batch's heading LANDED as it merges so this stays the source of truth for what's left.

## Ground rules for every batch

- **WebP**, exact filename and folder as listed (the app maps files by name).
- **Text in images:** thumbnails, category icons, and the hero are strictly
  text-free. **Lesson diagrams may carry short, essential labels** (step
  names, axis labels, anatomy names) when the row's description calls for
  them — the app is English-only, alt text covers accessibility, and a flow
  chart or timeline teaches nothing without its labels. Keep labels minimal
  and legible at lesson width; no paragraphs, no decorative text.
- No real people needed anywhere.
- Target **~10–40 KB per file** (stay near the ~1 MB total image budget).
- Deliver as a zip preserving the `public/images/…` folder structure.
- Each landed file also needs one entry in `REAL_IMAGE_PATHS` (`src/components/ImagePlaceholder.jsx`).
- Diagrams are teaching aids: anatomical accuracy matters and Evan vets each batch before merge.

## Batch 1: Unit card thumbnails — batch A (10 images) — LANDED 2026-07-12

3:2 (900×600), white background, no people, no embedded text. Same visual family as the four landed thumbnails (concussion/heat/EAP/wound care).

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | unit-ankle-sprain-hero.webp | 3:2 | white | public/images/units/ankle-sprain/ | Illustrative thumbnail for Ankle Sprains: Recognize, grade, and manage the most common athletic injury — and know when an ankle needs more than tape. | Thumbnail illustration for Ankle Sprains |
| 2 | unit-fractures-dislocations-hero.webp | 3:2 | white | public/images/units/fractures-dislocations/ | Illustrative thumbnail for Fractures & Dislocations: Recognize a broken bone or a joint out of place, protect the athlete, and know the one thing you must never try to fix yourself. | Thumbnail illustration for Fractures & Dislocations |
| 3 | unit-knee-acl-hero.webp | 3:2 | white | public/images/units/knee-acl/ | Illustrative thumbnail for Knee Injuries: ACL & Friends: The four major knee ligaments, the classic non-contact ACL tear, the 'unhappy triad,' and what to do when a knee gives out on the field. | Thumbnail illustration for Knee Injuries: ACL & Friends |
| 4 | unit-shoulder-injuries-hero.webp | 3:2 | white | public/images/units/shoulder-injuries/ | Illustrative thumbnail for Shoulder Injuries: The body's most mobile joint is also its least stable — tell a dislocation, a separated shoulder, and an overuse rotator cuff injury apart, and know what to do first. | Thumbnail illustration for Shoulder Injuries |
| 5 | unit-muscle-strains-hero.webp | 3:2 | white | public/images/units/muscle-strains/ | Illustrative thumbnail for Muscle Strains: Pulled hamstrings, groins, and quads: how muscles tear, how to grade and treat strains, and why athletes re-injure the same muscle. | Thumbnail illustration for Muscle Strains |
| 6 | unit-overuse-injuries-hero.webp | 3:2 | white | public/images/units/overuse-injuries/ | Illustrative thumbnail for Overuse Injuries: Shin splints, tendinopathy, and stress fractures: injuries that build up from training load, and the warning signs that separate soreness from damage. | Thumbnail illustration for Overuse Injuries |
| 7 | unit-taping-wrapping-hero.webp | 3:2 | white | public/images/units/taping-wrapping/ | Illustrative thumbnail for Taping & Wrapping Basics: Learn why athletic tape and elastic wraps are used, the core patterns behind them, and the safety checks that keep a taped or wrapped limb safe. | Thumbnail illustration for Taping & Wrapping Basics |
| 8 | unit-warmup-injury-prevention-hero.webp | 3:2 | white | public/images/units/warmup-injury-prevention/ | Illustrative thumbnail for Warming Up Right: The Science of Injury Prevention: Why a real warm-up changes how the body performs and how injured it gets — and why 'stretching' and 'warming up' are not the same thing. | Thumbnail illustration for Warming Up Right: The Science of Injury Prevention |
| 9 | unit-cold-exposure-hero.webp | 3:2 | white | public/images/units/cold-exposure/ | Illustrative thumbnail for Cold Exposure & Hypothermia: Recognize hypothermia and frostbite before they become emergencies — and know why wet, windy cold is more dangerous than a colder, dry day. | Thumbnail illustration for Cold Exposure & Hypothermia |
| 10 | unit-hydration-nutrition-hero.webp | 3:2 | white | public/images/units/hydration-nutrition/ | Illustrative thumbnail for Hydration & Sports Nutrition: Fuel and fluid strategy that actually holds up at practice and on tournament day — plus the myths worth unlearning. | Thumbnail illustration for Hydration & Sports Nutrition |

## Batch 2: Unit card thumbnails — batch B (4 images) — LANDED 2026-07-12

Same spec as batch A.

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | unit-dental-facial-trauma-hero.webp | 3:2 | white | public/images/units/dental-facial-trauma/ | Illustrative thumbnail for Dental and Facial Injuries: What to Do: Recognize and manage knocked-out teeth, cuts, nosebleeds, and possible facial fractures — and know the minutes that decide whether a tooth can be saved. | Thumbnail illustration for Dental and Facial Injuries: What to Do |
| 2 | unit-eye-injuries-hero.webp | 3:2 | white | public/images/units/eye-injuries/ | Illustrative thumbnail for Eye Injuries: Recognition and Response: Tell a minor eye irritation from a sight-threatening injury, and know exactly what to do — and not do — in the first minute. | Thumbnail illustration for Eye Injuries: Recognition and Response |
| 3 | unit-skin-conditions-hero.webp | 3:2 | white | public/images/units/skin-conditions/ | Illustrative thumbnail for Skin Infections: Recognition and Prevention: Recognize the contact-sport skin infections that spread fast in locker rooms and on mats, and know the rule that keeps them from spreading further. | Thumbnail illustration for Skin Infections: Recognition and Prevention |
| 4 | unit-sports-psychology-hero.webp | 3:2 | white | public/images/units/sports-psychology/ | Illustrative thumbnail for Mental Health in Sport: What Every Athlete Should Know: Recognize the mental health pressures that come with being an athlete, spot the signs a teammate is struggling, and learn how to connect them to help — including when it's a crisis. | Thumbnail illustration for Mental Health in Sport: What Every Athlete Should Know |

## Batch 3: Lesson diagrams — concussion (8 images)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | concussion-neurometabolic-cascade.webp | 16:9 | white | public/images/units/concussion/ | Horizontal flow diagram illustrating the neurometabolic cascade inside a stretched neuron: Step 1, potassium ions leaving the cell and calcium flooding in; Step 2, sodium-potassium pumps working overtime, consuming ATP; Step 3, a widening gap between rising glucose demand (up arrow) and falling cerebral blood flow (down arrow), labeled 'the energy crisis'; Step 4, calcium impairing mitochondria's ATP production. Use simple cell-level iconography (ion arrows, a mitochondrion icon) rather than gore. Clean diagrammatic style with labeled steps and arrows. | Flow diagram of the neurometabolic cascade after a concussion: ion imbalance, ATP-consuming pump overdrive, and the resulting mismatch between glucose demand and blood flow (the energy crisis). |
| 2 | concussion-lucid-interval-timeline.webp | 16:9 | white | public/images/units/concussion/ | Two stacked timeline graphs comparing symptom trajectory in the hours after a head impact. Top timeline, 'Typical concussion': symptom severity starts elevated at time of injury and gradually declines over the following hours. Bottom timeline, 'Lucid interval (possible structural bleed)': symptom severity dips briefly to near-normal right after the hit, then rises sharply beginning some minutes later, marked with a warning-colored zone and label 'deterioration — call 911.' Simple line-graph style, x-axis labeled 'time since impact,' y-axis labeled 'symptom severity.' | Comparison of two symptom timelines after a head impact: typical gradual concussion improvement versus a lucid interval followed by rapid deterioration suggesting a structural bleed. |
| 3 | concussion-brain-in-skull.webp | 4:3 | white | public/images/units/concussion/ | Simple side-view cross-section illustration of a head, showing the skull as an outer outline and the brain as a soft shape inside it, with a couple of light motion lines showing the brain shifting after an impact. Clean, non-graphic, simple medical-illustration style for middle schoolers, minimal labels (skull, brain). | Cross-section diagram of a head showing the brain moving inside the skull after an impact. |
| 4 | concussion-warning-signs.webp | 4:3 | white | public/images/units/concussion/ | Simple illustration of an athlete sitting on the sideline looking dazed and confused, with small clean icon callouts around them: a headache icon, a dizziness icon (swirl), and a question-mark icon for confusion. Flat, friendly illustration style, minimal detail. | Athlete on the sideline looking dazed, with icons showing headache, dizziness, and confusion. |
| 5 | concussion-second-impact-risk.webp | 16:9 | white | public/images/units/concussion/ | Simple two-panel icon-style illustration. Left panel: a head/brain icon with a small bandage or healing icon labeled 'still healing.' Right panel: the same head icon receiving a second hit, with a warning triangle symbol. Flat, non-graphic icon style appropriate for middle schoolers, minimal text. | Two-panel icon illustration showing a healing brain, then a warning symbol for a second hit before it recovers. |
| 6 | concussion-return-to-play-steps.webp | 16:9 | white | public/images/units/concussion/ | Simple left-to-right step illustration with four flat icons connected by an arrow path: a bed/rest icon, a schoolbook icon, a doctor with a checkmark icon, and a sports ball icon last, showing the order rest comes first, then school, then a doctor's okay, then sports. Clean flat icon style, minimal text. | Four-step icon illustration showing the return-to-play order: rest, school, doctor checkup, then sports. |
| 7 | concussion-brain-movement-mechanism.webp | 4:3 | white | public/images/units/concussion/ | Side-view cross-section of a head and skull, showing the brain shifted and rotated inside the skull after a sudden jolt, with a motion arrow indicating the rapid movement and a soft highlighted region where brain tissue stretches against the inner skull wall. Include a small inset showing the same jolt originating from a body hit (arrow into the torso) rather than only a direct head strike. Clean medical-illustration style. | Diagram showing the brain moving and rotating rapidly inside the skull after a jolt to the head or body, causing a concussion. |
| 8 | concussion-return-to-play-stages.webp | 16:9 | transparent | public/images/units/concussion/ | Horizontal five-step progression graphic with arrows connecting each stage in order: 1) light aerobic exercise, 2) sport-specific exercise, 3) non-contact drills, 4) full-contact practice, 5) competition. Under the arrow between each pair of stages, note '24+ hours, symptom-free.' Include a small looping arrow showing that any symptom return sends the athlete back a stage. Clean flat infographic style. | Five-stage return-to-play progression after a concussion, from light aerobic exercise through full competition, with 24-hour symptom-free gaps between stages. |

## Batch 4: Lesson diagrams — heat-illness (8 images)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | heat-illness-dissipation-pathways.webp | 16:9 | white | public/images/units/heat-illness/ | Four-panel diagram of an exercising athlete's heat-dissipation pathways: 1) Radiation — wavy heat-energy lines radiating outward from bare skin. 2) Conduction — direct heat transfer arrows into a cold object touching the skin (ice pack). 3) Convection — wind lines carrying heat away from the skin surface. 4) Evaporation — sweat droplets turning to vapor with upward arrows, labeled 'dominant pathway during intense exercise.' Include a small callout showing evaporation's vapor-pressure gradient shrinking in a humid-air version, labeled 'blocked by humidity.' Clean instructional-illustration style. | Diagram of the four heat-dissipation pathways — radiation, conduction, convection, and evaporation — with evaporation highlighted as the dominant pathway during exercise and blocked by humidity. |
| 2 | heat-illness-collapse-differential.webp | 16:9 | white | public/images/units/heat-illness/ | Four-column comparison chart for a collapsed athlete in heat. Column 1 'Sudden cardiac arrest': unresponsive, not breathing normally, no pulse — action: CPR/AED now. Column 2 'Exertional heat stroke': core temp >104°F, confusion/CNS dysfunction — action: cool first. Column 3 'Exertional sickling' (sickle cell trait): diffuse weakness, normal mental status — action: EMS, oxygen. Column 4 'Exercise-associated hyponatremia': confusion, weight stable or UP, overdrank water — action: do not give more water, EMS. Clean instructional-chart style, each column with a distinct icon. | Four-column differential chart for a collapsed athlete in a hot environment: sudden cardiac arrest, exertional heat stroke, exertional sickling, and exercise-associated hyponatremia, each with its distinguishing sign and correct action. |
| 3 | heat-illness-sweat-cooling.webp | 4:3 | white | public/images/units/heat-illness/ | Simple illustration of an athlete running or playing outdoors with visible sweat droplets on the skin and a few small motion/heat-wave lines rising off the skin, showing heat leaving the body as sweat evaporates. Clean, flat illustration style, no text in the image. | Athlete running outdoors with sweat droplets and heat lines showing the body cooling itself. |
| 4 | heat-illness-warning-signs.webp | 4:3 | white | public/images/units/heat-illness/ | Simple illustration of an athlete sitting on the sideline in hot weather, looking pale and clammy, head resting in their hands, with small clean icon callouts nearby showing a headache icon and a dizziness icon. Flat, friendly illustration style, minimal detail. | Athlete sitting on the sideline looking pale and dizzy in hot weather, with headache and dizziness icons. |
| 5 | heat-illness-heat-stroke-emergency.webp | 16:9 | white | public/images/units/heat-illness/ | Simple illustration of an athlete who has collapsed on the field in hot weather, with a teammate kneeling beside them and waving toward the sideline to call an adult. Clean, non-graphic emergency scene, plain illustration style for middle schoolers. | A teammate calling for help after another athlete collapses in hot weather. |
| 6 | heat-illness-prevention-habits.webp | 16:9 | white | public/images/units/heat-illness/ | Simple row of four flat icons showing hot-weather prevention habits: a water bottle, a shade umbrella, a small figure wearing light-colored loose clothing, and a clock showing scheduled breaks. Clean, flat icon style, minimal text. | Row of icons showing water bottle, shade, light clothing, and scheduled breaks as heat-illness prevention habits. |
| 7 | heat-illness-spectrum-triage.webp | 16:9 | transparent | public/images/units/heat-illness/ | Horizontal spectrum graphic with three connected stages in increasing severity order: 'Heat cramps' (muscle spasm icon), 'Heat exhaustion' (sweating figure, normal mental status noted), 'Heat stroke' (collapsed figure, core temp above 104°F and confusion noted). Add a dashed arrow skipping directly from the start to 'Heat stroke' labeled 'can happen without warning stages.' Clean flat infographic style. | Spectrum diagram showing heat illness progressing from heat cramps to heat exhaustion to heat stroke, with a note that heat stroke can occur without warning stages. |
| 8 | heat-illness-cold-water-immersion-technique.webp | 4:3 | white | public/images/units/heat-illness/ | An athlete seated in a large tub filled with ice water, submerged from the shoulders down, with two rescuers supporting the head and shoulders above the waterline and a bag of ice being added. A small clock icon in the corner reads 'within 10 minutes of collapse.' Clean instructional-illustration style, no distressing detail. | Diagram of whole-body cold water immersion, the definitive field treatment for exertional heat stroke. |

## Batch 5: Lesson diagrams — emergency-action-plan (8 images)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | eap-team-role-assignment.webp | 16:9 | white | public/images/units/emergency-action-plan/ | Overhead diagram of a field emergency scene with a collapsed athlete at center, surrounded by labeled role icons connected by dotted lines radiating outward: 'Scene leader' (directing), '911 caller' (on phone, confirming back), 'AED retriever' (running toward a wall-mounted AED icon), 'Gate/traffic person' (unlocking a gate and flagging an ambulance icon), 'Crowd control' (keeping teammates back), 'Documenter' (writing on a clipboard, noting times). Clean flat instructional-illustration style, non-graphic. | Diagram of six assigned emergency-response roles positioned around a collapsed athlete: scene leader, 911 caller, AED retriever, gate/traffic person, crowd control, and documenter. |
| 2 | eap-sca-cause-comparison.webp | 16:9 | white | public/images/units/emergency-action-plan/ | Three-column comparison chart of sudden cardiac arrest causes in young athletes. Column 1 'Structural': a simplified heart icon with a thickened wall region highlighted (hypertrophic cardiomyopathy) and a compressed vessel path (anomalous coronary artery). Column 2 'Electrical': a heart icon with an erratic ECG waveform overlay, labeled 'long QT syndrome, Wolff-Parkinson-White.' Column 3 'Commotio cordis': a heart icon with a small chest-impact arrow timed to a highlighted narrow window on an ECG waveform, labeled '10-30 ms vulnerable window, structurally normal heart.' Footer note: 'All three require the same immediate CPR/AED response.' Clean medical-illustration style, non-graphic. | Comparison chart of three causes of sudden cardiac arrest in young athletes: structural heart abnormalities, electrical rhythm disorders, and commotio cordis. |
| 3 | eap-collapsed-athlete-scene.webp | 16:9 | white | public/images/units/emergency-action-plan/ | Simple illustration of a sports field scene: one athlete lying still on the ground, another athlete nearby noticing them with a concerned expression, about to react. Clean, non-graphic, plain illustration style for middle schoolers, no injury detail shown. | A teammate noticing another athlete lying still on the field and reacting to an emergency. |
| 4 | eap-yell-for-help-scene.webp | 4:3 | white | public/images/units/emergency-action-plan/ | Simple illustration of a student athlete on a field or court, one arm raised and waving, calling out toward a coach standing on the sideline. Clean, flat, friendly illustration style, no text in the image. | Student athlete waving and calling out to get a coach's attention on the sideline. |
| 5 | eap-aed-wall-case.webp | 4:3 | white | public/images/units/emergency-action-plan/ | Simple illustration of an AED (automated external defibrillator) device inside its bright wall-mounted case in a gym hallway, with the cabinet door open showing the device. Clean, flat illustration style, minimal detail. | An AED device shown inside its bright wall-mounted case in a gym hallway. |
| 6 | eap-know-your-school-map.webp | 4:3 | white | public/images/units/emergency-action-plan/ | Simple overhead-style map illustration of a school gym and athletic field layout, with a small AED icon marked at its wall location and a small icon marking where a coach or athletic trainer is typically found. Clean, flat map style, minimal labels. | Simple map of a gym and field showing the AED location and where coaches are typically found. |
| 7 | eap-cpr-hand-placement.webp | 4:3 | white | public/images/units/emergency-action-plan/ | A rescuer kneeling beside a collapsed athlete lying on their back, hands correctly stacked with the heel of one hand on the center of the chest (lower half of the breastbone) and the other hand layered on top, elbows locked straight, shoulders directly over the hands. Include a small depth indicator (about 2 inches) beside the chest. Clean instructional-illustration style, no distressing detail. | Diagram of correct hand placement and body position for hands-only CPR chest compressions. |
| 8 | eap-aed-pad-placement.webp | 4:3 | white | public/images/units/emergency-action-plan/ | Front view of a torso showing the two AED pad placement locations: one pad on the upper right chest below the collarbone, one pad on the lower left side of the ribcage, with a dashed line suggesting the shock pathway between them. Include a small AED device icon beside the torso with a 'follow the voice prompts' label. Clean instructional-illustration style, no distressing detail. | Diagram showing correct AED pad placement on the chest: upper right below the collarbone and lower left side of the ribcage. |

## Batch 6: Lesson diagrams — wound-care (8 images) — LANDED 2026-07-15 (8 of 8)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | wound-care-bleeding-type-comparison.webp | 16:9 | white | public/images/units/wound-care/ | Three-panel comparison of bleeding types from a wound. Panel 1 'Capillary': slow, superficial oozing from a scraped/abraded surface (road-rash style), lighter and less pooled than the other two panels, labeled 'rarely dangerous alone.' Panel 2 'Venous': steady, dark-red flow, labeled 'low pressure, responds well to direct pressure.' Panel 3 'Arterial': bright-red blood spurting in sync with a pulse icon, labeled 'high pressure, life-threatening within minutes.' Clean medical-illustration style, non-graphic. | Comparison diagram of capillary, venous, and arterial bleeding by color, flow pattern, and urgency. |
| 2 | wound-care-junctional-wound-packing.webp | 4:3 | white | public/images/units/wound-care/ | Illustration of a deep junctional wound at the shoulder/axilla junction (revised from groin/thigh in the approved batch-6 generation) with gloved hands packing gauze firmly layer by layer while maintaining steady downward and inward pressure, with a small inset labeling 'junctional area — shoulder (axilla) meets torso, a tourniquet cannot be applied here.' Clean instructional-illustration style, non-graphic. | Diagram of wound packing technique for a deep junctional wound, showing gauze packed layer by layer into the wound cavity with sustained pressure. |
| 3 | wound-care-minor-vs-serious.webp | 4:3 | white | public/images/units/wound-care/ | Side-by-side illustration comparing a small, shallow scraped knee with light oozing to a deeper cut on a forearm with a warning-colored outline around it, showing the difference between a wound you can handle yourself and one that needs an adult. Clean, non-graphic illustration style for middle schoolers. | Comparison drawing of a minor scraped knee next to a deeper cut marked as needing an adult's attention. |
| 4 | wound-care-self-care-steps.webp | 4:3 | white | public/images/units/wound-care/ | Four small step illustrations in one image: hands being washed at a sink, a clean cloth pressed on a scraped knee, the knee being rinsed with water from a bottle, and the knee covered with a bandage. Clean, simple illustration style for middle schoolers, no gore. | Four-step illustration showing washing hands, pressing a cloth on a scrape, rinsing it, and covering it with a bandage. |
| 5 | wound-care-infection-signs.webp | 4:3 | white | public/images/units/wound-care/ | Side-by-side illustration comparing a healing scrape with a fresh bandage and normal-colored skin around it to a scrape with a bandage removed showing red, swollen skin around the edges, marked with a warning-colored outline. Clean, non-graphic illustration style for middle schoolers. | Comparison drawing of a normally healing bandaged scrape next to one with red, swollen skin showing signs of infection. |
| 6 | wound-care-nosebleed-position.webp | 4:3 | white | public/images/units/wound-care/ | Illustration of a student sitting upright and leaning slightly forward, pinching the soft part of their nose with a tissue, clearly not tilting their head back. Clean, simple illustration style for middle schoolers, no gore. | Illustration of a student sitting up and leaning slightly forward while pinching their nose for a nosebleed. |
| 7 | wound-care-open-wound-types.webp | 16:9 | white | public/images/units/wound-care/ | Five small side-by-side panels, each illustrating one open wound type on a forearm: abrasion (scraped, shallow, dirty-looking surface), laceration (jagged-edged cut), incision (clean straight cut with edges lining up), puncture (small deep entry hole), avulsion (a flap of skin torn partially away). Label each panel with its name. Clean medical-illustration style, non-graphic. | Diagram comparing five open wound types: abrasion, laceration, incision, puncture, and avulsion. |
| 8 | wound-care-direct-pressure-technique.webp | 4:3 | transparent | public/images/units/wound-care/ | A rescuer's gloved hands pressing firmly on a gauze pad over a forearm wound, with a small inset diagram showing a tourniquet band placed 2-3 inches above the wound (not over a joint) as the secondary, severe-bleeding-only backup option (revised in the approved batch-6 generation: no blank 'time applied' fill-in line, per the no-empty-callout-boxes rule — the time-recording rule is taught in the adjacent lesson text). Clean instructional-illustration style, non-graphic. | Diagram of firm direct pressure on a wound with gauze, and a tourniquet placed 2-3 inches above the wound for severe, uncontrolled bleeding. |

**Delivery note (2026-07-15):** `wound-care-bleeding-type-comparison.webp` and
`wound-care-minor-vs-serious.webp` were delivered with a sliver of the
neighboring production-sheet panel visible along the right edge. Fixed
in-repo (no regeneration needed): the sliver sat entirely on the white
margin (pixel columns 885+, card border ends by x=860), so the margin strip
was white-filled with sharp, leaving the card artwork byte-untouched. For
future batches: deliver each card as a standalone, full-frame render with
no part of any adjacent panel in frame.

## Batch 7: Lesson diagrams — ankle-sprain (9 images) — LANDED 2026-07-15 (9 of 9; 3 redone, see note below the table)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | ankle-sprain-syndesmosis-anatomy.webp | 4:3 | white | public/images/units/ankle-sprain/ | Anterior view of the distal tibia and fibula just above the ankle joint, highlighting the syndesmosis structures in a distinct color: the anterior inferior tibiofibular ligament (AITFL), posterior inferior tibiofibular ligament (PITFL), interosseous ligament, and interosseous membrane binding the two bones together. Small inset arrows show the squeeze test (hands compressing tibia and fibula together at mid-calf) and the external rotation (Kleiger) test. Clean medical-illustration style, labeled structures. | Diagram of the ankle syndesmosis — AITFL, PITFL, interosseous ligament and membrane binding the tibia and fibula — with squeeze-test and external-rotation-test insets. |
| 2 | ankle-sprain-differential-diagnosis.webp | 16:9 | white | public/images/units/ankle-sprain/ | Three-panel comparison illustration of ankle-sprain differentials. Panel 1, 'Peroneal tendon subluxation': lateral ankle with tendons highlighted snapping out of their groove posterior to the lateral malleolus. Panel 2, 'Osteochondral lesion of the talus': cross-section of the talar dome with a shaded defect where cartilage/bone has sheared off. Panel 3, 'Growth-plate (Salter-Harris) injury': a skeletally immature ankle with the distal fibular growth plate highlighted as the point of failure instead of the ligament. Label each panel with its name and the one distinguishing exam finding. Clean medical-illustration style, non-graphic. | Three-panel comparison of ankle-sprain differentials: peroneal tendon subluxation, osteochondral lesion of the talus, and a growth-plate injury in a younger athlete. |
| 3 | ankle-sprain-ligament-basics.webp | 4:3 | white | public/images/units/ankle-sprain/ | Simple side view of an ankle showing the ligaments as sturdy strap-like bands connecting the shin bone and foot bone. Highlight one ligament in red on the outside of the ankle, shown stretched and slightly torn, to illustrate what a sprain is. Clean, simple illustration style for middle schoolers, minimal labels. | Simple diagram of ankle ligaments, with one shown stretched and torn on the outside of the ankle. |
| 4 | ankle-sprain-swelling-signs.webp | 4:3 | white | public/images/units/ankle-sprain/ | Side-by-side illustration comparing a normal ankle and a sprained ankle with visible puffy swelling and light bruising around the outside bone. Simple, clean line-and-color style appropriate for middle schoolers, no gore. | Comparison drawing of a normal ankle next to a swollen, bruised sprained ankle. |
| 5 | ankle-sprain-rice-steps.webp | 4:3 | white | public/images/units/ankle-sprain/ | Simple illustration of an athlete sitting on a bench with an ice pack wrapped in a thin towel on their ankle, the leg propped up on a pillow above heart level. Clean, friendly illustration style, no text in the image. | Athlete sitting with an ice pack on a wrapped ankle propped up above heart level. |
| 6 | ankle-sprain-deformity-warning.webp | 4:3 | white | public/images/units/ankle-sprain/ | Side-by-side illustration comparing a normal ankle to one with an obvious bent or crooked deformity, drawn simply with a warning-colored outline around the injured ankle to signal danger. Clean, non-graphic style for middle schoolers. | Comparison drawing of a normal ankle next to a bent, deformed ankle marked as a warning sign. |
| 7 | ankle-sprain-lateral-ligaments.webp | 4:3 | white | public/images/units/ankle-sprain/ | Lateral (outside) view of a right ankle joint showing the tibia, fibula, and talus with the lateral malleolus labeled. Highlight the three lateral ligaments in a distinct color: ATFL (anterior talofibular), CFL (calcaneofibular), and PTFL (posterior talofibular), each labeled with its full name and abbreviation. Clean medical-illustration style, neutral foot position. | Diagram of the lateral ankle ligaments — ATFL, CFL, and PTFL — connecting the fibula to the talus and calcaneus. |
| 8 | ankle-sprain-inversion-mechanism.webp | 4:3 | transparent | public/images/units/ankle-sprain/ | Side view of a right foot and lower leg mid-inversion, sole rolling inward and toes pointed slightly down, weight coming down on the outer edge of the foot after a landing. Use a motion arrow to show the foot rolling inward relative to the leg, and shade the lateral ligaments under tension. Simple athletic-illustration style, no background clutter. | Diagram of an ankle inversion sprain mechanism, showing the foot rolling inward under body weight during a landing. |
| 9 | ankle-sprain-grading-comparison.webp | 16:9 | white | public/images/units/ankle-sprain/ | Three-panel side-by-side comparison of a lateral ankle, one panel per grade. Grade I: ligament fibers stretched but intact, mild puffiness. Grade II: ligament partially torn (visible frayed fibers), moderate swelling and a light bruise shading. Grade III: ligament completely torn with a visible gap, pronounced swelling and bruising, joint sitting slightly out of normal alignment. Label each panel with its grade number and one-line severity descriptor. Clean medical-illustration style. | Comparison diagram of Grade I, II, and III ankle sprains showing increasing ligament damage, swelling, and bruising. |

**Landed 6 of 9 (2026-07-15):** rows 1, 2, 3, 7, 8, 9
(`syndesmosis-anatomy`, `differential-diagnosis`, `ligament-basics`,
`lateral-ligaments`, `inversion-mechanism`, `grading-comparison`). Four of
these arrived with a neighboring-card sliver bleeding into the top (and, on
grading/inversion, a side) margin — fixed in-repo by white-filling the
margin outside each card (artwork untouched, dimensions unchanged), the same
technique used on batch 6.

**Redone and landed (2026-07-15):** rows 4, 5, 6
(`swelling-signs`, `rice-steps`, `deformity-warning`) first came back on the
wrong topic (a red-flags checklist, a sports-mechanism scene, and a
photorealistic exam scene with real people, respectively). The redo batch
returned all three on-topic and illustrated — swelling-signs = normal vs.
swollen ankle, rice-steps = athlete resting with ice + elevation (faceless),
deformity-warning = normal vs. bent/deformed ankle with a warning box. The
redos still arrived with thin neighbor slivers at an edge (top/left), fixed
in-repo the same way as the rest. Strand complete 9/9.

Recurring across batches 6 and 7: neighbor-panel slivers at image edges (and
in the first batch-7 delivery, wrong-topic filenames + one photoreal image).
Deliver each card as a fully standalone illustrated frame with nothing from
any adjacent card in view.

## Batch 8: Lesson diagrams — fractures-dislocations (8 images) — LANDED 2026-07-16 (8 of 8, clean delivery)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | fractures-dislocations-pattern-classification.webp | 16:9 | white | public/images/units/fractures-dislocations/ | Six-panel diagram of fracture patterns on a long bone shaft, each panel showing the same bone segment with a different break line: 1) Transverse — a straight break perpendicular to the shaft. 2) Oblique — a diagonal break line. 3) Spiral — a corkscrew break wrapping around the shaft. 4) Comminuted — three or more bone fragments. 5) Greenstick — a partial break with bending on one side, unbroken cortex on the other (pediatric bone). 6) Buckle (torus) — a compressed bulge in the bone surface with no clean break line (pediatric bone). Label each panel with its name and a one-word mechanism cue (direct blow, bending, twisting, high-energy, pediatric bending, pediatric compression). Clean medical-illustration style. | Six-panel classification diagram of fracture patterns: transverse, oblique, spiral, comminuted, greenstick, and buckle. |
| 2 | fractures-dislocations-patellar-vs-knee-dislocation.webp | 16:9 | white | public/images/units/fractures-dislocations/ | Two-panel comparison at the knee. Left panel 'Patellar dislocation': the kneecap displaced to the outside of the knee, femur and tibia still aligned, labeled 'painful and dramatic, rarely limb-threatening.' Right panel 'True knee (tibiofemoral) dislocation': the tibia and femur separated at the joint itself, with the popliteal artery highlighted running directly behind the joint and shown compressed/kinked, labeled 'vascular emergency — immediate EMS.' Clean medical-illustration style, non-graphic. | Comparison diagram of a patellar (kneecap) dislocation versus a true tibiofemoral knee dislocation, highlighting the popliteal artery's vascular risk in the latter. |
| 3 | fractures-dislocations-fracture-vs-dislocation.webp | 4:3 | white | public/images/units/fractures-dislocations/ | Simple side-by-side diagram: left side shows a forearm bone with a break highlighted in red (a fracture); right side shows a shoulder joint with the bones out of their normal alignment (a dislocation). Clean, labeled, non-graphic medical-illustration style for middle schoolers. | Side-by-side diagram comparing a broken forearm bone to a dislocated shoulder joint. |
| 4 | fractures-dislocations-warning-signs.webp | 4:3 | white | public/images/units/fractures-dislocations/ | Simple side-by-side illustration comparing a normal arm to an injured arm that looks bent, crooked, and swollen, with a couple of small arrows pointing to the deformity and swelling. Clean, non-graphic style for middle schoolers. | Comparison drawing of a normal arm next to an arm with a crooked, swollen deformity. |
| 5 | fractures-dislocations-do-not-move.webp | 4:3 | white | public/images/units/fractures-dislocations/ | Simple icon-style illustration showing two hands hovering just above an injured limb without touching it, with a small red 'no' symbol, plus a small icon of a person pointing or calling for an adult nearby. Flat, plain icon style, minimal detail. | Icon illustration of hands hovering near an injured limb without touching it, with a call-for-adult icon. |
| 6 | fractures-dislocations-doctor-xray-decision.webp | 4:3 | white | public/images/units/fractures-dislocations/ | Simple, calm illustration of a doctor in a clinic looking at an X-ray image of a bone displayed on a lightbox or screen, showing that a doctor is the one who decides when an athlete can return to play. Clean, flat illustration style. | A doctor looking at an X-ray image of a bone in a clinic. |
| 7 | fractures-dislocations-bone-vs-joint-diagram.webp | 16:9 | white | public/images/units/fractures-dislocations/ | Two-panel comparison at a shoulder joint. Left panel: a fracture — a break line through the humerus bone itself, with the joint still properly seated. Right panel: a dislocation — the humeral head displaced completely out of its socket, with the bone itself intact. Label each panel 'Fracture' and 'Dislocation.' Clean medical-illustration style, no graphic detail. | Comparison diagram of a bone fracture versus a joint dislocation at the shoulder. |
| 8 | fractures-dislocations-open-vs-closed.webp | 4:3 | white | public/images/units/fractures-dislocations/ | Two-panel cross-section comparison of a broken lower leg. Left panel: closed fracture — the break line is visible through a translucent skin overlay, but the skin surface is intact. Right panel: open fracture — a wound in the skin with the edge of the bone visible at the wound margin, and a dressing with gentle pressure being applied around (not on top of) the exposed bone. Label each panel 'Closed' and 'Open.' Clean clinical-illustration style, non-graphic. | Comparison diagram of a closed fracture (skin intact) and an open fracture (bone exposed through a wound). |

**Landed 8/8 clean (2026-07-16):** best delivery yet — standalone full-frame
cards, no neighbor slivers, no photographs, all on-topic and medically
accurate. Two deliberate, sound author refinements the unit JSON was updated
to match:
- **Row 3 (`fracture-vs-dislocation`)** was delivered as an *illustrated
  athlete recognition graphic* (a teen holding a painful/swollen forearm vs.
  a teen whose shoulder looks out of place) rather than the isolated
  forearm-bone / shoulder-joint diagram originally briefed — intentional, to
  avoid duplicating row 7's detailed bone-vs-joint anatomy. The slot's
  `alt`/`description` in `fractures-dislocations-ms.json` were rewritten to
  describe the actual image.
- **Row 8 (`open-vs-closed`)** shows a *small skin wound communicating with
  the fracture* rather than protruding bone (medically correct per AAOS — an
  open fracture doesn't require exposed bone). The `alt`/`description` in
  `fractures-dislocations.json` were updated from "bone exposed through a
  wound" to "a small skin wound connecting to the break."

## Batch 9: Lesson diagrams — knee-acl (8 images) — LANDED 2026-07-16 (8 of 8; differential chart timing corrected in-repo)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | knee-acl-position-of-no-return.webp | 16:9 | white | public/images/units/knee-acl/ | Illustration of an athlete decelerating during a cutting maneuver, captured at the instant of ACL failure: knee near full extension, collapsing inward (dynamic valgus) relative to the planted foot, tibia shown rotated relative to the femur with a small rotation arrow, and the trunk leaning/rotating toward the injured side shifting the center of mass outside the base of support. Label each contributing factor with a leader line: 'near-full extension,' 'dynamic valgus,' 'tibial rotation,' 'trunk lean.' Clean biomechanical-illustration style, no opponent in frame to emphasize non-contact mechanism. | Diagram of the 'position of no return' biomechanics behind a non-contact ACL tear: knee near full extension, dynamic valgus collapse, tibial rotation, and trunk lean during deceleration. |
| 2 | knee-acl-differential-comparison-chart.webp | 16:9 | white | public/images/units/knee-acl/ | Comparison table/chart with five columns, one per structure: 'ACL tear,' 'Meniscal tear,' 'PCL tear,' 'MCL/LCL sprain,' 'Patellar dislocation.' Each column lists its characteristic mechanism, effusion timing (rapid hemarthrosis vs. gradual), and one hallmark exam finding (Lachman-positive, joint line tenderness/locking, posterior sag, valgus/varus laxity, medial patellar tenderness/apprehension). Clean instructional-chart style, icon per column. | Comparison chart of five knee injuries — ACL tear, meniscal tear, PCL tear, MCL/LCL sprain, and patellar dislocation — by mechanism, swelling timing, and hallmark exam finding. |
| 3 | knee-acl-inside-the-knee.webp | 4:3 | white | public/images/units/knee-acl/ | Simple side-view cutaway of a knee joint showing the thigh bone and shin bone meeting, with thick strap-like ligaments connecting them and a soft cushioning pad between the bones. Highlight one ligament in a bright color to show it holds the bones together. Clean, simple illustration style for middle schoolers, minimal labels, no gore. | Simple diagram of the inside of a knee joint showing ligaments connecting the bones and a cushioning pad. |
| 4 | knee-acl-planting-twist-mechanism.webp | 4:3 | white | public/images/units/knee-acl/ | Illustration of a soccer or basketball player planting one foot on the ground and twisting their body, with the knee shown bending awkwardly to the side and no other player nearby to touch them. Motion lines show the sudden twisting movement. Clean, simple illustration style for middle schoolers, no gore. | Illustration of an athlete planting a foot and twisting, showing how a non-contact knee injury can happen. |
| 5 | knee-acl-warning-signs.webp | 4:3 | white | public/images/units/knee-acl/ | Illustration of an athlete sitting on the ground holding their knee, with a swollen, puffy knee shown next to a normal knee for comparison. Simple, clean illustration style, no gore, no text in the image. | Illustration comparing a normal knee to a swollen knee with an athlete holding it in pain. |
| 6 | knee-acl-deformity-emergency.webp | 4:3 | white | public/images/units/knee-acl/ | Side-by-side illustration comparing a normal knee to a knee that looks bent out of shape after a serious injury, drawn with a warning-colored outline around the injured knee to signal an emergency. Clean, non-graphic illustration style for middle schoolers. | Comparison drawing of a normal knee next to a deformed knee marked as an emergency warning sign. |
| 7 | knee-acl-anatomy-mechanism.webp | 4:3 | white | public/images/units/knee-acl/ | Anterior view of a right knee joint with the patella removed to show internal anatomy: femur above, tibia below, and the four major ligaments labeled in distinct colors — ACL and PCL crossing inside the joint, MCL along the inner edge, LCL along the outer edge — plus the medial and lateral menisci shown as C-shaped pads between femur and tibia. Clean medical-illustration style, no text other than labels. | Diagram of the knee joint showing the ACL, PCL, MCL, and LCL ligaments and the medial and lateral menisci. |
| 8 | knee-acl-noncontact-landing-mechanism.webp | 4:3 | transparent | public/images/units/knee-acl/ | An athlete captured mid-landing from a jump, knee nearly straight and collapsing inward (valgus) toward the midline while the foot stays planted, torso leaning away from the knee. Use a motion/force arrow at the knee to show the inward collapse. No opponent in frame, emphasizing this is a non-contact mechanism. Simple athletic-illustration style. | Illustration of the classic non-contact ACL injury mechanism: a knee collapsing inward while landing from a jump. |

**Landed 7/8 (2026-07-16):** standalone full-frame cards, no slivers,
no photographs, ligament anatomy vetted (ACL/PCL cross inside the joint, MCL
medial / LCL lateral, C-shaped menisci correct for a right knee), non-contact
mechanism shown with no opponent and hedged ("do not guarantee injury").

**Timing correction on row 2, `differential-comparison-chart` (Codex catch,
fixed in-repo):** as delivered, the meniscal-tear SWELLING cell read "usually
gradual (2–3 days)," which contradicted the app's own text — the lesson,
flashcard, and quiz in `knee-acl-adv.json` (and the `knee-acl.json` 9-10
lesson/flashcard) all teach gradual meniscal effusion over "hours to a day" /
"overnight," the standard rapid-vs-next-day contrast with ACL hemarthrosis.
Rather than a full redo, the "(2–3 days)" parenthetical was white-filled out
in-repo (background-matched, no other pixels touched), leaving "Usually
gradual" — consistent with the three columns (PCL, MCL/LCL, patellar) that
carry no timing parenthetical, and no longer contradicting the lesson. If this
strand is ever regenerated, brief the meniscal SWELLING cell as "gradual
(next day)".

One author-flagged, user-approved deviation the unit JSON was updated to match:
- **Row 8 (`noncontact-landing-mechanism`)** was delivered as a lower-body
  **skeletal biomechanics diagram** (femoral adduction, dynamic valgus,
  near-full extension, tibial rotation, ankle eversion, midline) rather than
  the briefed full-body action figure mid-landing — clearer for the
  multi-planar alignment. The `alt`/`description` in `knee-acl.json` were
  rewritten to describe the actual skeletal diagram.

## Batch 10: Lesson diagrams — shoulder-injuries (8 images) — LANDED 2026-07-16 (8 of 8, clean delivery)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | shoulder-injuries-bankart-hill-sachs.webp | 16:9 | white | public/images/units/shoulder-injuries/ | Two-panel diagram of an anterior shoulder dislocation's residual lesions. Left panel 'Bankart lesion': the glenoid socket viewed from the side showing the anterior-inferior labrum torn away from the rim, with the inferior glenohumeral ligament's attachment point lost. Right panel 'Hill-Sachs lesion': the posterior humeral head showing a compression divot where it impacted the front of the glenoid rim during the dislocation. Label both structures. Clean medical-illustration style. | Diagram of a Bankart lesion (torn anterior-inferior labrum) and a Hill-Sachs lesion (compression divot in the humeral head) from an anterior shoulder dislocation. |
| 2 | shoulder-injuries-internal-vs-classic-impingement.webp | 16:9 | white | public/images/units/shoulder-injuries/ | Two-panel comparison of shoulder impingement mechanisms. Left panel 'Classic (outlet/subacromial) impingement': the rotator cuff tendon pinched between the humeral head and the acromial arch overhead during arm reaching, common in swimmers. Right panel 'Internal impingement': the arm in the throwing position (maximally abducted and externally rotated), with the undersurface of the posterior rotator cuff contacting the posterior-superior labrum from inside the joint. Label each panel with its mechanism and the athlete population most affected. Clean medical-illustration style. | Comparison diagram of classic subacromial impingement (cuff pinched against the acromion during overhead reaching) versus internal impingement (posterior cuff contacting the posterior-superior labrum in the throwing position). |
| 3 | shoulder-injuries-two-causes.webp | 16:9 | white | public/images/units/shoulder-injuries/ | Split-scene illustration: on the left, an athlete lands hard on an outstretched arm during a fall; on the right, a different athlete throws a ball overhead in a repeated motion, shown a few times faded behind them to suggest doing it over and over. Clean, simple illustration style for middle schoolers, no gore. | Split illustration showing a fall onto an outstretched arm next to an athlete repeating an overhead throwing motion. |
| 4 | shoulder-injuries-warning-signs.webp | 4:3 | white | public/images/units/shoulder-injuries/ | Illustration of an athlete holding their injured arm close against their body with the other hand, shoulder looking a slightly different shape than the uninjured side, pained expression. Clean, simple illustration style for middle schoolers, no gore. | Illustration of an athlete holding an injured arm against their body, supporting it with the other hand. |
| 5 | shoulder-injuries-support-the-arm.webp | 4:3 | white | public/images/units/shoulder-injuries/ | Illustration of a coach or athletic trainer kneeling next to a seated athlete, gently supporting the athlete's injured arm in the position it's already in without moving it, while the athlete stays still. Clean, friendly illustration style, no text in the image. | Illustration of an adult gently supporting an athlete's injured arm in place without moving it. |
| 6 | shoulder-injuries-overhead-ache.webp | 4:3 | white | public/images/units/shoulder-injuries/ | Illustration of a swimmer or pitcher reaching overhead with a wincing expression and a small highlighted ache mark on the shoulder, showing discomfort during a repeated overhead motion rather than a sudden fall. Clean, simple illustration style for middle schoolers. | Illustration of an athlete wincing while reaching overhead, showing shoulder pain that builds up from overuse. |
| 7 | shoulder-injuries-glenohumeral-anatomy.webp | 4:3 | white | public/images/units/shoulder-injuries/ | Anterior view of the right shoulder with the humeral head seated in the shallow glenoid socket of the scapula. Label the glenohumeral joint, the labrum as a thin rim of cartilage around the socket edge, the four rotator cuff muscles (supraspinatus, infraspinatus, teres minor, subscapularis) wrapping the humeral head in a distinct color, and the AC joint where the clavicle meets the acromion, shown as a separate small joint above. Clean medical-illustration style. | Diagram of the shoulder's glenohumeral joint showing the shallow glenoid socket, labrum, rotator cuff muscles, and the separate AC joint. |
| 8 | shoulder-injuries-dislocation-vs-ac-sprain.webp | 16:9 | white | public/images/units/shoulder-injuries/ | Two-panel comparison of an injured right shoulder from the front. Left panel labeled 'Dislocation': arm held away from the body and supported by the other hand, shoulder contour looking squared-off instead of rounded. Right panel labeled 'AC sprain (separation)': arm hanging naturally at the side, with a visible step-off bump at the very top of the shoulder where the collarbone rides up. Clean medical-illustration style, non-graphic. | Comparison diagram of a shoulder dislocation (arm held away, squared-off contour) versus an AC joint sprain (arm hangs normally, step-off bump at the shoulder tip). |

**Landed 8/8 clean (2026-07-16):** best-anatomy batch yet — standalone
full-frame cards, no slivers, no photographs. Anatomy vetted: glenoid/labrum,
the four rotator-cuff muscles with a smart posterior-cuff inset (so
infraspinatus/teres minor aren't drawn on the anterior view; teres major
correctly omitted), the separate AC joint; Bankart = anterior-inferior
labrum, Hill-Sachs = posterior humeral-head divot (pairing with anterior
dislocation); classic subacromial vs internal impingement with correct
athlete groups (swimmers / throwers); dislocation squared-off contour vs AC
step-off bump. Minor: on `dislocation-vs-ac-sprain` the injured arm is drawn
cradled/supported rather than the lesson's classic "held away from the body"
— the diagnostic sign (squared-off contour) is correct and labeled, so it was
landed; the unit-JSON alt/desc were made position-neutral ("guarded and
supported") to stay consistent with the lesson text. If ever regenerated,
draw the dislocated arm slightly abducted/away from the body.

## Batch 11: Lesson diagrams — muscle-strains (8 images) — LANDED 2026-07-16 (8 of 8, clean delivery)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | muscle-strains-terminal-swing-mechanism.webp | 16:9 | white | public/images/units/muscle-strains/ | Side-view illustration of a sprinter's leg captured at the terminal swing phase of the gait cycle, just before foot strike: hip shown flexed forward, knee shown extending rapidly, with the hamstring muscle highlighted and stretched to near-maximum length while a contraction arrow shows it working eccentrically to decelerate the shank. Label 'terminal swing — peak length + peak eccentric force' beneath the figure. Clean biomechanical-illustration style. | Diagram of the terminal swing phase of sprinting, showing the hamstring stretched to near-maximum length while contracting eccentrically to decelerate the leg just before foot strike. |
| 2 | muscle-strains-differential-chart.webp | 16:9 | white | public/images/units/muscle-strains/ | Four-column comparison chart, one per condition: 'Strain' (a discrete eccentric-loading moment, localized sharp pain, one tender point), 'Contusion' (a direct blunt blow, diffuse tenderness at the impact site), 'Cramp' (sudden involuntary contraction, muscle feels hard/knotted, resolves in minutes), 'DOMS' (bilateral, gradual onset 24-72 hours after unaccustomed exercise, no single traumatic moment). Each column has a small icon and its distinguishing mechanism/onset/distribution. Clean instructional-chart style. | Comparison chart of four muscle-pain presentations — strain, contusion, cramp, and delayed onset muscle soreness (DOMS) — by mechanism, onset, and pain distribution. |
| 3 | muscle-strains-common-spots.webp | 4:3 | white | public/images/units/muscle-strains/ | Simple front and back outline of a runner's legs with four common strain spots highlighted in a bright color: the back of the thigh (hamstring), the front of the thigh (quad), the groin, and the calf. Clean, simple illustration style for middle schoolers, minimal labels. | Diagram of a runner's legs highlighting the hamstring, quad, groin, and calf as common spots for pulled muscles. |
| 4 | muscle-strains-warning-signs.webp | 4:3 | white | public/images/units/muscle-strains/ | Illustration of a sprinter suddenly stopping mid-stride, grabbing the back of their thigh with a pained expression, one leg trailing behind mid-limp. Clean, simple illustration style for middle schoolers, no gore. | Illustration of a runner suddenly stopping and grabbing the back of their thigh in pain. |
| 5 | muscle-strains-rice-steps.webp | 4:3 | white | public/images/units/muscle-strains/ | Simple illustration of an athlete sitting on a bench, resting their leg, with an ice pack wrapped in a thin towel placed on the back of their thigh. Clean, friendly illustration style, no text in the image. | Athlete sitting and resting with an ice pack wrapped in a towel on a pulled thigh muscle. |
| 6 | muscle-strains-severe-warning.webp | 4:3 | white | public/images/units/muscle-strains/ | Side-by-side illustration comparing a normal thigh muscle outline to one with a visible dent or gap where the muscle tore, drawn with a warning-colored outline around the injured area to signal danger. Clean, non-graphic illustration style for middle schoolers. | Comparison drawing of a normal thigh muscle next to one with a visible dent marking a severe muscle tear warning sign. |
| 7 | muscle-strains-two-joint-muscles-map.webp | 4:3 | white | public/images/units/muscle-strains/ | Front and back outline of a human body with the four commonly strained two-joint muscle groups highlighted and labeled: hamstrings (back of thigh, crossing hip and knee), rectus femoris (front of thigh, crossing hip and knee), groin/adductors (inner thigh), and gastrocnemius (calf, crossing knee and ankle). Use a consistent highlight color for all four with small joint-crossing icons at each end. Clean medical-illustration style. | Body diagram highlighting the hamstrings, rectus femoris, groin/adductors, and calf — the muscle groups most often strained because they cross two joints. |
| 8 | muscle-strains-grading-comparison.webp | 16:9 | white | public/images/units/muscle-strains/ | Three-panel comparison of a muscle belly (e.g., hamstring) cross-section, one panel per grade. Grade I: a few individual fibers frayed, muscle shape intact. Grade II: a visible partial tear through part of the muscle width, mild retraction. Grade III: a complete tear all the way through with a visible gap and the two ends balled up, plus a downstream bruise shading. Label each panel with its grade number. Clean medical-illustration style. | Comparison diagram of Grade I, II, and III muscle strains showing increasing fiber damage from a few stretched fibers to a complete rupture. |

**Landed 8/8 clean (2026-07-16):** standalone full-frame cards, no slivers,
no photographs, all on-topic. Anatomy vetted: the four two-joint muscle groups
(hamstring, quad/rectus femoris, groin/adductors, gastrocnemius) correctly
located, with the `two-joint-muscles-map` handling the adductor subtlety well
(labels "gracilis crosses hip + knee" rather than implying every adductor is
biarticular); terminal/late-swing eccentric hamstring mechanism correct; I→III
grading progression correct; and the differential chart's DOMS "24–72 hours"
matches the lesson/flashcard text exactly (no repeat of the batch-9 chart
issue). The differential chart is headed "Recognition clues — not a diagnosis"
and the severe-warning image uses the correct "visible dent — get an adult"
framing.

## Batch 12: Lesson diagrams — overuse-injuries (8 images) — LANDED 2026-07-16 (8 of 8, clean delivery)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | overuse-injuries-acwr-graph.webp | 16:9 | white | public/images/units/overuse-injuries/ | Line graph with 'weeks' on the x-axis and 'acute:chronic workload ratio' on the y-axis, showing a shaded 'sweet spot' band between about 0.8 and 1.3, and a warning-colored zone above about 1.5 labeled 'spike — sharply elevated injury risk.' A sample athlete's ratio line is plotted rising from within the sweet spot up into the danger zone after a sudden training jump, with an annotation 'returning from break or rapid mileage increase.' Clean scientific-chart style, labeled axes. | Graph of the acute:chronic workload ratio showing a safe sweet-spot zone between 0.8 and 1.3 and a high-risk spike zone above 1.5. |
| 2 | overuse-injuries-bone-stress-continuum.webp | 16:9 | white | public/images/units/overuse-injuries/ | Horizontal four-stage continuum diagram of bone stress injury, each stage bar taller/darker than the last: 1) 'Bone strain' — subclinical, no imaging findings. 2) 'Stress reaction' — bone marrow edema visible on MRI, no fracture line. 3) 'Stress fracture' — visible fracture line. 4) 'Complete/displaced fracture.' Beneath the continuum, a small body outline marks high-risk sites (femoral neck, tarsal navicular, anterior tibial cortex) in a warning color versus low-risk sites (posteromedial tibia, fibula, metatarsal shafts) in a neutral color. Clean instructional-illustration style. | Diagram of the bone stress injury continuum from bone strain through stress reaction, stress fracture, to complete fracture, with high-risk and low-risk anatomical sites marked on a body outline. |
| 3 | overuse-injuries-sudden-vs-gradual.webp | 16:9 | white | public/images/units/overuse-injuries/ | Split-scene illustration: on the left, an athlete tumbles hard while landing, with a single sharp motion line marking one exact moment of injury; on the right, a runner appears several times faded and repeated along a practice-calendar-like strip, with a small ache mark on the shin getting slightly darker each time to show pain building up gradually. Clean, simple illustration style for middle schoolers, no gore. | Split illustration comparing a sudden injury from one hard landing to pain that gradually builds up over repeated practices. |
| 4 | overuse-injuries-common-spots.webp | 4:3 | white | public/images/units/overuse-injuries/ | Simple outline of a young athlete's body from the front, with four common overuse pain spots highlighted in a bright color: the shin, the heel, just below the kneecap, and the elbow/shoulder. Clean, simple illustration style for middle schoolers, minimal labels. | Diagram of a young athlete's body highlighting the shin, heel, knee, and elbow/shoulder as common overuse pain spots. |
| 5 | overuse-injuries-warning-signs.webp | 4:3 | white | public/images/units/overuse-injuries/ | Illustration of a young athlete limping off the field, favoring one leg, with a small calendar icon in the corner showing several practice days marked to show the pain has repeated over time. Clean, simple illustration style for middle schoolers, no gore. | Illustration of an athlete limping off the field, showing pain that has repeated over several practices. |
| 6 | overuse-injuries-prevention-habits.webp | 4:3 | white | public/images/units/overuse-injuries/ | Illustration of a young athlete warming up with light jogging, next to a small calendar showing a marked rest day and two different sport icons (like a soccer ball and a basketball) to show mixing up activities. Clean, friendly illustration style for middle schoolers. | Illustration showing an athlete warming up, a marked rest day on a calendar, and icons for playing more than one sport. |
| 7 | overuse-injuries-pain-stage-progression.webp | 16:9 | transparent | public/images/units/overuse-injuries/ | Horizontal four-step severity ladder, each step taller and darker-shaded than the last. Stage 1: 'Pain after activity only.' Stage 2: 'Pain during activity, not limiting.' Stage 3: 'Pain during activity, limiting performance.' Stage 4: 'Pain at rest / night — stop and refer.' Use a rising arrow beneath the steps to show escalating urgency. Clean flat infographic style. | Four-stage severity ladder showing overuse injury pain progression from pain after activity only to pain at rest requiring referral. |
| 8 | overuse-injuries-shin-splints-vs-stress-fracture.webp | 4:3 | white | public/images/units/overuse-injuries/ | Front view of a lower leg with two shaded pain-location overlays side by side. Left overlay labeled 'Shin splints': a broad, diffuse shaded band running several centimeters along the inner border of the tibia. Right overlay labeled 'Stress fracture': a single small, sharply defined pinpoint dot at one spot on the tibia. Include a short caption under each: 'eases with warm-up' vs. 'worsens through activity, may ache at night.' Clean medical-illustration style. | Comparison diagram of shin splints (diffuse pain along the inner shin) versus a stress fracture (pinpoint bone pain). |

**Landed 8/8 clean (2026-07-16):** the most number-heavy batch, all values
verified against the lesson. Standalone full-frame cards, no slivers, no
photographs. Notable evidence-aware author refinements (all sound, kept):
- **`acwr-graph`**: keeps the exact 0.8 / 1.3 / 1.5 thresholds (matching the
  `overuse-injuries-adv.json` lesson, quiz, and flashcard) but frames the band
  as a "historically proposed sweet spot" and adds "not a safety guarantee" —
  more cautious than the lesson, not contradictory (the ACWR has been
  critiqued; README cites Impellizzeri 2020). No number conflict.
- **`bone-stress-continuum`**: correct four-stage continuum + specifies the
  **tension-side** superior femoral neck; uses six labeled anatomical
  close-ups instead of a small body outline (clearer). Its unit-JSON alt was
  updated from "on a body outline" to describe the close-ups.
- **`common-spots`**: fourth spot resolved to "throwing shoulder" (brief said
  elbow/shoulder); alt updated to match.
- `pain-stage-progression` uses the four exact stage statements; `common-spots`,
  `shin-splints-vs-stress-fracture`, and `prevention-habits` all carry
  recognition-not-diagnosis / not-a-guarantee wording.

## Batch 13: Lesson diagrams — taping-wrapping (8 images) — LANDED 2026-07-27 (8 of 8, clean delivery)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | taping-wrapping-materials-comparison.webp | 16:9 | white | public/images/units/taping-wrapping/ | Four-column reference chart, one per material: 'Rigid athletic tape' (non-stretch, true mechanical restriction), 'Elastic athletic tape' (stretches, conforms to muscle bellies, comfort over hard restriction), 'Cohesive wrap' (sticks to itself only, compression/securing layer, no independent motion restriction), 'Kinesiology tape' (thin, highly elastic, moves with skin, weak evidence beyond proprioceptive cueing). Each column shows a small tape-roll icon and its one-line mechanism. Clean instructional-chart style. | Comparison chart of four taping materials — rigid tape, elastic tape, cohesive wrap, and kinesiology tape — by mechanism and what each actually does. |
| 2 | taping-wrapping-dermatitis-vs-blister.webp | 16:9 | white | public/images/units/taping-wrapping/ | Two-panel comparison of tape-related skin reactions. Left panel 'Contact dermatitis': redness and small itchy bumps tracing the exact outline of tape strips across a wide area, labeled 'appears hours to a day after application.' Right panel 'Friction blister': a single raised blister concentrated at one bony pressure point or crossover point, labeled 'appears at a specific hot spot during activity.' Clean medical-illustration style, non-graphic. | Comparison diagram of contact dermatitis (a rash tracing the tape's outline) versus a friction blister (localized to one pressure point). |
| 3 | taping-wrapping-tape-vs-wrap.webp | 4:3 | white | public/images/units/taping-wrapping/ | Side-by-side illustration comparing a roll of stiff, sticky athletic tape applied firmly around an ankle to a stretchy elastic wrap coiled and wrapped snugly around a forearm, showing the different textures and uses. Clean, simple illustration style for middle schoolers, minimal labels. | Comparison drawing of stiff athletic tape on an ankle next to a stretchy elastic wrap on a forearm. |
| 4 | taping-wrapping-three-jobs.webp | 4:3 | white | public/images/units/taping-wrapping/ | Three small side-by-side illustrations in one image: a taped ankle with an arrow showing it can't roll inward (support), a wrapped, slightly swollen knee with an ice pack held in place (compression), and a padded, taped elbow (protection). Clean, simple illustration style for middle schoolers, one short label under each. | Three-panel illustration showing tape supporting an ankle, a wrap compressing a knee with an ice pack, and tape protecting an elbow. |
| 5 | taping-wrapping-too-tight-warning.webp | 4:3 | white | public/images/units/taping-wrapping/ | Side-by-side illustration comparing a normal, healthy-colored set of toes below an ankle wrap to a set of toes that look pale or bluish below a too-tight wrap, marked with a warning-colored outline. Clean, non-graphic illustration style for middle schoolers. | Comparison drawing of normal toes below a wrap next to pale, unusually colored toes warning that a wrap is too tight. |
| 6 | taping-wrapping-dont-hide-pain.webp | 4:3 | white | public/images/units/taping-wrapping/ | Illustration of an athletic trainer taping an athlete's ankle while the athlete winces slightly in pain but stays quiet, with a small thought bubble showing the athlete wanting to keep playing. A gentle visual reminder to speak up rather than mask pain. Clean, simple illustration style for middle schoolers. | Illustration of an athlete wincing while getting taped, showing why hiding pain from an adult is not okay. |
| 7 | taping-wrapping-basket-weave-pattern.webp | 4:3 | white | public/images/units/taping-wrapping/ | Step diagram of a closed basket weave ankle taping job on a right ankle, shown as a build-up sequence: anchor strips (one around the lower leg, one around the arch), alternating stirrups (vertical strips up one side, under the heel, up the other) and horseshoes (horizontal strips low to high), and finishing figure-8 and heel-lock strips crossing diagonally over the foot and around the heel. Use numbered layers or a light color gradient to show build order. Clean instructional-illustration style. | Step diagram of the closed basket weave ankle taping pattern, showing anchors, stirrups, horseshoes, and finishing figure-8/heel-lock strips. |
| 8 | taping-wrapping-capillary-refill-check.webp | 4:3 | transparent | public/images/units/taping-wrapping/ | Close-up of a hand pressing on a toenail bed distal to a wrapped ankle, with a small two-step sequence: step 1 shows the nail turning white under pressure, step 2 shows the nail released with a stopwatch icon reading 'under 2 seconds' as color returns. Clean instructional-illustration style. | Diagram of the capillary refill check: pressing a toenail bed until white, then timing how quickly pink color returns. |

**Landed 8/8 clean (2026-07-27):** no neighbor slivers (the first batch
where edge-profiling flagged nothing but legitimate full-bleed
composition), no wrong-topic files, correct filenames and dimensions
throughout. Accuracy verified against the unit text on every number and
label:
- **`materials-comparison`** — the batch's most sensitive image, since the
  11-12 unit teaches students to appraise kinesiology-tape marketing
  critically and its quiz counts believing those claims as the wrong
  answer. Delivered correctly: kinesiology tape reads "Minimal mechanical
  restriction / Evidence is mixed / Possible short-term sensory cueing,"
  with none of the marketing claims (lymphatic drainage, circulation, pain
  relief, injury prevention) asserted anywhere. Rigid tape is labeled
  "Initial mechanical restriction," which lines up with the same unit's
  teaching that restriction decays during activity. Cohesive wrap is
  correctly "Not designed for rigid motion restriction."
- **`basket-weave-pattern`** — build order matches the 9-10 lesson strip by
  strip: anchors (lower leg + arch) → 3 stirrups + 3 horseshoes labeled
  "inside first" → figure-8 + heel lock → closing strips, with a posterior
  view inset. Illustration style, correctly labeled with the lesson's own
  terms.
- **`capillary-refill-check`** — stopwatch reads "< 2 sec" and the caption
  "Pink returns in under 2 seconds," matching the lesson, quiz, and
  flashcard exactly; nail bed checked is distal to the wrap. **Delivered at
  274 KB** (4.5x the 30-60 KB budget) and re-encoded in-repo to 58.2 KB at
  WebP q=82 with the alpha channel preserved and label text still crisp —
  the only mechanical fix this batch needed.
- **`too-tight-warning`** — correct 7-8 scope: signs listed are numbness /
  tingling / pale, blue, or unusual color, and the action is "Tell an adult
  immediately." No student is shown loosening or re-applying a wrap.
- One alt reconciliation: **`dont-hide-pain`** was briefed with the athlete
  wincing, but the delivered figures are drawn with featureless faces (a
  faceless figure was also accepted in batch 7), so no wince is visible.
  The message carries instead through a thought bubble ("I want to keep
  playing…") and the trainer's "Speak up about pain." The slot's
  `alt`/`description` in `taping-wrapping-ms.json` were rewritten to
  describe what is actually shown.

**Style note — mixed rendering is APPROVED (decided 2026-07-27):** this batch
mixes rendering styles. `materials-comparison`, `dermatitis-vs-blister`,
`capillary-refill-check`, `tape-vs-wrap`, and `three-jobs` are
photorealistic renders of anonymous body parts (no faces, no identifiable
people, no photographs of real people), while `basket-weave-pattern`,
`too-tight-warning`, and `dont-hide-pain` are illustrated. This was raised
for a decision and **approved as a positive** — the mix helps convey the
message, because realism carries skin findings, tape texture, and limb
anatomy better while illustration carries scenes with people and
process/flow diagrams better. Later batches should follow the same
principle: pick the rendering that teaches each image best rather than
forcing one house style, and do not treat a mixed batch as a defect. The
prohibition that remains is about subject, not style — no photographs, and
no identifiable or photorealistic people; realistic anonymous body parts
are fine. See "Standing image rules" in `docs/HANDOFF.md`.

## Batch 14: Lesson diagrams — warmup-injury-prevention (8 images) — LANDED 2026-07-28 (8 of 8; 2 redone after Codex catches)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | warmup-injury-prevention-stress-strain-curve.webp | 16:9 | white | public/images/units/warmup-injury-prevention/ | Line graph with 'strain' (tissue deformation) on the x-axis and 'stress' (force) on the y-axis, showing two curves: a 'cold tissue' curve reaching its failure point (marked with an X) at a shorter strain, and a 'warm tissue' curve (raised ~1-2°C) reaching its failure point further along the strain axis, illustrating that warmer tissue tolerates more stretch before fibers tear. Clean scientific-diagram style, labeled axes and failure points. | Stress-strain graph comparing cold and warm tissue, showing that warm tissue reaches its failure (tearing) point at a greater strain than cold tissue. |
| 2 | warmup-injury-prevention-pap-window-graph.webp | 16:9 | white | public/images/units/warmup-injury-prevention/ | Line graph with 'time since activating bout' on the x-axis and 'performance relative to baseline' on the y-axis, showing two overlapping curves: a declining 'fatigue' curve starting high and dropping, and a rising-then-fading 'potentiation' curve, with their combined net-effect curve dipping below baseline briefly then rising above baseline in a shaded 'PAP window' band roughly at the 5-12 minute mark before fading back to baseline. Clean scientific-chart style, labeled axes and shaded window. | Graph showing the post-activation potentiation window: performance dips from fatigue immediately after an activating bout, then rises above baseline in a window roughly 5-12 minutes later before fading. |
| 3 | warmup-injury-prevention-cold-vs-warm-muscle.webp | 1:1 | white | public/images/units/warmup-injury-prevention/ | Side-by-side icon-style illustration: a stiff, straight rubber band on the left labeled as cold, next to a looser, slightly stretched rubber band on the right that flows more easily, to visually explain the cold-muscle-versus-warm-muscle metaphor. Clean, simple illustration style for middle schoolers. | Illustration comparing a stiff rubber band to a looser one, showing how cold muscles are stiffer than warm muscles. |
| 4 | warmup-injury-prevention-warmup-steps.webp | 16:9 | white | public/images/units/warmup-injury-prevention/ | Two-panel illustration on a field: first panel shows a group of athletes doing an easy jog together; second panel shows the same athletes doing dynamic movements like arm swings, lunges, and high knees. Clean, energetic illustration style for middle schoolers. | Two-panel illustration showing athletes first jogging easily, then doing dynamic movements like lunges and high knees. |
| 5 | warmup-injury-prevention-move-vs-hold.webp | 16:9 | white | public/images/units/warmup-injury-prevention/ | Split scene: on the left, before playing, an athlete is shown mid-motion doing arm swings and light jogging under a sun icon labeled 'before'; on the right, after playing, an athlete sits and holds a toe-touch stretch still under a moon or checkmark icon labeled 'after'. Clean, simple illustration style for middle schoolers. | Illustration comparing moving warm-up exercises done before playing to a held stretch done after playing. |
| 6 | warmup-injury-prevention-cold-weather.webp | 4:3 | white | public/images/units/warmup-injury-prevention/ | Illustration of an athlete warming up outdoors on a chilly day, wearing a light jacket, with visible breath in the cold air, doing arm swings before practice. Clean, simple illustration style for middle schoolers. | Illustration of an athlete warming up outdoors on a cold day, with visible breath in the cold air. |
| 7 | warmup-injury-prevention-dynamic-vs-static.webp | 16:9 | white | public/images/units/warmup-injury-prevention/ | Two-panel comparison. Left panel labeled 'Dynamic (before activity)': an athlete mid-motion in a walking lunge or leg swing, with a motion arrow showing active movement through the range. Right panel labeled 'Static (after activity)': an athlete holding a still hamstring stretch, with a stopwatch icon reading '20-30 seconds.' Clean instructional-illustration style. | Comparison diagram of dynamic stretching (active movement before activity) and static stretching (held position after activity). |
| 8 | warmup-injury-prevention-three-phase-structure.webp | 16:9 | transparent | public/images/units/warmup-injury-prevention/ | Horizontal flow diagram with three connected boxes and arrows showing increasing intensity left to right: 'General warm-up' (light jogging icon), 'Dynamic stretching & mobility' (leg swing icon), 'Sport-specific movement' (cutting/passing icon). Add a small intensity gradient bar beneath the boxes rising from low to high. Clean flat infographic style. | Flow diagram of the three-phase warm-up structure: general warm-up, dynamic stretching and mobility, then sport-specific movement. |

**Landed 8 of 8 — 6 on 2026-07-27, the two 11-12 graphs redone and landed
2026-07-28 after being held.** No
slivers, all eight files inside the 30-60 KB budget on arrival (the size
warning added to the brief after batch 13's 274 KB miss did its job),
correct dimensions including the batch's one 1:1 at 900x900, and true alpha
on `three-phase-structure`.

**REDONE and landed — `stress-strain-curve`.** Originally held on a Codex
catch on PR #47, confirmed by pixel measurement: the cold-tissue failure marker sits **higher** on the stress
axis than the warm one (y=117 vs y=137), i.e. the diagram teaches that cold
tissue fails at a *greater* force. The 11-12 lesson says the opposite in so
many words — "it isn't that cold muscle is 'weaker,' it's that its failure
point arrives sooner, **at a shorter length and lower force**." The strain
axis was right and only the stress relationship was wrong, and that is not
cleanly fixable in-repo (it needs the curve redrawn), so the asset was
removed and left unmapped pending a redo.
**The redo passes**, verified by the same pixel measurement rather than by
eye: cold failure marker at (431, 202), warm at (741, 104) — cold is both
left of (shorter strain) and below (lower force) warm, matching the lesson.
*Caution for whoever redoes this:* there is a real open question about
whether the lesson's "lower force" claim is itself the best reading of the
literature (some isolated-muscle work reports warmed muscle failing at
greater force *and* greater length). Do not "fix" the image against the
literature while leaving the lesson as-is, or the contradiction just
reverses — settle the lesson text first, against a source, then draw to it.

**REDONE and landed — `pap-window-graph`.** Also a Codex catch, and a good
one. The net
effect curve is correct — it dips below baseline early and rises above it
inside a shaded window marked 5-12 min, matching the lesson. But the shared
y-axis is labeled "Performance relative to baseline" while the **fatigue
curve sits entirely above baseline**, which reads as "more fatigue = better
performance." This was initially waved through here as the standard
textbook convention for the figure; that was wrong on the diagram's own
terms, because the axis label makes a claim the component curves don't
honor. Not cleanly fixable in-repo. **Redo note:** either plot fatigue as a
negative contribution below the baseline, or give the component curves an
explicit "effect magnitude" axis distinct from the net performance curve.
**The redo takes the first option and passes**: with the baseline measured
at y=216, the fatigue curve now sits below it throughout (y=333 early,
decaying to y=217 by the right edge), potentiation stays above it, and the
net curve starts below baseline (y=365) before crossing above it — so no
curve now implies that fatigue improves performance.

Landed and verified:
- **`dynamic-vs-static`** and **`move-vs-hold`** — both handled the batch's
  most contradiction-prone requirement correctly. Neither marks static
  stretching with an X or labels it wrong; `move-vs-hold` puts a green check
  on the "after" panel, which matches the lesson's "Move first, hold later"
  framing rather than forbidding held stretches.
- **`three-phase-structure`** — exactly three phases with the lesson's
  names, plus the low-to-high intensity bar.

**One filename fix:** the stress-strain image arrived as
`...-stress-strain-graph.webp` but the lesson slot is
`...-stress-strain-curve.webp`. The art was verified correct for the slot
first, then the file was renamed — this is *not* the batch-7 situation,
where art on an entirely different topic was held rather than remapped.
Renaming is only ever appropriate when the picture already matches the
slot's alt text.

**Style question raised and settled — `cold-weather` is APPROVED.** Codex
flagged this image on PR #47 as a photorealistic person that should be held.
It was kept and escalated instead, and the repo owner approved it. The
reasoning on record: it is a painted/rendered illustration rather than a
photograph, the figure is drawn from behind with no visible face, and it
therefore satisfies the standing rule as rewritten after batch 13 — which is
scoped to *subject* (no photographs, no identifiable or photorealistic
people) rather than to rendering style. Do not re-hold this image; the
"scenes with people should be illustrated" line in the brief guidance is a
preference about what teaches best, not a prohibition.

**One accepted deviation:** on `dynamic-vs-static` the stopwatch is a plain
icon with no "20-30 seconds" reading, where the brief asked for the number.
Nothing contradicts the lesson (the duration is taught in the body text and
a flashcard, and the slot's alt does not mention a duration), so it was
landed as-is rather than edited.

## Batch 15: Lesson diagrams — cold-exposure (8 images) — LANDED 2026-07-28 (8 of 8; 1 landed with a lesson change)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | cold-exposure-cold-injury-classification.webp | 16:9 | white | public/images/units/cold-exposure/ | Four-panel classification chart of cold-weather tissue injuries. Panel 1 'Frostnip': pale, numb skin with no blistering, labeled 'fully reversible, no ice crystals.' Panel 2 'Chilblains (pernio)': red-purple itchy patches on fingers/ears, labeled 'repeated cool-damp exposure, non-freezing.' Panel 3 'Trench foot': macerated, swollen, pale foot skin, labeled 'prolonged wet-cold immersion, non-freezing.' Panel 4 'Frostbite': hard, waxy, blistered tissue, labeled 'true tissue freezing, ice crystal formation.' Clean medical-illustration style, non-graphic, each panel labeled with its mechanism. | Classification chart comparing frostnip, chilblains, trench foot, and true frostbite by mechanism and appearance. |
| 2 | cold-exposure-confusion-differential.webp | 16:9 | white | public/images/units/cold-exposure/ | Three-column comparison chart for a confused cold-weather athlete. Column 1 'Hypothermia': core temp dropping, shivering status, cold exposure history. Column 2 'Hypoglycemia': known diabetes, recent food intake, trembling without matching cold-exposure severity. Column 3 'Concussion': recent head/body impact as the mechanism. Each column lists 2-3 overlapping symptoms (confusion, slurred speech, poor coordination) plus its one distinguishing clue, with a footer note: 'On the sideline, treat any of these as an emergency requiring adult/medical escalation.' Clean instructional-chart style. | Comparison chart of hypothermia, hypoglycemia, and concussion — overlapping symptoms and the one distinguishing clue for each in a confused cold-weather athlete. |
| 3 | cold-exposure-hypothermia-frostbite-overview.webp | 4:3 | white | public/images/units/cold-exposure/ | Simple outline illustration of an athlete's body from the front. Highlight the whole torso/core in one color with a small label icon for hypothermia (whole body getting too cold), and highlight the fingers, toes, ears, nose, and cheeks in a second color with a label icon for frostbite (a body part freezing). Clean, flat, non-graphic style for middle schoolers. | Body outline showing the core highlighted for hypothermia risk and the fingers, toes, ears, and nose highlighted for frostbite risk. |
| 4 | cold-exposure-layering-basics.webp | 4:3 | white | public/images/units/cold-exposure/ | Simple exploded-view illustration of an athlete showing three clothing layers: a snug base layer close to the skin, a warmer insulating middle layer, and a wind- and water-resistant outer jacket, plus a hat and gloves. Each layer drawn slightly separated with small arrows showing the order they go on. Clean, flat illustration style. | Illustration of an athlete's three cold-weather clothing layers, plus a hat and gloves. |
| 5 | cold-exposure-shivering-signs.webp | 4:3 | white | public/images/units/cold-exposure/ | Simple illustration of an athlete standing outdoors in cold-weather gear, arms wrapped around themselves and shoulders hunched to show shivering, with a couple of small motion lines to suggest shaking. Clean, plain illustration style, no text in the image. | Athlete outdoors shown shivering, arms wrapped around themselves in the cold. |
| 6 | cold-exposure-frostbite-signs.webp | 4:3 | white | public/images/units/cold-exposure/ | Close-up side-by-side illustration of a hand with fingers showing normal skin tone next to a hand with fingers showing pale, white/waxy, grayish skin color to illustrate frostbite. Simple, clean, non-graphic comparison style for middle schoolers. | Comparison of a normal hand next to a hand showing pale, white, waxy frostbite-affected fingers. |
| 7 | cold-exposure-conduction-convection.webp | 16:9 | transparent | public/images/units/cold-exposure/ | Two-panel diagram of an athlete outdoors in cold weather. Left panel: conduction — wet clothing clinging to skin with small arrows showing heat leaving the body directly into the wet fabric. Right panel: convection — wind lines blowing past the same athlete, arrows showing the thin warm air layer near the skin being stripped away. Label each panel 'Conduction' and 'Convection.' Clean instructional-illustration style. | Diagram comparing conduction (wet clothing) and convection (wind) as the two main ways an athlete loses body heat in cold weather. |
| 8 | cold-exposure-frostbite-severity.webp | 4:3 | white | public/images/units/cold-exposure/ | Two-panel comparison of frostbitten fingers. Left panel: superficial frostbite — skin looks white, waxy, or grayish, with a caption noting the tissue underneath still feels soft when pressed. Right panel: deep frostbite — skin is mottled, blue-white, with a blister and a caption noting the tissue is hard and cold throughout. Label each panel 'Superficial' and 'Deep.' Clean medical-illustration style, no graphic detail. | Comparison diagram of superficial frostbite (white, waxy skin) and deep frostbite (mottled, blistered skin) on the fingers. |

**Landed 8 of 8 (2026-07-28)** — seven straight through, the eighth after
an owner decision to change the lesson it illustrates. Mechanically the cleanest batch yet: correct
filenames, correct dimensions, every file 32-57 KB, true alpha on
`conduction-convection`, no slivers. **Every line of the direction checklist
added to this batch's brief came back satisfied** — the checklist approach is
worth keeping for any strand with counterintuitive relationships:
- `shivering-signs` presents shivering as the warning sign with no
  before/after implying that shivering ending means improvement.
- `cold-injury-classification` marks frostnip, chilblains, and trench foot
  NON-FREEZING and only frostbite FREEZING.
- `hypothermia-frostbite-overview` carries the footer "DIFFERENT PROBLEMS —
  NOT A SEVERITY SCALE."
- `conduction-convection` states "wind increases the RATE of heat loss" and
  "water transfers heat faster than air," and simply omits any temperature
  comparison rather than risking it.
- `confusion-differential` shows the overlapping signs as shared and carries
  the required "ESCALATE — DON'T DIAGNOSE" footer, with no decision tree.
- `layering-basics` has base innermost, three layers, hat and gloves, and an
  "avoid cotton next to skin" warning.
- `frostbite-signs` says "POSSIBLE FROSTBITE" and "GET INSIDE AND TELL AN
  ADULT," with no rewarming action shown.

**In-repo fix required by this batch:** the 11-12 flashcard "Freezing vs.
non-freezing cold injury" read *"Frostnip (superficial, fully reversible, no
ice crystals) and true frostbite (actual tissue freezing) **are freezing
injuries**"* — self-contradictory on its face, contradicting the adv lesson
body ("no actual ice crystals form in the tissue"), and contradicting the new
classification image. Frostnip was moved to the non-freezing group. This
defect predates the batch and was only surfaced by drawing the chart.

**`cold-exposure-frostbite-severity.webp` — landed, and the LESSON was
changed to match it (owner decision, 2026-07-28).** ChatGPT declined to draw
the briefed soft-underneath-vs-hard-throughout comparison and delivered
"FROSTBITE AFTER REWARMING" instead — superficial with a clear/milky
blister, deep with a hemorrhagic blister, under a banner reading "DO NOT
PRESS OR TEST — GET MEDICAL HELP" — along with a `LESSON-UPDATES.md`
arguing the 9-10 lesson should drop its palpation test. It cited the NATA
environmental cold injuries position statement (2008), the Wilderness
Medical Society frostbite guidelines (2024 update), and the ACSM
cold-weather consensus (2021); none of those could be read from the
container, so the change was judged on its own merits rather than on the
citations, and **no source was added to the unit**.

The argument that carried it: depth classification before rewarming is
unreliable, blister character after rewarming is the accepted discriminator,
and a lesson written for student aides should not describe pressing on
frozen tissue as a way to grade injury depth. What changed in
`cold-exposure.json`:
- the two "Frostbite — when tissue actually freezes" body paragraphs, which
  now say depth is hard to judge while frozen, tell the student not to
  press/squeeze/rub, and put the clear-vs-hemorrhagic blister distinction
  after rewarming under medical care;
- that slot's `description` and `alt`, rewritten to describe the delivered
  after-rewarming image;
- the "Frostbite: signs" flashcard, which had carried the same "hard and
  cold throughout" palpation framing.
The quiz needed no change. The 7-8 unit was already correct — it never
taught palpation, only "get inside and tell an adult."

**Process note:** ChatGPT also edited the brief it was given and returned the
modified copy. Two of its four proposed lesson changes were reactions to
compressions in *the brief's paraphrase* rather than to the actual lesson —
the wet/windy 40 °F vs dry/still 20 °F comparison is already hedged with
"can" in the lesson (the brief dropped the hedge), and the lesson already
says frostnip involves no ice crystals. Always diff a proposed lesson change
against the unit JSON before acting on it.

## Batch 16: Lesson diagrams — dental-facial-trauma (8 images) — LANDED 2026-07-30 (8 of 8; 3 redone)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | dental-trauma-luxation-spectrum.webp | 16:9 | white | public/images/units/dental-facial-trauma/ | Six-panel horizontal spectrum diagram of tooth luxation injuries in order of severity, each panel showing the same front tooth in a different position relative to its neighbors and the gumline: 1) Concussion — tooth in normal position, small tenderness icon, no visible displacement. 2) Subluxation — tooth slightly loose with a subtle wobble arrow, still in normal position. 3) Lateral luxation — tooth tilted sideways, wedged against bone. 4) Intrusion — tooth pushed up, appearing shorter than neighbors. 5) Extrusion — tooth pulled down/out, appearing longer and loose. 6) Avulsion — socket empty, tooth completely out. Label each panel with its name and one-line distinguishing feature. Clean medical-illustration style, non-graphic. | Six-panel diagram of tooth luxation injuries from least to most severe: concussion, subluxation, lateral luxation, intrusion, extrusion, and avulsion. |
| 2 | dental-trauma-mandible-ring-anatomy.webp | 4:3 | white | public/images/units/dental-facial-trauma/ | Front/lower view of the mandible (lower jawbone) illustrated as a continuous ring shape running from one temporomandibular joint (TMJ), around the chin, to the other TMJ, with the ring outline highlighted. Show one example fracture at the chin (body of the mandible) with a second, dashed-line fracture marked at the opposite condyle near the ear, connected by a curved arrow indicating force transmission around the ring. Label the mental nerve's path exiting near the chin. Clean medical-illustration style. | Diagram of the mandible as a structural ring from TMJ to TMJ, showing how a fracture at the chin can transmit force to cause a second fracture at the opposite condyle. |
| 3 | dental-trauma-injury-types-overview.webp | 4:3 | white | public/images/units/dental-facial-trauma/ | Simple front-view illustration of a young athlete's face and mouth area with four numbered callout points: one pointing to a tooth (knocked-out or chipped tooth), one to the lip (cut lip), one to the nose (nosebleed), and one to the jaw (hard hit/possible break). Clean, flat overview style, minimal labels. | Illustration of a face with callouts pointing to a tooth, lip, nose, and jaw showing different injury types. |
| 4 | dental-trauma-tooth-crown-root.webp | 4:3 | white | public/images/units/dental-facial-trauma/ | Simple diagram of a single tooth with the crown (white top part) and root (narrow part that was inside the gum) clearly labeled and color-coded. Next to it, a small illustration of a hand holding the tooth by the crown only, lowering it into a small cup of milk. Clean, plain illustration style for middle schoolers. | Diagram of a tooth's crown and root, next to a hand placing the tooth by its crown into a cup of milk. |
| 5 | dental-trauma-nosebleed-position.webp | 4:3 | white | public/images/units/dental-facial-trauma/ | Simple illustration of an athlete sitting upright on a bench, leaning slightly forward, using two fingers to pinch the soft lower part of the nose. Clean, calm, plain illustration style for middle schoolers, minimal detail. | Athlete sitting upright and leaning forward slightly while pinching the soft part of the nose for a nosebleed. |
| 6 | dental-trauma-mouthguard.webp | 1:1 | white | public/images/units/dental-facial-trauma/ | Simple illustration showing a mouthguard on its own next to a young athlete wearing it with a slight smile, showing how it fits over the teeth. Clean, flat, friendly illustration style, no text in the image. | A mouthguard shown on its own and being worn by an athlete. |
| 7 | dental-trauma-tooth-anatomy-handling.webp | 4:3 | white | public/images/units/dental-facial-trauma/ | Cross-section of a tooth showing the crown (white chewing surface, labeled) above the gumline and the root (labeled) below it, wrapped in a thin highlighted layer representing the periodontal ligament. Beside it, a small inset shows a hand correctly holding an avulsed tooth by the crown only, fingers not touching the root. Clean medical-illustration style. | Diagram of a tooth's crown and root with the periodontal ligament highlighted, and a hand correctly holding a knocked-out tooth by the crown only. |
| 8 | dental-trauma-nosebleed-technique.webp | 4:3 | transparent | public/images/units/dental-facial-trauma/ | An athlete seated upright, torso leaning slightly forward from the hips (not tilting the head back), pinching the soft lower part of the nose with thumb and finger just below the bony bridge. Add a small crossed-out icon showing the incorrect head-tilted-back position beside it. Simple instructional-illustration style. | Diagram of correct nosebleed positioning: sitting upright and leaning slightly forward while pinching the soft part of the nose. |

**Landed 8 of 8** — five on 2026-07-29, three after a redo on 2026-07-30. All eight were mechanically clean —
correct filenames (including the `dental-trauma-` prefix against the
`dental-facial-trauma/` folder), correct dimensions, 31-58 KB, true alpha
where required, no slivers. **All three flagged reversals came back
correct**, which is what the direction checklist is for:
- `luxation-spectrum` — six panels in order, and critically **intrusion
  reads shorter, extrusion reads longer**, with concussion showing no
  displacement, subluxation loose-but-not-displaced, and lateral luxation
  displaced-but-rigid. Spelling correct throughout.
- `tooth-crown-root` and `tooth-anatomy-handling` — fingers on the **crown
  only** in both, and the periodontal ligament is highlighted on the **root
  surface**, which is the reason the root must not be touched.
- `mandible-ring-anatomy` — excellent anatomy: ring outline TMJ to TMJ, an
  anterior fracture at the body with the **associated condylar fracture on
  the opposite side**, condyle correctly at the top of the ramus, and the
  inferior alveolar nerve running inside the bone to exit at the mental
  foramen. Titled "Example multisite pattern," which carries the ring
  concept without the briefed force arrow.

**One alt reconciliation:** `mouthguard` was briefed as a mouthguard beside
a young athlete wearing it; the delivery shows the guard beside a second one
seated on a model of the upper teeth. No athlete, but the fit reads clearly
and nothing is wrong, so it was landed and the slot's `description`/`alt`
rewritten to describe the model.

**THREE REDONE AND LANDED (2026-07-30), after being held for two distinct
reasons.**

*Both nosebleed images first came back as anatomical skeletons* — skull,
spine, and a disembodied hand pinching a translucent soft-tissue nose. The
direction was right in both, but the brief asked for an athlete and the
substitution failed hardest where the teaching lives: at 7-8 the lesson
content *is* the posture ("sit up and lean forward"), and that image showed
no seated posture at all. **Both redos are correct**: an illustrated young
athlete seated on a bench/stool, leaning slightly forward, pinching the soft
part below the bony bridge, head never tilted back. The 9-10 redo also
brought back the one genuinely good idea from the rejected version — the
soft-tissue-over-bone cross-section, now a **labelled inset** marking BONY
BRIDGE and SOFT PART — plus a "10 minutes steady pressure" clock and a
smaller crossed-out tilted-back figure. Its `description` and `alt` were
expanded to cover the inset, clock, and crossed-out figure.

*`injury-types-overview` (7-8) first missed its band on four axes at once*:
it omitted the avulsed tooth (the first item in the 7-8 list and the unit's
headline injury), used 11-12 clinical vocabulary ("Epistaxis," "Mandibular
Fracture"), showed cheek abrasions as the jaw sign, and was a front-facing
photorealistic adult face — the closest any delivery has come to the
no-photorealistic-people rule. **The redo is correct**: flat illustration of
a young athlete, neutral expression, four numbered callouts in the lesson's
own plain language — completely knocked out, chipped or cracked, cut on the
lip, nosebleed — with a visible gap in the upper teeth marking the avulsion.
The jaw callout was dropped to keep four clean callouts, so the slot's
`description` and `alt` (which had listed a jaw callout) were rewritten to
match what is shown.

**OPEN POLISH ITEM — `tooth-anatomy-handling` leader line (Codex, PR #49).**
Both the `Root` and `Periodontal ligament` leader lines terminate on or at
the edge of the same thin blue ligament layer, rather than the root leader
landing clearly on the root's cream dentin. Verified by cropping the label
region. The rendering itself is anatomically correct and the adjacent 9-10
lesson text is explicit ("the tooth's root is covered in a thin layer of
living cells (the periodontal ligament)"), so nothing teaches a falsehood —
but this is the one diagram whose entire purpose is distinguishing those two
structures, so the ambiguity is worth removing. **Landed rather than held**,
because a full redo round-trip for a single leader-line endpoint was not
proportionate, then **corrected on 2026-07-31**. The corrected file was
verified two ways: a pixel-diff against the live original showed only **0.42%
of pixels changed**, confirming a surgical edit rather than a regeneration,
and a 3x crop confirmed the `Root` dot now sits on the cream dentin well
clear of the blue layer while `Periodontal ligament` still points at the
blue. A faint rectangular patch artifact is visible around the moved dot at
high magnification, imperceptible at display size. File also recompressed
from 57.6 KB to 29.8 KB with no visible quality loss.

**Lesson for later briefs:** the redo prompt led with a single shared
instruction — *"when a spec says 'an athlete' it means an illustrated
person"* — rather than repeating it per image, because the same substitution
had happened three ways in one batch. That reads as one systematic
misreading rather than three slips, and it was fixed in one pass.

## Batch 17: Lesson diagrams — eye-injuries (8 images) — LANDED 2026-07-31 (8 of 8; 1 redone)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | eye-injuries-orbital-blowout-entrapment.webp | 4:3 | white | public/images/units/eye-injuries/ | Front cross-section of the orbit showing the thin orbital floor fractured with the inferior rectus muscle caught ('trapdoor') in the fracture line, while the surrounding orbital rim stays intact. Include a small inset showing the eye's restricted upward gaze compared to the unaffected eye, illustrating the double-vision finding. Label the orbital floor, inferior rectus muscle, and infraorbital nerve. Clean medical-illustration style. | Diagram of an orbital blowout fracture with the inferior rectus muscle entrapped in the orbital floor, and an inset showing restricted upward eye movement. |
| 2 | eye-injuries-subconjunctival-vs-hyphema.webp | 16:9 | white | public/images/units/eye-injuries/ | Two-panel side-by-side comparison of a red eye after trauma. Left panel 'Subconjunctival hemorrhage': a flat, sharply-bordered bright-red patch on the white of the eye, normal-looking pupil and iris underneath, labeled 'painless, self-resolves in 1-2 weeks.' Right panel 'Hyphema': a visible layer of blood settled in front of the lower iris/pupil inside the anterior chamber, labeled 'painful, light-sensitive, urgent referral.' Clean medical-illustration style, non-graphic. | Comparison diagram of subconjunctival hemorrhage (a flat red patch on the white of the eye) and hyphema (blood layered in front of the iris) after trauma. |
| 3 | eye-injuries-warning-signs.webp | 4:3 | white | public/images/units/eye-injuries/ | Side-by-side illustration comparing a normal eye and an injured eye, with the injured eye showing mild redness in the white part and slight swelling around it. Simple, clean, non-graphic style appropriate for middle schoolers, minimal labels. | Comparison drawing of a normal eye next to an injured eye with redness and swelling. |
| 4 | eye-injuries-do-not-touch.webp | 1:1 | white | public/images/units/eye-injuries/ | Simple icon-style illustration of a hand held near an eye with a red circle-and-slash 'no' symbol overlaid, showing 'do not touch or rub the eye.' Plain, flat icon style, minimal detail, no text in the image. | Icon showing a hand near an eye with a red no symbol, meaning do not touch the eye. |
| 5 | eye-injuries-minor-irritation-rinse.webp | 4:3 | white | public/images/units/eye-injuries/ | Simple, calm illustration of an adult gently rinsing an athlete's eye with clean water poured from a small cup, the athlete leaning slightly forward and tilting their head. Clean, plain illustration style for middle schoolers. | An adult gently rinsing an athlete's eye with clean water from a small cup. |
| 6 | eye-injuries-protective-eyewear.webp | 4:3 | white | public/images/units/eye-injuries/ | Simple front-facing illustration of an athlete wearing sport-specific protective eyewear, like wraparound goggles suited for a sport such as hockey or racquetball. Clean, flat, friendly illustration style. | Athlete wearing sport-specific protective wraparound eyewear. |
| 7 | eye-injuries-anatomy-cross-section.webp | 4:3 | white | public/images/units/eye-injuries/ | Side cross-section of a human eye seated in its bony orbit, with the sclera, cornea, iris, pupil, and orbit each labeled with a leader line. Use distinct colors for the sclera (white), cornea (clear, outlined), and iris (colored ring around the pupil). Clean medical-illustration style, neutral gaze. | Cross-section diagram of the eye showing the sclera, cornea, iris, pupil, and bony orbit. |
| 8 | eye-injuries-rigid-shield-technique.webp | 4:3 | transparent | public/images/units/eye-injuries/ | Side view of a face with a rigid shield (the cut-off bottom of a paper cup) taped over the bony rim surrounding the eye, resting on the brow bone and cheekbone without touching the eye itself. Tape strips shown running from the shield to the forehead and cheek, well clear of the eye. Include a small crossed-out icon of a flat gauze patch pressing directly on the eye to show what NOT to do. Clean instructional-illustration style, no graphic detail. | Diagram showing a rigid shield taped over the bony rim around an injured eye, resting on surrounding bone rather than the eye itself. |

**Landed 8 of 8 (2026-07-31)** — seven straight through, the rinse image after a redraw. All mechanically clean — correct
filenames, correct dimensions including the 1:1 at 900x900, 32-55 KB, true
alpha on `rigid-shield-technique`, no slivers.

**The batch's highest-risk image came back correct.**
`subconjunctival-vs-hyphema` places the blood exactly right in both panels:
the subconjunctival patch is flat on the **white** with the iris and pupil
clear underneath, and the hyphema is pooled **inside the anterior chamber**
in front of the lower iris with a horizontal fluid level. Swapping those
would have inverted the entire differential. Title spelling was verified at
3x magnification after looking wrong at full-size — it is correct.

Also verified:
- `orbital-blowout-entrapment` — **rim intact, floor fractured**, inferior
  rectus caught in the fracture line, infraorbital nerve labelled, and the
  inset shows restricted **upward** gaze (unaffected vs affected), not
  sideways.
- `anatomy-cross-section` — **all five leader lines land on their own
  structure** (cornea, iris, pupil, sclera, orbit). This was specifically
  called out in the brief because of the batch-16 leader-line problem, and
  it was heeded.
- `rigid-shield-technique` — an illustrated athlete, rigid shield resting on
  brow and cheekbone with a visible gap over the eye, tape clear of the eye,
  and the crossed-out alternative is the flat patch pressing on the globe.
- `warning-signs` — plain language, normal-vs-injured comparison, mild
  redness and puffiness only.

**One alt reconciliation:** `protective-eyewear` was briefed as an athlete
wearing sport goggles and came back as a product illustration of the goggles
alone. Landed with the slot's `description`/`alt` rewritten — the heavy
wraparound frame and strap still carry the lesson's point that sports
eyewear is not ordinary glasses. This is the same call made for batch 16's
`mouthguard`, and it is now the **second** "athlete wearing X" spec to
return as object-only.

**REDRAWN AND LANDED — `eye-injuries-minor-irritation-rinse.webp`, first
delivered with a scope violation.**
The image shows the athlete rinsing **their own eye** over a sink. Both the
lesson ("an adult can also gently rinse the eye with clean water") and the
slot's alt ("An adult gently rinsing an athlete's eye") assign that action
to an adult, and the 7-8 scope rule across this whole strand is
notice-and-get-an-adult — the neighbouring `do-not-touch` image exists to
say hands off. Nothing here is dangerous in isolation, but it teaches the
wrong actor. **The redraw is correct:** two people, with an adult pouring
clean water from a small cup into a seated athlete's eye, the athlete's head
tilted so water runs away from the other eye, calm and low-key with no injury
signs.

**Minor observation, not a defect:** the athlete in `rigid-shield-technique`
wears a shirt with three parallel shoulder stripes, which is a common
illustrative convention for athletic wear but also evokes a well-known
brand's trade dress. No wordmark or logo is present. Landed; worth a glance
if the app is ever distributed commercially.

## Batch 18: Lesson diagrams — hydration-nutrition (7 images) — LANDED 2026-08-01 (7 of 7, clean delivery)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | hydration-nutrition-fuel-crossover-graph.webp | 16:9 | white | public/images/units/hydration-nutrition/ | Line graph with 'exercise intensity' on the x-axis (low to high) and 'percentage of energy contribution' on the y-axis. Two crossing lines: a downward-sloping line labeled 'Fat oxidation' starting high at low intensity and declining, and an upward-sloping line labeled 'Carbohydrate oxidation' starting low and rising, crossing at a marked 'crossover point' partway up the intensity axis. Add a small annotation at the far right: 'glycogen depletion here = bonking.' Clean scientific-diagram style, labeled axes. | Graph showing the crossover concept: fat oxidation dominates at low exercise intensity while carbohydrate oxidation becomes dominant past a crossover point as intensity increases. |
| 2 | hydration-nutrition-drink-comparison.webp | 16:9 | white | public/images/units/hydration-nutrition/ | Simple illustration comparing three drinks side by side: a water bottle with a green checkmark, a sports drink bottle with a small checkmark labeled 'sometimes,' and an energy drink can with a red X over it. Clean, flat icon style, minimal text. | Comparison of a water bottle, a sports drink, and an energy drink with checkmark and X symbols. |
| 3 | hydration-nutrition-meal-plate.webp | 1:1 | white | public/images/units/hydration-nutrition/ | Simple illustration of a plate divided into two sections showing a balanced pre/post-practice snack: fruit or toast on one side (carbs) and a small protein item like eggs or yogurt on the other side. Clean, flat food-illustration style, no text in the image. | A plate showing a balanced snack with fruit or toast and a small protein item. |
| 4 | hydration-nutrition-urine-color-chart.webp | 16:9 | white | public/images/units/hydration-nutrition/ | Simple horizontal color gradient chart showing urine color from pale yellow (like lemonade) on the left to dark amber on the right, with a small checkmark icon at the pale end and a small warning icon at the dark end. Clean, minimal, flat chart style, no realistic imagery. | Color gradient chart from pale yellow to dark amber showing hydration level. |
| 5 | hydration-nutrition-game-day-bag.webp | 4:3 | white | public/images/units/hydration-nutrition/ | Simple illustration of an open sports bag packed with a refillable water bottle, a piece of fruit or a granola bar, and a folded extra shirt. Clean, flat illustration style, no text in the image. | An open sports bag packed with a water bottle, a snack, and an extra shirt. |
| 6 | hydration-nutrition-hyponatremia-vs-dehydration.webp | 16:9 | transparent | public/images/units/hydration-nutrition/ | Two-panel side-by-side comparison. Left panel labeled 'Dehydration': thirst, dry mouth, dark urine, fatigue icons. Right panel labeled 'Overhydration / Hyponatremia': confusion, worsening headache, vomiting, swollen hands/feet icons. Add a small caption under the right panel: 'More water makes this WORSE, not better.' Clean flat infographic style. | Comparison diagram of dehydration signs versus overhydration (hyponatremia) signs during long endurance events. |
| 7 | hydration-nutrition-fueling-timeline.webp | 16:9 | white | public/images/units/hydration-nutrition/ | Horizontal timeline graphic centered on a practice/game icon, with markers at '3-4 hours before' (balanced meal icon: chicken, rice, vegetables), '1-2 hours before' (light snack icon: banana or granola bar), and '30-60 minutes after' (recovery snack icon: chocolate milk or sandwich), followed by 'normal meal.' Clean flat infographic timeline style. | Timeline diagram of pre-activity and post-activity meal and snack timing for athletes. |

**Landed 7/7 clean (2026-08-01)** — nothing held, nothing reconciled, the
first fully clean delivery since batch 15. Correct filenames, correct
dimensions across three aspect ratios, 30-40 KB throughout, true alpha on
`hyponatremia-vs-dehydration`, no slivers.

**All three flagged reversals came back correct, including the one that was a
genuine safety issue:**
- **`hyponatremia-vs-dehydration`** carries the required banner — *"More
  water makes this WORSE, not better"* — and nothing in that panel shows or
  implies drinking more water. The two panels read as different problems
  rather than mild-vs-severe versions of one. This was the batch's real risk:
  an image implying "drink more" for confusion plus worsening headache after
  hours of plain water would have taught something harmful.
- **`fuel-crossover-graph`** has fat oxidation starting high and falling,
  carbohydrate starting low and rising, crossing at a marked crossover point,
  and — the easy-to-miss part — **neither line reaches zero**, so fat is
  never shown as fully switched off.
- **`urine-color-chart`** puts the checkmark at the pale end and the warning
  at the dark end, as an abstract gradient bar with no realistic imagery.

`fueling-timeline` uses the exact windows (3-4 hours / 1-2 hours / 30-60
minutes after) in left-to-right order around a practice icon.

**One in-repo fix, from a Codex catch — and the error was in the spec, not
the delivery.** `fuel-crossover-graph` arrived with the briefed annotation
"Glycogen depletion here = bonking" and an arrow pointing at the
**high-intensity end of the x-axis**. That makes bonking look like a
consequence of reaching a particular intensity, whereas the lesson says it
happens "when glycogen runs critically low **during prolonged exercise**" —
a function of duration, not of a point on an intensity axis.

The annotation came from the slot's own `description` field, which predates
this session and was passed through into the brief unquestioned. Fixed in
repo the batch-9 way: the annotation and arrow were white-filled out after
verifying the fill box contained **zero curve pixels** (checked
programmatically before compositing), leaving both curves, the crossover
point, and every axis label intact. The image now matches its `alt`, which
never mentioned bonking. The slot's `description` was rewritten to drop the
annotation and to record *why* it must not come back, so a future
regeneration can't reintroduce it.

**The no-branding rule held.** The lesson names Gatorade, Red Bull, and
Monster in its text, so the brief required generic containers; the delivery
uses a plain "WATER" bottle, an unlabelled orange sports drink, and a generic
dark "ENERGY DRINK" can under a red X. No logos or recognisable trade dress
anywhere, including the granola bar and duffel.

**Sources — scoped by content, not by the earmark.** `docs/HANDOFF.md` had
two NATA statements earmarked for this strand. Checking them against the
units showed they don't both apply everywhere:
- **Fluid Replacement for the Physically Active** (2017;52(9):877-895,
  doi:10.4085/1062-6050-52.9.02) → **all three bands**. It backs urine-colour
  checks, the >2% body-weight-loss threshold, pre/post weigh-in sweat-rate
  protocol, and hyponatremia.
- **Safe Weight Loss and Maintenance Practices in Sport and Exercise**
  (2011;46(3):322-336) → **11-12 only**, which is the one band with a "Body
  composition, weight-class sports, and knowing when to refer" section and
  RED-S content. Cited without a URL because the earmark carried no DOI.
Attaching the second statement to the 7-8 and 9-10 units would have pointed
a weight-practices source at lessons that never discuss making weight.

## Batch 19: Lesson diagrams — skin-conditions (6 images) — LANDED 2026-08-01 (6 of 6, clean delivery)

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | skin-conditions-warning-signs.webp | 4:3 | white | public/images/units/skin-conditions/ | Simple illustration of a forearm with a small labeled-free callout circle zooming in on a red, slightly swollen skin spot, next to a normal patch of skin for comparison. Clean, non-graphic illustration style for middle schoolers, no real medical imagery. | Illustration comparing a normal patch of skin to a red, swollen skin spot that needs an adult's attention. |
| 2 | skin-conditions-shared-gear-risk.webp | 4:3 | white | public/images/units/skin-conditions/ | Illustration of two wrestlers in close contact on a wrestling mat, with a folded towel and water bottle sitting nearby on a bench, showing the kind of close-contact, shared-gear setting where skin problems can spread. Clean, simple illustration style for middle schoolers. | Illustration of wrestlers in close contact on a mat near shared towels and gear. |
| 3 | skin-conditions-blister-care.webp | 4:3 | white | public/images/units/skin-conditions/ | Side-by-side illustration comparing a closed, unbroken blister on a heel that is simply covered with a bandage, next to a blister that looks red and swollen around the edges, marked with a warning-colored outline to show it needs an adult's attention. Clean, non-graphic illustration style for middle schoolers. | Comparison drawing of a normal covered blister next to a red, swollen blister that needs an adult's attention. |
| 4 | skin-conditions-locker-room-habits.webp | 4:3 | white | public/images/units/skin-conditions/ | Illustration of a locker room scene showing a student wearing shower sandals heading to a shower stall, with their own labeled towel and water bottle beside them, separate from a teammate's things. Clean, friendly illustration style for middle schoolers. | Illustration of a student wearing shower sandals in a locker room with their own separate towel and water bottle. |
| 5 | skin-conditions-fungal-infection-comparison.webp | 16:9 | white | public/images/units/skin-conditions/ | Three-panel comparison of common fungal skin infections, each shown on a small patch of skin. Panel 1 'Ringworm': a ring-shaped red patch with a raised, scaly border and a clearer center. Panel 2 'Athlete's foot': redness and peeling skin between the toes. Panel 3 'Jock itch': a red, itchy rash with a defined edge in the groin/inner-thigh area (shown modestly, non-graphic). Label each panel. Clean medical-illustration style. | Comparison diagram of three fungal skin infections: ringworm, athlete's foot, and jock itch. |
| 6 | skin-conditions-bacterial-infection-signs.webp | 16:9 | white | public/images/units/skin-conditions/ | Two-panel comparison of bacterial skin infections. Left panel 'Impetigo': small sores/blisters that have broken open and formed a distinctive honey-colored (yellowish) crust, typically near the nose/mouth. Right panel 'MRSA': a red, swollen bump resembling a pimple or spider bite, with small icons noting 'warm to touch' and 'pain out of proportion to size.' Label each panel. Clean medical-illustration style, non-graphic. | Comparison diagram of impetigo (honey-colored crusted sores) and MRSA (a swollen, painful bump resembling a pimple). |

**Landed 6/6 clean (2026-08-01)** — nothing held. Correct filenames and
dimensions, 34-40 KB throughout, no slivers, no transparent images needed.

**A correction to this batch's own framing, caught while writing the brief.**
The table above summarised this strand as "contagious → recognize/**cover**/
refer." That is wrong, and building images to it would have taught the exact
behaviour the unit exists to warn against. The lesson says, in its own words:
*"Tell an adult — don't just cover it up,"* *"Do not just slap a bandage over
it and keep playing like normal,"* and it names *"covering it with a bandage
and playing through"* as the mistake. The correct framing is **recognize →
tell an adult → refer**. Covering is right in exactly one place — a **closed
blister**, which is not an infection — and the brief carved that out as the
sole exception. Later sessions should treat the one-line summaries in this
table as prompts to go read the lesson, not as specifications.

**Both accuracy risks came back correct:**
- **`fungal-infection-comparison`** draws ringworm as a **ring with a raised
  scaly border and a clearer centre**, not a solid red disc — that ring is
  the entire recognition cue and was the batch's most likely single error.
  Nothing wormlike appears. Athlete's foot is correctly **between the toes**,
  and jock itch is a cropped inner-thigh patch shown modestly.
- **`bacterial-infection-signs`** renders the impetigo crust in the correct
  **honey/golden-yellow**, and — the subtler requirement — draws **MRSA as
  deceptively minor**, a small pimple-like bump with "warm to touch" and
  "painful" icons. The lesson's point is that the dangerous one does not look
  dangerous, so an obviously-severe lesion would have inverted the teaching.

**The scope framing landed precisely.** `blister-care` puts a bandage and a
green tick on the *closed* blister and routes the inflamed one to a large
"TELL AN ADULT" arrow — not to re-bandaging. `warning-signs` labels its
zoom panels "Normal skin" and "Something changed" with a "Tell an adult"
bubble and no disease name anywhere, matching that band's explicit teaching
that students don't need to name anything. `shared-gear-risk` shows no skin
lesion at all, since it is about the setting. `locker-room-habits` keeps the
student fully dressed in practice clothing with two clearly separated sets of
belongings.

**RESOLVED — the jock-itch panel (Codex catch on PR #52, corrected
2026-08-03).** Codex called the third panel of
`fungal-infection-comparison` "a thin diagonal line... more like a scratch or
scar" than a demarcated rash. Checking it both ways showed the viewing size
decides the answer:
- **At 3x magnification the original was fine** — a real plaque behind a
  scalloped, well-demarcated border.
- **At true display size, and more so at mobile width, it was not.** The
  plaque flattened into surrounding skin and a curving red line dominated.
  Since that is the size students see, that was the read that counted, and
  the original 3x check had flattered the image.

Contributing cause was in the brief, not the delivery: it demanded modesty in
strong terms ("a cropped upper-inner-thigh patch only, no genitals, no
underwear detail") and the art honoured that at the cost of anatomical
context. The tension between modesty and recognisability is real in a school
app, and the first attempt sat too far toward modesty.

**The correction is verified good.** The redo widens the rash into a clearly
broader filled plaque that still carries its scaly demarcated border, adds
enough inner-thigh context to place it, and stays modest. It was checked at
phone width first, where it now reads as a plaque rather than a line. Panels
1 and 2 were preserved: a pixel-diff over the left 600 px shows **0.44%
change**, consistent with recompression rather than a redraw, so the accepted
ringworm ring and athlete's-foot panels are untouched.

**Method note worth keeping:** the correction request shipped a render of the
panel *at phone width* alongside the source file, so the failure mode was
visible rather than described. That is a good pattern for any
"looks-fine-magnified" defect.

**One accepted imprecision:** the MRSA panel's second icon reads "Painful"
where the lesson says "painful **out of proportion to its size**" — the
disproportion is the actual discriminator. Not contradictory, and the slot's
`alt` says only "painful," so it was landed. Worth tightening if the image is
ever regenerated.

**Unsourced.** No earmarked source for this strand. A NATA position statement
on skin diseases in athletes exists and would be the natural fit; it needs a
PDF in-session to cite, since DOI hosts are unreachable from the container.

## Batch 20: Lesson diagrams — sports-psychology (5 images) — LANDED 2026-08-03 (5 of 5, clean delivery) — FINAL BATCH

| # | Asset | Ratio | Background | Folder | Description | Alt text |
|---|---|---|---|---|---|---|
| 1 | sports-psychology-range-of-feelings.webp | 16:9 | white | public/images/units/sports-psychology/ | Split scene of two young athletes on the same team: one celebrating happily after a win, arms raised; the other sitting quietly on the bench looking down after a tough loss or an injury. Both are shown as normal, relatable moments, not exaggerated. Clean, warm illustration style for middle schoolers. | Illustration of one athlete celebrating a win and another sitting quietly after a tough moment, showing that both feelings are normal. |
| 2 | sports-psychology-recognize-withdrawal.webp | 4:3 | white | public/images/units/sports-psychology/ | Illustration of a team of athletes chatting and laughing together in a group off to one side, while one teammate sits alone a short distance away, not joining in, looking down. A gentle, non-alarming scene showing withdrawal from the group as something a teammate might notice. Clean, warm illustration style for middle schoolers. | Illustration of a teammate sitting apart from a group of chatting friends, showing a sign of withdrawal to notice. |
| 3 | sports-psychology-injured-sidelines.webp | 4:3 | white | public/images/units/sports-psychology/ | Illustration of an athlete on crutches sitting on the sideline bench, watching their team practice in the background, with a thoughtful, slightly sad expression. A gentle, relatable scene, no medical detail. Clean, warm illustration style for middle schoolers. | Illustration of an injured athlete on crutches watching their team practice from the sideline, looking a little down. |
| 4 | sports-psychology-listening-scene.webp | 4:3 | white | public/images/units/sports-psychology/ | Illustration of one teammate sitting beside another on a bench, listening calmly and supportively while the other talks, with a coach visible approaching nearby in the background to show the next step of getting a trusted adult involved. Warm, reassuring illustration style for middle schoolers. | Illustration of a teammate listening supportively to another, with a coach approaching in the background. |
| 5 | sports-psychology-supportive-conversation.webp | 4:3 | transparent | public/images/units/sports-psychology/ | Two teammates in practice gear sitting together on a bench off to the side of a field or court, one leaning in and listening attentively with open, calm body language while the other talks. Warm, low-key scene with no text, no visible score or crowd — the focus is entirely on the supportive one-on-one conversation. Simple, gentle illustration style, nothing clinical or distressing. | Illustration of one teammate listening supportively while another talks, depicting a peer-support conversation. |

**Landed 5/5 clean (2026-08-03) — the final batch of the project.** Correct
filenames and dimensions, 38-52 KB, true alpha on `supportive-conversation`,
no slivers.

**The strand's safety requirements were all met.** No image depicts crisis,
self-harm, or acute distress — the crisis material stays text-only in all
three bands, as designed. Nothing clinical: no therapy couches, pill
bottles, or storm-cloud metaphors. Tone is warm and ordinary throughout.

- **`recognize-withdrawal`** cleared the batch's hardest requirement:
  **withdrawal, not exclusion**. The group is animated and turned toward each
  other, absorbed in its own conversation — nobody points, stares, or turns
  away — while the teammate sits apart on the same bench looking down. She is
  drawn with exactly the same care and detail as everyone else, which was the
  dignity requirement.
- **`listening-scene`** includes the **approaching coach**, which was
  non-negotiable: the lesson's three steps are listen, don't try to fix it,
  tell a trusted adult, and without the adult the image would teach peer
  support as the endpoint. The coach reads as approachable and unhurried,
  walking over rather than summoned in alarm.
- **`range-of-feelings`** shows both feelings as equally ordinary — a gentle
  celebration and a quiet slump, neither euphoric nor despairing, no tears.
- **`injured-sidelines`** is wistful rather than miserable, with crutches as
  context and no medical detail.
- **`supportive-conversation`** carries no text at all, no crowd, no
  scoreboard — just open listening body language, on a genuine alpha channel.

All five use warm readable faces (the one batch where featureless faces would
not have worked, since these images carry tone) and show a mix of athletes.

**Checked at display size as well as full size**, applying the lesson from
the jock-itch panel: the withdrawal image was re-rendered at mobile width to
confirm the group still reads as absorbed rather than excluding, and the
seated teammate still reads as apart and quiet. It holds.

---

# PIPELINE COMPLETE — 139/139 lesson diagrams, 165/165 image slots

Verified 2026-08-03 by walking all 54 unit pages in a browser: **139 diagrams
rendered, 0 placeholders remaining anywhere, 0 console or network errors.**

---
**Totals:** 153 images in 20 batches originally; batches 1–2 (14 images) landed, **139 remaining across batches 3–20**, largest batch 10 images.
