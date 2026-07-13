// ============ DATA — edit prices/packages here ============
const PACKAGES = [
  {
    id: 'ceramic-ir-full',
    label: 'Ceramic IR — Full Vehicle',
    price: 650,
    specs: { coverage: 'All windows', heatReject: 'Highest', warranty: 'Lifetime' },
  },
  {
    id: 'ceramic-full',
    label: 'Ceramic — Full Vehicle',
    price: 500,
    specs: { coverage: 'All windows', heatReject: 'High', warranty: 'Lifetime' },
  },
  {
    id: 'carbon-full',
    label: 'Carbon — Full Vehicle',
    price: 350,
    specs: { coverage: 'All windows', heatReject: 'Moderate', warranty: '5 years' },
  },
  {
    id: 'front-strip',
    label: 'Front Two + Windshield Strip',
    price: 150,
    specs: { coverage: 'Front windows + strip', heatReject: 'Moderate', warranty: '5 years' },
  },
  {
    id: 'removal',
    label: 'Tint Removal',
    price: 120,
    specs: { coverage: 'All windows', heatReject: '—', warranty: '—' },
  },
];

const VLT_OPTIONS = ['5%', '20%', '35%', '50%'];
const TIME_SLOTS = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM'];

const VLT_TIERS = [
  { max: 8, label: 'Limo black — max privacy' },
  { max: 25, label: 'Dark — most common choice' },
  { max: 40, label: 'Medium — balanced look' },
  { max: 60, label: 'Light — subtle heat cut' },
  { max: 100, label: 'Factory-clear range' },
];

// ============ STATE ============
const booking = {
  packageId: null,
  vlt: null,
  vehicleType: '',
  vehicleMake: '',
  vehicleModel: '',
  date: '',
  time: null,
  name: '',
  phone: '',
  email: '',
  notes: '',
};

// ============ HERO VLT SLIDER ============
const vltSlider = document.getElementById('vltSlider');
const vltOverlay = document.getElementById('vltOverlay');
const vltNumber = document.getElementById('vltNumber');
const vltTier = document.getElementById('vltTier');

function updateVltDemo(value) {
  const v = Number(value);
  vltNumber.textContent = v;
  // Lower VLT = darker film = higher overlay opacity. Map 2-70% to opacity 0.92-0.15
  const opacity = 0.92 - ((v - 2) / (70 - 2)) * 0.77;
  vltOverlay.style.opacity = opacity.toFixed(2);
  const tier = VLT_TIERS.find((t) => v <= t.max);
  vltTier.textContent = tier ? tier.label : '';
}
vltSlider.addEventListener('input', (e) => updateVltDemo(e.target.value));
updateVltDemo(vltSlider.value);

// ============ RENDER SPEC CARDS ============
const specGrid = document.getElementById('specGrid');
specGrid.innerHTML = PACKAGES.map((p) => `
  <div class="spec-card">
    <h3>${p.label}</h3>
    <div class="spec-price">$${p.price} XCD</div>
    <div class="spec-row"><span>Coverage</span><span>${p.specs.coverage}</span></div>
    <div class="spec-row"><span>Heat rejection</span><span>${p.specs.heatReject}</span></div>
    <div class="spec-row"><span>Warranty</span><span>${p.specs.warranty}</span></div>
  </div>
`).join('');

// ============ WIZARD: PACKAGE + VLT CHOICES ============
const pkgChoices = document.getElementById('pkgChoices');
pkgChoices.innerHTML = PACKAGES.map((p) => `
  <button type="button" class="choice-btn" data-pkg="${p.id}">
    <span class="choice-title">${p.label}</span>
    <span class="choice-sub">$${p.price} XCD</span>
  </button>
`).join('');

const vltChoices = document.getElementById('vltChoices');
vltChoices.innerHTML = VLT_OPTIONS.map((v) => `
  <button type="button" class="choice-btn" data-vlt="${v}">
    <span class="choice-title">${v} VLT</span>
  </button>
`).join('');

function checkStep1() {
  document.getElementById('toStep2').disabled = !(booking.packageId && booking.vlt);
}

pkgChoices.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-pkg]');
  if (!btn) return;
  pkgChoices.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  booking.packageId = btn.dataset.pkg;
  checkStep1();
});

vltChoices.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-vlt]');
  if (!btn) return;
  vltChoices.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  booking.vlt = btn.dataset.vlt;
  checkStep1();
});

// ============ WIZARD NAVIGATION ============
const panels = document.querySelectorAll('.wizard-panel');
const steps = document.querySelectorAll('.step');

function goToPanel(name) {
  panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === name));
  steps.forEach((s) => {
    const n = Number(s.dataset.step);
    s.classList.toggle('active', s.dataset.step === name);
    s.classList.toggle('done', !Number.isNaN(n) && n < Number(name));
  });
  document.getElementById('wizard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('toStep2').addEventListener('click', () => goToPanel('2'));
document.getElementById('toStep3').addEventListener('click', () => {
  booking.vehicleType = document.getElementById('vehicleType').value;
  booking.vehicleMake = document.getElementById('vehicleMake').value;
  booking.vehicleModel = document.getElementById('vehicleModel').value;
  goToPanel('3');
});
document.getElementById('toStep4').addEventListener('click', () => goToPanel('4'));
document.getElementById('toStep5').addEventListener('click', () => {
  booking.name = document.getElementById('custName').value.trim();
  booking.phone = document.getElementById('custPhone').value.trim();
  booking.email = document.getElementById('custEmail').value.trim();
  booking.notes = document.getElementById('custNotes').value.trim();
  renderSummary();
  goToPanel('5');
});

document.querySelectorAll('[data-back]').forEach((btn) => {
  btn.addEventListener('click', () => goToPanel(btn.dataset.back));
});

// Step 4 validation
['custName', 'custPhone'].forEach((id) => {
  document.getElementById(id).addEventListener('input', () => {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    document.getElementById('toStep5').disabled = !(name && phone);
  });
});

// ============ STEP 3: DATE + TIME SLOTS ============
const apptDate = document.getElementById('apptDate');
const timeGrid = document.getElementById('timeGrid');
const today = new Date();
apptDate.min = today.toISOString().split('T')[0];

apptDate.addEventListener('change', async () => {
  booking.date = apptDate.value;
  booking.time = null;
  document.getElementById('toStep4').disabled = true;
  if (!booking.date) return;

  timeGrid.innerHTML = '<p class="hint">Loading availability...</p>';
  let bookedTimes = [];
  try {
    const res = await fetch(`/api/get-availability?date=${booking.date}`);
    if (res.ok) {
      const data = await res.json();
      bookedTimes = data.bookedTimes || [];
    }
  } catch (err) {
    // If the API isn't deployed yet (e.g. local preview), just show all slots open.
    console.warn('Availability check failed, showing all slots as open:', err);
  }

  timeGrid.innerHTML = TIME_SLOTS.map((t) => {
    const isBooked = bookedTimes.includes(t);
    return `<button type="button" class="time-slot${isBooked ? ' booked' : ''}" data-time="${t}" ${isBooked ? 'disabled' : ''}>${t}</button>`;
  }).join('');
});

timeGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.time-slot');
  if (!btn || btn.classList.contains('booked')) return;
  timeGrid.querySelectorAll('.time-slot').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  booking.time = btn.dataset.time;
  document.getElementById('toStep4').disabled = false;
});

// ============ STEP 5: SUMMARY + CONFIRM ============
function renderSummary() {
  const pkg = PACKAGES.find((p) => p.id === booking.packageId);
  document.getElementById('bookingSummary').innerHTML = `
    <div><strong>${pkg.label}</strong> — ${booking.vlt} VLT</div>
    <div>${booking.vehicleMake || ''} ${booking.vehicleModel || ''} (${booking.vehicleType || 'n/a'})</div>
    <div>${booking.date} at ${booking.time}</div>
    <div>${booking.name} — ${booking.phone}</div>
    <div style="margin-top:8px; color: var(--ceramic);">$${pkg.price} XCD</div>
  `;
}

document.getElementById('submitBooking').addEventListener('click', async () => {
  const errorEl = document.getElementById('wizardError');
  errorEl.textContent = '';
  const submitBtn = document.getElementById('submitBooking');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Booking...';

  const pkg = PACKAGES.find((p) => p.id === booking.packageId);

  try {
    const res = await fetch('/api/create-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: booking.name,
        phone: booking.phone,
        email: booking.email,
        vehicleMake: booking.vehicleMake,
        vehicleModel: booking.vehicleModel,
        vehicleType: booking.vehicleType,
        packageId: booking.packageId,
        packageLabel: pkg.label,
        vlt: booking.vlt,
        price: pkg.price,
        appointmentDate: booking.date,
        appointmentTime: booking.time,
        notes: booking.notes,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Something went wrong. Please try again.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm booking';
      return;
    }

    document.getElementById('confirmTitle').textContent = 'Booking confirmed';
    document.getElementById('confirmBody').textContent =
      `${pkg.label} on ${booking.date} at ${booking.time}. Pay $${pkg.price} XCD in person at your appointment.`;
    goToPanel('confirm');
  } catch (err) {
    errorEl.textContent = 'Network error — please try again.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm booking';
  }
});
