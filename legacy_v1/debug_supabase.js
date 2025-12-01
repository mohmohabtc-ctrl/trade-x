import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wesjfaqzzighybovostc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlc2pmYXF6emlnaHlib3Zvc3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Mjc0ODcsImV4cCI6MjA3OTAwMzQ4N30.m48Ju2M5VzBhhi5-eu9FFOv2W2rL38nHLe0tB-RoP38';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log("Testing Supabase Connection...");

    // 1. Test Leads Insert
    console.log("\n--- Testing 'leads' table insert ---");
    try {
        const { data: leadData, error: leadError } = await supabase.from('leads').insert([
            {
                name: 'Test User Debug',
                email: `test.debug.${Date.now()}@example.com`,
                phone: '1234567890',
                company: 'Test Corp',
                role: 'Prospect'
            }
        ]);

        if (leadError) {
            console.error("❌ Error inserting lead:", JSON.stringify(leadError, null, 2));
        } else {
            console.log("✅ Lead inserted successfully:", leadData);
        }
    } catch (e) {
        console.error("Exception during lead insert:", e);
    }

    // 2. Test Users Insert (Expected to fail for Anon)
    console.log("\n--- Testing 'users' table insert (Expect Failure) ---");
    try {
        const testUserId = `test-${Date.now()}`;
        const { data: userData, error: userError } = await supabase.from('users').insert([
            {
                id: testUserId,
                name: 'Test Manager',
                email: `test.mgr.${Date.now()}@example.com`,
                password: 'password123',
                role: 'SUPERVISOR',
                active: true
            }
        ]).select();

        if (userError) {
            console.log("ℹ️ User insert failed (Expected for Anon):", userError.code, userError.message);
        } else {
            console.log("✅ User inserted successfully (Unexpected for Anon):", userData);
        }
    } catch (e) {
        console.error("Exception during user insert:", e);
    }
}

testConnection();
