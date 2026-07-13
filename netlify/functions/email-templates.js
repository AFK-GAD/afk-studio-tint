function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function customerReceiptHtml(booking) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="margin-bottom: 4px;">Booking confirmed — AFK Studio</h2>
      <p style="color: #555;">Thanks, ${esc(booking.customerName)}. Here's what we have on file:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 6px 0; color: #777;">Service</td><td style="padding: 6px 0; text-align: right;"><strong>${esc(booking.packageLabel)}</strong></td></tr>
        <tr><td style="padding: 6px 0; color: #777;">VLT</td><td style="padding: 6px 0; text-align: right;">${esc(booking.vlt)}</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Vehicle</td><td style="padding: 6px 0; text-align: right;">${esc(booking.vehicleMake)} ${esc(booking.vehicleModel)}</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Date</td><td style="padding: 6px 0; text-align: right;">${esc(booking.appointmentDate)}</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Time</td><td style="padding: 6px 0; text-align: right;">${esc(booking.appointmentTime)}</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Price</td><td style="padding: 6px 0; text-align: right;"><strong>$${esc(booking.price)} XCD</strong> — pay in person</td></tr>
      </table>
      <p style="color: #555; font-size: 14px;">See you then. Reply to this email if anything needs to change.</p>
    </div>
  `;
}

function ownerNotificationHtml(booking) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="margin-bottom: 4px;">New booking</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 6px 0; color: #777;">Customer</td><td style="padding: 6px 0; text-align: right;">${esc(booking.customerName)}</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Phone</td><td style="padding: 6px 0; text-align: right;">${esc(booking.phone)}</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Email</td><td style="padding: 6px 0; text-align: right;">${esc(booking.email) || '—'}</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Service</td><td style="padding: 6px 0; text-align: right;">${esc(booking.packageLabel)} (${esc(booking.vlt)})</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Vehicle</td><td style="padding: 6px 0; text-align: right;">${esc(booking.vehicleMake)} ${esc(booking.vehicleModel)} (${esc(booking.vehicleType) || 'n/a'})</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Date</td><td style="padding: 6px 0; text-align: right;">${esc(booking.appointmentDate)} at ${esc(booking.appointmentTime)}</td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Tint needed</td><td style="padding: 6px 0; text-align: right;"><strong>${esc(booking.totalSqft)} sqft</strong></td></tr>
        <tr><td style="padding: 6px 0; color: #777;">Price</td><td style="padding: 6px 0; text-align: right;">$${esc(booking.price)} XCD — in person</td></tr>
        ${booking.notes ? `<tr><td style="padding: 6px 0; color: #777;">Notes</td><td style="padding: 6px 0; text-align: right;">${esc(booking.notes)}</td></tr>` : ''}
      </table>
    </div>
  `;
}

module.exports = { customerReceiptHtml, ownerNotificationHtml };
