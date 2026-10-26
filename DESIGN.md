# Design Brief

## Direction

Market Fresh — a warm, editorial neighbourhood-grocery storefront for Mr Kipmasai Mini Mart: fresh, friendly and trustworthy, with prices in Malaysian Ringgit (RM).

## Tone

Refined-organic retail — clean editorial layout with botanical green and citrus accents; warm and human, never discount-bin cluttered.

## Differentiation

Deep forest-green primary paired with a punchy tangerine price accent on warm cream — a fresh-market identity that avoids the beige "rustic food" cliché, anchored by tabular mono price chips.

## Color Palette

| Token      | OKLCH          | Role                                            |
| ---------- | -------------- | ----------------------------------------------- |
| background | 0.975 0.012 95 | warm cream page canvas                          |
| foreground | 0.2 0.02 150   | deep green-charcoal text                        |
| card       | 1.0 0.004 95   | near-white product surfaces                     |
| primary    | 0.42 0.105 155 | forest green — header, buttons, active states   |
| accent     | 0.66 0.185 45  | tangerine — price chips, badges, promo CTA      |
| muted      | 0.94 0.014 95  | section alternation, footer, quiet surfaces     |
| success    | 0.6 0.15 150   | "In stock" indicators                           |
| destructive| 0.55 0.22 25   | remove-from-cart, validation errors             |

## Typography

- Display: Bricolage Grotesque — wordmark, hero headline, section headings
- Body: Figtree — product names, UI labels, paragraphs, forms
- Mono: JetBrains Mono — prices (RM), order references, quantities (tabular-nums)
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-4xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Layered warm surfaces: cream page → white cards with `shadow-subtle`, hover lifts to `shadow-elevated`; header and footer use `shadow-lifted`/borders for separation, never flat single-plane.

## Structural Zones

| Zone    | Background          | Border            | Notes                                          |
| ------- | ------------------- | ----------------- | ---------------------------------------------- |
| Header  | `bg-card`           | `border-b`        | Sticky; wordmark + search + category pills + cart count |
| Content | `bg-background`     | —                 | Alternate sections with `bg-muted/40`          |
| Footer  | `bg-muted/60`       | `border-t`        | Store info, categories, contact columns        |

## Spacing & Rhythm

Generous section gaps (`py-12 md:py-20`), product grid `gap-6`, card padding `p-4`; micro-spacing `gap-2` inside cards and `gap-3` in forms.

## Component Patterns

- Buttons: pill (`rounded-full`), primary forest green with subtle hover darken; accent tangerine for promo CTAs; `transition-smooth`
- Cards: `rounded-xl` white surface, `shadow-subtle` → `shadow-elevated` on hover, product image on tinted square
- Badges: pill, `bg-success/15 text-success` for stock, `bg-accent text-accent-foreground` for price chips

## Motion

- Entrance: `fade-up` on section reveal, 0.4s ease-out, staggered 60ms
- Hover: card lift + shadow deepen, 0.3s `transition-smooth`; buttons scale 1.02
- Decorative: soft `float` on hero produce accents, cart badge `pop` on add

## Constraints

- No raw hex/rgb in components — semantic tokens only
- Prices always rendered in mono with `RM` prefix
- No online card payment, delivery tracking, reviews, or promo codes in this build

## Signature Detail

The tangerine mono price chip — a small accent-orange pill with tabular-numeral price that recurs on every product card, cart line and order total, giving the storefront a memorable market-tag rhythm.
