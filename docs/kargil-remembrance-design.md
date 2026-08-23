# Kargil Remembrance — Design Document

## Working title

**At the Heights, They Stood**

An Independence Day remembrance of the fallen of Operation Vijay, expressed through an
Ashoka Chakra whose 24 spokes carry 24 names through the campaign.

## Intent

The piece connects Independence Day to remembrance without turning sacrifice into spectacle.
The Chakra represents the Republic carrying memory forward. As it turns and moves through an
editorial field, the surrounding text is recomputed with Pretext and flows around the wheel.

The central line is:

> The freedom we celebrate was held at these heights.

This is a small, interpretive memorial—not a comprehensive roll of honour. The 24 names match
the Chakra's 24 spokes. They are not a ranking. The complete sacrifice of Operation Vijay is
acknowledged in the closing copy and through a link to the Kargil War Memorial.

## Experience

1. **Threshold** — A quiet opening introduces Kargil, 1999 and the line above.
2. **The wheel** — The Ashoka Chakra becomes sticky while the reader scrolls through 24 steps.
3. **The field** — Campaign prose fills the canvas as a continuous typographic terrain. Each step
   rotates the wheel by one spoke and advances one name in the chronological sequence.
4. **Local reflow** — The wheel cuts a large circular clearing through the prose. As it crosses the
   field, each affected line is recomputed into left and right segments in real time.
5. **Phase reflow** — Five campaign phases progressively change both the wheel's route and the
   outer contour of every line, so the complete text field visibly breathes and reforms.
6. **Resolution** — After the 24th name, the wheel returns to centre and the individual names
   globally reflow into a widening mountain form beneath it. The closing then acknowledges every
   fallen person of Operation Vijay, not only the 24 represented in the experience.

## Interaction and motion

- Scroll is the primary input; arrow keys and the on-page previous/next buttons offer equivalent
  control.
- One spoke advances for each name. The wheel rotates in measured 15-degree increments.
- The selected name sits inside the clearing while a restrained DOM marker at the right preserves
  context and legibility. Large profile cards are deliberately avoided so that reflow remains the
  primary visual event.
- Motion uses slow, damped interpolation. There is no throwing, bouncing, confetti, explosion,
  or gamified scoring.
- With reduced motion enabled, transitions become immediate and the text uses a stable layout.
- The names remain legible in the DOM even if Canvas or JavaScript is unavailable.

## Visual language

- **Ground:** warm Ladakh stone (`#ede7dc`) rather than pure white.
- **Ink:** near-black blue (`#111927`).
- **Chakra:** deep navy (`#163b6d`).
- **Saffron and green:** restrained horizon rules and final-state accents only.
- **Type:** an editorial serif for the central remembrance; a clear sans serif for names,
  locations, and controls.
- **Terrain:** abstract CSS layers plus prose whose changing line bounds create typographic
  contours, not literal battlefield imagery.

## The 24-name sequence

The order follows campaign chronology and keeps people who served and fell together adjacent.
Within a shared action, the patrol or crew leader is followed by the other members. The sequence
begins with Captain Saurabh Kalia as requested and ends at Point 4875 with Captain Vikram Batra.

| Spoke | Name                                 | Unit / service                  | Campaign moment         |
| ----: | ------------------------------------ | ------------------------------- | ----------------------- |
|    01 | Captain Saurabh Kalia                | 4 JAT                           | First patrol, Kaksar    |
|    02 | Sepoy Arjun Ram                      | 4 JAT                           | First patrol, Kaksar    |
|    03 | Sepoy Bhanwar Lal Bagaria            | 4 JAT                           | First patrol, Kaksar    |
|    04 | Sepoy Bhika Ram                      | 4 JAT                           | First patrol, Kaksar    |
|    05 | Sepoy Moola Ram                      | 4 JAT                           | First patrol, Kaksar    |
|    06 | Sepoy Naresh Singh                   | 4 JAT                           | First patrol, Kaksar    |
|    07 | Squadron Leader Ajay Ahuja           | No. 17 Squadron, IAF            | Operation Safed Sagar   |
|    08 | Squadron Leader Rajiv Pundir         | 152 Helicopter Unit, IAF        | Tololing air mission    |
|    09 | Flight Lieutenant S. Muhilan         | 152 Helicopter Unit, IAF        | Tololing air mission    |
|    10 | Sergeant PVNR Prasad                 | 152 Helicopter Unit, IAF        | Tololing air mission    |
|    11 | Sergeant RK Sahu                     | 152 Helicopter Unit, IAF        | Tololing air mission    |
|    12 | Major Mariappan Saravanan            | 1 Bihar                         | Batalik                 |
|    13 | Major Rajesh Singh Adhikari          | 18 Grenadiers                   | Tololing                |
|    14 | Lieutenant Colonel R. Vishwanathan   | 18 Grenadiers                   | Tololing                |
|    15 | Captain Haneef Uddin                 | Army Service Corps / 11 Raj Rif | Turtuk                  |
|    16 | Major Vivek Gupta                    | 2 Rajputana Rifles              | Tololing                |
|    17 | Major Ajay Singh Jasrotia            | 13 JAK Rif                      | Dras                    |
|    18 | Major Padmapani Acharya              | 2 Rajputana Rifles              | Knoll, Tololing complex |
|    19 | Captain Neikezhakuo Kenguruse        | 2 Rajputana Rifles              | Black Rock              |
|    20 | Captain Vijyant Thapar               | 2 Rajputana Rifles              | Knoll                   |
|    21 | Lieutenant Keishing Clifford Nongrum | 12 JAK LI                       | Point 4812, Batalik     |
|    22 | Captain Manoj Kumar Pandey           | 1/11 Gorkha Rifles              | Khalubar Ridge          |
|    23 | Captain Anuj Nayyar                  | 17 JAT                          | Pimple II               |
|    24 | Captain Vikram Batra                 | 13 JAK Rif                      | Point 4875              |

## Content policy

- Do not invent quotations, last words, ages, family details, or combat actions.
- The first sample uses only short, sourced factual labels: rank, name, unit, phase, and location.
- Future biographical copy must be checked against official citations or family-approved material.
- Real portraits are out of scope for this first sample; the name remains the primary memorial.

## Accessibility

- The ordered list is present as semantic HTML and can be read without the animation.
- Canvas is decorative and hidden from assistive technology.
- Focus indicators, keyboard navigation, sufficient contrast, and reduced-motion behavior are
  mandatory.
- Controls are labelled with the currently selected name and position in the sequence.

## Sources used for the first sample

- Kargil War Memorial, e-Shradhanjali: <https://kargilwarmemorial.com/>
- Ministry of Defence / PIB, 26th Kargil Vijay Diwas:
  <https://www.pib.gov.in/PressReleasePage.aspx?PRID=2148839>
- Ministry of Defence / PIB, Kargil Vijay Diwas 2025 backgrounder:
  <https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=154940&id=154940>
- Ministry of Defence / PIB, IAF Mi-17 crew remembrance:
  <https://www.pib.gov.in/PressReleasePage.aspx?PRID=2033075>
- Lok Sabha record of Operation Vijay gallantry awards:
  <https://eparlib.sansad.in/bitstream/123456789/460870/1/7759.pdf>
- Indian Express archive, Captain Saurabh Kalia and the five members of the Kaksar patrol:
  <https://indianexpress.com/article/india/captain-saurabh-kalia-the-first-kargil-martyr-5276575/>

## First-sample boundaries

- One dedicated Astro route.
- Pretext-powered Canvas reflow across the complete stage: moving exclusion zone, campaign-phase
  contours, and a final name-built mountain.
- Twenty-four scroll steps with keyboard and button navigation.
- Responsive desktop and mobile compositions.
- No audio, photographs, analytics, data collection, or tribute submission flow.
