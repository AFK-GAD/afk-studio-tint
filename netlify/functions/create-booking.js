const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { customerReceiptHtml, ownerNotificationHtml } = require('./email-templates');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendBookingEmails(booking) {
  if (!resend || !process.env.FROM_EMAIL) return; // Email not configured yet — skip silently

  const tasks = [];

  if (booking.email) {
    tasks.push(
      resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: booking.email,
        subject: 'Your AFK Studio appointment is confirmed',
        html: customerReceiptHtml(booking),
      })
    );
  }

  if (process.env.OWNER_EMAIL) {
    tasks.push(
      resend.emails.send({
        from: process.env.FROM_EMAIL,
        to: process.env.OWNER_EMAIL,
        subject: `New booking: ${booking.customerName} — ${booking.appointmentDate} ${booking.appointmentTime}`,
        html: ownerNotificationHtml(booking),
      })
    );
  }

  // Run both sends but never let an email failure fail the booking request.
  const results = await Promise.allSettled(tasks);
  results.forEach((r) => {
    if (r.status === 'rejected') {
      console.error('Booking email failed to send:', r.reason);
    }
  });
}

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

    // Fire off receipt + owner notification. Never let this block or fail the booking response.
    try {
      await sendBookingEmails({
        customerName, phone, email, vehicleMake, vehicleModel, vehicleType,
        packageLabel, vlt, price, appointmentDate, appointmentTime, notes,
      });
    } catch (emailErr) {
      console.error('sendBookingEmails threw:', emailErr);
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
