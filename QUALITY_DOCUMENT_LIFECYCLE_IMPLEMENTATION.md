# Quality Document Lifecycle Implementation Summary

## Overview

This implementation adds a comprehensive frontend-only document lifecycle roadmap and milestone system for Quality Documents in the Document Management System (DMS). The system manages the complete lifecycle from initial upload through review, endorsement, and final publication.

## Scope

**Applies ONLY to Quality Documents:**
- `document.type === "file"`
- `document.metadata.fileType.isQualityDocument === true`

**Does NOT affect:**
- Non-file documents (folders, audit schedules, form templates, form responses)
- Files where `isQualityDocument !== true`

## New Document Properties

Four new properties have been added to quality documents:

### 1. status (number)
Lifecycle stage of the document:
- `-1`: Working (draft state)
- `0`: Under Review
- `1`: Approved (Reserved - not actively used)
- `2`: Published (final state)

### 2. checkedOut (number)
Controls editability:
- `0`: Checked In (Read-only)
- `1`: Checked Out (Editable)

### 3. requestId (string | null)
- `null`: No active request
- `<string>`: Request identifier during review, rejection, or endorsement

### 4. mode (string | null)
Defines who currently owns the workflow step:
- `"TEAM"`: Document owner / submitting team
- `"CONTROLLER"`: Reviewer / approver
- `null`: No active workflow

## Files Created

### 1. `/src/utils/qualityDocumentUtils.js`
Core utility module providing:
- Lifecycle constants (LIFECYCLE_STATUS, CHECKOUT_STATUS, WORKFLOW_MODE)
- `isQualityDocument()` - Identifies quality documents
- `getInitialLifecycleProps()` - Returns initial state for new documents
- `canEditDocument()` - Checks if document can be edited
- `canCreateVersion()` - Checks if versions can be created
- `validateTransition()` - Validates lifecycle action transitions
- `getExpectedState()` - Returns expected state after an action
- `getStatusLabel()` / `getModeLabel()` - Human-readable labels

### 2. `/src/components/Document/QualityDocumentBadges.jsx`
UI component that displays:
- Lifecycle status badge (color-coded by state)
- Checkout status badge (when checked in)
- Workflow mode badge (TEAM or CONTROLLER)

### 3. `/src/components/Document/QualityDocumentActions.jsx`
UI component that provides:
- Role-aware action buttons based on workflow mode
- Confirmation dialogs for all actions
- Integration with DocumentsContext lifecycle methods
- Toast notifications for success/error

## Files Modified

### 1. `/src/services/api.js`
Added lifecycle API methods:
- `submitDocumentRequest(documentId)` - POST /documents/request
- `discardDocumentRequest(requestId)` - PUT /documents/request/:id?type=discard
- `endorseDocumentRequest(requestId)` - PUT /documents/request/:id?type=endorse&mode=CONTROLLER
- `rejectDocumentRequest(requestId)` - PUT /documents/request/:id?type=reject
- `publishDocument(requestId)` - PUT /documents/request/:id?type=publish

### 2. `/src/context/DocumentsContext.jsx`
Enhanced with:
- Import of quality document utilities
- Automatic lifecycle property initialization for new quality documents
- Five new lifecycle methods:
  - `submitDocumentForReview()` - Submit document for review
  - `discardDocumentRequest()` - Discard active request
  - `endorseDocumentForPublish()` - Endorse for publish
  - `rejectDocumentRequest()` - Reject document
  - `publishDocument()` - Publish document
- All methods include validation and proper state updates

### 3. `/src/pages/Document/DocumentDetail.jsx`
Integrated lifecycle UI:
- Imported quality document utilities and components
- Added `handleQualityDocumentUpdate()` callback
- Calculated `documentCanBeEdited` using `canEditDocument()`
- Disabled title/description editables when document is checked in
- Added QualityDocumentBadges next to existing DocumentBadges
- Added QualityDocumentActions section for lifecycle buttons
- Replaced old placeholder "Version Control & Approval Status" card with new "Lifecycle Status" card

### 4. `/src/components/Document/modals/EditDocumentModal.jsx`
Added lifecycle protection:
- Import of `canEditDocument` utility
- Warning alert when document cannot be edited
- Disabled all form fields when `checkedOut === 0`
- Disabled submit button when document is checked in
- Validation before submitting changes

### 5. `/src/components/Document/modals/ManageDocumentMetadataModal.jsx`
Added lifecycle protection:
- Import of `canEditDocument` utility
- Warning alert when document cannot be edited
- Disabled all form fields when `checkedOut === 0`
- Disabled submit button when document is checked in
- Validation before submitting changes

### 6. `/src/components/FileTypeAsyncSelect.jsx`
Enhanced to support lifecycle:
- Added `isDisabled` prop handling
- Passes `isDisabled` to both FormControl and AsyncSelect
- Ensures proper disabled state when used in protected modals

## Lifecycle Flow

### Initial State (Upload)
```
status: -1 (Working)
checkedOut: 1 (Checked Out)
requestId: null
mode: null
```
Document is editable, no request UI shown.

### Submit Request
```
status: 0 (Under Review)
checkedOut: 0 (Checked In)
requestId: <id>
mode: "TEAM"
```
Document locked for editing, shows "Under Review" and "Team Review" badges.

### Discard Request
```
status: -1 (Working)
checkedOut: 1 (Checked Out)
requestId: null
mode: null
```
Returns to initial editable state.

### Endorse for Publish
```
status: 0 (Under Review)
checkedOut: 0 (Checked In)
requestId: <id>
mode: "CONTROLLER"
```
Moves to controller review, document remains locked.

### Reject Request
```
status: -1 (Working)
checkedOut: 0 (Checked In)
requestId: <id>
mode: "TEAM"
```
Returns to working status but remains locked until discarded or resubmitted.

### Publish Document
```
status: 2 (Published)
checkedOut: 0 (Checked In)
requestId: null
mode: null
```
Final state - document permanently locked, no further changes allowed.

## Allowed Workflow Paths

### ✅ Ideal Flow
Upload → Submit → Endorse → Publish

### 🔁 Discard Flow
Upload → Submit → Reject → Discard

### ♻️ Resubmission Flow
Upload → Submit → Reject → Submit → Endorse → Publish

## Frontend Validations

The system enforces:
1. Valid transitions only (via `validateTransition()`)
2. Prevent publish without endorsement
3. Prevent submit while already under review
4. Prevent edits when `checkedOut === 0`
5. State consistency checks
6. Role-aware UI based on workflow mode

## Version Control Integration

Version-related restrictions:
- No new versions allowed when `checkedOut === 0`
- No new versions allowed when `status >= 0`
- Version creation only in: `status === -1 && checkedOut === 1`
- Edit protection extends to all modals and inline editing

## Mock Mode Support

All lifecycle functionality works in mock mode (`VITE_USE_API=false`):
- API calls return mock success responses
- Generates mock request IDs
- State management fully functional
- UI behaves identically to API mode

## Security Considerations

- All validation happens on frontend (as per requirements)
- Backend API should implement its own validation
- Request IDs are generated by API (trusted source)
- State transitions follow strict validation rules
- No security vulnerabilities detected by CodeQL

## Testing

A comprehensive testing guide has been created in:
`/QUALITY_DOCUMENT_LIFECYCLE_TESTING.md`

This includes:
- Test scenarios for all lifecycle transitions
- Validation rule tests
- Edit protection tests
- Non-quality document isolation tests
- API integration tests
- Browser and responsive testing guidelines

## Future Enhancements

The implementation is designed to be extensible:
- Additional workflow modes can be added
- New lifecycle states can be introduced
- Custom validation rules can be added
- Workflow step notifications can be integrated
- Audit trail can be enhanced

## Build & Deployment

- ✅ Builds successfully with `npm run build`
- ✅ Passes linting with `npm run lint`
- ✅ No ESLint warnings or errors
- ✅ No security vulnerabilities (CodeQL scan passed)
- ✅ Code review completed with all feedback addressed

## Backward Compatibility

- Non-quality documents remain unaffected
- Existing document functionality preserved
- New properties only added to quality documents
- Graceful handling of documents without lifecycle properties
