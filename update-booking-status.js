const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ALLOWED_STATUSES = ['pending_in_person', 'paid', 'cancelled'];

exports.handler = async (event) => {
  const providedPassword = event.headers['x-admin-password'];
  if (!process.env.ADMIN_PASSWORD || providedPassword !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { bookingId, status } = payload;
  if (!bookingId || !ALLOWED_STATUSES.includes(status)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid bookingId or status' }) };
  }

  try {
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: status })
      .eq('id', bookingId);

    if (error) throw error;

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
