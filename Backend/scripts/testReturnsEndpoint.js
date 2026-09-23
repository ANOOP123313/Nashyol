async function testReturns() {
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@naashyol.com", password: "password123" }),
  });
  const loginData = await loginRes.json();
  const token = loginData?.token;
  console.log("Got token:", !!token);

  const res = await fetch("http://localhost:5000/api/returns/admin", {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Origin": "http://localhost:5173",
    },
  });
  console.log("Admin Returns status:", res.status);
  const data = await res.json();
  console.log("Returns returned count:", data.length);
  console.log("Sample Return:", JSON.stringify(data[0], null, 2));

  // Test track route
  if (data[0]) {
    const idToTrack = data[0]._id;
    const trackRes = await fetch(`http://localhost:5000/api/returns/track/${idToTrack}`);
    console.log("Track status:", trackRes.status);
    const trackData = await trackRes.json();
    console.log("Track data status:", trackData.status, "tracking:", trackData.tracking);
  }
}
testReturns().catch(console.error);
