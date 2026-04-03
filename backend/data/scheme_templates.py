# data/scheme_templates.py
"""
Application draft templates for major government schemes.
Each template defines:
  - questions: what to ask the user in the modal
  - document_checklist: what docs to attach
  - letter_template: Python str.format()-compatible letter body
"""

SCHEME_TEMPLATES = {
    "PMEGP": {
        "full_name": "Prime Minister Employment Generation Programme",
        "authority": "KVIC / KVIB / DIC",
        "apply_url": "https://www.kviconline.gov.in/pmegpeportal",
        "questions": [
            {"id": "applicant_name",    "label": "Your full name",                           "type": "text"},
            {"id": "father_name",       "label": "Father's / Husband's name",                "type": "text"},
            {"id": "dob",               "label": "Date of birth (DD/MM/YYYY)",                "type": "text"},
            {"id": "address",           "label": "Complete residential address with pincode", "type": "textarea"},
            {"id": "district",          "label": "Your district",                             "type": "text"},
            {"id": "business_name",     "label": "Proposed business name",                   "type": "text"},
            {"id": "business_activity", "label": "What will your business do? (2-3 sentences)", "type": "textarea"},
            {"id": "project_cost",      "label": "Estimated total project cost (₹)",         "type": "number"},
            {"id": "bank_name",         "label": "Preferred bank for loan",                  "type": "text"},
            {"id": "category",          "label": "Category",                                 "type": "select",
             "options": ["General", "SC", "ST", "OBC", "Women", "Ex-Serviceman", "Differently Abled"]},
            {"id": "qualification",     "label": "Educational qualification",                "type": "text"},
        ],
        "document_checklist": [
            "Aadhaar Card (self-attested copy)",
            "PAN Card",
            "Passport size photographs (3 copies)",
            "Educational qualification certificate",
            "Caste certificate (if SC/ST/OBC)",
            "Project report",
            "Bank account statement (last 6 months)",
            "Proof of residence",
        ],
        "letter_template": """To,
The District Industries Centre / KVIC Office,
{district}, India

Subject: Application for Financial Assistance under PMEGP Scheme

Respected Sir/Madam,

I, {applicant_name}, son/daughter/wife of {father_name}, residing at {address}, wish to apply for financial assistance under the Prime Minister Employment Generation Programme (PMEGP).

I propose to establish a {business_activity} under the name "{business_name}". The estimated project cost is ₹{project_cost}.

I belong to the {category} category and my educational qualification is {qualification}. I request you to consider my application for a PMEGP loan to be processed through {bank_name}.

I hereby declare that all information provided is true and correct to the best of my knowledge.

Yours faithfully,
{applicant_name}
Date: {current_date}
Place: {district}

Enclosures:
{document_checklist}
""",
    },

    "Mudra": {
        "full_name": "Pradhan Mantri Mudra Yojana (Shishu)",
        "authority": "Any Scheduled Commercial Bank / MFI",
        "apply_url": "https://www.mudra.org.in",
        "questions": [
            {"id": "applicant_name",  "label": "Full name",                                     "type": "text"},
            {"id": "address",         "label": "Complete address with pincode",                   "type": "textarea"},
            {"id": "district",        "label": "District",                                       "type": "text"},
            {"id": "business_name",   "label": "Business name",                                  "type": "text"},
            {"id": "business_type",   "label": "Type of business",                               "type": "select",
             "options": ["Manufacturing", "Trading", "Services", "Agriculture Allied"]},
            {"id": "loan_amount",     "label": "Loan amount required (max ₹50,000 for Shishu)", "type": "number"},
            {"id": "loan_purpose",    "label": "What will you use the loan for?",                "type": "textarea"},
            {"id": "bank_name",       "label": "Bank where you have account",                    "type": "text"},
            {"id": "existing_income", "label": "Current monthly income (₹)",                    "type": "number"},
        ],
        "document_checklist": [
            "Aadhaar Card",
            "PAN Card or Form 60",
            "Passport size photographs (2 copies)",
            "Proof of business address",
            "Bank statement (last 6 months)",
            "Quotation of machinery/equipment (if applicable)",
            "Caste certificate (SC/ST/OBC if applicable)",
        ],
        "letter_template": """To,
The Branch Manager,
{bank_name},
{district}, India

Subject: Application for Mudra Loan (Shishu) under PMMY

Respected Sir/Madam,

I, {applicant_name}, residing at {address}, am engaged in {business_type} business under the name "{business_name}".

I am writing to request a Mudra Loan of ₹{loan_amount} under the Pradhan Mantri Mudra Yojana (Shishu category) for the purpose of {loan_purpose}.

My current monthly income is ₹{existing_income}. I assure you of timely repayment of the loan.

Yours faithfully,
{applicant_name}
Date: {current_date}
Place: {district}

Enclosures:
{document_checklist}
""",
    },

    "Stand-Up India": {
        "full_name": "Stand-Up India Scheme",
        "authority": "Scheduled Commercial Banks",
        "apply_url": "https://www.standupmitra.in",
        "questions": [
            {"id": "applicant_name",  "label": "Full name",                              "type": "text"},
            {"id": "category",        "label": "Category",                               "type": "select",
             "options": ["SC", "ST", "Women"]},
            {"id": "address",         "label": "Complete address",                       "type": "textarea"},
            {"id": "district",        "label": "District",                               "type": "text"},
            {"id": "business_name",   "label": "Enterprise name",                        "type": "text"},
            {"id": "business_sector", "label": "Business sector",                        "type": "select",
             "options": ["Manufacturing", "Services", "Trading"]},
            {"id": "project_cost",    "label": "Total project cost (₹10L - ₹1Cr)",      "type": "number"},
            {"id": "business_plan",   "label": "Describe your business plan briefly",   "type": "textarea"},
            {"id": "bank_name",       "label": "Preferred bank",                         "type": "text"},
            {"id": "experience",      "label": "Relevant business experience (if any)", "type": "textarea"},
        ],
        "document_checklist": [
            "Aadhaar Card",
            "PAN Card",
            "Caste / Category certificate",
            "Business plan / Project report",
            "Proof of business address",
            "Photographs (3 copies)",
            "Bank statement (last 12 months)",
            "Income Tax returns (last 2 years if available)",
            "Memorandum of Association (if company)",
        ],
        "letter_template": """To,
The Branch Manager,
{bank_name},
{district}, India

Subject: Application for Loan under Stand-Up India Scheme

Respected Sir/Madam,

I, {applicant_name}, belonging to {category} category, residing at {address}, wish to apply for a composite loan under the Stand-Up India Scheme.

I propose to set up a greenfield {business_sector} enterprise named "{business_name}" with a total project cost of ₹{project_cost}.

Business Plan Summary:
{business_plan}

My relevant experience: {experience}

Yours faithfully,
{applicant_name}
Date: {current_date}
Place: {district}

Enclosures:
{document_checklist}
""",
    },

    "ODOP": {
        "full_name": "One District One Product Scheme (UP)",
        "authority": "UP MSME Department / DIC",
        "apply_url": "https://odopup.in",
        "questions": [
            {"id": "applicant_name", "label": "Full name",                               "type": "text"},
            {"id": "district",       "label": "Your district",                           "type": "text"},
            {"id": "odop_product",   "label": "Which ODOP product will you work with?",  "type": "text"},
            {"id": "business_name",  "label": "Business / Unit name",                    "type": "text"},
            {"id": "address",        "label": "Business address",                        "type": "textarea"},
            {"id": "investment",     "label": "Proposed investment amount (₹)",          "type": "number"},
            {"id": "employment",     "label": "Number of people you will employ",         "type": "number"},
            {"id": "business_desc",  "label": "Describe what you will produce/sell",     "type": "textarea"},
        ],
        "document_checklist": [
            "Aadhaar Card",
            "PAN Card",
            "Domicile certificate",
            "Business registration proof",
            "Bank account details",
            "Project report",
            "Photographs of unit/workspace",
            "Caste certificate (if applicable)",
        ],
        "letter_template": """To,
The General Manager,
District Industries Centre,
{district}, India

Subject: Application for Support under One District One Product (ODOP) Scheme

Respected Sir/Madam,

I, {applicant_name}, residing at {address}, wish to apply for financial and technical support under the ODOP scheme for {district} district.

I propose to establish/expand a unit for {odop_product} under the name "{business_name}". The proposed investment is ₹{investment} and the unit will generate employment for {employment} persons.

Business Description:
{business_desc}

Yours faithfully,
{applicant_name}
Date: {current_date}
Place: {district}

Enclosures:
{document_checklist}
""",
    },

    "Vishwakarma": {
        "full_name": "UP Vishwakarma Shram Samman Yojana",
        "authority": "UP MSME Department",
        "apply_url": "https://diupmsme.upsdc.gov.in",
        "questions": [
            {"id": "applicant_name",   "label": "Full name",                              "type": "text"},
            {"id": "trade",            "label": "Your traditional trade/craft",            "type": "select",
             "options": ["Carpenter", "Blacksmith", "Potter", "Weaver", "Goldsmith",
                         "Tailor", "Cobbler", "Barber", "Washerman", "Basket Maker", "Other"]},
            {"id": "address",          "label": "Complete address",                       "type": "textarea"},
            {"id": "district",         "label": "District",                               "type": "text"},
            {"id": "experience_years", "label": "Years of experience in this trade",      "type": "number"},
            {"id": "training_needed",  "label": "What training/equipment do you need?",   "type": "textarea"},
            {"id": "annual_income",    "label": "Current annual income (₹)",              "type": "number"},
        ],
        "document_checklist": [
            "Aadhaar Card",
            "Domicile certificate",
            "Caste certificate",
            "Photographs (2 copies)",
            "Bank account passbook copy",
            "Proof of trade (any document showing your work)",
        ],
        "letter_template": """To,
The District Magistrate / MSME Department,
{district}, India

Subject: Application under Vishwakarma Shram Samman Yojana

Respected Sir/Madam,

I, {applicant_name}, a traditional {trade} artisan residing at {address}, wish to apply for support under the Vishwakarma Shram Samman Yojana.

I have {experience_years} years of experience in this trade. My current annual income is ₹{annual_income}.

I am seeking: {training_needed}

Yours faithfully,
{applicant_name}
Date: {current_date}
Place: {district}

Enclosures:
{document_checklist}
""",
    },
}

# Every possible name variant that maps to a template key
SCHEME_NAME_ALIASES = {
    # PMEGP variants
    "pmegp": "PMEGP",
    "prime minister employment generation": "PMEGP",
    "prime minister's employment generation programme": "PMEGP",
    "pradhan mantri employment generation": "PMEGP",
    "pm employment generation": "PMEGP",

    # Mudra variants
    "mudra": "Mudra",
    "pmmy": "Mudra",
    "pradhan mantri mudra yojana": "Mudra",
    "mudra loan": "Mudra",
    "mudra shishu": "Mudra",
    "mudra kishor": "Mudra",
    "mudra tarun": "Mudra",

    # Stand-Up India variants
    "stand-up india": "Stand-Up India",
    "standup india": "Stand-Up India",
    "stand up india": "Stand-Up India",
    "standupmitra": "Stand-Up India",

    # ODOP variants
    "odop": "ODOP",
    "one district one product": "ODOP",
    "ek zila ek utpad": "ODOP",

    # Vishwakarma variants
    "vishwakarma": "Vishwakarma",
    "vishwakarma shram samman": "Vishwakarma",
    "up vishwakarma": "Vishwakarma",
    "pm vishwakarma": "Vishwakarma",
}

def resolve_scheme_template(scheme_name: str) -> tuple[str | None, dict | None]:
    """
    Takes any scheme name variant from the DB and returns
    (template_key, template_dict) or (None, None) if not found.

    Matching strategy — tried in order:
    1. Exact key match
    2. Alias map exact match
    3. Substring: alias contained in scheme_name or vice versa
    4. Substring: template key contained in scheme_name (catches "...PMEGP...")
    """
    if not scheme_name:
        return None, None

    # Strategy 1: exact key match
    if scheme_name in SCHEME_TEMPLATES:
        return scheme_name, SCHEME_TEMPLATES[scheme_name]

    normalized = scheme_name.lower().strip()

    # Strategy 2: alias map exact match
    if normalized in SCHEME_NAME_ALIASES:
        key = SCHEME_NAME_ALIASES[normalized]
        return key, SCHEME_TEMPLATES[key]

    # Strategy 3: alias substring match
    for alias, key in SCHEME_NAME_ALIASES.items():
        if alias in normalized or normalized in alias:
            return key, SCHEME_TEMPLATES[key]

    # Strategy 4: template key appears anywhere in the scheme name
    # e.g. "Prime Minister Employment Generation Programme (PMEGP)" → key "PMEGP"
    for key in SCHEME_TEMPLATES:
        if key.lower() in normalized:
            return key, SCHEME_TEMPLATES[key]

    return None, None
