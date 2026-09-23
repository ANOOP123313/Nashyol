async function testAdminReviews() {
  const adminRes = await fetch("http://localhost:5000/api/reviews/admin", {
    headers: { Origin: "http://localhost:5173" },
  });
  console.log("Admin reviews status:", adminRes.status);
  const adminData = await adminRes.json();
  console.log("Admin reviews count:", adminData.length);
  console.log("Admin reviews sample:", JSON.stringify(adminData[0], null, 2));
}
testAdminReviews().catch(console.error);
