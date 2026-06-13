# Revive Yoga Co. — Modern Redesign

A trendy, modern redesign of **www.reviveyoga.co**, built in your real brand
colors, with an interactive mockup in Figma and a full section-by-section spec.

**Figma mockup:** https://www.figma.com/design/3UVmKg8UJT1lxeQ9lIn2sQ/Revive-Yoga-Co--Modern-Redesign-Mockup

> Status: **complete.** All 11 sections are built as a single full-length
> desktop homepage frame (1440 × ~5,350px), styled in Revive's gold / white /
> champagne / charcoal palette. Image slots use labelled placeholders — see
> "Photography" below for the recommended photo for each slot.

---

## Design direction

The current site has a beautiful, minimal gold-on-white brand. The redesign
keeps that exact palette and elegance, but adds the modern structure a
boutique studio site needs to convert: a clear hero, a class grid, simple
pricing, social proof, and a repeated booking CTA.

- **Your real brand palette** — muted gold, champagne, white, charcoal.
- **High-contrast serif display (Playfair) + clean sans (Inter)**, with
  generous letter-spacing to echo your wordmark's refined feel.
- **Lots of whitespace**, soft rounded image cards, and pill buttons.
- **One repeated booking CTA**, anchored by a free-first-class hook.
- **Testimonials + Instagram feed** to build community and trust.

### Color palette (from your brand)

| Token             | Hex       | Use                                       |
|-------------------|-----------|-------------------------------------------|
| Muted gold / ochre| `#C29B64` | Accent, CTAs, wordmark, eyebrows          |
| Deep gold         | `#A8824B` | Gold text on light backgrounds            |
| Champagne / tan   | `#E2D3BE` | Marquee band, soft accents                |
| Soft champagne    | `#EFE6D6` | Alternating section backgrounds           |
| White             | `#FFFFFF` | Primary background                        |
| Charcoal / black  | `#1A1A1A` | Headlines, dark bands, footer             |
| Warm grey         | `#7A7164` | Body / secondary text                     |

### Typography

- **Display:** Playfair Display (Black/Bold) — editorial headlines.
- **Body & UI:** Inter (Regular → Semi Bold), with letter-spacing on labels.

---

## Page structure (11 sections)

1. **Announcement bar** (charcoal + gold) — new Reformer studio / free first class
2. **Sticky nav** — `RE·VIVE` wordmark, links, gold "Book a Class" pill
3. **Hero** — "Restore. Strengthen. Renew." + stat row + dual CTAs
4. **Marquee** — class styles in serif on champagne
5. **Studio / About split** — philosophy + three proof points
6. **Class grid "Find your flow"** — Bikram, Vinyasa, Yin, Barre + Yoga, HIIT, Reformer
7. **Pricing "Memberships made simple"** — Free intro / `$60` unlimited (featured) / `$75` reformer 3-pack
8. **Testimonial band** (charcoal + gold) — member pull-quote
9. **Instagram gallery "From the mat"** — four tiles + follow button
10. **Closing CTA** — "Your first class is on us."
11. **Footer** — address/hours, link columns, newsletter signup, socials

---

## Photography

Every image slot is a labelled placeholder (e.g. `img:Reformer Pilates — hero
photo`). Swap in warm, natural-light photography to match your brand. Note:
the redesign session could not auto-insert photos because the sandbox network
blocks external image hosts — so add them in Figma directly (drag a downloaded
image onto a placeholder frame and Figma fills it), or via Figma's Unsplash
plugin.

Recommended free photos (Pexels, free to use):

| Slot                         | Suggested photo |
|------------------------------|-----------------|
| Hero — Reformer Pilates      | https://www.pexels.com/photo/woman-practicing-pilates-on-reformer-in-studio-31509827/ |
| About — sunlit studio        | https://www.pexels.com/photo/the-interior-of-a-pilates-studio-11036673/ |
| Bikram — hot yoga pose       | https://www.pexels.com/photo/woman-doing-yoga-on-mat-in-light-room-6454060/ |
| Vinyasa — flow               | https://www.pexels.com/photo/a-woman-in-brown-tank-top-stretching-on-a-yoga-mat-6246385/ |
| Yin — restorative / Savasana | https://www.pexels.com/photo/slim-woman-lying-in-shavasana-pose-on-yoga-mat-4498188/ |
| Barre + Yoga — strength      | https://www.pexels.com/photo/a-woman-doing-handstand-on-a-yoga-mat-4534695/ |
| HIIT — strength              | https://www.pexels.com/photo/a-woman-doing-push-ups-6739040/ |
| Reformer Pilates             | https://www.pexels.com/photo/woman-doing-pilates-with-a-use-of-a-machine-18136885/ |
| Gallery — studio             | https://www.pexels.com/photo/pilates-reformer-machine-in-a-studio-25599821/ |
| Gallery — reformer           | https://www.pexels.com/photo/woman-exercising-on-pilates-reformer-in-studio-31509828/ |
| Gallery — community          | https://www.pexels.com/photo/women-at-pilates-25596681/ |
| Gallery — sunrise flow       | https://www.pexels.com/photo/woman-sitting-on-a-yoga-mat-8436706/ |

> If `mcp.figma.com` (and `images.pexels.com`) are added to the environment's
> network egress allowlist, the photos can be auto-placed into each slot
> instead.

---

## Next steps

- Drop real photography into the placeholder frames (see above).
- Add a mobile breakpoint (single-column stack, hamburger nav).
- Once approved, this is straightforward to build as a real site (Next.js +
  Tailwind, or a Squarespace/Webflow theme) using the same tokens.
