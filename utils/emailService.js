// import SibApiV3Sdk from 'sib-api-v3-sdk';

// // Configure API key inside the function to ensure env is loaded
// export const sendEmail = async ({ to, subject, htmlContent }) => {
//   const defaultClient = SibApiV3Sdk.ApiClient.instance;
//   const apiKey = defaultClient.authentications['api-key'];
//   apiKey.apiKey = process.env.BREVO_API_KEY?.trim();

//   if (!apiKey.apiKey) {
//     console.error('Brevo API key is missing! Check your .env file.');
//     throw new Error('Email service misconfigured: API key missing');
//   }

//   const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
//   const sendSmtpEmail = {
//     to: [{ email: to }],
//     sender: { email: process.env.EMAIL_FROM, name: 'Islamic App' },
//     subject,
//     htmlContent,
//   };

//   try {
//     const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
//     console.log('Email sent successfully to:', to);
//     return response;
//   } catch (error) {
//     console.error('Error sending email:', error.response?.body || error.message);
//     throw error;
//   }
// };

// // ==================== Styled OTP Email ====================
// export const sendOtpEmail = async (email, otp, type) => {
//   const subject = type === 'verify' ? 'Verify Your Email' : 'Reset Your Password';
//   const action = type === 'verify' ? 'verify your email address' : 'reset your password';

//   const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>${subject}</title>
//     </head>
//     <body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f4f5; line-height:1.5;">
//       <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5; padding:20px;">
//         <tr>
//           <td align="center">
//             <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" border="0" style="max-width:500px; width:100%; background-color:#ffffff; border-radius:32px; box-shadow:0 10px 25px rgba(0,0,0,0.05); overflow:hidden;">
//               <!-- Header -->
//               <tr>
//                 <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding:32px 24px; text-align:center;">
//                   <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700; letter-spacing:-0.5px;">🕌 Islamic App</h1>
//                   <p style="margin:8px 0 0; color:#e6f7f0; font-size:16px;">Your spiritual companion</p>
//                 </td>
//               </tr>
//               <!-- Body -->
//               <tr>
//                 <td style="padding:32px 24px;">
//                   <h2 style="margin:0 0 8px; color:#1e293b; font-size:24px; font-weight:600;">${subject}</h2>
//                   <p style="margin:0 0 24px; color:#475569; font-size:16px;">We received a request to ${action}. Use the following one‑time code to complete this action. The code is valid for <strong>10 minutes</strong>.</p>
                  
//                   <!-- OTP Box -->
//                   <div style="background-color:#f1f5f9; border-radius:24px; padding:24px; text-align:center; margin-bottom:24px;">
//                     <span style="font-size:40px; font-weight:800; letter-spacing:8px; color:#0f172a;">${otp}</span>
//                   </div>
                  
//                   <p style="margin:0 0 16px; color:#475569; font-size:15px;">If you didn’t request this, you can safely ignore this email.</p>
//                   <hr style="border:0; border-top:1px solid #e2e8f0; margin:24px 0;" />
//                   <p style="margin:0; color:#94a3b8; font-size:13px; text-align:center;">May your day be filled with blessings.</p>
//                 </td>
//               </tr>
//               <!-- Footer -->
//               <tr>
//                 <td style="background-color:#f8fafc; padding:20px 24px; text-align:center;">
//                   <p style="margin:0; color:#64748b; font-size:13px;">© ${new Date().getFullYear()} Islamic App. All rights reserved.</p>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>
//       </table>
//     </body>
//     </html>
//   `;

//   await sendEmail({ to: email, subject, htmlContent });
// };

// // ==================== Styled Missed Prayer Reminder ====================
// export const sendMissedPrayerNotification = async (email, name, missedPrayers) => {
//   const subject = 'Missed Prayer Reminder';
//   const prayersList = missedPrayers.join(', ');

//   const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>${subject}</title>
//     </head>
//     <body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f4f5; line-height:1.5;">
//       <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5; padding:20px;">
//         <tr>
//           <td align="center">
//             <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" border="0" style="max-width:500px; width:100%; background-color:#ffffff; border-radius:32px; box-shadow:0 10px 25px rgba(0,0,0,0.05); overflow:hidden;">
//               <!-- Header -->
//               <tr>
//                 <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding:32px 24px; text-align:center;">
//                   <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700; letter-spacing:-0.5px;">🕌 Islamic App</h1>
//                   <p style="margin:8px 0 0; color:#fff3e0; font-size:16px;">Never miss a prayer</p>
//                 </td>
//               </tr>
//               <!-- Body -->
//               <tr>
//                 <td style="padding:32px 24px;">
//                   <h2 style="margin:0 0 8px; color:#1e293b; font-size:24px; font-weight:600;">Assalamu Alaikum ${name} 👋</h2>
//                   <p style="margin:0 0 16px; color:#475569; font-size:16px;">We noticed that you missed the following prayer(s) today:</p>
                  
//                   <div style="background-color:#fef2f2; border-left:4px solid #ef4444; border-radius:16px; padding:16px; margin-bottom:24px;">
//                     <p style="margin:0; color:#b91c1c; font-weight:600; font-size:18px;">${prayersList}</p>
//                   </div>
                  
//                   <p style="margin:0 0 16px; color:#475569; font-size:16px;">It’s never too late to make them up. The Prophet ﷺ said: <em>“Whoever forgets a prayer, let him pray it when he remembers.”</em> (Muslim)</p>
                  
//                   <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
//                     <tr>
//                       <td align="center" style="background-color:#10b981; border-radius:999px; padding:12px 32px;">
//                         <a href="${process.env.CLIENT_URL}/prayerbook" style="color:#ffffff; text-decoration:none; font-weight:600; font-size:16px;">Log Your Prayers</a>
//                       </td>
//                     </tr>
//                   </table>
                  
//                   <hr style="border:0; border-top:1px solid #e2e8f0; margin:24px 0;" />
//                   <p style="margin:0; color:#94a3b8; font-size:13px; text-align:center;">May Allah accept your efforts and grant you steadfastness.</p>
//                 </td>
//               </tr>
//               <!-- Footer -->
//               <tr>
//                 <td style="background-color:#f8fafc; padding:20px 24px; text-align:center;">
//                   <p style="margin:0; color:#64748b; font-size:13px;">© ${new Date().getFullYear()} Islamic App. All rights reserved.</p>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>
//       </table>
//     </body>
//     </html>
//   `;

//   await sendEmail({ to: email, subject, htmlContent });
// };



// // Streak milestone email
// export const sendStreakMilestoneEmail = async (email, name, streak) => {
//   const subject = `🎉 Mubarak! You've reached a ${streak}-day streak!`;
//   const htmlContent = `
//     <h2>Assalamu Alaikum ${name},</h2>
//     <p>Masha'Allah! You have maintained your prayers for <strong>${streak} consecutive days</strong>.</p>
//     <p>May Allah continue to grant you steadfastness and accept your efforts.</p>
//     <p>Keep up the great work!</p>
//   `;
//   await sendEmail({ to: email, subject, htmlContent });
// };

// // Reminder email for incomplete prayers (streak ≥30)
// export const sendPrayerReminderEmail = async (email, name, streak) => {
//   const subject = '⏰ Don’t break your streak!';
//   const htmlContent = `
//     <h2>Assalamu Alaikum ${name},</h2>
//     <p>You have an amazing streak of <strong>${streak} days</strong>! Don't let it break.</p>
//     <p>You haven't logged all your prayers today. There's still time to complete them before midnight.</p>
//     <p><a href="${process.env.CLIENT_URL}/prayerbook" style="background-color:#10b981; color:white; padding:10px 20px; border-radius:30px; text-decoration:none;">Log Your Prayers</a></p>
//     <p>May Allah accept from you.</p>
//   `;
//   await sendEmail({ to: email, subject, htmlContent });
// };


















import SibApiV3Sdk from 'sib-api-v3-sdk';

// Configure API key inside the function to ensure env is loaded
export const sendEmail = async ({ to, subject, htmlContent }) => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY?.trim();

  if (!apiKey.apiKey) {
    console.error('Brevo API key is missing! Check your .env file.');
    throw new Error('Email service misconfigured: API key missing');
  }

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = {
    to: [{ email: to }],
    sender: { email: process.env.EMAIL_FROM, name: 'Islamic App' },
    subject,
    htmlContent,
  };

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully to:', to);
    return response;
  } catch (error) {
    console.error('Error sending email:', error.response?.body || error.message);
    throw error;
  }
};

// ==================== Styled OTP Email ====================
export const sendOtpEmail = async (email, otp, type) => {
  const subject = type === 'verify' ? 'Verify Your Email' : 'Reset Your Password';
  const action = type === 'verify' ? 'verify your email address' : 'reset your password';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f4f5; line-height:1.5;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5; padding:20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" border="0" style="max-width:500px; width:100%; background-color:#ffffff; border-radius:32px; box-shadow:0 10px 25px rgba(0,0,0,0.05); overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding:32px 24px; text-align:center;">
                  <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700; letter-spacing:-0.5px;">🕌 Islamic App</h1>
                  <p style="margin:8px 0 0; color:#e6f7f0; font-size:16px;">Your spiritual companion</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:32px 24px;">
                  <h2 style="margin:0 0 8px; color:#1e293b; font-size:24px; font-weight:600;">${subject}</h2>
                  <p style="margin:0 0 24px; color:#475569; font-size:16px;">We received a request to ${action}. Use the following one‑time code to complete this action. The code is valid for <strong>10 minutes</strong>.</p>
                  
                  <!-- OTP Box -->
                  <div style="background-color:#f1f5f9; border-radius:24px; padding:24px; text-align:center; margin-bottom:24px;">
                    <span style="font-size:40px; font-weight:800; letter-spacing:8px; color:#0f172a;">${otp}</span>
                  </div>
                  
                  <p style="margin:0 0 16px; color:#475569; font-size:15px;">If you didn’t request this, you can safely ignore this email.</p>
                  <hr style="border:0; border-top:1px solid #e2e8f0; margin:24px 0;" />
                  <p style="margin:0; color:#94a3b8; font-size:13px; text-align:center;">May your day be filled with blessings.</p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color:#f8fafc; padding:20px 24px; text-align:center;">
                  <p style="margin:0; color:#64748b; font-size:13px;">© ${new Date().getFullYear()} Islamic App. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({ to: email, subject, htmlContent });
};

// ==================== Registration Email (with Login Key) ====================
export const sendRegistrationEmail = async (email, name, otp, loginKey) => {
  const subject = 'Welcome to Islamic App – Your Login Key';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Islamic App</title>
    </head>
    <body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f4f5;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5; padding:20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" border="0" style="max-width:500px; width:100%; background-color:#ffffff; border-radius:32px; overflow:hidden;">
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding:32px 24px; text-align:center;">
                  <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700;">🕌 Islamic App</h1>
                  <p style="margin:8px 0 0; color:#e6f7f0; font-size:16px;">Your spiritual companion</p>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 24px;">
                  <h2 style="margin:0 0 16px; color:#1e293b;">Assalamu Alaikum ${name}!</h2>
                  <p style="color:#475569;">Thank you for registering. Your OTP is:</p>
                  <div style="background-color:#f1f5f9; border-radius:24px; padding:24px; text-align:center; margin:20px 0;">
                    <span style="font-size:40px; font-weight:800; letter-spacing:8px; color:#0f172a;">${otp}</span>
                  </div>
                  <p style="color:#475569;">Your unique login key (keep it safe):</p>
                  <div style="background-color:#e0f2fe; border-radius:16px; padding:16px; text-align:center; margin:20px 0;">
                    <span style="font-size:24px; font-weight:700; color:#0369a1;">${loginKey}</span>
                  </div>
                  <p style="color:#475569;">You can use this key to log in instead of email and password.</p>
                  <p style="color:#475569;">The OTP expires in 10 minutes.</p>
                </td>
              </tr>
              <tr>
                <td style="background-color:#f8fafc; padding:20px 24px; text-align:center;">
                  <p style="margin:0; color:#64748b;">© ${new Date().getFullYear()} Islamic App. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  await sendEmail({ to: email, subject, htmlContent });
};

// ==================== Missed Prayer Reminder ====================
export const sendMissedPrayerNotification = async (email, name, missedPrayers) => {
  const subject = 'Missed Prayer Reminder';
  const prayersList = missedPrayers.join(', ');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f4f4f5; line-height:1.5;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5; padding:20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="500px" cellpadding="0" cellspacing="0" border="0" style="max-width:500px; width:100%; background-color:#ffffff; border-radius:32px; box-shadow:0 10px 25px rgba(0,0,0,0.05); overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding:32px 24px; text-align:center;">
                  <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700; letter-spacing:-0.5px;">🕌 Islamic App</h1>
                  <p style="margin:8px 0 0; color:#fff3e0; font-size:16px;">Never miss a prayer</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:32px 24px;">
                  <h2 style="margin:0 0 8px; color:#1e293b; font-size:24px; font-weight:600;">Assalamu Alaikum ${name} 👋</h2>
                  <p style="margin:0 0 16px; color:#475569; font-size:16px;">We noticed that you missed the following prayer(s) today:</p>
                  
                  <div style="background-color:#fef2f2; border-left:4px solid #ef4444; border-radius:16px; padding:16px; margin-bottom:24px;">
                    <p style="margin:0; color:#b91c1c; font-weight:600; font-size:18px;">${prayersList}</p>
                  </div>
                  
                  <p style="margin:0 0 16px; color:#475569; font-size:16px;">It’s never too late to make them up. The Prophet ﷺ said: <em>“Whoever forgets a prayer, let him pray it when he remembers.”</em> (Muslim)</p>
                  
                  <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
                    <tr>
                      <td align="center" style="background-color:#10b981; border-radius:999px; padding:12px 32px;">
                        <a href="${process.env.CLIENT_URL}/prayerbook" style="color:#ffffff; text-decoration:none; font-weight:600; font-size:16px;">Log Your Prayers</a>
                      </td>
                    </tr>
                  </table>
                  
                  <hr style="border:0; border-top:1px solid #e2e8f0; margin:24px 0;" />
                  <p style="margin:0; color:#94a3b8; font-size:13px; text-align:center;">May Allah accept your efforts and grant you steadfastness.</p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color:#f8fafc; padding:20px 24px; text-align:center;">
                  <p style="margin:0; color:#64748b; font-size:13px;">© ${new Date().getFullYear()} Islamic App. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({ to: email, subject, htmlContent });
};

// ==================== Streak Milestone Email ====================
export const sendStreakMilestoneEmail = async (email, name, streak) => {
  const subject = `🎉 Mubarak! You've reached a ${streak}-day streak!`;
  const htmlContent = `
    <h2>Assalamu Alaikum ${name},</h2>
    <p>Masha'Allah! You have maintained your prayers for <strong>${streak} consecutive days</strong>.</p>
    <p>May Allah continue to grant you steadfastness and accept your efforts.</p>
    <p>Keep up the great work!</p>
  `;
  await sendEmail({ to: email, subject, htmlContent });
};

// ==================== Prayer Reminder Email ====================
export const sendPrayerReminderEmail = async (email, name, streak) => {
  const subject = '⏰ Don’t break your streak!';
  const htmlContent = `
    <h2>Assalamu Alaikum ${name},</h2>
    <p>You have an amazing streak of <strong>${streak} days</strong>! Don't let it break.</p>
    <p>You haven't logged all your prayers today. There's still time to complete them before midnight.</p>
    <p><a href="${process.env.CLIENT_URL}/prayerbook" style="background-color:#10b981; color:white; padding:10px 20px; border-radius:30px; text-decoration:none;">Log Your Prayers</a></p>
    <p>May Allah accept from you.</p>
  `;
  await sendEmail({ to: email, subject, htmlContent });
};