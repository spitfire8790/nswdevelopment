-- Drop existing table if it exists
DROP TABLE IF EXISTS development_applications;

-- Create table with exact fields from API specification
CREATE TABLE development_applications (
  id BIGSERIAL PRIMARY KEY,
  
  -- Mandatory Fields (M)
  PlanningPortalApplicationNumber text UNIQUE NOT NULL,
  ApplicationType text NOT NULL,
  ApplicationStatus text NOT NULL,
  ModificationApplicationNumber text NOT NULL,
  CouncilName text NOT NULL,
  DevelopmentType jsonb NOT NULL,
  NumberOfNewDwellings integer NOT NULL,
  CostOfDevelopment numeric NOT NULL,
  LodgementDate timestamp with time zone NOT NULL,
  DeterminationDate timestamp with time zone NOT NULL,
  DeterminationAuthority text NOT NULL,
  DevelopmentSubjectToSICFlag text NOT NULL,
  VariationToDevelopmentStandardsApprovedFlag text NOT NULL,
  
  -- Optional Fields (O)
  NumberOfStoreys integer,
  NumberOfExistingLots integer,
  NumberOfProposedLots integer,
  EPIVariationProposedFlag text,
  AccompaniedByVPAFlag text,
  SubdivisionProposedFlag text,
  
  -- Conditional Mandatory Fields (CM)
  VPAStatus text,
  AssessmentExhibitionStartDate timestamp with time zone,
  AssessmentExhibitionEndDate timestamp with time zone,
  
  -- Location Information
  Location jsonb,
  
  -- Metadata
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
