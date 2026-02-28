# Frappe Books - AI Agent Instructions

## Project Overview

**Frappe Books** is an open-source desktop accounting software built with:
- **Frontend:** Vue.js 3 with TypeScript
- **Desktop:** Electron (Windows, macOS, Linux)
- **Backend:** SQLite database with Knex query builder
- **Build:** Vite for dev server, custom Electron build setup

The app follows **double-entry accounting principles** and includes features like invoicing, payments, journal entries, financial reports (GL, P&L, Balance Sheet), POS, and inventory management.

## Architecture

### High-Level Data Flow
```
User Action (Vue Component) 
  ↓ Router Navigation
  ↓ Component State Change
  ↓ IPC Call (if Electron action needed)
  ↓ Main Process Handler (IPC_ACTIONS)
  ↓ Database Query via Fyo.db
  ↓ SQLite Database
  ↓ IPC Response back to Renderer
  ↓ Component Update
```

### Core Components

**Fyo Framework** (`fyo/index.ts`): Central singleton managing data, auth, database, and config. All models and docs access data through this.

**Doc Class** (`fyo/model/doc.ts`): Base class for all business entities. Implements lifecycle hooks (`beforeSync`, `afterSync`, `validate`), formula evaluation, and change tracking.

**Schema System** (`schemas/index.ts`): Declarative field definitions that generate database structure. Schemas include field types, validation rules, relationships, and custom fields.

**Model Registry** (`models/index.ts`): Maps schema names to TypeScript class implementations for business logic.

**Main Process** (`main/`): Electron IPC handlers exposed via `IPC_ACTIONS` (see `utils/messages.ts`). Direct database, file system, and OS access.

**Renderer Process** (`src/`): Vue components access data via Fyo singleton and emit IPC actions.

## Key Patterns

### Adding a New Model

1. Define schema in `schemas/app/newModelName.ts`:
```typescript
export const newModelNameSchema: Schema = {
  name: 'NewModelName',
  label: t`New Model Name`,
  doctype: 'DocType',
  isSubmittable: false,
  fields: [
    { fieldname: 'name', label: t`Name`, fieldtype: 'Data', required: true },
    // ... more fields
  ],
};
```

2. Create model class in `models/baseModels/NewModelName/NewModelName.ts`:
```typescript
export class NewModelName extends Doc {
  required: RequiredMap = { /* dynamic validation */ };
  static defaults: DefaultMap = { /* initial values */ };
  static getListViewSettings(): ListViewSettings { /* columns */ }
  
  async validate() { /* run validations */ }
  async beforeSync() { /* pre-save logic */ }
}
```

3. Register in `models/index.ts` ModelMap export.

4. Add schema to `schemas/schemas.ts` appSchemas export.

### IPC Communication Pattern

Main process handlers in `main/registerIpcMainActionListeners.ts`:
```typescript
ipcMain.handle(IPC_ACTIONS.ACTION_NAME, async (_, ...args) => {
  try {
    // Main process code with database access
    const result = await databaseManager.db.get('DocType', name);
    return { data: result };
  } catch (err) {
    return { error: err.message };
  }
});
```

Renderer calls via typed wrapper (see `src/renderer/registerIpcRendererListeners.ts`):
```typescript
const response = await ipc.invoke(IPC_ACTIONS.ACTION_NAME, args);
```

### Regional/Locale Patterns

Region-specific models and schemas in `regional/{countryCode}.ts`. Example: `regional/in.ts` includes India GST schemas and state mappings. Register regional models when initializing Fyo with country setting.

### Reports Pattern

All reports extend `Report` base class (`reports/Report.ts`):
```typescript
export class MyReport extends Report {
  static title = 'My Report';
  static reportName = 'MyReport';
  
  async getFilters(): Promise<Field[]> { /* user-configurable inputs */ }
  async getColumns(): Promise<ColumnField[]> { /* result columns */ }
  async setReportData() { 
    this.reportData = await this.getReportData();
    this.notify(); // Trigger observable update
  }
}
```

Register in `reports/index.ts` reports map indexed by reportName.

## Development Workflow

**Start Dev Server:**
```bash
npm run dev
```
Vite serves frontend on http://localhost:6969, Electron launched from main.ts

**Run Tests:**
```bash
npm test [TEST_PATH]
```
Tests use Tape framework. Set `IS_TEST=true` env var. Use `getTestFyo()` helper for isolated test instances.

**Build for Production:**
```bash
npm run build
```
Runs custom Electron build via `build/scripts/build.mjs`

**Lint & Format:**
```bash
npm run lint
npm run format
```

## Important Conventions

- **Schema Naming:** Matches DocType enum in `models/types.ts` (PascalCase)
- **Field Types:** Mapped to SQLite types in `backend/helpers.ts` sqliteTypeMap
- **Transactions:** Double-entry accounting requires balanced debit/credit entries
- **Currency:** Handled via Pesa library for precision; Currency field type
- **Testing:** Isolated Fyo instances; use test database paths from helpers
- **Error Handling:** Wrapped in `getErrorHandledReponse()` for consistent client errors
- **Translations:** Use `t` template tag from `fyo/utils/translation`; translations in CSV files in `translations/`

## File Organization

```
fyo/              - Core framework (Fyo class, handlers, models)
  core/           - Database, auth, doc handlers
  model/          - Base Doc class and types
  utils/          - Errors, translation, formatting
  
models/           - Business logic models
  baseModels/     - Shared accounting entities
  inventory/      - Stock tracking models
  regionalModels/ - Country-specific models
  
schemas/          - Schema definitions
  app/            - Application schemas
  core/           - Core system schemas
  regional/       - Country-specific schemas
  
main/             - Electron main process IPC handlers
src/              - Vue renderer process
  components/     - Reusable Vue components
  pages/          - Page-level components
  renderer/       - Renderer IPC handlers
  setup/          - Initial setup wizard
  
reports/          - Financial and inventory reports
  BalanceSheet/, GeneralLedger/, ProfitAndLoss/ - Account reports
  inventory/      - Stock-related reports
  
backend/          - SQLite database layer
  database/       - Database manager, schema sync
  patches/        - Database migration scripts
```

## Common Tasks for Agents

- **Add a DocType field:** Modify schema → add validation/formula in Doc class if needed
- **Create a report:** Extend Report class → implement getFilters/getColumns/setReportData → register in index
- **Add IPC action:** Add handler in registerIpcMainActionListeners → add action constant in utils/messages.ts → call via ipc.invoke in component
- **Support new country:** Add regional schema in regional/{code}.ts → add to regional export → register when initializing Fyo
- **Fix double-entry issue:** Check Account.isDebit vs isCredit logic, validate both posting sides balance
