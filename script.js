// ============ DATA — edit sqft/prices here to match your real numbers ============
// Square footage estimates per window zone, by vehicle category. These are starting
// estimates — adjust them once you've measured a few real jobs of each vehicle type.
const VEHICLES = [
  {
    id: 'sedan',
    label: 'Sedan / Coupe',
    sqft: { windshieldStrip: 2, front2: 6, rear2: 6, rearWindshield: 7 },
  },
  {
    id: 'suv-small',
    label: 'Small SUV / Crossover',
    sqft: { windshieldStrip: 2.5, front2: 7, rear2: 10, rearWindshield: 8 },
  },
  {
    id: 'suv-large',
    label: 'Large SUV / Van',
    sqft: { windshieldStrip: 3, front2: 8, rear2: 14, rearWindshield: 9 },
  },
  {
    id: 'truck',
    label: 'Pickup Truck',
    sqft: { windshieldStrip: 2, front2: 7, rear2: 5, rearWindshield: 6 },
  },
];

const ZONES = [
  { id: 'windshieldStrip', label: 'Windshield Strip' },
  { id: 'front2', label: 'Front Two Windows' },
  { id: 'rear2', label: 'Rear Two Windows' },
  { id: 'rearWindshield', label: 'Rear Windshield' },
];

// Price per square foot of film, by film type — edit to match your real cost + margin.
const FILM_TYPES = [
  { id: 'carbon', label: 'Carbon', pricePerSqft: 17, heatReject: 'Moderate', warranty: '5 years' },
  { id: 'ceramic', label: 'Ceramic', pricePerSqft: 24, heatReject: 'High', warranty: 'Lifetime' },
  { id: 'ceramic-ir', label: 'Ceramic IR', pricePerSqft: 31, heatReject: 'Highest', warranty: 'Lifetime' },
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

function roundToNearest(value, step) {
  return Math.round(value / step) * step;
}

// ============ STATE ============
const booking = {
  vehicleCategory: null,
  vehicleMake: '',
  vehicleModel: '',
  zones: [], // selected zone ids, or ['full'] for full vehicle
  filmType: null,
  vlt: null,
  totalSqft: 0,
  price: 0,
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
  const opacity = 0.92 - ((v - 2) / (70 - 2)) * 0.77;
  vltOverlay.style.opacity = opacity.toFixed(2);
  const tier = VLT_TIERS.find((t) => v <= t.max);
  vltTier.textContent = tier ? tier.label : '';
}
vltSlider.addEventListener('input', (e) => updateVltDemo(e.target.value));
updateVltDemo(vltSlider.value);

// ============ RENDER SPEC CARDS (film types) ============
const specGrid = document.getElementById('specGrid');
specGrid.innerHTML = FILM_TYPES.map((f) => `
  <div class="spec-card">
    <h3>${f.label}</h3>
    <div class="spec-price">$${f.pricePerSqft} XCD / sqft</div>
    <div class="spec-row"><span>Heat rejection</span><span>${f.heatReject}</span></div>
    <div class="spec-row"><span>Warranty</span><span>${f.warranty}</span></div>
  </div>
`).join('');

// ============ WIZARD STEP 1: VEHICLE ============
const vehicleChoices = document.getElementById('vehicleChoices');
vehicleChoices.innerHTML = VEHICLES.map((v) => `
  <button type="button" class="choice-btn" data-vehicle="${v.id}">
    <span class="choice-title">${v.label}</span>
  </button>
`).join('');

vehicleChoices.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-vehicle]');
  if (!btn) return;
  vehicleChoices.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  booking.vehicleCategory = btn.dataset.vehicle;
  document.getElementById('toStep2').disabled = false;
});

// ============ WIZARD STEP 2: COVERAGE + FILM + VLT ============
const coverageChoices = document.getElementById('coverageChoices');
coverageChoices.innerHTML = `
  <button type="button" class="choice-btn" data-coverage="full">
    <span class="choice-title">Full Vehicle</span>
    <span class="choice-sub">Every window</span>
  </button>
  <button type="button" class="choice-btn" data-coverage="custom">
    <span class="choice-title">Choose Windows</span>
    <span class="choice-sub">Pick specific zones</span>
  </button>
`;

const zoneChoices = document.getElementById('zoneChoices');
zoneChoices.innerHTML = ZONES.map((z) => `
  <label class="zone-choice" data-zone="${z.id}">
    <input type="checkbox" value="${z.id}" />
    ${z.label}
  </label>
`).join('');
zoneChoices.style.display = 'none';

const filmChoices = document.getElementById('filmChoices');
filmChoices.innerHTML = FILM_TYPES.map((f) => `
  <button type="button" class="choice-btn" data-film="${f.id}">
    <span class="choice-title">${f.label}</span>
    <span class="choice-sub">$${f.pricePerSqft}/sqft</span>
  </button>
`).join('');

const vltChoices = document.getElementById('vltChoices');
vltChoices.innerHTML = VLT_OPTIONS.map((v) => `
  <button type="button" class="choice-btn" data-vlt="${v}">
    <span class="choice-title">${v} VLT</span>
  </button>
`).join('');

coverageChoices.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-coverage]');
  if (!btn) return;
  coverageChoices.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');

  if (btn.dataset.coverage === 'full') {
    booking.zones = ['full'];
    zoneChoices.style.display = 'none';
    zoneChoices.querySelectorAll('input').forEach((cb) => { cb.checked = false; });
  } else {
    booking.zones = [];
    zoneChoices.style.display = 'grid';
  }
  updatePricePreview();
});

zoneChoices.addEventListener('change', () => {
  const checked = Array.from(zoneChoices.querySelectorAll('input:checked')).map((cb) => cb.value);
  booking.zones = checked;
  updatePricePreview();
});

filmChoices.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-film]');
  if (!btn) return;
  filmChoices.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  booking.filmType = btn.dataset.film;
  updatePricePreview();
});

vltChoices.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-vlt]');
  if (!btn) return;
  vltChoices.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('selected'));
  btn.classList.add('selected');
  booking.vlt = btn.dataset.vlt;
  updatePricePreview();
});

function calcTotalSqft() {
  const vehicle = VEHICLES.find((v) => v.id === booking.vehicleCategory);
  if (!vehicle) return 0;
  const zoneIds = booking.zones.includes('full') ? ZONES.map((z) => z.id) : booking.zones;
  return zoneIds.reduce((sum, zId) => sum + (vehicle.sqft[zId] || 0), 0);
}

function updatePricePreview() {
  const pricePreview = document.getElementById('pricePreview');
  const film = FILM_TYPES.find((f) => f.id === booking.filmType);
  const hasCoverage = booking.zones.length > 0;

  if (!booking.vehicleCategory || !hasCoverage || !film || !booking.vlt) {
    pricePreview.textContent = 'Pick your vehicle, coverage, film, and VLT to see your price.';
    document.getElementById('toStep3').disabled = true;
    return;
  }

  const totalSqft = calcTotalSqft();
  const price = roundToNearest(totalSqft * film.pricePerSqft, 5);
  booking.totalSqft = totalSqft;
  booking.price = price;

  pricePreview.innerHTML = `${totalSqft.toFixed(1)} sqft of ${film.label} — <strong>$${price} XCD</strong>`;
  document.getElementById('toStep3').disabled = false;
}

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

document.getElementById('toStep2').addEventListener('click', () => {
  booking.vehicleMake = document.getElementById('vehicleMake').value;
  booking.vehicleModel = document.getElementById('vehicleModel').value;
  goToPanel('2');
});
document.getElementById('toStep3').addEventListener('click', () => goToPanel('3'));
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
function coverageLabel() {
  if (booking.zones.includes('full')) return 'Full Vehicle';
  return ZONES.filter((z) => booking.zones.includes(z.id)).map((z) => z.label).join(', ');
}

function renderSummary() {
  const vehicle = VEHICLES.find((v) => v.id === booking.vehicleCategory);
  const film = FILM_TYPES.find((f) => f.id === booking.filmType);
  document.getElementById('bookingSummary').innerHTML = `
    <div><strong>${film.label}</strong> — ${booking.vlt} VLT</div>
    <div>${coverageLabel()} (${booking.totalSqft.toFixed(1)} sqft)</div>
    <div>${vehicle.label}${booking.vehicleMake ? ' — ' + booking.vehicleMake : ''} ${booking.vehicleModel || ''}</div>
    <div>${booking.date} at ${booking.time}</div>
    <div>${booking.name} — ${booking.phone}</div>
    <div style="margin-top:8px; color: var(--ceramic);">$${booking.price} XCD</div>
  `;
}

document.getElementById('submitBooking').addEventListener('click', async () => {
  const errorEl = document.getElementById('wizardError');
  errorEl.textContent = '';
  const submitBtn = document.getElementById('submitBooking');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Booking...';

  const vehicle = VEHICLES.find((v) => v.id === booking.vehicleCategory);
  const film = FILM_TYPES.find((f) => f.id === booking.filmType);

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
        vehicleType: vehicle.id,
        packageId: film.id,
        packageLabel: `${film.label} — ${coverageLabel()}`,
        vlt: booking.vlt,
        price: booking.price,
        totalSqft: booking.totalSqft,
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
      `${film.label} — ${coverageLabel()} on ${booking.date} at ${booking.time}. Pay $${booking.price} XCD in person at your appointment.`;
    goToPanel('confirm');
  } catch (err) {
    errorEl.textContent = 'Network error — please try again.';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm booking';
  }
});
