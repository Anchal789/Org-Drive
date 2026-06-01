'use client';

const LoginPage = () => {
  const response = fetch('/api/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber: '1234567890' }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log(response);
  return (
    <div>
      <h1>Login Page</h1>
    </div>
  );
};

export default LoginPage;
