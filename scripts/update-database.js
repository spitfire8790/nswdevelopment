import { createClient } from '@supabase/supabase-js';
import { format, subMonths } from 'date-fns';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { councils } from '../src/data/councilList.js'; // Import councils from your existing file

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processCouncil(councilName) {
  console.log(`\n🔍 Processing ${councilName}...`);
  
  try {
    const apiFilters = {
      CouncilName: [councilName],
      ApplicationType: undefined,
      DevelopmentCategory: undefined,
      ApplicationStatus: undefined,
      CostOfDevelopmentFrom: undefined,
      CostOfDevelopmentTo: undefined,
      LodgementDateFrom: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
      LodgementDateTo: format(new Date(), 'yyyy-MM-dd'),
      ApplicationLastUpdatedFrom: "2019-02-01"
    };

    console.log('Request filters:', JSON.stringify(apiFilters, null, 2));

    const response = await fetch('https://api.apps1.nsw.gov.au/eplanning/data/v0/OnlineDA', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'PageSize': '50000',
        'PageNumber': '1',
        'filters': JSON.stringify({ filters: apiFilters })
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Found ${data.Application?.length || 0} applications`);
    
    if (data.Application?.length > 0) {
      const applications = data.Application.map(app => ({
        PlanningPortalApplicationNumber: app.PlanningPortalApplicationNumber,
        CouncilName: app.Council?.CouncilName,
        cost_of_development: app.CostOfDevelopment,
        number_of_new_dwellings: app.NumberOfNewDwellings,
        number_of_storeys: app.NumberOfStoreys,
        modification_application_number: app.ModificationApplicationNumber,
        ApplicationStatus: app.ApplicationStatus,
        application_type: app.ApplicationType,
        accompanied_by_vpa_flag: app.AccompaniedByVPAFlag,
        epi_variation_proposed_flag: app.EPIVariationProposedFlag,
        subdivision_proposed_flag: app.SubdivisionProposedFlag,
        determination_authority: app.DeterminationAuthority,
        
        // Handle development types array
        development_types: app.DevelopmentType ? 
          JSON.stringify(app.DevelopmentType.map(dt => dt.DevelopmentType)) : 
          null,

        // Handle location data
        full_address: app.Location?.[0]?.FullAddress,
        longitude: app.Location?.[0]?.X,
        latitude: app.Location?.[0]?.Y,
        street_number: app.Location?.[0]?.StreetNumber1,
        street_name: app.Location?.[0]?.StreetName,
        street_type: app.Location?.[0]?.StreetType,
        suburb: app.Location?.[0]?.Suburb,
        postcode: app.Location?.[0]?.Postcode,
        state: app.Location?.[0]?.State,

        // Handle lot details
        lot_details: app.Location?.[0]?.Lot ? 
          JSON.stringify(app.Location[0].Lot.map(lot => ({
            lot: lot.Lot,
            planLabel: lot.PlanLabel
          }))) : 
          null,

        fetched_at: new Date().toISOString(),
        Description: app.Description
      }));

      console.log('Sample processed application:', JSON.stringify(applications[0], null, 2));

      const { data: insertedData, error } = await supabase
        .from('development_applications')
        .upsert(applications, {
          onConflict: 'PlanningPortalApplicationNumber',
          returning: 'representation'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log(`Supabase response:`, {
        inserted: insertedData?.length || 0,
        total: applications.length
      });

      return applications.length;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error processing ${councilName}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database update process...');
  
  // Test Supabase connection and check table
  try {
    const { data, error } = await supabase
      .from('development_applications')
      .select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    console.log('✅ Connected to Supabase');
    console.log(`Current record count: ${data || 0}`);
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return;
  }

  // Delete progress file to start fresh
  try {
    await fs.unlink('progress.txt');
    console.log('Deleted old progress file');
  } catch (error) {
    // File doesn't exist, that's fine
  }

  let totalApplications = 0;
  
  for (let i = 0; i < councils.length; i++) {
    const council = councils[i];
    const progress = Math.round(((i + 1) / councils.length) * 100);
    
    console.log(`\n=== Progress: ${progress}% (${i + 1}/${councils.length}) ===`);

    try {
      const count = await processCouncil(council);
      totalApplications += count;
      if (count > 0) {
        await fs.appendFile('progress.txt', `${council}\n`);
      }
      console.log(`📊 Total applications processed: ${totalApplications}`);
    } catch (error) {
      console.error(`Failed to process ${council}:`, error);
      await fs.appendFile('errors.txt', `${council}: ${error.message}\n`);
    }
    
    // Longer delay between councils to avoid rate limiting
    if (i < councils.length - 1) {
      console.log('Waiting 5 seconds before next council...');
      await wait(5000);
    }
  }

  // Final Supabase check
  try {
    const { data, error } = await supabase
      .from('development_applications')
      .select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    console.log('\n=== Final Summary ===');
    console.log(`Final record count in Supabase: ${data || 0}`);
    console.log(`Total applications processed: ${totalApplications}`);
  } catch (error) {
    console.error('Failed to get final count:', error);
  }
}

main().catch(console.error); 