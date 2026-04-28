/* ============================================================================
   External Consultant Hire Request — submission handler
   ----------------------------------------------------------------------------
   Submitting opens the user's default mail client with a pre-filled email
   addressed to the recipients below. To wire this up to a real backend later
   (e.g. Formspree, an internal API, or Power Automate), replace the body
   of `submitForm()` with a `fetch(...)` call.
   ============================================================================ */

/* ---------------- Recipients ---------------- */

const PRIMARY_RECIPIENT_EMAIL = 'lilian.lee@proton.ch';

// People team alias — receives every submission alongside the primary recipient.
// Leave as empty string ('') to send to the primary recipient only.
const SECOND_RECIPIENT_EMAIL = 'people@proton.ch';

const EMAIL_SUBJECT = 'External consultant hire request';


/* ---------------- Conditional UI ---------------- */

const form = document.getElementById('hire-form');
const agreementHelp = document.getElementById('agreement-help');
const laptopDetails = document.getElementById('laptop-details');
const formError = document.getElementById('form-error');

// Show the "2–5 working days" help text if user picks "Not yet"
form.querySelectorAll('input[name="agreement"]').forEach((input) => {
  input.addEventListener('change', (e) => {
    const needsAgreement = e.target.value.startsWith('Not yet');
    agreementHelp.hidden = !needsAgreement;
  });
});

// Reveal laptop sub-fields once *either* Yes or No has been selected —
// the same equipment questions apply in both cases.
form.querySelectorAll('input[name="laptop_exception"]').forEach((input) => {
  input.addEventListener('change', () => {
    laptopDetails.hidden = false;
  });
});

// Currency: when "Other" is selected, reveal a follow-up text input so
// the manager can type the actual currency code.
function wireCurrencyOther(selectId, otherInputId) {
  const sel = document.getElementById(selectId);
  const other = document.getElementById(otherInputId);
  if (!sel || !other) return;
  sel.addEventListener('change', () => {
    const isOther = sel.value === 'Other';
    other.hidden = !isOther;
    if (isOther) {
      // Make required only when this currency is actually used
      if (sel.required) other.required = true;
      other.focus();
    } else {
      other.required = false;
      other.value = '';
    }
  });
}
wireCurrencyOther('currency', 'currency-other');

// Laptop preference: when "Others" is selected, reveal a text input for the model.
(function wireLaptopOther() {
  const sel = document.getElementById('laptop-pref');
  const other = document.getElementById('laptop-pref-other');
  if (!sel || !other) return;
  sel.addEventListener('change', () => {
    const isOther = sel.value === 'Others';
    other.hidden = !isOther;
    if (isOther) {
      other.focus();
    } else {
      other.value = '';
    }
  });
})();

// Pickup office: if the manager picks an office, hide the shipping fields;
// only show shipping address + mobile when "None of the above" is chosen.
(function wirePickupOffice() {
  const sel = document.getElementById('pickup-office');
  const deliveryFields = document.getElementById('delivery-fields');
  if (!sel || !deliveryFields) return;
  sel.addEventListener('change', () => {
    deliveryFields.hidden = sel.value !== 'None';
  });
})();

// Entity location: Yes → show pickup/shipping block; No → show buy-and-expense
// notice with the buy/expense confirmation checkbox (required only when shown).
(function wireEntityLocation() {
  const yesBlock = document.getElementById('entity-yes-block');
  const noBlock  = document.getElementById('entity-no-block');
  const buyExpense = document.getElementById('buy-expense-confirmed');
  if (!yesBlock || !noBlock) return;
  form.querySelectorAll('input[name="entity_location"]').forEach((input) => {
    input.addEventListener('change', (e) => {
      const isYes = e.target.value === 'Yes';
      yesBlock.hidden = !isYes;
      noBlock.hidden  =  isYes;
      // The buy & expense confirmation only applies in the "No" branch.
      if (buyExpense) buyExpense.required = !isYes;
    });
  });
})();


/* ---------------- Field labels for email body ---------------- */

const FIELD_LABELS = {
  agreement:              'Consulting agreement in place?',
  requester_name:         'Requester name',
  legal_first_name:       'Consultant — Legal first name',
  legal_last_name:        'Consultant — Legal last name',
  preferred_name:         'Consultant — Preferred name',
  personal_email:         'Consultant — Personal email',
  company_name:           'Consultant — Company name',
  job_title:              'Job title',
  country_of_work:        'Country of work',
  group_team:             'Group / Department / Team / Cost Center',
  reporting_to:           'Reporting to',
  start_date:             'Start date',
  end_date:               'End date',
  duties:                 'Description of duties',
  hourly_rate:            'Hourly rate',
  daily_rate:             'Daily rate',
  currency:               'Currency',
  hours_per_week:         'Working hours per week',
  access:                 'Access required',
  laptop_exception:       'Laptop exception requested?',
  screenshot_confirmed:   'Will provide approval screenshot of exception ticket',
  entity_location:        'Located in EU / US / UK / TW',
  laptop_preference:      'Laptop preference',
  pickup_office:          'Pickup office',
  addr_line1:             'Delivery address — line 1',
  addr_line2:             'Delivery address — line 2',
  addr_city:              'Delivery address — city',
  addr_state:             'Delivery address — state / region',
  addr_zip:               'Delivery address — zip / post code',
  addr_country:           'Delivery address — country',
  delivery_mobile:        "Consultant's mobile number",
  buy_expense_confirmed:  'Confirmed buy & expense process',
};

/* ---------------- Submit handler ---------------- */

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formError.hidden = true;

  // HTML5 native validation
  if (!form.checkValidity()) {
    formError.hidden = false;
    // highlight the first invalid control
    const firstInvalid = form.querySelector(':invalid');
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus({ preventScroll: true });
    }
    return;
  }

  submitForm();
});

function submitForm() {
  const data = collectFormData(form);
  const body = buildEmailBody(data);

  const recipients = [PRIMARY_RECIPIENT_EMAIL];
  if (SECOND_RECIPIENT_EMAIL) recipients.push(SECOND_RECIPIENT_EMAIL);

  const mailto =
    'mailto:' + encodeURIComponent(recipients.join(',')) +
    '?subject=' + encodeURIComponent(EMAIL_SUBJECT) +
    '&body=' + encodeURIComponent(body);

  // Open the user's mail client
  window.location.href = mailto;
}

function collectFormData(formEl) {
  const fd = new FormData(formEl);
  const out = {};
  for (const key of Object.keys(FIELD_LABELS)) {
    const value = fd.get(key);
    out[key] = value == null ? '' : String(value).trim();
  }
  // Checkboxes: FormData returns null when unchecked; normalize to "No"
  ['screenshot_confirmed', 'buy_expense_confirmed'].forEach((k) => {
    out[k] = out[k] === 'Yes' ? 'Yes' : 'No';
  });
  // If currency is "Other", merge the manager's typed value into the field
  // so the email shows the actual currency rather than the literal "Other".
  if (out.currency === 'Other') {
    const typed = (fd.get('currency_other') || '').toString().trim();
    out.currency = typed ? `${typed} (other)` : 'Other (not specified)';
  }
  // Same pattern for laptop preference: merge custom model into the value.
  if (out.laptop_preference === 'Others') {
    const typed = (fd.get('laptop_preference_other') || '').toString().trim();
    out.laptop_preference = typed ? `Others — ${typed}` : 'Others (model not specified)';
  }
  return out;
}

function buildEmailBody(data) {
  const lines = [];
  lines.push('A new external consultant hire request has been submitted.');
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('CONSULTING AGREEMENT');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(line('agreement', data));

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('REQUESTER');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(line('requester_name', data));

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('CONSULTANT');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  ['legal_first_name','legal_last_name','preferred_name','personal_email',
   'company_name','job_title','country_of_work','group_team','reporting_to']
    .forEach((k) => lines.push(line(k, data)));

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('ENGAGEMENT');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  ['start_date','end_date','duties','hourly_rate','daily_rate',
   'currency','hours_per_week','access']
    .forEach((k) => lines.push(line(k, data)));

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('EQUIPMENT');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  ['laptop_exception','screenshot_confirmed','entity_location','laptop_preference',
   'pickup_office','addr_line1','addr_line2','addr_city','addr_state','addr_zip',
   'addr_country','delivery_mobile','buy_expense_confirmed']
    .forEach((k) => lines.push(line(k, data)));

  lines.push('');
  lines.push('Submitted at: ' + new Date().toISOString());

  return lines.join('\n');
}

function line(key, data) {
  const label = FIELD_LABELS[key];
  const value = data[key] || '—';
  return label + ': ' + value;
}
