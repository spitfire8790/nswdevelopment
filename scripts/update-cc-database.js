import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import dotenv from 'dotenv';
import { councils } from '../src/data/councilList.js';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const API_BASE_URL = 'https://api.apps1.nsw.gov.au/eplanning/data/v0/OnlineCC';
const PAGE_SIZE = 1000;
const COUNCILS_PER_REQUEST = 3;
const DELAY_BETWEEN_REQUESTS = 2000;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Improved fetch with retries and better error handling
async function fetchWithRetry(url, options, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      
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
        
        const backoffDelay = delay * Math.pow(2, i);
        console.log(`Waiting ${backoffDelay}ms before retry...`);
        await delay(backoffDelay);
        
        if (i === retries - 1) throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        return response;
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      
      const backoffDelay = delay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${retries} after ${backoffDelay}ms...`);
      await delay(backoffDelay);
    }
  }
}

async function fetchPage(councils, pageNumber) {
  const filterString = JSON.stringify({
    filters: {
      CouncilName: councils
    }
  });

  console.log(`\nFetching data for councils: ${councils.join(', ')}`);
  console.log(`Page ${pageNumber} | Filter: ${filterString}`);

  try {
    const response = await fetchWithRetry(API_BASE_URL, {
      method: 'GET',
      headers: {
        'PageSize': PAGE_SIZE.toString(),
        'PageNumber': pageNumber.toString(),
        'filters': filterString
      }
    });

    const data = await response.json();
    console.log(`Page ${pageNumber} of ${data.TotalPages}`);
    console.log(`Records in this page: ${data.Application.length}`);
    console.log(`Total records available: ${data.TotalCount}`);

    return {
      records: data.Application || [],
      totalPages: data.TotalPages,
      totalRecords: data.TotalCount,
      hasMore: pageNumber < data.TotalPages
    };
  } catch (error) {
    console.error(`Error fetching page ${pageNumber}:`, error);
    return { records: [], totalPages: 0, totalRecords: 0, hasMore: false };
  }
}

function transformToSupabaseFormat(record, councilName) {
  const location = record.Location?.[0] || {};
  const buildingCodes = record.BuildingCodeClass?.[0] || {};
  const devTypes = record.DevelopmentType || [];
  
  return {
    council_name: councilName,
    application_number: record.PlanningPortalApplicationNumber,
    status: record.ApplicationStatus,
    storeys_proposed: record.StoreysProposed,
    land_area: record.LandArea,
    existing_gfa: record.ExistingGrossFloorArea,
    proposed_gfa: record.ProposedGrossFloorArea,
    units_proposed: record.UnitsProposed,
    proposed_lots: record.ProposedLots,
    current_use: record.CurrentBuildingUse,
    proposed_use: record.ProposedBuildingUse,
    builder_legal_name: record.BuilderLegalName,
    builder_trading_name: record.BuilderTradingName,
    building_class: buildingCodes.BuildingCodeClass,
    building_description: buildingCodes.BuildingCodeDescription,
    development_type: devTypes,
    location: location,
    fetched_at: new Date().toISOString()
  };
}

async function processCouncil(councilName) {
  console.log(`\n=== Processing ${councilName} ===`);
  try {
    let pageNumber = 1;
    let hasMore = true;
    let totalProcessed = 0;

    while (hasMore) {
      const { records, totalPages, hasMore: morePages } = await fetchPage([councilName], pageNumber);
      
      if (records.length > 0) {
        const transformedRecords = records.map(record => 
          transformToSupabaseFormat(record, councilName)
        );
        
        const { error } = await supabase
          .from('construction_certificates')
          .upsert(transformedRecords, {
            onConflict: 'application_number',
            returning: 'minimal'
          });

        if (error) {
          console.error(`Error upserting data for ${councilName}:`, error);
          throw error;
        }

        totalProcessed += records.length;
        console.log(`Successfully upserted ${records.length} certificates for ${councilName}`);
      }

      hasMore = morePages;
      if (hasMore) {
        pageNumber++;
        await delay(DELAY_BETWEEN_REQUESTS);
      }
    }

    return totalProcessed;
  } catch (error) {
    console.error(`Error processing ${councilName}:`, error);
    throw error;
  }
}

async function main() {
  console.log('Starting NSW Planning Portal CC data collection');
  console.log(`Time: ${new Date().toISOString()}`);
  
  // Test Supabase connection
  try {
    const { data, error } = await supabase
      .from('construction_certificates')
      .select('count', { count: 'exact', head: true });
    
    if (error) throw error;
    console.log('✅ Connected to Supabase');
    console.log(`Current record count: ${data || 0}`);
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return;
  }

  let totalProcessed = 0;
  let successfulCouncils = 0;
  let failedCouncils = 0;

  for (const council of councils) {
    try {
      const count = await processCouncil(council);
      totalProcessed += count;
      successfulCouncils++;
      
      // Add delay between councils
      if (councils.indexOf(council) < councils.length - 1) {
        console.log('Waiting before next council...');
        await delay(DELAY_BETWEEN_REQUESTS);
      }
    } catch (error) {
      console.error(`Failed to process ${council}:`, error);
      failedCouncils++;
    }
  }

  console.log('\n=== Final Summary ===');
  console.log(`Total certificates processed: ${totalProcessed}`);
  console.log(`Successful councils: ${successfulCouncils}`);
  console.log(`Failed councils: ${failedCouncils}`);
}

main().catch(console.error);