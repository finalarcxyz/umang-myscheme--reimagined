const fs = require('fs');

let uiCode = fs.readFileSync('src/components/schemes/EligibilityVerificationInline.tsx', 'utf8');

// Ah, wait. I tried to replace `ಸମାଧାନ` with `ଯାଞ୍ଚ କରନ୍ତୁ` but it failed? Oh I replaced "{language === 'or' ? 'ସମାଧାନ' : 'Submit'}" exactly, but the actual code has `ସମାଧାନ` ? Wait let's check what it has.
uiCode = uiCode.replace(
  "{language === 'or' ? 'ସମାଧାନ' : 'Submit'}",
  "{language === 'or' ? 'ଯାଞ୍ଚ କରନ୍ତୁ' : 'Submit'}"
);

uiCode = uiCode.replace(
  "{language === 'or' ? 'ପିଛି' : 'Back'}",
  "{language === 'or' ? 'ପଛକୁ ଫେରନ୍ତୁ' : 'Back'}"
);

uiCode = uiCode.replace(
  "{language === 'or' ? 'ପୂର୍ଣ୍ଣ କ୍ରିଟେରିଆ' : 'Criteria Met ✅'}",
  "{language === 'or' ? 'ଆପଣଙ୍କ ପାଖରେ କ’ଣ ଅଛି' : 'What you have ✅'}"
);

uiCode = uiCode.replace(
  "{language === 'or' ? 'ଅପୂର୍ଣ୍ଣ କ୍ରିଟେରିଆ' : 'Criteria Not Met ❌'}",
  "{language === 'or' ? 'ଆଉ କ’ଣ ଆବଶ୍ୟକ' : 'What else is needed ❌'}"
);

fs.writeFileSync('src/components/schemes/EligibilityVerificationInline.tsx', uiCode);
