# ACE visual-system snapshot

`system.css` is copied unchanged from `../ace-visual-system/src/styles/system.css`, reviewed at commit `1cdd96290e212e526cefd8d351160569f826c9aa` on 2026-11-25. It provides brand and semantic tokens, typography, base styles, and theme definitions. The HMI Primer currently uses its dark default with 16 px body text and product layout overrides in `src/style.css`.

`src/assets/brand/ace-mark.svg` is copied unchanged from that project's `src/assets/logos/ace/3 color/logo-mark.svg`. The mark remains ACE corporate artwork, paired with the HMI Primer name.

This follows CDL Explorer's vendoring pattern so builds do not require a sibling checkout or an unpublished package. Re-copy from the authoritative visual-system repository when intentionally updating the design system, and update this provenance record. The source stylesheet imports Google Fonts; fallback fonts keep content usable offline.
