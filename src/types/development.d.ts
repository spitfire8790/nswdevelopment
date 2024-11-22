interface DevelopmentType {
    DevelopmentType: string;
  }
  
  interface Location {
    FullAddress: string;
    X: string;
    Y: string;
    Lot?: Array<{
      Lot: string;
      PlanLabel: string;
    }>;
    Geometry?: any;
  }
  
  interface DevelopmentResult {
    PlanningPortalApplicationNumber: string;
    ApplicationStatus: string;
    ApplicationType: string;
    CostOfDevelopment: number;
    Location: Location[];
    LodgementDate: string;
    DeterminationDate?: string;
    AssessmentExhibitionStartDate?: string;
    AssessmentExhibitionEndDate?: string;
    DeterminationAuthority?: string;
    DevelopmentType: DevelopmentType[];
    NumberOfNewDwellings?: number;
    NumberOfStoreys?: number;
    AccompaniedByVPAFlag?: boolean;
    DevelopmentSubjectToSICFlag?: boolean;
    EPIVariationProposedFlag?: boolean;
    LotIdString?: string;
  }
  
  interface ChartDataPoint {
    name: string;
    underAssessment: number;
    determined: number;
    onExhibition: number;
    additionalInfoRequested: number;
    pendingLodgement: number;
    rejected: number;
    pendingCourtAppeal: number;
    withdrawn: number;
    deferredCommencement: number;
    value?: number;
  }
  
  interface AreaData {
    [key: string]: number;
  }