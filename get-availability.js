const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  const date = event.queryStringParameters && event.queryStringParameters.date;

  if (!date) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing date query param' }) };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('appointment_time, payment_status')
      .eq('appointment_date', date)
      .neq('payment_status', 'failed');

    if (error) throw error;

    const bookedTimes = data.map((row) => row.appointment_time);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookedTimes }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
