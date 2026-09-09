const fs = require('fs');
const pmfby = JSON.parse(fs.readFileSync('src/lib/schemes/catalog/pmfby.json'));

pmfby.eligibilityCriteria = pmfby.eligibilityCriteria.filter(c => c.field !== 'canApplyWithinPrescribedTimeframe');
for (const c of pmfby.eligibilityCriteria) {
  if (c.field === 'growsNotifiedCropInNotifiedArea') {
     c.type = 'fact_check';
     c.fact = 'land_tenure';
     c.expected_values = ['own', 'bhaga_sharecropper'];
     delete c.field;
     delete c.required;
     delete c.question;
  }
  if (c.field === 'hasValidLandOwnershipOrTenureEvidence') {
     c.type = 'fact_check';
     c.fact = 'land_record_status';
     c.expected_values = ['valid_records'];
     delete c.field;
     delete c.required;
     delete c.question;
  }
}
fs.writeFileSync('src/lib/schemes/catalog/pmfby.json', JSON.stringify(pmfby, null, 2));

const ae = JSON.parse(fs.readFileSync('src/lib/schemes/catalog/ae.json'));
// only add if it's not already there
if (!ae.eligibilityCriteria.find(c => c.fact === 'krushak_id_status')) {
  ae.eligibilityCriteria.push(
    {
      source_text: 'Krushak Odisha ID required',
      type: 'fact_check',
      fact: 'krushak_id_status',
      expected_values: ['has_id']
    },
    {
      source_text: 'No prior machinery subsidy within 5 years',
      type: 'fact_check',
      fact: 'prior_machinery_subsidy_5yr',
      expected_values: ['no_not_received']
    }
  );
  fs.writeFileSync('src/lib/schemes/catalog/ae.json', JSON.stringify(ae, null, 2));
}
