const http = require('http');

function request(port, path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' },
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null }); }
                catch (e) { resolve({ status: res.statusCode, data: data }); }
            });
        });
        req.on('error', (e) => reject(e));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runVerification() {
    console.log('🚀 Starting Super Admin Auth Verification...\n');
    const email = `admin_${Date.now()}@example.com`;
    const password = 'securepassword123';

    try {
        // 1. Register
        console.log(`1. Registering user ${email}...`);
        const regRes = await request(3001, '/api/auth/register', 'POST', { email, password });
        if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
        console.log('   ✅ Registration successful.');

        // 2. Check Mailhog
        console.log('2. Checking Mailhog for verification email...');
        await delay(2000); // Wait for email to arrive
        const mailRes = await request(8025, '/api/v2/messages');
        if (!mailRes.data || !mailRes.data.items || mailRes.data.items.length === 0) {
            throw new Error('No emails found in Mailhog');
        }

        // Find email for this user
        const message = mailRes.data.items.find(m => m.Content.Headers.To[0].includes(email));
        if (!message) throw new Error(`Email for ${email} not found`);
        console.log('   ✅ Email received.');

        // Extract Token
        let body = message.Content.Body;
        // Decode Quoted-Printable
        body = body.replace(/=\r\n/g, '').replace(/=\n/g, '').replace(/=3D/g, '=');

        console.log('   ℹ️ Decoded Body Snippet:', body.substring(0, 200).replace(/\n/g, ' '));

        const match = body.match(/token=([a-f0-9]+)/);
        if (!match) throw new Error('Token not found in email body');
        const token = match[1];
        console.log(`   ✅ Token extracted: ${token} (Length: ${token.length})`);

        // 3. Verify Email
        console.log('3. Verifying Email...');
        const verifyRes = await request(3001, '/api/auth/verify-email', 'POST', { token });
        if (verifyRes.status !== 200) throw new Error(`Verification failed: ${JSON.stringify(verifyRes.data)}`);
        console.log('   ✅ Email verified.');

        // 4. Login
        console.log('4. Logging in...');
        const loginRes = await request(3001, '/api/auth/login', 'POST', { email, password });
        if (loginRes.status !== 200 || !loginRes.data.token) throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
        console.log('   ✅ Login successful. Token received.');

        console.log('\n🎉 Super Admin Auth Flow Verified via API & Mailhog!');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
        process.exit(1);
    }
}

runVerification();
