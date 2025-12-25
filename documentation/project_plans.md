# Implementation Plan - Feature Enhancements

## Goal Description
Enhance existing data management and import features to be more robust and useful. Specifically, improve duplicate detection logic and expand Excel import capabilities.

## User Review Required
> [!NOTE]
> **Duplicate Logic**: Will now check `F.I.O` + `Year` + `Specialty`. Entries matching ALL three will be treated as duplicates.
> **Excel Import**: Will attempt to read columns A (FIO), B (Dir/Spec), and C (Year). If headers exist, they will be skipped if they match keywords.

## Proposed Changes

### Logic Layer
#### [MODIFY] [app.js](file:///c:/Users/User/.gemini/antigravity/scratch/student_docs/app.js)
- **Update `removeDuplicates`**:
    - Change unique key generation from `s.fio` to `${s.fio}|${s.year}|${s.specialty}`.
    - Ensure case-insensitivity and trim whitespace.
- **Update `importExcel`**:
    - Map Column B (index 1) to `specialty`.
    - Map Column C (index 2) to `year`.
    - Add validation to ensure imported Year is a reasonable number (e.g., length 4).

## Verification Plan

### Manual Verification
1. **Duplicate Test**:
    - Create Student A: "Vali", 2024, "IT".
    - Create Student B: "Vali", 2023, "IT".
    - Run `removeDuplicates`. Result: Both should stay (different year).
    - Create Student C: "Vali", 2024, "IT".
    - Run `removeDuplicates`. Result: One "Vali" (2024, IT) removed.
2. **Excel Import Test**:
    - Create simple Excel with 3 columns: Name, Spec, Year.
    - Import.
    - Verify all fields populate correctly in the list.
