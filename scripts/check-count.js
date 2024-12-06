import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function checkCount() {
    console.log('Checking database counts...');
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        // Get total count
        const { count: totalCount, error: countError } = await supabase
            .from('development_applications')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;
        console.log('Total records:', totalCount);

        // Get all unique councils
        const { data: councils, error: councilError } = await supabase
            .from('development_applications')
            .select('council_name')
            .limit(1000);

        if (councilError) throw councilError;

        // Get count for each council
        console.log('\nRecords by council:');
        const uniqueCouncils = [...new Set(councils.map(r => r.council_name))];
        
        for (const council of uniqueCouncils) {
            const { count, error } = await supabase
                .from('development_applications')
                .select('*', { count: 'exact', head: true })
                .eq('council_name', council);
                
            if (error) {
                console.error(`Error getting count for ${council}:`, error);
                continue;
            }
            
            console.log(`${council}: ${count}`);
        }

        // Get most recent records
        const { data: recentRecords, error: recentError } = await supabase
            .from('development_applications')
            .select('planning_portal_application_number, council_name, fetched_at')
            .order('fetched_at', { ascending: false })
            .limit(5);

        if (recentError) throw recentError;
        console.log('\nMost recent records:');
        recentRecords.forEach(record => {
            console.log(`${record.council_name} - ${record.planning_portal_application_number} (${record.fetched_at})`);
        });

    } catch (error) {
        console.error('Error checking counts:', error);
    }
}

checkCount();
