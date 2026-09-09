const fs = require('fs');
const kcc = JSON.parse(fs.readFileSync('src/lib/schemes/catalog/kcc.json'));

kcc.eligibilityCriteria = [
  {
    source_text: 'owner cultivator',
    source_text_aliases: [
      'tenant farmer',
      'oral lessee',
      'sharecropper',
      'farmer SHG/JLG',
      '[EXCLUSION] not a farmer / no agricultural activity'
    ],
    type: 'fact_check',
    fact: 'land_tenure',
    expected_values: ['own', 'bhaga_sharecropper', 'shg_jlg']
  }
];

fs.writeFileSync('src/lib/schemes/catalog/kcc.json', JSON.stringify(kcc, null, 2));
