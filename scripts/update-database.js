import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { councils } from '../src/data/councilList.js';

dotenv.config();

// Debug logging for environment variables
console.log('Environment variables loaded:', {
  VITE_API_URL: process.env.VITE_API_URL ? 'Set' : 'Not set',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set'
});

// Initialize Supabase client with service role key
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

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Improved fetch with retries and better error handling
async function fetchWithRetry(url, options, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Attempt ${i + 1}/${retries} failed:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // Add exponential backoff for rate limiting
        const backoffDelay = delay * Math.pow(2, i);
        console.log(`Waiting ${backoffDelay}ms before retry...`);
        await wait(backoffDelay);
        
        if (i === retries - 1) throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        return response;
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      
      const backoffDelay = delay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${retries} after ${backoffDelay}ms...`);
      await wait(backoffDelay);
    }
  }
}

async function processCouncil(councilName) {
  console.log(`\n=== Processing ${councilName} ===`);
  try {
    // First, get the total count with a minimal request
    const initialResponse = await fetchWithRetry('https://api.apps1.nsw.gov.au/eplanning/data/v0/OnlineDA', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'PageSize': '1',
        'PageNumber': '1',
        'filters': JSON.stringify({
          filters: {
            CouncilName: [councilName],
            LodgementDateTo: format(new Date(), 'yyyy-MM-dd')
          }
        })
      }
    });

    const initialData = await initialResponse.json();
    const totalCount = initialData.TotalCount;
    console.log(`Found ${totalCount} applications for ${councilName}`);

    // Process in smaller chunks with proper pagination
    const pageSize = 1000; // Smaller page size for better reliability
    const totalPages = Math.ceil(totalCount / pageSize);
    let processedApplications = 0;

    for (let page = 1; page <= totalPages; page++) {
      console.log(`Fetching page ${page}/${totalPages} for ${councilName}`);
      
      const response = await fetchWithRetry('https://api.apps1.nsw.gov.au/eplanning/data/v0/OnlineDA', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'PageSize': pageSize.toString(),
          'PageNumber': page.toString(),
          'filters': JSON.stringify({
            filters: {
              CouncilName: [councilName],
              LodgementDateTo: format(new Date(), 'yyyy-MM-dd')
            }
          })
        }
      });

      const data = await response.json();
      const applications = data.Application || [];
      processedApplications += applications.length;
      
      console.log(`Retrieved ${applications.length} applications (${processedApplications}/${totalCount})`);

      if (applications.length > 0) {
        // Transform the data to match database schema
        const transformedApplications = applications.map(app => ({
          planning_portal_application_number: app.PlanningPortalApplicationNumber,
          application_type: app.ApplicationType,
          application_status: app.ApplicationStatus,
          council_name: app.Council?.CouncilName,
          development_type: app.DevelopmentType || [],
          number_of_new_dwellings: app.NumberOfNewDwellings || 0,
          lodgement_date: app.LodgementDate,
          determination_authority: app.DeterminationAuthority || 'Unknown',
          subdivision_proposed_flag: app.SubdivisionProposedFlag || 'N',
          modification_application_number: app.ModificationApplicationNumber || null,
          cost_of_development: app.CostOfDevelopment || null,
          number_of_storeys: app.NumberOfStoreys || null,
          number_of_existing_lots: app.NumberOfExistingLots || null,
          number_of_proposed_lots: app.NumberOfProposedLots || null,
          epi_variation_proposed_flag: app.EPIVariationProposedFlag || null,
          accompanied_by_vpa_flag: app.AccompaniedByVPAFlag || null,
          vpa_status: app.VPAStatus || null,
          assessment_exhibition_start_date: app.AssessmentExhibitionStartDate || null,
          assessment_exhibition_end_date: app.AssessmentExhibitionEndDate || null,
          determination_date: app.DeterminationDate || null,
          development_subject_to_sic_flag: app.DevelopmentSubjectToSICFlag || 'N',
          variation_to_development_standards_approved_flag: app.VariationToDevelopmentStandardsApprovedFlag || 'N',
          location: app.Location || null,
          fetched_at: new Date().toISOString()
        }));

        // Log first transformed application for debugging
        if (page === 1) {
          console.log('Sample transformed application:', JSON.stringify(transformedApplications[0], null, 2));
        }

        // Batch upsert to Supabase
        const { error } = await supabase
          .from('development_applications')
          .upsert(transformedApplications, {
            onConflict: 'planning_portal_application_number',
            returning: 'minimal'
          });

        if (error) {
          console.error(`Error upserting data for ${councilName}:`, error);
          throw error;
        }

        console.log(`Successfully upserted ${transformedApplications.length} applications for ${councilName}`);
      }

      // Add a small delay between pages to avoid rate limiting
      if (page < totalPages) {
        await wait(1000);
      }
    }

    return processedApplications;
  } catch (error) {
    console.error(`Error processing ${councilName}:`, error);
    await fs.appendFile('errors.txt', `${councilName}: ${error.message}\n`);
    throw error;
  }
}

async function getLastUpdateTime(councilName) {
  const { data, error } = await supabase
    .from('development_applications')
    .select('fetched_at')
    .eq('council_name', councilName)
    .order('fetched_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error(`Error getting last update time for ${councilName}:`, error);
    return null;
  }

  return data?.[0]?.fetched_at;
}

async function shouldUpdateCouncil(councilName) {
  const lastUpdate = await getLastUpdateTime(councilName);
  
  if (!lastUpdate) {
    console.log(`${councilName} has never been updated`);
    return true;
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const lastUpdateDate = new Date(lastUpdate);
  
  const shouldUpdate = lastUpdateDate < oneHourAgo;
  if (!shouldUpdate) {
    console.log(`Skipping ${councilName} - last updated ${lastUpdateDate.toLocaleString()}`);
  }
  
  return shouldUpdate;
}

async function hasRecordChanged(existingRecord, newData) {
  // Compare relevant fields to detect changes
  const fieldsToCompare = [
    'application_status',
    'description',
    'estimated_cost',
    // Add other fields that might change
  ];

  return fieldsToCompare.some(field => 
    existingRecord[field] !== newData[field]
  );
}

async function updateDatabase() {
  console.log('🚀 Starting database update process...');
  
  try {
    // Get existing records that are not determined yet
    const { data: existingRecords, error: fetchError } = await supabase
      .from('development_applications')
      .select('*')
      .is('determination_date', null);

    if (fetchError) throw fetchError;

    // Create lookup map for faster searching
    const existingRecordsMap = new Map(
      existingRecords.map(record => [record.application_number, record])
    );

    // Fetch new data from source
    const newData = await fetchNewApplicationData(); // Your existing fetch function

    let updateCount = 0;
    let skipCount = 0;
    let insertCount = 0;

    for (const newRecord of newData) {
      const existingRecord = existingRecordsMap.get(newRecord.application_number);

      if (existingRecord) {
        // Record exists - check if it needs updating
        if (await hasRecordChanged(existingRecord, newRecord)) {
          const { error: updateError } = await supabase
            .from('development_applications')
            .update(newRecord)
            .eq('application_number', newRecord.application_number);

          if (updateError) {
            console.error(`Error updating record ${newRecord.application_number}:`, updateError);
            continue;
          }
          updateCount++;
        } else {
          skipCount++;
        }
      } else {
        // New record - insert it
        const { error: insertError } = await supabase
          .from('development_applications')
          .insert(newRecord);

        if (insertError) {
          console.error(`Error inserting record ${newRecord.application_number}:`, insertError);
          continue;
        }
        insertCount++;
      }
    }

    console.log('Update complete:');
    console.log(`- ${updateCount} records updated`);
    console.log(`- ${skipCount} records unchanged`);
    console.log(`- ${insertCount} new records inserted`);

  } catch (error) {
    console.error('Failed to update database:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Starting database update process...');
  
  // Test Supabase connection
  try {
    console.log('Testing Supabase connection...');
    console.log('Using URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    const { data, error } = await supabase
      .from('development_applications')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log('✅ Connected to Supabase');
    console.log('Sample record:', data[0]);
  } catch (error) {
    console.error('Failed to connect to Supabase:', {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    });
    return;
  }

  let totalApplications = 0;
  let successfulCouncils = 0;
  let failedCouncils = 0;
  let skippedCouncils = 0;
  
  for (let i = 0; i < councils.length; i++) {
    const council = councils[i];
    const progress = Math.round(((i + 1) / councils.length) * 100);
    
    console.log(`\n=== Progress: ${progress}% (${i + 1}/${councils.length}) ===`);
    console.log(`Successful councils: ${successfulCouncils}`);
    console.log(`Failed councils: ${failedCouncils}`);
    console.log(`Skipped councils: ${skippedCouncils}`);
    console.log(`Total applications: ${totalApplications}`);

    try {
      // Check if council needs updating
      if (!await shouldUpdateCouncil(council)) {
        skippedCouncils++;
        continue;
      }

      const count = await processCouncil(council);
      totalApplications += count;
      successfulCouncils++;
    } catch (error) {
      console.error(`Failed to process ${council}:`, error);
      failedCouncils++;
    }
    
    // Longer delay between councils to avoid rate limiting
    if (i < councils.length - 1) {
      console.log('Waiting 5 seconds before next council...');
      await wait(5000);
    }
  }

  // Final summary
  console.log('\n=== Final Summary ===');
  console.log(`Total applications processed: ${totalApplications}`);
  console.log(`Successful councils: ${successfulCouncils}`);
  console.log(`Failed councils: ${failedCouncils}`);
  console.log(`Skipped councils: ${skippedCouncils}`);
}

main().catch(console.error);