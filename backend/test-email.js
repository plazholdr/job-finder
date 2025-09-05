const nodemailer = require('nodemailer');

// Test Brevo SMTP configuration
async function testBrevoEmail() {
  console.log('🧪 Testing Brevo SMTP Configuration...');
  
  // Your Brevo credentials
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: '95f8ae001@smtp-brevo.com',
      pass: 'vP4m2C8Y9aGHwJnj' // Your actual Brevo SMTP key
    },
  });

  // Test email
  const mailOptions = {
    from: '"JobFinder" <aaron.riang99@gmail.com>',
    to: 'aaron.riang99@gmail.com', // Send test email to yourself
    subject: '🎉 Brevo SMTP Test - JobFinder',
    html: `
      <h2>✅ Email Service Working!</h2>
      <p>This is a test email from your JobFinder application.</p>
      <p><strong>SMTP Provider:</strong> Brevo (Sendinblue)</p>
      <p><strong>From:</strong> JobFinder &lt;aaron.riang99@gmail.com&gt;</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p>Your email service is now ready for production! 🚀</p>
    `,
    text: `
      ✅ Email Service Working!
      
      This is a test email from your JobFinder application.
      SMTP Provider: Brevo (Sendinblue)
      From: JobFinder <aaron.riang99@gmail.com>
      Time: ${new Date().toLocaleString()}
      
      Your email service is now ready for production! 🚀
    `
  };

  try {
    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    // Send test email
    console.log('📧 Sending test email...');
    const result = await transporter.sendMail(mailOptions);
    
    console.log('🎉 SUCCESS! Test email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    console.log('📧 Check your inbox:', 'aaron.riang99@gmail.com');
    
    return true;
  } catch (error) {
    console.error('❌ FAILED! Email test failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Fix: Update the SMTP password in this file with your actual Brevo SMTP key');
    }
    
    return false;
  }
}

// Run the test
testBrevoEmail()
  .then((success) => {
    if (success) {
      console.log('\n🎯 Next Steps:');
      console.log('1. ✅ Your Brevo SMTP is working!');
      console.log('2. 🔧 Update backend/.env.development with your real SMTP key');
      console.log('3. 🚀 Your email service is ready for production!');
    } else {
      console.log('\n🔧 To Fix:');
      console.log('1. Get your SMTP key from Brevo dashboard');
      console.log('2. Replace "REPLACE_WITH_YOUR_BREVO_SMTP_KEY" in this file');
      console.log('3. Run: node test-email.js');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
