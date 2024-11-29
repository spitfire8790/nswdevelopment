-- Update existing table to match API specification exactly
ALTER TABLE development_applications
  -- Ensure core fields exist and are NOT NULL
  ALTER COLUMN PlanningPortalApplicationNumber SET NOT NULL,
  ALTER COLUMN ApplicationType SET NOT NULL,
  ALTER COLUMN ApplicationStatus SET NOT NULL,
  ALTER COLUMN ModificationApplicationNumber DROP NOT NULL,
  ALTER COLUMN CouncilName SET NOT NULL,
  ALTER COLUMN NumberOfNewDwellings SET NOT NULL,
  ALTER COLUMN CostOfDevelopment SET NOT NULL,
  ALTER COLUMN LodgementDate SET NOT NULL,
  ALTER COLUMN DeterminationDate SET NOT NULL,
  ALTER COLUMN DeterminationAuthority SET NOT NULL,
  ALTER COLUMN DevelopmentSubjectToSICFlag SET NOT NULL,
  ALTER COLUMN VariationToDevelopmentStandardsApprovedFlag SET NOT NULL,

  -- Add any missing optional fields
  ADD COLUMN IF NOT EXISTS NumberOfStoreys integer,
  ADD COLUMN IF NOT EXISTS NumberOfExistingLots integer,
  ADD COLUMN IF NOT EXISTS NumberOfProposedLots integer,
  ADD COLUMN IF NOT EXISTS EPIVariationProposedFlag text,
  ADD COLUMN IF NOT EXISTS AccompaniedByVPAFlag text,
  ADD COLUMN IF NOT EXISTS SubdivisionProposedFlag text,
  
  -- Add conditional mandatory fields
  ADD COLUMN IF NOT EXISTS VPAStatus text,
  ADD COLUMN IF NOT EXISTS AssessmentExhibitionStartDate timestamp with time zone,
  ADD COLUMN IF NOT EXISTS AssessmentExhibitionEndDate timestamp with time zone;

-- Ensure complex objects are stored as JSONB
ALTER TABLE development_applications
  ALTER COLUMN DevelopmentType TYPE jsonb USING DevelopmentType::jsonb,
  ALTER COLUMN Location TYPE jsonb USING Location::jsonb;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_da_council_name ON development_applications(CouncilName);
CREATE INDEX IF NOT EXISTS idx_da_lodgement_date ON development_applications(LodgementDate);
CREATE INDEX IF NOT EXISTS idx_da_status ON development_applications(ApplicationStatus);

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
