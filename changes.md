# Changes Log (Code Folder + Data)

This file explains the implemented changes, line-by-line by file, and the reasoning behind each change.

## 1) `src/app/interfaces/event.ts`

- **Line 1**: Added `EntityId = string | number`.
  - **Reason**: JSON Server IDs are commonly strings, while UI logic originally assumed numbers.
- **Lines 4, 7**: Updated `AppEvent.id` and `AppEvent.categoryId` to use `EntityId`.
  - **Reason**: Prevent type mismatch and runtime comparison issues.
- **Line 11**: Updated `AppEvent.date` to `Date | string`.
  - **Reason**: Form code uses `Date`, API payloads return string timestamps.
- **Lines 19-22**: Simplified `category` to core identity (`id`, `categoryName`) and removed inline description field.
  - **Reason**: Category descriptions are now managed as separate records.
- **Lines 24-33**: Added `categoryDescription` and `categoryWithDescriptions` interfaces.
  - **Reason**: Support one category name with multiple independently managed descriptions in UI and API flows.

## 2) `src/app/services/event-api.ts`

- **Line 2**: Imported `EntityId`.
  - **Reason**: Align service signatures with string/number IDs.
- **Lines 25, 30**: Updated `updateEvent` and `deleteEvent` to accept `EntityId`.
  - **Reason**: Fix API calls when event IDs are strings from JSON Server.

## 3) `src/app/services/category.ts`

- **Lines 10-11**: Split API endpoints into `categoriesUrl` and `categoryDescriptionsUrl`.
  - **Reason**: Categories and descriptions are now different resources.
- **Lines 15-26**: Added normalization and lookup helpers:
  - `normalizeCategoryName`
  - `normalizeDescription`
  - `findCategoryByName`
  - **Reason**: Enforce case-insensitive uniqueness and avoid duplicate logical entries.
- **Lines 39-53**: Added read/create methods for description records.
  - **Reason**: Needed for per-description display and deletion.
- **Lines 68-69**: Added `deleteCategoryDescription`.
  - **Reason**: Categories tab deletes descriptions individually instead of deleting entire categories.

## 4) `src/app/pages/event-registration/event-registration.page.ts`

- **Lines 20-27**: `newEvent.categoryId` default is now empty string (`''`) instead of numeric.
  - **Reason**: Align with mixed/string IDs.
- **Lines 45-77**: Reworked `loadCategories(...)`:
  - Deduplicates category names case-insensitively.
  - Preserves current selected category only if still valid.
  - Can optionally open category picker after fetch.
  - **Reason**: Ensure dropdown shows DB truth and selection remains stable.
- **Lines 79-85**: Added `refreshCategories()` and `openCategoryPicker()`.
  - **Reason**: Clicking category row fetches latest DB data first, then opens selector.
- **Lines 87-118**: Strengthened submit validation and payload composition.
  - **Reason**: Avoid silent submit failures and keep event data consistent.
- **Lines 120-226**: Rebuilt `createAndUseCategory()` flow:
  - Existing category name (case-insensitive) is selected instead of duplicated.
  - New description for existing category is validated for uniqueness.
  - New category creation supports optional first description.
  - Success/failure alerts added for each path.
  - **Reason**: Enforce uniqueness and keep UX clear.
- **Lines 228-241**: Updated `resetForm()` defaults to new ID model.
  - **Reason**: Prevent invalid numeric defaults.

## 5) `src/app/pages/event-registration/event-registration.page.html`

- **Line 19**: Category row is clickable and triggers `openCategoryPicker()`.
  - **Reason**: User-requested interaction: click row to open selector.
- **Lines 21-31**: Category selector remains `ion-select` and binds to `newEvent.categoryId`.
  - **Reason**: Keep consistent selector behavior while refreshing from DB.
- **Lines 33-38**: Added empty-state message and manual refresh action.
  - **Reason**: Improve visibility when DB has no categories or after external changes.
- **Line 50**: Updated description label text to clarify optional behavior.
  - **Reason**: Better form guidance.

## 6) `src/app/pages/event-list/event-list.page.ts`

- **Refactor summary**: Rewrote this file in a simpler, more beginner-style flow while keeping the same end behavior.
  - **Reason**: You asked for the same results with less complex-looking code.
- **Top import block**: Kept only the required page dependencies and icon setup, but in a cleaner structure.
  - **Reason**: Make the file easier to scan for new developers.
- **`ngOnInit` / `refreshAllData()`**: Uses straightforward nested API calls (events → categories → descriptions), then groups and syncs.
  - **Reason**: Beginner-friendly control flow (less split state handling).
- **`startCategorySyncWatcher()` + `onTabChanged()`**: Refreshes data when Categories tab is active and when tab is opened.
  - **Reason**: Keep categories synced with event changes in a simple way.
- **`syncDescriptionsFromEvents()`**: Uses simple arrays/loops/find checks to:
  - create missing description rows from events,
  - remove stale/duplicate rows not represented by events.
  - **Reason**: Preserve sync behavior without advanced-heavy patterns.
- **`deleteEvent()` / `startEdit()` / `saveUpdate()`**: Keeps confirm dialogs and success/failure alerts.
  - **Reason**: Preserve requested operation feedback UX.
- **`addCategory()`**: Keeps case-insensitive category uniqueness and per-category description uniqueness.
  - **Reason**: Preserve data integrity rules while remaining readable.
- **`deleteCategoryDescription()`**: Deletes one description and refreshes page data.
  - **Reason**: Maintain per-description delete behavior.

## 7) `src/app/pages/event-list/event-list.page.html`

- **Line 16**: Segment now calls `onTabChanged()` on tab switch.
  - **Reason**: Trigger on-demand sync when opening Categories tab.
- **Lines 30-88**: Events tab moved to `ion-accordion-group` + `ion-accordion`.
  - **Reason**: Requested move away from list-style event rows.
- **Lines 33-58**: Event detail rows now render with **label on left** and **value on right**.
  - **Reason**: Requested field orientation for readability (e.g., `Category | transport`, `Service | uber`).
- **Lines 78-84**: Replaced text action buttons with icons:
  - Edit → pen (`create-outline`)
  - Delete → trash (`trash-outline`)
  - **Reason**: Requested icon-based action controls.
- **Lines 96-138**: Categories tab keeps grouped categories with per-description delete controls.
  - **Reason**: Category heading is non-deletable, descriptions are deletable individually.

## 8) `src/app/pages/event-list/event-list.page.scss`

- **Lines 1-6**: Added `.category-heading` (blue, bold, uppercase).
  - **Reason**: Distinguish non-deletable category headings from descriptions.
- **Lines 8-70**: Added accordion and metadata row styling.
  - Includes label/value alignment rules with values pushed right.
  - **Reason**: Match requested accordion presentation and left-label/right-value layout.

## 9) `db.json`

- **Events array**: Updated records reflect ongoing add/edit/delete actions from Event List flows.
  - **Reason**: Runtime CRUD operations modify persisted data.
- **Categories array**: Stores canonical category names.
  - **Reason**: Category identity is now separate from descriptions.
- **CategoryDescriptions array**: Stores synced descriptions tied to `categoryId`.
  - **Reason**: Supports per-description management and reconciliation with Events.

---

## Summary of Why These Changes Were Made

- Fix ID/type mismatches with JSON Server.
- Enforce category name uniqueness (case-insensitive).
- Support one category with multiple descriptions.
- Keep Categories tab auto-synced with Events and DB.
- Improve Event List UX with accordion layout, left-label/right-value rows, icon actions, and operation confirmations/feedback.
