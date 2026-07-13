const gateView = document.getElementById('gateView');
const dashView = document.getElementById('dashView');
const adminPasswordInput = document.getElementById('adminPassword');
const gateError = document.getElementById('gateError');
const bookingsBody = document.getElementById('bookingsBody');

function getPassword() {
  return sessionStorage.getItem('afkAdminPw') || '';
}

async function loadBookings() {
  bookingsBody.innerHTML = '<tr><td colspan="13" class="hint">Loading...</td></tr>';
  try {
    const res = await fetch('/api/list-bookings', {
      headers: { 'x-admin-password': getPassword() },
    });

    if (res.status === 401) {
      sessionStorage.removeItem('afkAdminPw');
      showGate('Wrong password.');
      return;
    }

    const data = await res.json();
    renderBookings(data.bookings || []);
  } catch (err) {
    bookingsBody.innerHTML = `<tr><td colspan="13" class="hint">Couldn't load appointments — check your connection.</td></tr>`;
  }
}

function renderBookings(bookings) {
  if (!bookings.length) {
    bookingsBody.innerHTML = '<tr><td colspan="13" class="hint">No appointments yet.</td></tr>';
    return;
  }

  bookingsBody.innerHTML = bookings.map((b) => `
    <tr data-id="${b.id}">
      <td>${b.appointment_date}</td>
      <td>${b.appointment_time}</td>
      <td>${b.customer_name}</td>
      <td>${b.phone}</td>
      <td>${b.email || '—'}</td>
      <td>${[b.vehicle_make, b.vehicle_model].filter(Boolean).join(' ') || '—'}</td>
      <td>${b.package_label}</td>
      <td>${b.vlt}</td>
      <td>${b.total_sqft ? Number(b.total_sqft).toFixed(1) + ' sqft' : '—'}</td>
      <td>$${b.price}</td>
      <td><span class="status-pill status-${b.payment_status}">${b.payment_status.replace(/_/g, ' ')}</span></td>
      <td>${b.notes || '—'}</td>
      <td>
        <div class="row-actions">
          <button data-action="paid">Mark paid</button>
          <button data-action="cancelled">Cancel</button>
        </div>
      </td>
    </tr>
  `).join('');
}

bookingsBody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const row = btn.closest('tr');
  const bookingId = row.dataset.id;
  const status = btn.dataset.action;

  btn.disabled = true;
  try {
    const res = await fetch('/api/update-booking-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': getPassword() },
      body: JSON.stringify({ bookingId, status }),
    });
    if (res.ok) {
      loadBookings();
    } else {
      btn.disabled = false;
    }
  } catch (err) {
    btn.disabled = false;
  }
});

document.getElementById('refreshBtn').addEventListener('click', loadBookings);

function showGate(message) {
  gateView.style.display = 'block';
  dashView.style.display = 'none';
  gateError.textContent = message || '';
}

function showDash() {
  gateView.style.display = 'none';
  dashView.style.display = 'block';
  loadBookings();
}

document.getElementById('unlockBtn').addEventListener('click', () => {
  const pw = adminPasswordInput.value.trim();
  if (!pw) return;
  sessionStorage.setItem('afkAdminPw', pw);
  showDash();
});

adminPasswordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('unlockBtn').click();
});

// If we already have a password this session, skip the gate and try loading directly.
if (getPassword()) {
  showDash();
} else {
  showGate();
}
