function verifyEmailTemplate({ brandName = 'JobFinder', code, verifyLink }) {
  const styles = 'font-family: Arial, Helvetica, sans-serif; color:#111;';
  const btn = `display:inline-block;background:#2563eb;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;`;
  return `
<!doctype html>
<html>
  <body style="${styles}">
    <div style="max-width:560px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 8px 0;">Verify your email</h2>
      <p>Hi, thanks for signing up for ${brandName}. Use the code below to verify your email. It expires in 10 minutes.</p>
      <div style="font-size:28px;letter-spacing:4px;font-weight:bold;margin:16px 0;">${code}</div>
      <p>Or click the button below:</p>
      <p>
        <a href="${verifyLink}" style="${btn}">Verify email</a>
      </p>
      <p style="color:#666;font-size:12px;margin-top:24px;">If you did not request this, you can ignore this email.</p>
    </div>
  </body>
</html>`;
}

export { verifyEmailTemplate };

