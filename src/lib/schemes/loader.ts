// Auto-generated loader for scheme catalogs
import kcc from './catalog/kcc.json' with { type: 'json' };
import nfsmcss from './catalog/nfsmcss.json' with { type: 'json' };
import rkvyshfshc from './catalog/rkvyshfshc.json' with { type: 'json' };
import acandabc from './catalog/acandabc.json' with { type: 'json' };
import ksis from './catalog/ksis.json' with { type: 'json' };
import cpis from './catalog/cpis.json' with { type: 'json' };
import ky_smsp from './catalog/ky-smsp.json' with { type: 'json' };
import nmnf from './catalog/nmnf.json' with { type: 'json' };
import pmkmdy from './catalog/pmkmdy.json' with { type: 'json' };
import pmksypdmc from './catalog/pmksypdmc.json' with { type: 'json' };
import ae from './catalog/ae.json' with { type: 'json' };
import e_nam from './catalog/e-nam.json' with { type: 'json' };
import pmfby from './catalog/pmfby.json' with { type: 'json' };
import rad from './catalog/rad.json' with { type: 'json' };
import ami from './catalog/ami.json' with { type: 'json' };
import midh from './catalog/midh.json' with { type: 'json' };
import nbm from './catalog/nbm.json' with { type: 'json' };
import nmeo_op from './catalog/nmeo-op.json' with { type: 'json' };
import smam from './catalog/smam.json' with { type: 'json' };
import ndd from './catalog/ndd.json' with { type: 'json' };
import kvny from './catalog/kvny.json' with { type: 'json' };
import beds from './catalog/beds.json' with { type: 'json' };
import piatibft from './catalog/piatibft.json' with { type: 'json' };
import mpy_mcpnpky from './catalog/mpy-mcpnpky.json' with { type: 'json' };
import ssgsf from './catalog/ssgsf.json' with { type: 'json' };
import pfmeiiao from './catalog/pfmeiiao.json' with { type: 'json' };
import scdf from './catalog/scdf.json' with { type: 'json' };
import kalia from './catalog/kalia.json' with { type: 'json' };
import mtc from './catalog/mtc.json' with { type: 'json' };
import pmv from './catalog/pmv.json' with { type: 'json' };
import pm_vikas from './catalog/pm-vikas.json' with { type: 'json' };
import nssw from './catalog/nssw.json' with { type: 'json' };
import visvasi from './catalog/visvasi.json' with { type: 'json' };
import smbdlp from './catalog/smbdlp.json' with { type: 'json' };
import cbssc_msy from './catalog/cbssc-msy.json' with { type: 'json' };
import mcfnsfdc from './catalog/mcfnsfdc.json' with { type: 'json' };
import aksmsy from './catalog/aksmsy.json' with { type: 'json' };


const schemesMap: Record<string, any> = {
  'kcc': kcc,
  'nfsmcss': nfsmcss,
  'rkvyshfshc': rkvyshfshc,
  'acandabc': acandabc,
  'ksis': ksis,
  'cpis': cpis,
  'ky-smsp': ky_smsp,
  'nmnf': nmnf,
  'pmkmdy': pmkmdy,
  'pmksypdmc': pmksypdmc,
  'ae': ae,
  'e-nam': e_nam,
  'pmfby': pmfby,
  'rad': rad,
  'ami': ami,
  'midh': midh,
  'nbm': nbm,
  'nmeo-op': nmeo_op,
  'smam': smam,
  'ndd': ndd,
  'kvny': kvny,
  'beds': beds,
  'piatibft': piatibft,
  'mpy-mcpnpky': mpy_mcpnpky,
  'ssgsf': ssgsf,
  'pfmeiiao': pfmeiiao,
  'scdf': scdf,
  'kalia': kalia,
  'mtc': mtc,
  'pmv': pmv,
  'pm-vikas': pm_vikas,
  'nssw': nssw,
  'visvasi': visvasi,
  'smbdlp': smbdlp,
  'cbssc-msy': cbssc_msy,
  'mcfnsfdc': mcfnsfdc,
  'aksmsy': aksmsy,
};


export function getAllSchemes() {
  return Object.values(schemesMap).map(s => {
    const { eligibilityCriteria, ...metadata } = s;
    return metadata;
  });
}

export function getEligibilityMap(): Record<string, any> {
  const map: Record<string, any> = {};
  for (const [id, s] of Object.entries(schemesMap)) {
    map[id] = {
      id: s.id,
      name: s.name,
      criteria: s.eligibilityCriteria
    };
  }
  return map;
}

export function getSchemeById(id: string) {
  return schemesMap[id];
}

// Ensure backwards compatibility by exporting catalog and eligibilityCatalog objects
export const catalog = {
  taxonomy: {
  "version": "1.0.0",
  "source_basis": "Schemes - Sheet1.pdf supplied in conversation",
  "source_scheme_count": 37,
  "production_principles": [
    "Interpret citizen language into structured intent before matching schemes.",
    "Apply hard eligibility/exclusion rules before relevance ranking whenever the required facts are known.",
    "Do not equate relevance with eligibility.",
    "If a hard eligibility fact is unknown, keep the scheme provisional and ask only the smallest useful follow-up question.",
    "Suppress low-relevance schemes rather than showing a long generic list.",
    "Preserve source anomalies and stale temporal notes instead of silently correcting them."
  ],
  "intent_schema": {
    "goal": [
      "start_new_activity",
      "grow_existing_activity",
      "protect_income",
      "reduce_cost",
      "access_credit",
      "access_subsidy",
      "access_insurance",
      "access_training",
      "access_education",
      "sell_or_market",
      "improve_productivity",
      "get_advice"
    ],
    "need": [
      "loan",
      "subsidy",
      "insurance",
      "pension",
      "scholarship",
      "training",
      "equipment",
      "infrastructure",
      "market_access",
      "advice",
      "working_capital",
      "livelihood_support"
    ],
    "activity": [
      "crop_farming",
      "horticulture",
      "irrigation",
      "livestock",
      "poultry",
      "duck_farming",
      "goat_farming",
      "sheep_farming",
      "piggery",
      "dairy",
      "fish_farming",
      "shrimp_farming",
      "traditional_fishing",
      "artisan_trade",
      "small_business",
      "seed",
      "bamboo",
      "oil_palm",
      "coconut",
      "agri_services"
    ],
    "beneficiary": [
      "farmer",
      "tenant_farmer",
      "sharecropper",
      "landless_household",
      "woman",
      "women_shg_member",
      "artisan",
      "fisher",
      "student",
      "agri_graduate",
      "entrepreneur",
      "fpo",
      "shg",
      "cooperative"
    ],
    "context": [
      "state",
      "district",
      "age",
      "gender",
      "caste",
      "minority_status",
      "income",
      "land_area",
      "land_status",
      "existing_activity",
      "new_activity",
      "education",
      "shg_membership",
      "prior_subsidy",
      "prior_loan",
      "crop",
      "pond_status",
      "project_size"
    ]
  },
  "ranking": {
    "hard_eligibility": "eliminate if definitely excluded; otherwise continue",
    "weights": {
      "intent_match": 40,
      "activity_match": 25,
      "need_match": 15,
      "location_match": 10,
      "known_context_match": 10
    },
    "bands": {
      "HIGH": [
        80,
        100
      ],
      "MEDIUM": [
        60,
        79
      ],
      "LOW": [
        40,
        59
      ],
      "SUPPRESS": [
        0,
        39
      ]
    },
    "rules": [
      "Exact activity-specific match should outrank generic livelihood schemes.",
      "A scheme with a known hard exclusion must score 0.",
      "A scheme requiring unknown eligibility should be labeled 'eligibility not yet confirmed', not 'eligible'.",
      "State-specific schemes outrank national generic schemes when the user's activity and state match exactly.",
      "Component-specific schemes should not be surfaced merely because a broad category word matches."
    ]
  },
  "question_policy": {
    "max_questions_per_turn": 2,
    "ask_only_if_material": true,
    "priority": [
      "hard_exclusion_fact",
      "location",
      "activity",
      "beneficiary_type",
      "age",
      "income",
      "caste_or_minority",
      "land_or_project_requirement",
      "prior_benefit"
    ],
    "examples": [
      {
        "user": "mo business pain loan darkar",
        "ask": "What kind of business do you run or want to start?"
      },
      {
        "user": "mu machha chasa karibaku chahunchhi",
        "ask": "Do you already have a pond, or do you want help creating one?"
      },
      {
        "user": "mu duck farm start karibaku chahunchhi",
        "ask": "Are you planning a semi-commercial duck unit of around 1,000 ducks?"
      },
      {
        "user": "mu chasa bhala karibaku chahunchhi",
        "ask": "What would help most: irrigation, farm equipment, seeds/inputs, reducing costs, selling produce, or crop protection?"
      }
    ]
  },
  "language_layer": {
    "supported_input": "English + Romanized Odia/Hinglish-style mixed language",
    "normalization": [
      "lowercase",
      "unicode_normalization",
      "punctuation_cleanup",
      "common spelling variants",
      "Romanized Odia synonym expansion"
    ],
    "starter_lexicon": {
      "farming": [
        "chasa",
        "chasha",
        "kheti",
        "kheti kariba",
        "chasa kariba"
      ],
      "business": [
        "business",
        "byabasa",
        "byabasaya",
        "dokan",
        "dukana"
      ],
      "loan": [
        "loan",
        "lon",
        "rin",
        "rina",
        "paisa darkar",
        "taka darkar"
      ],
      "subsidy": [
        "subsidy",
        "sahajya",
        "sarkari sahajya"
      ],
      "duck": [
        "duck",
        "duck farm",
        "duck farming",
        "bataka",
        "bataka palana",
        "bataka chasa"
      ],
      "fish": [
        "fish",
        "fish farming",
        "machha",
        "machha chasa",
        "matsya"
      ],
      "goat": [
        "goat",
        "goat farming",
        "goat rearing",
        "chaga",
        "chhag",
        "bakri palan"
      ],
      "sheep": [
        "sheep",
        "sheep farming",
        "menda",
        "sheep palan"
      ],
      "irrigation": [
        "irrigation",
        "drip",
        "sprinkler",
        "pani",
        "jala",
        "jalasechana"
      ],
      "coconut": [
        "coconut",
        "narial",
        "nariyal",
        "nadia",
        "coconut tree"
      ],
      "artisan": [
        "artisan",
        "craft",
        "karigar",
        "silpi",
        "traditional trade"
      ]
    }
  }
},
  schema_version: "1.0.0",
  source_file: "Schemes - Sheet1.pdf",
  source_note: "This catalog is derived from the supplied scheme database. It intentionally does not add external eligibility facts.",
  schemes: getAllSchemes()
};

export const eligibilityCatalog = getEligibilityMap();
