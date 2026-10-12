async function testTenantsEndpoint() {
  const token = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  // First login to get accessToken
  const loginRes = await fetch('http://localhost:3025/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `XSRF-TOKEN=${token}`,
      'x-xsrf-token': token,
    },
    body: JSON.stringify({
      identifier: 'bsofts.contact@gmail.com',
      password: 'ChangeMeInDev123*',
    }),
  });
  const loginData = await loginRes.json();
  const jwt = loginData.accessToken;
  console.log('JWT obtained:', !!jwt);

  // Call /api/tenants
  const res = await fetch('http://localhost:3025/api/tenants?limit=100', {
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Cookie': `XSRF-TOKEN=${token}`,
      'x-xsrf-token': token,
    },
  });
  const data = await res.json();
  console.log('STATUS /api/tenants:', res.status);
  console.log('DATA SHAPE:', Array.isArray(data) ? `Array of ${data.length}` : (data.data ? `data.data array of ${data.data.length}` : typeof data));
  console.log('SAMPLE DATA:', JSON.stringify(data, null, 2).slice(0, 500));
}
testTenantsEndpoint();
