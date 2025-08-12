export async function POST(req) {
    const { email } = await req.json();
  
    // Validate email
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }
  
    // TODO: Check if email exists in database and send reset link (mocking here)
    console.log(`Password reset email sent to: ${email}`);
  
    return new Response(JSON.stringify({ message: "Reset link sent to email" }), { status: 200 });
  }