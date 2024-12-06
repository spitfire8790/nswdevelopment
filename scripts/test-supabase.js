import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log('Environment variables:', {
        URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...'
    });

    try {
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

        const { data, error } = await supabase
            .from('development_applications')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Query error:', error);
            throw error;
        }

        console.log('Successfully connected to Supabase!');
        console.log('Sample data:', data);
    } catch (error) {
        console.error('Connection error:', {
            name: error.name,
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
    }
}

testConnection();
