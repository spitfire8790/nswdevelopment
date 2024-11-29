import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { councils } from '../src/data/councilList.js';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function calculateLocationMatchScore(ccLocation, daLocation) {
  let score = 0;
  const maxScore = 100;

  // Exact coordinate match (highest confidence)
  if (ccLocation.X === daLocation.X && ccLocation.Y === daLocation.Y) {
    return maxScore;
  }

  // Check proximity if coordinates are close (within ~50 meters)
  const coordDiff = Math.sqrt(
    Math.pow(parseFloat(ccLocation.X) - parseFloat(daLocation.X), 2) +
    Math.pow(parseFloat(ccLocation.Y) - parseFloat(daLocation.Y), 2)
  );
  
  if (coordDiff < 0.0005) { // roughly 50 meters
    score += 80;
  }

  // Address component matching
  if (ccLocation.StreetNumber1 === daLocation.StreetNumber1) score += 5;
  if (ccLocation.StreetName === daLocation.StreetName) score += 5;
  if (ccLocation.StreetType === daLocation.StreetType) score += 3;
  if (ccLocation.Suburb === daLocation.Suburb) score += 4;
  if (ccLocation.Postcode === daLocation.Postcode) score += 3;

  return Math.min(score, maxScore);
}

async function findMatchingApplications() {
  console.log('Starting matching process...');

  // Get count of all CCs
  const { count: totalCCs } = await supabase
    .from('construction_certificates')
    .select('*', { count: 'exact' });

  console.log(`Total Construction Certificates: ${totalCCs}`);

  // Get count of unmatched CCs
  const { count: unmatchedCCs } = await supabase
    .from('construction_certificates')
    .select('*', { count: 'exact' })
    .is('matched_da_id', null);

  console.log(`Unmatched Construction Certificates: ${unmatchedCCs}`);

  console.log(`\nProcessing ${councils.length} councils`);

  let totalMatchesFound = 0;

  // Process each council from the imported list
  for (const councilName of councils) {
    console.log(`\n=== Processing ${councilName} ===`);

    // Get all unmatched CCs for this council
    const { data: ccs, error: ccError } = await supabase
      .from('construction_certificates')
      .select('*')
      .eq('council_name', councilName)
      .is('matched_da_id', null);

    if (ccError) {
      console.error(`Error fetching CCs for ${councilName}:`, ccError);
      continue;
    }

    console.log(`Found ${ccs?.length || 0} unmatched CCs for ${councilName}`);

    // Get all DAs for this council
    const { data: das, error: daError } = await supabase
      .from('development_applications')
      .select('*')
      .eq('council_name', councilName);

    if (daError) {
      console.error(`Error fetching DAs for ${councilName}:`, daError);
      continue;
    }

    console.log(`Found ${das?.length || 0} DAs for ${councilName}`);

    let councilMatchesFound = 0;

    // Process each CC
    for (const cc of (ccs || [])) {
      const ccLocation = cc.location;
      if (!ccLocation) {
        console.log(`Skipping CC ${cc.application_number} - no location data`);
        continue;
      }

      let bestMatch = null;
      let bestScore = 0;

      // Find best matching DA
      for (const da of (das || [])) {
        const daLocation = da.location?.[0];
        if (!daLocation) continue;

        const score = calculateLocationMatchScore(ccLocation, daLocation);
        if (score > bestScore && score >= 80) {
          bestScore = score;
          bestMatch = da;
        }
      }

      // If we found a good match, update the CC record
      if (bestMatch) {
        const { error: updateError } = await supabase
          .from('construction_certificates')
          .update({ 
            matched_da_id: bestMatch.id,
            match_confidence: bestScore
          })
          .eq('id', cc.id);

        if (updateError) {
          console.error(`Error updating CC ${cc.application_number}:`, updateError);
        } else {
          councilMatchesFound++;
          totalMatchesFound++;
          console.log(`Matched CC ${cc.application_number} to DA ${bestMatch.planning_portal_application_number} with confidence ${bestScore}%`);
        }
      }
    }

    console.log(`\nCompleted ${councilName}: Found ${councilMatchesFound} matches out of ${ccs?.length || 0} CCs`);
    console.log(`Progress: ${councils.indexOf(councilName) + 1}/${councils.length} councils processed`);
    console.log(`Total matches found so far: ${totalMatchesFound}`);
  }

  // Final summary
  console.log('\n=== Final Summary ===');
  console.log(`Total councils processed: ${councils.length}`);
  console.log(`Total matches found: ${totalMatchesFound}`);
}

// Make sure to export and call the function
findMatchingApplications().catch(console.error); 