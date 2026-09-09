1. **Create Canonical Fact Registry (`src/lib/schemes/facts.ts`)**:
   - Define canonical fact definitions: `land_tenure`, `land_record_status`, `krushak_id_status`, `prior_machinery_subsidy_5yr`.
   - Provide human-friendly labels, questions, and discrete choice options in 'en' and 'or'.

2. **Create Rejection Reason Localization (`src/lib/schemes/evaluation-reasons.ts`)**:
   - Map each fact key to user-facing rejection strings in 'en' and 'or'.

3. **Refactor Schemas (`src/lib/schemes/catalog/`)**:
   - Update KCC (`kcc.json`) to evaluate against canonical fact keys instead of bespoke raw strings.
   - Update PMFBY (`pmfby.json`) to evaluate against canonical keys. Drop the temporal PMFBY sowing deadline question.
   - Update SMAE (`ae.json`) to add `krushak_id_status` and `prior_machinery_subsidy_5yr` checks.

4. **Verify Definitions**:
   - Check using `read_file` or `cat` that `facts.ts` and `evaluation-reasons.ts` were created correctly.
   - Check that `kcc.json`, `pmfby.json` and `ae.json` schemas are modified properly.

5. **Update UI Evaluator & Question Selector**:
   - **Question Selector (`src/lib/schemes/question-selector.ts`)**: Prioritize unknown canonical facts.
   - **UI Component (`src/components/schemes/EligibilityVerificationInline.tsx`)**:
     - Locate the eligibility results and update the copy strings:
       - Satisfied (Met criteria): "ଆପଣଙ୍କ ପାଖରେ କ’ଣ ଅଛି" for 'or'
       - Unmet criteria: "ଆଉ କ’ଣ ଆବଶ୍ୟକ" for 'or'
       - Submit button: "ଯାଞ୍ଚ କରନ୍ତୁ" for 'or'
       - Back button: "ପଛକୁ ଫେରନ୍ତୁ" for 'or'
     - (And their 'en' counterparts like "What you have", "What else is needed", "Verify", "Back"). Ensure it uses localized reason strings if applicable.

6. **Run Tests and Build**:
   - Run `npm test` and `npm run build` to ensure all tests pass and TypeScript types compile clearly.

7. **Pre-commit Steps**:
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

8. **Submission**:
   - Commit and submit.
