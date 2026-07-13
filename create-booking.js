const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const {
    customerName,
    phone,
    email,
    vehicleMake,
    vehicleModel,
    vehicleType,
    packageId,
    packageLabel,
    vlt,
    price,
    appointmentDate,
    appointmentTime,
    notes,
  } = payload;

  if (!customerName || !phone || !packageId || !appointmentDate || !appointmentTime) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  try {
    const { data: inserted, error: insertError } = await supabase
      .from('bookings')
      .insert({
        customer_name: customerName,
        phone,
        email,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        vehicle_type: vehicleType,
        package_id: packageId,
        package_label: packageLabel,
        vlt,
        price,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        payment_method: 'in_person',
        payment_status: 'pending_in_person',
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      // Unique constraint violation means the slot was just taken
      if (insertError.code === '23505') {
        return { statusCode: 409, body: JSON.stringify({ error: 'That time slot was just booked. Please pick another.' }) };
      }
      throw insertError;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: inserted.id, status: 'confirmed_in_person' }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
