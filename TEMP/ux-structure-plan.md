# UX structure plan — de-squeeze Dashboard + expand sidebar

## Goal
- Prevent “everything squeezed into one page”.
- Make content stack vertically: one section per row by default.
- Split oversized visuals into dedicated pages when needed.
- Expand sidebar with more feature tabs and route structure.

## Proposed pages / routes
- `/` **Command Center** (hero + map + pipeline preview + quick alerts + recommendations preview)
- `/warehouses` Warehouses (map + facility details + sensor feed)
- `/inventory` Inventory grid/table (already exists)
- `/shelf-life` (new) Shelf life distribution + inventory heatmap
- `/prediction` Prediction Lab (already exists)
- `/alerts` Alerts timeline (already exists but needs timeline style)
- `/insight-studio` (alias/new) Analytics + MLInsights
- `/reports` Reports (already exists)
- `/settings` Settings (already exists)

## Dashboard reflow strategy
- DashboardPage should render a vertical stack on xl too (no 3-card row layouts).
- Use `max-w` and consistent section spacing.
- Convert “3-column sections” into one section per row (with optional pagination between heavy charts).

## Sidebar expansion
- Add more entries:
  - Command Center
  - Warehouses
  - Inventory
  - Shelf Life (new)
  - Prediction Lab
  - Insight Studio (Analytics)
  - Alerts
  - AI Model Insights (Explainability)
  - Reports
  - Settings

## Implementation notes
- Update `App.tsx` routes.
- Create new page(s) or repurpose sections.
- Update `Sidebar.tsx` to include new routes.

