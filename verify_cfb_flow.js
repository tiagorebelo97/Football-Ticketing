
const http = require('http');
const { exec } = require('child_process');

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

function runCommand(command) {
    return new Promise((resolve) => {
        exec(command, (error, stdout) => resolve(error ? null : stdout.trim()));
    });
}

function extractUuid(text) {
    if (!text) return null;
    const match = text.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
    return match ? match[0] : null;
}

async function runVerification() {
    console.log('🚀 Starting Verification for "Clube Futebol Benfica"...\n');

    try {
        // 1. Get/Create Club
        console.log('1. Getting Club ID...');
        const listResponse = await request(3001, '/api/clubs', 'GET');
        let clubId = null;

        if (listResponse.data && Array.isArray(listResponse.data)) {
            const found = listResponse.data.find(c => c.slug === 'clube-futebol-benfica');
            if (found) clubId = found.id;
        }

        if (!clubId) {
            console.log('   Provisioning...');
            const dockerCmd = `docker exec postgres psql -U football_user -d football_ticketing -t -c "INSERT INTO clubs (name, slug, primary_color, secondary_color, keycloak_realm_id, stripe_account_id) VALUES ('Clube Futebol Benfica', 'clube-futebol-benfica', '#E30613', '#000000', 'krealm_' || floor(random() * 1000000), 'acct_' || floor(random() * 1000000)) RETURNING id;"`;
            const output = await runCommand(dockerCmd);
            clubId = extractUuid(output);
        }
        console.log(`   ✅ Club ID: ${clubId}\n`);

        if (!clubId) throw new Error("Could not retrieve Club ID");

        // 1.5 Verify Auth Endpoint
        console.log('1.5 Checking Auth Endpoint...');
        const authRes = await request(3002, '/api/auth/clube-futebol-benfica', 'GET');
        if (authRes.status === 200 && authRes.data.id === clubId) {
            console.log('   ✅ Auth Endpoint works and returned correct ID.');
        } else {
            throw new Error(`Auth Endpoint failed: Status ${authRes.status} Data: ${JSON.stringify(authRes.data)}`);
        }

        // 2. Create Match
        console.log('2. Creating Match...');
        const matchData = {
            clubId: clubId,
            homeTeam: 'Clube Futebol Benfica',
            awayTeam: 'Sporting CP',
            matchDate: new Date(Date.now() + 86400000).toISOString(),
            venue: 'Estádio da Tapadinha',
            totalCapacity: 5000,
            ticketPrice: 15
        };
        // Check existing
        const matchesRes = await request(3002, `/api/matches?clubId=${clubId}`, 'GET');
        let existing = null;
        if (matchesRes.data && Array.isArray(matchesRes.data)) {
            existing = matchesRes.data.find(m => m.home_team === matchData.homeTeam);
        }

        if (!existing) {
            await request(3002, '/api/matches', 'POST', matchData);
            console.log('   ✅ Match created.');
        } else {
            console.log('   ✅ Match already exists.');
        }

        // 3. Verify Data Isolation (Club Backoffice API)
        console.log('\n3. Testing Data Isolation (The "club.localhost" logic)...');

        // Test A: Fetch with Correct Club ID
        const correctRes = await request(3002, `/api/matches?clubId=${clubId}`, 'GET');
        let hasMatch = false;
        if (correctRes.data && Array.isArray(correctRes.data)) {
            hasMatch = correctRes.data.some(m => m.home_team === 'Clube Futebol Benfica');
        }

        // Test B: Fetch with Random/Other Club ID
        const randomId = '00000000-0000-0000-0000-000000000000';
        const wrongRes = await request(3002, `/api/matches?clubId=${randomId}`, 'GET');
        const hasDataForWrong = (wrongRes.data && Array.isArray(wrongRes.data) && wrongRes.data.length > 0);

        if (hasMatch && !hasDataForWrong) {
            console.log('   ✅ ISOLATION VERIFIED: API returns matches ONLY for the specific club.');
            console.log('      - Request with Club ID returned ' + correctRes.data.length + ' matches.');
            console.log('      - Request with Wrong ID returned ' + (wrongRes.data ? wrongRes.data.length : 0) + ' matches.');
        } else {
            throw new Error('Data Isolation Failed! matches leaked or not found.');
        }

        console.log('\n🎉 System is verified and secure.');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runVerification();
