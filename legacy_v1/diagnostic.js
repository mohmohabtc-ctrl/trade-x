
import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://wesjfaqzzighybovostc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlc2pmYXF6emlnaHlib3Zvc3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Mjc0ODcsImV4cCI6MjA3OTAwMzQ4N30.m48Ju2M5VzBhhi5-eu9FFOv2W2rL38nHLe0tB-RoP38';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runDiagnostics() {
    console.log("🛠️ Starting Backend Diagnostics...");
    console.log(`Target: ${SUPABASE_URL}`);

    // Test 1: Connectivity (Ping)
    console.log('\n[1/4] Testing Connectivity...');
    const start1 = Date.now();
    const { data: pingData, error: pingError } = await supabase.from('leads').select('count').limit(1).single();
    const time1 = Date.now() - start1;

    if (pingError && pingError.code !== 'PGRST116') {
        console.error(`❌ Ping failed (${time1}ms):`, pingError.message);
        return; // Stop if basic connection fails
    } else {
        console.log(`✅ Connection established in ${time1}ms`);
    }

    // Test 2: Insert Lead (RLS Check)
    console.log('\n[2/4] Testing Lead Insert (RLS)...');
    const testEmail = `mohmohabtc+diag${Date.now()}@gmail.com`;
    const start2 = Date.now();
    const { data: leadData, error: leadError } = await supabase.from('leads').insert([{
        name: 'Diagnostic Node',
        email: testEmail,
        company: 'Test Corp',
        role: 'Tester',
        plan_interest: 'Diagnostic'
    }]).select();
    const time2 = Date.now() - start2;

    if (leadError) {
        console.error(`❌ Lead insert failed (${time2}ms):`, leadError.message);
    } else {
        console.log(`✅ Lead inserted in ${time2}ms`);
    }

    // Test 3: Auth SignUp (Trigger Check)
    console.log('\n[3/4] Testing Auth SignUp (Trigger)...');
    const start3 = Date.now();
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'password123',
        options: {
            data: {
                name: 'Diagnostic Node User',
                role: 'SUPERVISOR',
                zone: 'TestZone'
            }
        }
    });
    const time3 = Date.now() - start3;

    if (authError) {
        console.error(`❌ Auth SignUp failed (${time3}ms):`, authError.message);
    } else {
        console.log(`✅ Auth User created in ${time3}ms. ID: ${authData.user?.id}`);
    }

    // Test 4: RPC Call (Demo User)
    console.log('\n[4/4] Testing login_demo_user RPC...');
    const start4 = Date.now();
    const { data: rpcData, error: rpcError } = await supabase.rpc('login_demo_user', {
        email_input: 'mobile.mohmohabtc@gmail.com',
        password_input: '12345678'
    });
    const time4 = Date.now() - start4;

    if (rpcError) {
        console.error(`❌ RPC failed (${time4}ms):`, rpcError.message);
    } else {
        console.log(`✅ RPC executed in ${time4}ms (Result: ${JSON.stringify(rpcData)})`);
    }

    console.log('\n🏁 Diagnostics Complete.');
}

runDiagnostics();
