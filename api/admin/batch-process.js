import { createClient } from '@supabase/supabase-js';
import { format, subMonths } from 'date-fns';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const councils = [
  "Albury City Council",
  "Armidale Regional Council",
  "Ballina Shire Council",
  "Bathurst Regional Council",
  "Bayside Council",
  "Bega Valley Shire Council",
  "Bellingen Shire Council",
  "Berrigan Shire Council",
  "Blacktown City Council",
  "Bland Shire Council",
  "Blayney Shire Council",
  "Blue Mountains City Council",
  "Bogan Shire Council",
  "Bourke Shire Council",
  "Brewarrina Shire Council",
  "Broken Hill City Council",
  "Burwood Council",
  "Byron Shire Council",
  "Cabonne Council",
  "Camden Council",
  "Campbelltown City Council",
  "Canterbury-Bankstown Council",
  "Central Coast Council",
  "Central Darling Shire Council",
  "Cessnock City Council",
  "City of Canada Bay Council",
  "City of Parramatta Council",
  "City of Sydney",
  "Clarence Valley Council",
  "Cobar Shire Council",
  "Coffs Harbour City Council",
  "Coolamon Shire Council",
  "Coonamble Shire Council",
  "Cootamundra-Gundagai Regional Council",
  "Cowra Shire Council",
  "Cumberland Council",
  "Dubbo Regional Council",
  "Dungog Shire Council",
  "Edward River Council",
  "Eurobodalla Shire Council",
  "Fairfield City Council",
  "Federation Council",
  "Forbes Shire Council",
  "Georges River Council",
  "Gilgandra Shire Council",
  "Glen Innes Severn Shire Council",
  "Goulburn Mulwaree Council",
  "Greater Hume Shire Council",
  "Griffith City Council",
  "Gunnedah Shire Council",
  "Gwydir Shire Council",
  "Hawkesbury City Council",
  "Hay Shire Council",
  "Hilltops Council",
  "Hornsby Shire Council",
  "Hunter's Hill Council",
  "Inner West Council",
  "Inverell Shire Council",
  "Junee Shire Council",
  "Kempsey Shire Council",
  "Kiama Municipal Council",
  "Ku-ring-gai Council",
  "Kyogle Council",
  "Lachlan Shire Council",
  "Lake Macquarie City Council",
  "Lane Cove Municipal Council",
  "Leeton Shire Council",
  "Lismore City Council",
  "Lithgow City Council",
  "Liverpool City Council",
  "Liverpool Plains Shire Council",
  "Lockhart Shire Council",
  "Maitland City Council",
  "Mid-Coast Council",
  "Mid-Western Regional Council",
  "Moree Plains Shire Council",
  "Mosman Municipal Council",
  "Murray River Council",
  "Murrumbidgee Council",
  "Muswellbrook Shire Council",
  "Nambucca Valley Council",
  "Narrabri Shire Council",
  "Narrandera Shire Council",
  "Narromine Shire Council",
  "Newcastle City Council",
  "North Sydney Council",
  "Northern Beaches Council",
  "Oberon Council",
  "Orange City Council",
  "Parkes Shire Council",
  "Penrith City Council",
  "Port Macquarie-Hastings Council",
  "Port Stephens Council",
  "Queanbeyan-Palerang Regional Council",
  "Randwick City Council",
  "Richmond Valley Council",
  "Ryde City Council",
  "Shellharbour City Council",
  "Shoalhaven City Council",
  "Singleton Council",
  "Snowy Monaro Regional Council",
  "Snowy Valleys Council",
  "Strathfield Municipal Council",
  "Sutherland Shire Council",
  "Tamworth Regional Council",
  "Temora Shire Council",
  "Tenterfield Shire Council",
  "The Council of the Municipality of Hunters Hill",
  "The Council of the Municipality of Kiama",
  "The Council of the Shire of Hornsby",
  "The Hills Shire Council",
  "Tweed Shire Council",
  "Upper Hunter Shire Council",
  "Upper Lachlan Shire Council",
  "Uralla Shire Council",
  "Wagga Wagga City Council",
  "Walcha Council",
  "Walgett Shire Council",
  "Warren Shire Council",
  "Warrumbungle Shire Council",
  "Waverley Council",
  "Weddin Shire Council",
  "Wentworth Shire Council",
  "Willoughby City Council",
  "Wingecarribee Shire Council",
  "Wollondilly Shire Council",
  "Wollongong City Council",
  "Woollahra Municipal Council",
  "Yass Valley Council"
];

// LGA mapping 
const lgaMapping = {
  "Albury City Council": "ALBURY CITY",
  "Armidale Regional Council": "ARMIDALE REGIONAL",
  "Ballina Shire Council": "BALLINA",
  "Bathurst Regional Council": "BATHURST REGIONAL",
  "Bayside Council": "BAYSIDE",
  "Bega Valley Shire Council": "BEGA VALLEY",
  "Bellingen Shire Council": "BELLINGEN",
  "Berrigan Shire Council": "BERRIGAN",
  "Blacktown City Council": "BLACKTOWN",
  "Bland Shire Council": "BLAND",
  "Blayney Shire Council": "BLAYNEY",
  "Blue Mountains City Council": "BLUE MOUNTAINS",
  "Bogan Shire Council": "BOGAN",
  "Bourke Shire Council": "BOURKE",
  "Brewarrina Shire Council": "BREWARRINA",
  "Broken Hill City Council": "BROKEN HILL",
  "Burwood Council": "BURWOOD",
  "Byron Shire Council": "BYRON",
  "Cabonne Council": "CABONNE",
  "Camden Council": "CAMDEN",
  "Campbelltown City Council": "CAMPBELLTOWN",
  "Canterbury-Bankstown Council": "CANTERBURY-BANKSTOWN",
  "Central Coast Council": "CENTRAL COAST",
  "Central Darling Shire Council": "CENTRAL DARLING",
  "Cessnock City Council": "CESSNOCK",
  "City of Canada Bay Council": "CANADA BAY",
  "City of Parramatta Council": "CITY OF PARRAMATTA",
  "City of Sydney": "SYDNEY",
  "Clarence Valley Council": "CLARENCE VALLEY",
  "Cobar Shire Council": "COBAR",
  "Coffs Harbour City Council": "COFFS HARBOUR",
  "Coolamon Shire Council": "COOLAMON",
  "Coonamble Shire Council": "COONAMBLE",
  "Cootamundra-Gundagai Regional Council": "COOTAMUNDRA-GUNDAGAI REGIONAL",
  "Cowra Shire Council": "COWRA",
  "Cumberland Council": "CUMBERLAND",
  "Dubbo Regional Council": "DUBBO REGIONAL",
  "Dungog Shire Council": "DUNGOG",
  "Edward River Council": "EDWARD RIVER",
  "Eurobodalla Shire Council": "EUROBODALLA",
  "Fairfield City Council": "FAIRFIELD",
  "Federation Council": "FEDERATION",
  "Forbes Shire Council": "FORBES",
  "Georges River Council": "GEORGES RIVER",
  "Gilgandra Shire Council": "GILGANDRA",
  "Glen Innes Severn Shire Council": "GLEN INNES SEVERN",
  "Goulburn Mulwaree Council": "GOULBURN MULWAREE",
  "Greater Hume Shire Council": "GREATER HUME SHIRE",
  "Griffith City Council": "GRIFFITH",
  "Gunnedah Shire Council": "GUNNEDAH",
  "Gwydir Shire Council": "GWYDIR",
  "Hawkesbury City Council": "HAWKESBURY",
  "Hay Shire Council": "HAY",
  "Hilltops Council": "HILLTOPS",
  "Hornsby Shire Council": "HORNSBY",
  "Hunter's Hill Council": "HUNTERS HILL",
  "Inner West Council": "INNER WEST",
  "Inverell Shire Council": "INVERELL",
  "Junee Shire Council": "JUNEE",
  "Kempsey Shire Council": "KEMPSEY",
  "Kiama Municipal Council": "KIAMA",
  "Ku-ring-gai Council": "KU-RING-GAI",
  "Kyogle Council": "KYOGLE",
  "Lachlan Shire Council": "LACHLAN",
  "Lake Macquarie City Council": "LAKE MACQUARIE",
  "Lane Cove Municipal Council": "LANE COVE",
  "Leeton Shire Council": "LEETON",
  "Lismore City Council": "LISMORE",
  "Lithgow City Council": "LITHGOW CITY",
  "Liverpool City Council": "LIVERPOOL",
  "Liverpool Plains Shire Council": "LIVERPOOL PLAINS",
  "Lockhart Shire Council": "LOCKHART",
  "Maitland City Council": "MAITLAND",
  "Mid-Coast Council": "MID-COAST",
  "Mid-Western Regional Council": "MID-WESTERN REGIONAL",
  "Moree Plains Shire Council": "MOREE PLAINS",
  "Mosman Municipal Council": "MOSMAN",
  "Murray River Council": "MURRAY RIVER",
  "Murrumbidgee Council": "MURRUMBIDGEE",
  "Muswellbrook Shire Council": "MUSWELLBROOK",
  "Nambucca Valley Council": "NAMBUCCA VALLEY",
  "Narrabri Shire Council": "NARRABRI",
  "Narrandera Shire Council": "NARRANDERA",
  "Narromine Shire Council": "NARROMINE",
  "Newcastle City Council": "NEWCASTLE",
  "North Sydney Council": "NORTH SYDNEY",
  "Northern Beaches Council": "NORTHERN BEACHES",
  "Oberon Council": "OBERON",
  "Orange City Council": "ORANGE",
  "Parkes Shire Council": "PARKES",
  "Penrith City Council": "PENRITH",
  "Port Macquarie-Hastings Council": "PORT MACQUARIE-HASTINGS",
  "Port Stephens Council": "PORT STEPHENS",
  "Queanbeyan-Palerang Regional Council": "QUEANBEYAN-PALERANG REGIONAL",
  "Randwick City Council": "RANDWICK",
  "Richmond Valley Council": "RICHMOND VALLEY",
  "Ryde City Council": "RYDE",
  "Shellharbour City Council": "SHELLHARBOUR",
  "Shoalhaven City Council": "SHOALHAVEN",
  "Singleton Council": "SINGLETON",
  "Snowy Monaro Regional Council": "SNOWY MONARO REGIONAL",
  "Snowy Valleys Council": "SNOWY VALLEYS",
  "Strathfield Municipal Council": "STRATHFIELD",
  "Sutherland Shire Council": "SUTHERLAND SHIRE",
  "Tamworth Regional Council": "TAMWORTH REGIONAL",
  "Temora Shire Council": "TEMORA",
  "Tenterfield Shire Council": "TENTERFIELD",
  "The Hills Shire Council": "THE HILLS SHIRE",
  "Tweed Shire Council": "TWEED",
  "Upper Hunter Shire Council": "UPPER HUNTER",
  "Upper Lachlan Shire Council": "UPPER LACHLAN SHIRE",
  "Uralla Shire Council": "URALLA",
  "Wagga Wagga City Council": "WAGGA WAGGA",
  "Walcha Council": "WALCHA",
  "Walgett Shire Council": "WALGETT",
  "Warren Shire Council": "WARREN",
  "Warrumbungle Shire Council": "WARRUMBUNGLE",
  "Waverley Council": "WAVERLEY",
  "Weddin Shire Council": "WEDDIN",
  "Wentworth Shire Council": "WENTWORTH",
  "Willoughby City Council": "WILLOUGHBY",
  "Wingecarribee Shire Council": "WINGECARRIBEE",
  "Wollondilly Shire Council": "WOLLONDILLY",
  "Wollongong City Council": "WOLLONGONG",
  "Woollahra Municipal Council": "WOOLLAHRA",
  "Yass Valley Council": "YASS VALLEY"
};

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

// Add this mapping at the top of the file with other constants
const STATUS_MAPPING = {
  'Lodged': 'Lodged',
  'In Assessment': 'Under Assessment',
  'Approved': 'Approved',
  'Refused': 'Refused',
  'Withdrawn': 'Withdrawn',
  'Determined': 'Determined',
  'Rejected': 'Rejected',
  'Under Review': 'Under Review',
  'Deferred': 'Deferred',
  'Cancelled': 'Unknown',  // Map cancelled to Unknown since it's not in our enum
  // Any other status will default to 'Unknown'
};

const APPLICATION_TYPE_MAPPING = {
  'Development Application': 'Development Application',
  'Modification Application': 'Modification Application',
  'Review Application': 'Review Application',
  'Complying Development Certificate': 'Complying Development Certificate',
  'Construction Certificate': 'Construction Certificate'
  // Any other type will default to 'Other'
};

// Add this helper function at the top
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, retries = 3, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Remove timeout, just do the fetch
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) throw error; // Last retry, throw error
      console.log(`Retrying in ${delay/1000} seconds...`);
      await wait(delay);
    }
  }
};

// Add these at the top of the file
let processedCouncils = new Set(); // Keep track of successfully processed councils
let lastSuccessfulCouncil = null;
let isProcessing = false; // Flag to track if processing is active

// Add at the top with other constants
const BATCH_SIZE = 1; // Process one council at a time
const DELAY_BETWEEN_COUNCILS = 5000; // 5 seconds between councils

/**
 * Process a single council's development applications
 */
const processCouncil = async (councilName) => {
  console.log(`\n=== Starting ${councilName} ===`);
  try {
    const filters = {
      CouncilName: councilName,
      LodgementDateFrom: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
      LodgementDateTo: format(new Date(), 'yyyy-MM-dd')
    };

    // Remove timeout, just do the initial request
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
            LodgementDateFrom: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
            LodgementDateTo: format(new Date(), 'yyyy-MM-dd')
          }
        })
      }
    });

    const initialData = await initialResponse.json();
    const totalCount = initialData.TotalCount;
    console.log(`Total applications available for ${councilName}: ${totalCount}`);

    let allApplications = [];
    const pageSize = 2000;
    const totalPages = Math.ceil(totalCount / pageSize);

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      console.log(`Fetching page ${pageNumber}/${totalPages} for ${councilName}`);
      
      try {
        // Add timeout for each page fetch
        const response = await fetchWithRetry('https://api.apps1.nsw.gov.au/eplanning/data/v0/OnlineDA', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'PageSize': pageSize.toString(),
            'PageNumber': pageNumber.toString(),
            'filters': JSON.stringify({
              filters: {
                CouncilName: [councilName],
                LodgementDateFrom: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
                LodgementDateTo: format(new Date(), 'yyyy-MM-dd')
              }
            })
          }
        });

        const data = await response.json();
        console.log(`Page ${pageNumber} data received for ${councilName}`);
        
        // Log the first application to see exact structure
        if (data.Application && data.Application[0]) {
          console.log('Example API response structure:', data.Application[0]);
        }

        const applications = data.Application || [];
        
        console.log(`Received ${applications.length} applications for ${councilName} (page ${pageNumber}/${totalPages})`);
        allApplications = allApplications.concat(applications);

        // Transform the data by explicitly selecting only the fields we want
        const transformedApplications = applications.map(app => ({
          // Core fields
          PlanningPortalApplicationNumber: app.PlanningPortalApplicationNumber,
          LodgementDate: app.LodgementDate,
          DeterminationDate: app.DeterminationDate,
          AssessmentExhibitionEndDate: app.AssessmentExhibitionEndDate,
          AssessmentExhibitionStartDate: app.AssessmentExhibitionStartDate,
          CostOfDevelopment: app.CostOfDevelopment,
          NumberOfNewDwellings: app.NumberOfNewDwellings,
          NumberOfStoreys: app.NumberOfStoreys,
          NumberOfExistingLots: app.NumberOfExistingLots,
          NumberOfProposedLots: app.NumberOfProposedLots,
          
          // Status and type fields
          ApplicationStatus: app.ApplicationStatus,
          ApplicationType: app.ApplicationType,
          DevelopmentCategory: app.DevelopmentCategory,
          
          // Flag fields
          AccompaniedByVPAFlag: app.AccompaniedByVPAFlag,
          DevelopmentSubjectToSICFlag: app.DevelopmentSubjectToSICFlag,
          EPIVariationProposedFlag: app.EPIVariationProposedFlag,
          SubdivisionProposedFlag: app.SubdivisionProposedFlag,
          VariationToDevelopmentStandardsApprovedFlag: app.VariationToDevelopmentStandardsApprovedFlag,
          IntegratedDevelopmentFlag: app.IntegratedDevelopmentFlag,
          AssociatedReviewFlag: app.AssociatedReviewFlag,
          DesignatedDevelopmentFlag: app.DesignatedDevelopmentFlag,
          StateSignificantDevelopmentFlag: app.StateSignificantDevelopmentFlag,
          ConcurrenceReferralFlag: app.ConcurrenceReferralFlag,
          Section34AccountabilityFlag: app.Section34AccountabilityFlag,
          DelegatedAuthorityFlag: app.DelegatedAuthorityFlag,
          
          // Other fields
          DeterminationAuthority: app.DeterminationAuthority,
          GFA: app.GFA,
          SiteArea: app.SiteArea,
          Description: app.Description,
          AssessingOfficer: app.AssessingOfficer,
          DAPDetermination: app.DAPDetermination,
          
          // Flattened Council field
          CouncilName: app.Council?.CouncilName,
          
          // Metadata
          fetched_at: new Date().toISOString()
        }));

        // Batch insert main applications
        const { error } = await supabase
          .from('development_applications')
          .upsert(transformedApplications, {
            onConflict: 'PlanningPortalApplicationNumber',
            ignoreDuplicates: true
          });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        // Batch prepare related data
        const developmentTypes = [];
        const locations = [];
        const lots = [];

        // Get all inserted applications in one query
        const CHUNK_SIZE = 500; // Process in smaller batches
        const applicationNumbers = applications.map(a => a.PlanningPortalApplicationNumber);
        const chunks = [];

        // Split into chunks of 500
        for (let i = 0; i < applicationNumbers.length; i += CHUNK_SIZE) {
            chunks.push(applicationNumbers.slice(i, i + CHUNK_SIZE));
        }

        // Process each chunk
        let allInsertedApps = [];
        for (const chunk of chunks) {
            const { data: insertedApps, error: selectError } = await supabase
                .from('development_applications')
                .select('id, PlanningPortalApplicationNumber')
                .in('PlanningPortalApplicationNumber', chunk);

            if (selectError) {
                console.error('Error fetching chunk of applications:', selectError);
                continue; // Skip this chunk if there's an error, but continue processing
            }

            allInsertedApps = allInsertedApps.concat(insertedApps || []);
        }

        // Create a lookup map for faster reference
        const appIdMap = Object.fromEntries(
            allInsertedApps.map(app => [app.PlanningPortalApplicationNumber, app.id])
        );

        // Log for debugging
        console.log(`Found ${Object.keys(appIdMap).length} matching applications in database`);

        // Prepare all related data
        for (const app of applications) {
          const appId = appIdMap[app.PlanningPortalApplicationNumber];
          if (!appId) continue;

          // Collect development types
          if (app.DevelopmentType?.length > 0) {
            developmentTypes.push(...app.DevelopmentType.map(dt => ({
              application_id: appId,
              DevelopmentType: dt.DevelopmentType
            })));
          }

          // Collect locations
          if (app.Location?.length > 0) {
            for (const location of app.Location) {
              const { data: insertedLocation } = await supabase
                .from('development_applications_locations')
                .upsert({
                  application_id: appId,
                  FullAddress: location.FullAddress,
                  X: location.X,
                  Y: location.Y,
                  StreetNumber1: location.StreetNumber1,
                  StreetName: location.StreetName,
                  StreetType: location.StreetType,
                  Suburb: location.Suburb,
                  Postcode: location.Postcode,
                  State: location.State
                }, { 
                  onConflict: ['application_id', 'FullAddress'],
                  returning: true 
                });

              // If location inserted successfully, collect its lots
              if (location.Lot?.length > 0 && insertedLocation?.[0]) {
                lots.push(...location.Lot.map(lot => ({
                  location_id: insertedLocation[0].id,
                  Lot: lot.Lot,
                  PlanLabel: lot.PlanLabel
                })));
              }
            }
          }
        }

        // Batch insert development types
        if (developmentTypes.length > 0) {
          await supabase
            .from('development_applications_development_types')
            .upsert(developmentTypes, {
              onConflict: ['application_id', 'DevelopmentType']
            });
        }

        // Batch insert lots
        if (lots.length > 0) {
          await supabase
            .from('development_applications_lots')
            .upsert(lots, {
              onConflict: ['location_id', 'Lot', 'PlanLabel']
            });
        }

        // Shorter delay between councils
        if (pageNumber === totalPages) {
          await wait(2000); // 2 seconds between councils
        }
      } catch (pageError) {
        console.error(`Error on page ${pageNumber} for ${councilName}:`, pageError);
        throw pageError; // Re-throw to be caught by outer handler
      }
    }

    console.log(`Total applications fetched for ${councilName}: ${allApplications.length}`);

    console.log(`Successfully processed ${allApplications.length} applications for ${councilName}`);
    return allApplications.length;
  } catch (error) {
    console.error(`\n!!! Error processing ${councilName} !!!`);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error; // Re-throw to be caught by the batch processor
  }
};

// Hardcode the admin key since env vars aren't loading properly
const ADMIN_KEY = 'dev-admin-key-123';

export default async function handler(req, res) {
  // Check for allowed methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Handler started');
  
  // If already processing, return current status
  if (isProcessing) {
    return res.status(200).json({
      status: 'in_progress',
      processedCouncils: Array.from(processedCouncils),
      lastSuccessfulCouncil,
      message: 'Processing is already running'
    });
  }

  isProcessing = true;

  try {
    console.log("Starting batch process...");
    const results = [];
    const errors = [];

    // Process one council at a time
    for (let i = 0; i < councils.length; i++) {
      const council = councils[i];
      
      // Skip if already processed
      if (processedCouncils.has(council)) {
        continue;
      }

      console.log(`\n=== Processing ${council} (${i + 1}/${councils.length}) ===`);
      
      try {
        const result = await processCouncil(council);
        console.log(`✓ Completed ${council}`);
        processedCouncils.add(council);
        lastSuccessfulCouncil = council;
        results.push(result);
        
        // Progress update
        const progress = Math.round(((i + 1) / councils.length) * 100);
        console.log(`\nProgress: ${progress}%`);
        console.log(`Processed: ${processedCouncils.size}/${councils.length} councils`);
        
        // Wait between councils
        if (i < councils.length - 1) {
          console.log(`Waiting ${DELAY_BETWEEN_COUNCILS/1000}s before next council...`);
          await wait(DELAY_BETWEEN_COUNCILS);
        }
      } catch (error) {
        console.error(`✗ Failed ${council}:`, error);
        errors.push({ council, error: error.message });
      }
    }

    isProcessing = false;
    
    return res.status(200).json({ 
      status: 'complete',
      success: true, 
      total: results.reduce((a, b) => a + b, 0),
      errors,
      processedCouncils: Array.from(processedCouncils),
      failedCouncils: errors.length
    });
  } catch (error) {
    isProcessing = false;
    console.error("\nCritical error in batch process:", error);
    return res.status(500).json({ 
      status: 'error',
      error: error.message,
      lastSuccessfulCouncil,
      processedCount: processedCouncils.size
    });
  }
}