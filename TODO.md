# TODO — RipeCrate Frontend Redesign

## Step 1 — Design system foundation
- [x] Verify fonts (Space Grotesk + Inter) load correctly; add imports if missing.
- [x] Standardize key UI primitives (panel/card/button/glow/border-radius) to match spec.
- [x] Verify build succeeds for the current frontend state.




## Step 2 — Shared layout polish
- [ ] Upgrade `Sidebar.tsx` visuals to match futuristic enterprise style.
- [ ] Upgrade `Topbar.tsx` spacing/hover/notification pulse to match spec.
- [ ] Review/adjust shared UI in `ui.tsx` (PageHeader/StatCard/ChartCard/StatusChip/SearchBar).

## Step 3 — Dashboard storytelling upgrades
- [ ] Replace “Cold Chain Flow” timeline with animated pipeline (farm→transport→warehouse→distribution→retail).
- [ ] Ensure Alerts Timeline is a vertical timeline with proper critical blinking.
- [ ] Make Inventory Health radial gauge animated.

## Step 4 — Prediction Lab “coolest page” polish
- [ ] Add animated confidence/risk meters.
- [ ] Improve SHAP-style chart styling and microinteractions.

## Step 5 — Inventory enterprise table controls
- [ ] Make column chooser functional (toggles columns).
- [ ] Add export CSV (client-side) and refresh feel.

## Step 6 — Alerts page timeline
- [ ] Convert AlertsPage cards list to timeline layout.

## Step 7 — Background “living cold-chain” visuals
- [ ] Enhance `styles.css` with animated connection lines and route dots.

## Step 8 — Validate
- [ ] Run frontend dev server and check all routes render.
- [ ] Quick visual + motion accessibility pass (prefers-reduced-motion).

