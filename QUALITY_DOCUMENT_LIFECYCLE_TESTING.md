# Quality Document Lifecycle - Testing Guide

This document provides guidance for testing the Quality Document Lifecycle implementation.

## Prerequisites

1. A document with `type === "file"`
2. The document's file type must have `isQualityDocument === true`

## Initial State (Upload)

When a quality document is first uploaded:

```javascript
status: -1        // Working
checkedOut: 1     // Checked Out (Editable)
requestId: null
mode: null
```

**Expected Behavior:**
- Document is editable (title, description, metadata can be changed)
- No request UI shown
- Shows "Working" status badge
- Shows "Submit for Review" button

## Lifecycle Transitions

### 1. Submit for Review

**Action:** Click "Submit for Review" button

**Expected Result:**
```javascript
status: 0         // Under Review
checkedOut: 0     // Checked In (Read-only)
requestId: <id>   // Request ID from API
mode: "TEAM"
```

**Expected Behavior:**
- Document becomes read-only (title, description, metadata cannot be changed)
- Shows "Under Review" and "Checked In" badges
- Shows "Team Review" mode badge
- Shows "Discard Request" button
- EditDocumentModal shows warning if opened
- ManageDocumentMetadataModal shows warning if opened

### 2. Discard Request (from Team Review)

**Action:** Click "Discard Request" button

**Expected Result:**
```javascript
status: -1        // Working
checkedOut: 1     // Checked Out
requestId: null
mode: null
```

**Expected Behavior:**
- Returns to initial editable state
- All badges reset to initial state
- Document becomes editable again

### 3. Endorse (from Team Review)

**Action:** Click "Endorse" button (only visible in TEAM mode)

**Expected Result:**
```javascript
status: 0         // Under Review
checkedOut: 0     // Checked In
requestId: <id>   // Same request ID
mode: "CONTROLLER"
```

**Expected Behavior:**
- Document remains locked
- Shows "Controller Review" mode badge
- Shows "Publish" and "Reject" buttons

### 4. Reject (from Controller Review)

**Action:** Click "Reject" button

**Expected Result:**
```javascript
status: -1        // Working
checkedOut: 0     // Checked In
requestId: <id>   // Same request ID
mode: "TEAM"
```

**Expected Behavior:**
- Document remains read-only
- User must explicitly discard or resubmit
- Shows "Discard Request" button

### 5. Publish (from Controller Review)

**Action:** Click "Publish" button

**Expected Result:**
```javascript
status: 2         // Published
checkedOut: 0     // Checked In
requestId: null
mode: null
```

**Expected Behavior:**
- Final state - document is permanently locked
- No further edits allowed
- No active request
- Shows "Published" status badge
- No workflow action buttons shown

## Test Scenarios

### Scenario 1: Happy Path
1. Upload quality document → Working state
2. Submit for review → Under Review (Team)
3. Endorse → Under Review (Controller)
4. Publish → Published (final)

### Scenario 2: Discard After Submit
1. Upload quality document → Working state
2. Submit for review → Under Review (Team)
3. Discard → Back to Working state
4. Document is editable again

### Scenario 3: Reject and Resubmit
1. Upload quality document → Working state
2. Submit for review → Under Review (Team)
3. Endorse → Under Review (Controller)
4. Reject → Working (but still checked in)
5. Discard → Working and editable
6. Submit again → Under Review (Team)
7. Endorse → Under Review (Controller)
8. Publish → Published

## Non-Quality Documents

**Test:** Upload or edit a regular document (not a quality document)

**Expected Behavior:**
- No lifecycle badges shown
- No lifecycle action buttons shown
- Document behaves normally (always editable)
- No checkout restrictions

## Edit Protection Tests

### Test EditDocumentModal
1. Open edit modal for a quality document in "checked in" state
2. Verify warning message appears
3. Verify all form fields are disabled
4. Verify "Save Changes" button is disabled

### Test ManageDocumentMetadataModal
1. Open metadata modal for a quality document in "checked in" state
2. Verify warning message appears
3. Verify all form fields are disabled
4. Verify "Save Changes" button is disabled

### Test DocumentDetail Editables
1. Navigate to a quality document in "checked in" state
2. Try to edit the title → Should not be editable
3. Try to edit the description → Should not be editable
4. Verify title and description show no hover effects

## API Integration

When running with real API (`VITE_USE_API=true`), the following endpoints should be called:

- **Submit:** `POST /documents/request` with `{ documentId }`
- **Discard:** `PUT /documents/request/:id?type=discard`
- **Endorse:** `PUT /documents/request/:id?type=endorse&mode=CONTROLLER`
- **Reject:** `PUT /documents/request/:id?type=reject`
- **Publish:** `PUT /documents/request/:id?type=publish`

## Validation Rules

The system prevents invalid transitions. Test these:

1. ❌ Cannot submit when already under review
2. ❌ Cannot discard when no active request
3. ❌ Cannot endorse when not in TEAM mode
4. ❌ Cannot publish when not in CONTROLLER mode
5. ❌ Cannot edit when checkedOut === 0
6. ❌ Cannot create versions when status >= 0

## Browser Testing

Test in different browsers:
- Chrome
- Firefox
- Safari
- Edge

## Responsive Testing

Test at different viewport sizes:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

Verify that:
- Badges wrap properly
- Action buttons are accessible
- Modals display correctly
