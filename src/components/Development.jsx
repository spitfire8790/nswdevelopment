import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { councils } from "@/data/councilList";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  MapPin, 
  Loader2, 
  HourglassIcon, 
  CheckCircle2, 
  Eye, 
  Clock, 
  XCircle, 
  AlertCircle, 
  PauseCircle, 
  History, 
  Timer,
  Scale,
  FileQuestion,
  MinusCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { ComposedChart, Line, Scatter } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Papa from 'papaparse';
import AnimatedDevLogo from './AnimatedDevLogo';
import { GeoJSON } from 'react-leaflet';
import { lgamapping } from '../data/lgamapping';

// Create a simple object for development type mapping
const devTypesData = [
  // Residential Types
  { oldtype: 'Dwelling', newtype: 'Dwelling', secondary: '' },
  { oldtype: 'Dwelling house', newtype: 'House', secondary: '' },
  { oldtype: 'Secondary dwelling', newtype: '', secondary: 'X' },
  { oldtype: 'Dual occupancy', newtype: 'Dual occupancy', secondary: '' },
  { oldtype: 'Dual occupancy (attached)', newtype: 'Dual occupancy', secondary: '' },
  { oldtype: 'Dual occupancy (detached)', newtype: 'Dual occupancy', secondary: '' },
  { oldtype: 'Residential flat building', newtype: 'Apartments', secondary: '' },
  { oldtype: 'Multi-dwelling housing', newtype: 'Multi-dwelling housing', secondary: '' },
  { oldtype: 'Multi-dwelling housing (terraces)', newtype: 'Terrace housing', secondary: '' },
  { oldtype: 'Semi-attached dwelling', newtype: 'Semi-attached dwelling', secondary: '' },
  { oldtype: 'Attached dwelling', newtype: 'Attached dwelling', secondary: '' },
  { oldtype: 'Semi-detached dwelling', newtype: 'Semi-detached dwelling', secondary: '' },
  { oldtype: 'Shop top housing', newtype: 'Shop top housing', secondary: '' },
  { oldtype: 'Boarding house', newtype: 'Boarding house', secondary: '' },
  { oldtype: 'Seniors housing', newtype: 'Seniors housing', secondary: '' },
  { oldtype: 'Group homes', newtype: 'Group homes', secondary: '' },
  { oldtype: 'Group home', newtype: 'Group homes', secondary: '' },
  { oldtype: 'Group home (permanent)', newtype: 'Group homes', secondary: '' },
  { oldtype: 'Group home (transitional)', newtype: 'Group homes', secondary: '' },
  { oldtype: 'Build-to-rent', newtype: 'Build-to-rent', secondary: '' },
  { oldtype: 'Co-living', newtype: 'Co-living housing', secondary: '' },
  { oldtype: 'Co-living housing', newtype: 'Co-living housing', secondary: '' },
  { oldtype: 'Manufactured home', newtype: 'Manufactured home', secondary: '' },
  { oldtype: 'Moveable dwelling', newtype: 'Moveable dwelling', secondary: '' },
  { oldtype: 'Rural worker\'s dwelling', newtype: 'Rural worker\'s dwelling', secondary: '' },

  // Alterations and Modifications
  { oldtype: 'Alterations and additions to residential development', newtype: '', secondary: 'X' },
  { oldtype: 'Alterations and additions to commercial development', newtype: '', secondary: 'X' },
  { oldtype: 'Alterations and additions to industrial development', newtype: '', secondary: 'X' },
  { oldtype: 'Alterations or additions to an existing building or structure', newtype: '', secondary: 'X' },
  { oldtype: 'Minor building alterations (external)', newtype: '', secondary: 'X' },
  { oldtype: 'Minor building alterations (internal)', newtype: '', secondary: 'X' },

  // Commercial and Business
  { oldtype: 'Commercial development', newtype: 'Commercial', secondary: '' },
  { oldtype: 'Business premises', newtype: 'Commercial', secondary: '' },
  { oldtype: 'Office premises', newtype: 'Office', secondary: '' },
  { oldtype: 'Office Premise', newtype: 'Office', secondary: '' },
  { oldtype: 'Retail premises', newtype: 'Retail', secondary: '' },
  { oldtype: 'Retail Premise', newtype: 'Retail', secondary: '' },
  { oldtype: 'Specialised Retail Premises', newtype: 'Retail', secondary: '' },
  { oldtype: 'Shop', newtype: 'Shop', secondary: '' },
  { oldtype: 'Neighbourhood shop', newtype: 'Shop', secondary: '' },
  { oldtype: 'Neighbourhood supermarket', newtype: 'Shop', secondary: '' },

  // Food and Beverage
  { oldtype: 'Restaurant or cafe', newtype: 'Food and beverage', secondary: '' },
  { oldtype: 'Food and drink premises', newtype: 'Food and beverage', secondary: '' },
  { oldtype: 'Take-away food and drink premises', newtype: 'Food and beverage', secondary: '' },
  { oldtype: 'Food and drink premise', newtype: 'Food and beverage', secondary: '' },
  { oldtype: 'Take away food and drink', newtype: 'Food and beverage', secondary: '' },
  { oldtype: 'Artisanal food and drink', newtype: 'Food and beverage', secondary: '' },
  { oldtype: 'Artisan food and drink industry', newtype: 'Food and beverage', secondary: '' },
  { oldtype: 'Pub', newtype: 'Pub', secondary: '' },
  { oldtype: 'Small bar', newtype: 'Pub', secondary: '' },

  // Education and Childcare
  { oldtype: 'Educational establishment', newtype: 'Educational establishment', secondary: '' },
  { oldtype: 'Centre based childcare', newtype: 'Childcare', secondary: '' },
  { oldtype: 'Centre-based child care', newtype: 'Childcare', secondary: '' },
  { oldtype: 'School based child care', newtype: 'Childcare', secondary: '' },
  { oldtype: 'School-based child care', newtype: 'Childcare', secondary: '' },
  { oldtype: 'Home based child care', newtype: 'Childcare', secondary: '' },
  { oldtype: 'Early Education and Care Facility', newtype: 'Childcare', secondary: '' },
  { oldtype: 'School', newtype: 'School', secondary: '' },
  { oldtype: 'Out of school hours care', newtype: 'Out of school hours care', secondary: '' },

  // Health and Medical
  { oldtype: 'Health services facilities', newtype: 'Health services', secondary: '' },
  { oldtype: 'Health services facility', newtype: 'Health services', secondary: '' },
  { oldtype: 'Health consulting room', newtype: 'Health services', secondary: '' },
  { oldtype: 'Health Infrastructure', newtype: 'Health Infrastructure', secondary: '' },
  { oldtype: 'Medical centre', newtype: 'Medical centre', secondary: '' },
  { oldtype: 'Hospital', newtype: 'Hospital', secondary: '' },
  { oldtype: 'Community health service facility', newtype: 'Health services', secondary: '' },

  // Recreation and Entertainment
  { oldtype: 'Recreational Uses', newtype: 'Recreation', secondary: '' },
  { oldtype: 'Recreation facility (indoor)', newtype: 'Recreation facility (indoor)', secondary: '' },
  { oldtype: 'Recreation facility (outdoor)', newtype: 'Recreation facility (outdoor)', secondary: '' },
  { oldtype: 'Recreation/Tourist Premise', newtype: 'Recreation/Tourist', secondary: '' },
  { oldtype: 'Recreation area', newtype: 'Recreation', secondary: '' },
  { oldtype: 'Recreation facility (major)', newtype: 'Recreation', secondary: '' },
  { oldtype: 'Entertainment facility', newtype: 'Entertainment facility', secondary: '' },
  { oldtype: 'Function centre', newtype: 'Function centre', secondary: '' },
  { oldtype: 'Tennis courts', newtype: 'Tennis courts', secondary: '' },
  { oldtype: 'Water recreation structure', newtype: 'Recreation', secondary: '' },

  // Tourism and Accommodation
  { oldtype: 'Tourist and visitor accommodation', newtype: 'Tourist and visitor accommodation', secondary: '' },
  { oldtype: 'Hotel or motel accommodation', newtype: 'Hotel', secondary: '' },
  { oldtype: 'Hotel or motel accomodation', newtype: 'Hotel', secondary: '' },
  { oldtype: 'Serviced apartment', newtype: 'Serviced apartment', secondary: '' },
  { oldtype: 'Bed and breakfast accommodation', newtype: 'Bed and breakfast accommodation', secondary: '' },
  { oldtype: 'Backpackers\' accommodation', newtype: 'Backpackers', secondary: '' },
  { oldtype: 'Farm stay accommodation', newtype: 'Farm stay accommodation', secondary: '' },
  { oldtype: 'Eco-tourist facility', newtype: 'Eco-tourist facility', secondary: '' },

  // Industrial and Warehousing
  { oldtype: 'Industrial development', newtype: 'Industrial', secondary: '' },
  { oldtype: 'General industry', newtype: 'General industry', secondary: 'X' },
  { oldtype: 'Light industry', newtype: 'Light industry', secondary: '' },
  { oldtype: 'Heavy industry', newtype: 'Heavy industry', secondary: '' },
  { oldtype: 'Warehouse or distribution centre', newtype: 'Warehouse or distribution centre', secondary: '' },
  { oldtype: 'Local distribution premise', newtype: 'Warehouse or distribution centre', secondary: '' },
  { oldtype: 'Storage premises', newtype: 'Storage', secondary: 'X' },
  { oldtype: 'Self storage units', newtype: 'Storage', secondary: '' },
  { oldtype: 'Data storage premises', newtype: 'Data storage', secondary: '' },
  { oldtype: 'Heavy Industrial Storage Establishment', newtype: 'Industrial storage', secondary: '' },
  { oldtype: 'Hazardous storage establishment', newtype: 'Hazardous storage', secondary: '' },
  { oldtype: 'Hazardous Industry', newtype: 'Hazardous industry', secondary: '' },
  { oldtype: 'Offensive Industry', newtype: 'Hazardous industry', secondary: '' },

  // Transport and Vehicle Related
  { oldtype: 'Car park', newtype: 'Car park', secondary: '' },
  { oldtype: 'Service station', newtype: 'Service station', secondary: '' },
  { oldtype: 'Vehicle repair station', newtype: 'Vehicle repair', secondary: '' },
  { oldtype: 'Vehicle Sales or Hire Premises', newtype: 'Vehicle Sales or Hire Premises', secondary: '' },
  { oldtype: 'Vehicle body repair workshop', newtype: 'Vehicle repair', secondary: '' },
  { oldtype: 'Automotive/truck premises', newtype: 'Automotive/truck premises', secondary: '' },
  { oldtype: 'Truck depot', newtype: 'Depot', secondary: '' },
  { oldtype: 'Transport depot', newtype: 'Depot', secondary: '' },
  { oldtype: 'Transport Infrastructure', newtype: 'Transport infrastructure', secondary: '' },
  { oldtype: 'Passenger transport facility', newtype: 'Passenger transport', secondary: '' },
  { oldtype: 'Highway service centre', newtype: 'Highway service centre', secondary: '' },
  { oldtype: 'Air transport premises', newtype: 'Air transport', secondary: '' },
  { oldtype: 'Air transport facility', newtype: 'Air transport', secondary: '' },
  { oldtype: 'Airport', newtype: 'Airport', secondary: '' },
  { oldtype: 'Helipad', newtype: 'Helipad', secondary: '' },

  // Marine and Water Related
  { oldtype: 'Marina', newtype: 'Marina', secondary: '' },
  { oldtype: 'Marine Premise', newtype: 'Marine Premise', secondary: '' },
  { oldtype: 'Boat launching ramp', newtype: 'Boat ramp', secondary: '' },
  { oldtype: 'Boat building and repair facility', newtype: 'Boat building and repair', secondary: '' },
  { oldtype: 'Boat shed', newtype: 'Boat shed', secondary: 'X' },
  { oldtype: 'Mooring Pen', newtype: 'Mooring', secondary: '' },
  { oldtype: 'Mooring', newtype: 'Mooring', secondary: '' },
  { oldtype: 'Jetty', newtype: 'Jetty', secondary: '' },
  { oldtype: 'Port wharf boating facilities', newtype: 'Boat facilities', secondary: '' },
  { oldtype: 'Wharf or boating facility', newtype: 'Boat facilities', secondary: '' },
  { oldtype: 'Sea walls or training walls', newtype: 'Sea walls', secondary: '' },

  // Infrastructure and Utilities
  { oldtype: 'Infrastructure', newtype: 'Infrastructure', secondary: '' },
  { oldtype: 'Other Infrastructure', newtype: 'Infrastructure', secondary: 'X' },
  { oldtype: 'Telecommunications and communication facilities', newtype: 'Telecommunications facility', secondary: '' },
  { oldtype: 'Telecommunications facility', newtype: 'Telecommunications facility', secondary: '' },
  { oldtype: 'Telecommunications network', newtype: 'Telecommunications network', secondary: '' },
  { oldtype: 'Water Infrastructure', newtype: 'Water infrastructure', secondary: '' },
  { oldtype: 'Water storage facility', newtype: 'Water storage', secondary: '' },
  { oldtype: 'Water supply system', newtype: 'Water supply', secondary: '' },
  { oldtype: 'Water treatment facility', newtype: 'Water treatment', secondary: '' },
  { oldtype: 'Water recycling facility', newtype: 'Water treatment', secondary: '' },
  { oldtype: 'Electricity generating facility (solar and wind)', newtype: 'Electricity generating', secondary: '' },
  { oldtype: 'Electricity generating facility (non-solar or wind)', newtype: 'Electricity generating', secondary: '' },
  { oldtype: 'Facilities for electric vehicles', newtype: 'Electric vehicle facility', secondary: '' },
  { oldtype: 'Electric vehicle facility', newtype: 'Electric vehicle facility', secondary: '' },

  // Subdivision and Land Development
  { oldtype: 'Subdivision of land', newtype: 'Subdivision', secondary: '' },
  { oldtype: 'Subdivision', newtype: 'Subdivision', secondary: '' },
  { oldtype: 'Stratum / community title subdivision', newtype: 'Subdivision', secondary: 'X' },
  { oldtype: 'Earthworks / change in levels', newtype: '', secondary: 'X' },
  { oldtype: 'Earthworks, retaining walls and structural support', newtype: '', secondary: 'X' },

  // Mixed Use and Other Development Types
  { oldtype: 'Mixed use development', newtype: 'Mixed use', secondary: '' },
  { oldtype: 'Creative industry', newtype: 'Creative industry', secondary: '' },
  { oldtype: 'Exhibition home', newtype: 'Exhibition home', secondary: '' },
  { oldtype: 'Exhibition village', newtype: 'Exhibition home', secondary: '' },
  { oldtype: 'Market', newtype: 'Market', secondary: '' },
  { oldtype: 'Animal boarding or training establishment', newtype: 'Animal boarding or training establishment', secondary: '' },
  { oldtype: 'Animal care premises', newtype: 'Animal care', secondary: '' },
  { oldtype: 'Animal shelters', newtype: 'Animal care', secondary: '' },
  { oldtype: 'Veterinary hospital', newtype: 'Veterinary hospital', secondary: '' },
  { oldtype: 'Hardware and building supply', newtype: 'Hardware and building supply', secondary: '' },
  { oldtype: 'Sex services premise', newtype: 'Sex services', secondary: '' },
  { oldtype: 'Sex and Adult Premise', newtype: 'Sex services', secondary: '' },
  { oldtype: 'Restricted premise', newtype: 'Restricted premise', secondary: '' },
  { oldtype: 'Registered club', newtype: 'Registered club', secondary: '' },

  // Home Business and Occupation
  { oldtype: 'Home business', newtype: 'Home business', secondary: '' },
  { oldtype: 'Home occupation', newtype: 'Home occupation', secondary: '' },
  { oldtype: 'Home industry', newtype: 'Home industry', secondary: '' },

  // Secondary Structures and Modifications
  { oldtype: 'Shed', newtype: '', secondary: 'X' },
  { oldtype: 'Shipping containers', newtype: '', secondary: 'X' },
  { oldtype: 'Swimming pool', newtype: '', secondary: 'X' },
  { oldtype: 'Swimming pools', newtype: '', secondary: 'X' },
  { oldtype: 'Portable swimming pools and spas and child-resistant barriers', newtype: '', secondary: 'X' },
  { oldtype: 'Fences', newtype: '', secondary: 'X' },
  { oldtype: 'Access ramp', newtype: '', secondary: 'X' },
  { oldtype: 'Stairway', newtype: '', secondary: 'X' },
  { oldtype: 'Privacy screens', newtype: '', secondary: 'X' },
  { oldtype: 'Carport', newtype: '', secondary: 'X' },
  { oldtype: 'Garage, carport or carparking space', newtype: '', secondary: 'X' },
  { oldtype: 'Garages, carports and car parking spaces', newtype: '', secondary: 'X' },
  { oldtype: 'Balcony, deck, patio, terrace or verandah', newtype: '', secondary: 'X' },
  { oldtype: 'Balconies, decks, patios, terraces or verandahs', newtype: '', secondary: 'X' },
  { oldtype: 'Balcony, deck, patio, terrace or verandah (screened enclosures)', newtype: '', secondary: 'X' },
  { oldtype: 'Retaining walls, protection of trees', newtype: '', secondary: 'X' },

  // Miscellaneous and Administrative
  { oldtype: 'Other', newtype: '', secondary: 'X' },
  { oldtype: 'Change of use', newtype: '', secondary: 'X' },
  { oldtype: 'Change of use of land or a building or the classification of a building under the Building Code of Australia', newtype: '', secondary: 'X' },
  { oldtype: 'Erection of a new structure', newtype: '', secondary: 'X' },
  { oldtype: 'Demolition', newtype: '', secondary: 'X' },
  { oldtype: 'Temporary structure', newtype: '', secondary: 'X' },
  { oldtype: 'Temporary building, structure or use', newtype: '', secondary: 'X' },
  { oldtype: 'Hours of operation and trading', newtype: '', secondary: 'X' },
  { oldtype: 'Supporting Development', newtype: '', secondary: 'X' },
  { oldtype: 'Signage', newtype: '', secondary: 'X' },
  { oldtype: 'Advertising and signage', newtype: '', secondary: 'X' },
  { oldtype: 'Advertising structure', newtype: '', secondary: 'X' },
  { oldtype: 'Business identification sign', newtype: '', secondary: 'X' },
  { oldtype: 'Building identification sign', newtype: '', secondary: 'X' },
  { oldtype: 'Entertainment associated with existing premises', newtype: '', secondary: 'X' },
  { oldtype: 'Emergency work and repairs', newtype: '', secondary: 'X' },
  { oldtype: 'Maintenance of buildings in draft heritage conservation areas', newtype: '', secondary: 'X' },
  { oldtype: 'Temporary installation following natural disaster', newtype: '', secondary: 'X' }
];

// Create a mapping of development types outside the component for better performance
const typeMap = new Map(
  devTypesData.map(row => [
    row.oldtype, 
    { 
      newtype: row.newtype || row.oldtype, // If newtype is blank, use oldtype
      secondary: row.secondary === 'X'  // True if secondary column contains 'X'
    }
  ])
);

/**
 * Get default date range (12 months ago to today)
 * @returns {Object} Object containing from and to dates in YYYY-MM-DD format
 */
const getDefaultDateRange = () => {
  const today = new Date();
  const twelveMonthsAgo = new Date(today);
  twelveMonthsAgo.setMonth(today.getMonth() - 12);
  
  return {
    from: twelveMonthsAgo.toISOString().split('T')[0],
    to: today.toISOString().split('T')[0]
  };
};

/**
 * Format date string to YYYY-MM-DD
 * @param {string} dateString - Date string to format
 * @returns {string|undefined} Formatted date string or undefined if input is invalid
 */
const formatDate = (dateString) => {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString().split('T')[0];
};

// Added this new function for button variants
const getButtonVariant = (set, value) => {
  return set.has(value) ? "default" : "outline";
};

/**
 * Helper function to clean development types
 * @param {Array} developmentTypes - Array of development type objects
 * @returns {string} Cleaned development type
 */
const cleanDevelopmentType = (developmentTypes) => {
  if (!developmentTypes || !developmentTypes.length) return 'N/A';

  // First try to find a non-secondary type
  const primaryType = developmentTypes
    .find(dt => {
      const mapping = typeMap.get(dt.DevelopmentType);
      return mapping && !mapping.secondary;
    });

  if (primaryType) {
    const mapping = typeMap.get(primaryType.DevelopmentType);
    return mapping.newtype;
  }

  // If no primary type found, use the first mapped type (even if secondary)
  const firstMappedType = developmentTypes
    .find(dt => typeMap.has(dt.DevelopmentType));

  if (firstMappedType) {
    const mapping = typeMap.get(firstMappedType.DevelopmentType);
    return mapping.newtype;
  }

  // Fallback to first type if no mapping found
  return developmentTypes[0].DevelopmentType;
};

/**
 * Helper function to create a unique key for each development
 * @param {Object} result - Development application result
 * @returns {string} Unique key
 */
const createDevelopmentKey = (result) => {
  const address = result.Location?.[0]?.FullAddress || '';
  const applicationType = result.ApplicationType;
  return `${address}-${applicationType}`;
};

/**
 * Process and deduplicate results
 * @param {Array} results - Array of development applications
 * @returns {Array} Deduplicated results
 */
const processResults = (results) => {
  const uniqueDevelopments = new Map();

  results.forEach(result => {
    const key = createDevelopmentKey(result);
    
    // If we haven't seen this development before, or if this is a newer version
    if (!uniqueDevelopments.has(key) || 
        new Date(result.LodgementDate) > new Date(uniqueDevelopments.get(key).LodgementDate)) {
      uniqueDevelopments.set(key, result);
    }
  });

  return Array.from(uniqueDevelopments.values());
};

// Add this helper function near the top with other helper functions
const createFeature = (geometry, result) => ({
  type: "Feature",
  geometry,
  properties: {
    id: result.PlanningPortalApplicationNumber,
    status: result.ApplicationStatus,
    type: result.ApplicationType,
    cost: result.CostOfDevelopment,
    address: result.Location?.[0]?.FullAddress,
    lodgementDate: result.LodgementDate,
    determinationDate: result.DeterminationDate,
    assessmentExhibitionStartDate: result.AssessmentExhibitionStartDate,
    assessmentExhibitionEndDate: result.AssessmentExhibitionEndDate,
    determinationAuthority: result.DeterminationAuthority,
    developmentCategory: result.DevelopmentType?.map(dt => dt.DevelopmentType).join(", "),
    numberOfNewDwellings: result.NumberOfNewDwellings,
    numberOfStoreys: result.NumberOfStoreys,
    accompaniedByVPA: result.AccompaniedByVPAFlag,
    developmentSubjectToSICAct: result.DevelopmentSubjectToSICFlag,
    EPIVariationProposed: result.EPIVariationProposedFlag,
    lots: result.Location?.[0]?.Lot?.map(lot => 
      `${lot.Lot}//${lot.PlanLabel}`
    ),
    lotIdString: result.LotIdString
  }
});

// Add this helper function to check if a development type is residential
const isResidentialType = (type) => {
  // Find the first matching entry in devTypesData
  const typeEntry = devTypesData.find(entry => 
    entry.oldtype === type || entry.newtype === type
  );
  
  // Check if it's in the residential section (first 25 entries based on current data structure)
  return typeEntry && devTypesData.indexOf(typeEntry) < 25;
};

/**
 * Development component for querying the Development Application (DA) API
 * Provides a user interface to search for DAs across NSW councils
 */
const Development = () => {
  const defaultDates = getDefaultDateRange();

  // State for form inputs
  const [council, setCouncil] = useState("");
  const [costFrom, setCostFrom] = useState("0");
  const [costTo, setCostTo] = useState("10000000");
  const [selectedCategories, setSelectedCategories] = useState(new Set(["Select All"]));
  const [selectedTypes, setSelectedTypes] = useState(new Set(["Select All"]));
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(["Select All"]));
  const [lodgementDateFrom, setLodgementDateFrom] = useState(defaultDates.from);
  const [lodgementDateTo, setLodgementDateTo] = useState(defaultDates.to);
  const [determinationDateFrom, setDeterminationDateFrom] = useState("");
  const [determinationDateTo, setDeterminationDateTo] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isQueryVisible, setIsQueryVisible] = useState(true);
  const [isLayerLoading, setIsLayerLoading] = useState(false);
  const [columnWidths, setColumnWidths] = useState({
    address: 300,
    lots: 150,
    type: 100,
    development: 200,
    status: 150,
    lodged: 120,
    days: 80,
    cost: 120
  });

  // Add this state for storing area data
  const [areaData, setAreaData] = useState({});

  // Add this state for storing map features
  const [mapFeatures, setMapFeatures] = useState({});

  // Add new state to track which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Add this state for storing council boundary
  const [councilBoundary, setCouncilBoundary] = useState(null);

  // Add near your other state declarations
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const dividerRef = useRef(null);

  // Add this function to calculate area from geometry
  const calculateAreaFromGeometry = async (result) => {
    try {
      const response = await rpc.invoke("geometry/area", {
        geometry: result.Location?.[0]?.Geometry
      });
      
      return response?.area;
    } catch (error) {
      console.error('Error calculating area:', error);
      return null;
    }
  };

  const fetchPage = async (pageNumber, filters) => {
    try {
      const formattedCouncilName = filters.CouncilName ? 
        filters.CouncilName === "City of Sydney" ? 
          "COUNCIL OF THE CITY OF SYDNEY" : 
          `${filters.CouncilName.toUpperCase()} COUNCIL` 
        : undefined;

      const apiFilters = {
        CouncilName: formattedCouncilName ? [formattedCouncilName] : undefined,
        ApplicationType: filters.ApplicationType,
        DevelopmentCategory: filters.DevelopmentCategory,
        ApplicationStatus: filters.ApplicationStatus,
        CostOfDevelopmentFrom: filters.CostOfDevelopmentFrom,
        CostOfDevelopmentTo: filters.CostOfDevelopmentTo,
        LodgementDateFrom: filters.LodgementDateFrom,
        LodgementDateTo: filters.LodgementDateTo,
        DeterminationDateFrom: filters.DeterminationDateFrom,
        DeterminationDateTo: filters.DeterminationDateTo,
        ApplicationLastUpdatedFrom: "2019-02-01"
      };

      const baseUrl = '/api/eplanning';
      const url = `${baseUrl}/data/v0/OnlineDA`;

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'filters': JSON.stringify({ filters: apiFilters })
      };

      console.log('Making request:', { url, headers });

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Raw Response:', response);
        console.error('Detailed Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: response.headers,
          url: response.url
        });
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw new Error(`Failed to fetch development applications: ${error.message}`);
    }
  };

  // Use the helper functions in your useMemo hooks
  const sortedResults = useMemo(() => {
    if (!searchResults) return [];
    const uniqueResults = processResults(searchResults);
    return uniqueResults.sort((a, b) => 
      new Date(b.LodgementDate) - new Date(a.LodgementDate)
    );
  }, [searchResults]);

  // Add this helper function to calculate median
  const calculateMedian = (values) => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  };

  // Add these helper functions for calculating statistics
  const calculateStats = (values) => {
    if (values.length === 0) return null;
    const sorted = [...values].sort((a, b) => a - b);
    
    // Calculate quartiles
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    return {
      min: sorted[0],
      q1: sorted[q1Index],
      median: calculateMedian(sorted),
      q3: sorted[q3Index],
      max: sorted[sorted.length - 1]
    };
  };

  // Modify the chartData processing to support grouping
  const chartData = useMemo(() => {
    if (!searchResults) return { 
      byType: [], 
      totalValue: [], 
      averageCost: [], 
      averageDays: [], 
      costPerDwelling: [] 
    };

    const uniqueResults = processResults(searchResults);
    
    // First aggregate all data as before
    const detailedData = uniqueResults.reduce((acc, curr) => {
      const type = cleanDevelopmentType(curr.DevelopmentType);
      if (!acc[type]) {
        acc[type] = {
          name: type,
          underAssessment: 0,
          determined: 0,
          onExhibition: 0,
          additionalInfoRequested: 0,
          pendingLodgement: 0,
          rejected: 0,
          pendingCourtAppeal: 0,
          withdrawn: 0,
          deferredCommencement: 0,
          totalCost: 0,
          count: 0,
          determinedCount: 0,
          determinedDays: 0
        };
      }

      // Update counts based on status
      const status = curr.ApplicationStatus?.toLowerCase().replace(/\s+/g, '');
      if (status) {
        switch(status) {
          case 'underassessment': acc[type].underAssessment++; break;
          case 'determined': acc[type].determined++; break;
          case 'onexhibition': acc[type].onExhibition++; break;
          case 'additionalinformationrequested': acc[type].additionalInfoRequested++; break;
          case 'pendinglodgement': acc[type].pendingLodgement++; break;
          case 'rejected': acc[type].rejected++; break;
          case 'pendingcourtappeal': acc[type].pendingCourtAppeal++; break;
          case 'withdrawn': acc[type].withdrawn++; break;
          case 'deferredcommencement': acc[type].deferredCommencement++; break;
        }
      }
  
      // Update value tracking
      acc[type].totalCost += curr.CostOfDevelopment || 0;
      acc[type].count++;
  
      // Only track days for determined applications
      if (curr.ApplicationStatus === 'Determined' && curr.DeterminationDate) {
        acc[type].determinedCount++;
        acc[type].determinedDays += Math.floor(
          (new Date(curr.DeterminationDate) - new Date(curr.LodgementDate)) / (1000 * 60 * 60 * 24)
        );
      }
  
      return acc;
    }, {});
  
    // Calculate total value across all types
    const totalValueSum = Object.values(detailedData)
      .reduce((sum, data) => sum + data.totalCost, 0) / 1000000; // Convert to millions
  
    // Convert aggregated data into chart formats
    const totalValue = Object.entries(detailedData)
      .map(([type, data]) => ({
        name: type,
        value: data.totalCost / 1000000 // Convert to millions
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  
    const averageDays = Object.entries(detailedData)
      .filter(([_, data]) => data.determinedCount > 0) // Only include types with determined applications
      .map(([type, data]) => ({
        name: type,
        value: Math.round(data.determinedDays / data.determinedCount)
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  
    // Process dwelling data for average cost per dwelling
    const dwellingData = uniqueResults.reduce((acc, curr) => {
      if (curr.NumberOfNewDwellings > 0 && 
          curr.CostOfDevelopment > 0 && 
          curr.DevelopmentType?.some(dt => isResidentialType(dt.DevelopmentType))) {
        
        const type = cleanDevelopmentType(curr.DevelopmentType);
        
        if (!acc[type]) {
          acc[type] = {
            name: type,
            totalCost: 0,
            dwellingCount: 0
          };
        }
        
        acc[type].totalCost += curr.CostOfDevelopment;
        acc[type].dwellingCount += curr.NumberOfNewDwellings;
      }
      return acc;
    }, {});
  
    const costPerDwelling = Object.entries(dwellingData)
      .map(([type, data]) => ({
        name: type,
        value: (data.totalCost / data.dwellingCount) / 1000000 // Convert to millions
      }))
      .filter(item => dwellingData[item.name].dwellingCount >= 3) // Only show types with at least 3 developments
      .sort((a, b) => b.value - a.value);
  
    return {
      byType: Object.values(detailedData),
      totalValue,
      totalValueSum: totalValueSum.toFixed(1),
      averageCost: Object.entries(detailedData).map(([type, data]) => ({
        name: type,
        value: (data.totalCost / data.count) / 1000000
      })),
      averageDays,
      costPerDwelling
    };
  }, [searchResults]);

  // Add these click handlers
  const handleCategoryClick = (category) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (category === "Select All") {
        return new Set(["Select All"]);
      }
      newSet.delete("Select All");
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      if (newSet.size === 0) {
        return new Set(["Select All"]);
      }
      return newSet;
    });
  };

  const handleTypeClick = (type) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (type === "Select All") {
        return new Set(["Select All"]);
      }
      newSet.delete("Select All");
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      if (newSet.size === 0) {
        return new Set(["Select All"]);
      }
      return newSet;
    });
  };

  const handleStatusClick = (status) => {
    setSelectedStatuses(prev => {
      const newSet = new Set(prev);
      if (status === "Select All") {
        return new Set(["Select All"]);
      }
      newSet.delete("Select All");
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      if (newSet.size === 0) {
        return new Set(["Select All"]);
      }
      return newSet;
    });
  };

  // Modify your search function to prepare map data during initial query
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearchResults(null);
    setAreaData({});
    setCouncilBoundary(null);

    try {
      // Fetch council boundary first
      if (council) {
        const geoJsonBoundary = await fetchCouncilBoundary(council);
        if (geoJsonBoundary) {
          console.log('Setting council boundary:', geoJsonBoundary);
          setCouncilBoundary(geoJsonBoundary);
        }
      }

      const filters = {
        CouncilName: council || undefined,
        ApplicationType: selectedTypes.has("Select All") ? undefined : Array.from(selectedTypes),
        DevelopmentCategory: selectedCategories.has("Select All") ? undefined : Array.from(selectedCategories),
        ApplicationStatus: selectedStatuses.has("Select All") ? undefined : Array.from(selectedStatuses),
        CostOfDevelopmentFrom: costFrom ? parseInt(costFrom) : undefined,
        CostOfDevelopmentTo: costTo ? parseInt(costTo) : undefined,
        LodgementDateFrom: formatDate(lodgementDateFrom),
        LodgementDateTo: formatDate(lodgementDateTo),
        DeterminationDateFrom: formatDate(determinationDateFrom),
        DeterminationDateTo: formatDate(determinationDateTo)
      };

      // Add retry logic
      let retries = 3;
      while (retries > 0) {
        try {
          const firstPage = await fetchPage(1, filters);
          let allResults = firstPage.Application || [];
          
          if (firstPage.TotalPages > 1) {
            console.log(`Fetching remaining ${firstPage.TotalPages - 1} pages...`);
            const pagePromises = [];
            for (let page = 2; page <= firstPage.TotalPages; page++) {
              pagePromises.push(fetchPage(page, filters));
            }

            const remainingPages = await Promise.all(pagePromises);
            remainingPages.forEach(page => {
              if (page.Application) {
                allResults = [...allResults, ...page.Application];
              }
            });
          }
          
          setSearchResults(allResults);
          break; // Success, exit retry loop
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between retries
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to fetch development applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResize = (column, width) => {
    setColumnWidths(prev => ({
      ...prev,
      [column]: width
    }));
  };

  const ResizableColumn = ({ children, width, onResize }) => {
    const [isResizing, setIsResizing] = useState(false);
    const startX = useRef(0);
    const startWidth = useRef(0);

    const handleMouseDown = (e) => {
      setIsResizing(true);
      startX.current = e.pageX;
      startWidth.current = width;
    };

    useEffect(() => {
      const handleMouseMove = (e) => {
        if (!isResizing) return;
        const diff = e.pageX - startX.current;
        onResize(Math.max(50, startWidth.current + diff));
      };

      const handleMouseUp = () => {
        setIsResizing(false);
      };

      if (isResizing) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isResizing, onResize]);

    return (
      <th 
        className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
        style={{ width }}
      >
        {children}
        <div
          className="absolute right-0 top-0 h-full w-4 cursor-col-resize hover:bg-gray-200"
          onMouseDown={handleMouseDown}
        />
      </th>
    );
  };

  // Replace the existing handleAddToMap function with this new version
  const handleAddToMap = async () => {
    if (!searchResults?.length) return;

    setIsLayerLoading(true);
    try {
      const features = await Promise.all(searchResults.map(async result => {
        // First try to get lot polygon if lotidstring exists
        if (result.LotIdString && result.LotIdString !== "N/A") {
          const lotQuery = `${encodeURIComponent(result.LotIdString)}`;
          const url = new URL('https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Land_Parcel_Property_Theme/FeatureServer/8/query');
          url.searchParams.append('where', `lotidstring='${lotQuery}'`);
          url.searchParams.append('outFields', '*');
          url.searchParams.append('returnGeometry', 'true');
          url.searchParams.append('outSR', '4326');
          url.searchParams.append('f', 'json');

          const response = await fetch(url);
          
          if (response.ok) {
            const lotData = await response.json();
            if (lotData.features?.[0]?.geometry?.rings) {
              return createFeature({
                type: "Polygon",
                coordinates: lotData.features[0].geometry.rings
              }, result);
            }
          }
        }

        // Fallback to property lookup using coordinates
        const coords = [
          parseFloat(result.Location[0].X),
          parseFloat(result.Location[0].Y)
        ];

        try {
          const url = new URL('https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Land_Parcel_Property_Theme/FeatureServer/12/query');
          url.searchParams.append('geometry', `${coords[0]},${coords[1]}`);
          url.searchParams.append('geometryType', 'esriGeometryPoint');
          url.searchParams.append('inSR', '4326');
          url.searchParams.append('spatialRel', 'esriSpatialRelIntersects');
          url.searchParams.append('outFields', '*');
          url.searchParams.append('returnGeometry', 'true');
          url.searchParams.append('outSR', '4326');
          url.searchParams.append('f', 'json');

          const propertyResponse = await fetch(url);

          if (propertyResponse.ok) {
            const propertyData = await propertyResponse.json();
            if (propertyData.features?.[0]?.geometry?.rings) {
              return createFeature({
                type: "Polygon",
                coordinates: propertyData.features[0].geometry.rings
              }, result);
            }
          }
        } catch (error) {
          console.error('Error fetching property boundary:', error);
        }

        // If both methods fail, fall back to point geometry
        return createFeature({
          type: "Point",
          coordinates: coords
        }, result);
      }));

      const geojsonData = {
        type: "FeatureCollection",
        features: features.filter(Boolean)
      };
      
      setMapFeatures(geojsonData);
    } catch (error) {
      console.error('Error processing features:', error);
    } finally {
      setIsLayerLoading(false);
    }
  };

  const getBounds = (results) => {
    if (!results || results.length === 0) {
      // Default bounds for Sydney region (wider view)
      return [
        [-34.2, 150.5], // Southwest corner
        [-33.4, 151.7]  // Northeast corner
      ];
    }

    const coordinates = results
      .filter(result => result.Location?.[0]?.X && result.Location?.[0]?.Y)
      .map(result => [
        parseFloat(result.Location[0].Y),
        parseFloat(result.Location[0].X)
      ]);

    if (coordinates.length === 0) {
      return [
        [-34.2, 150.5],
        [-33.4, 151.7]
      ];
    }

    const latitudes = coordinates.map(coord => coord[0]);
    const longitudes = coordinates.map(coord => coord[1]);

    const padding = 0.1;
    return [
      [Math.min(...latitudes) - padding, Math.min(...longitudes) - padding],
      [Math.max(...latitudes) + padding, Math.max(...longitudes) + padding]
    ];
  };

  const handleCSVDownload = () => {
    if (!searchResults) return;
    
    const csvContent = searchResults.map(result => ({
      Address: result.Location?.[0]?.FullAddress || 'N/A',
      Lots: result.Location?.[0]?.Lot?.map(lot => 
        `${lot.Lot}//${lot.PlanLabel}`).join(', ') || 'N/A',
      Type: result.ApplicationType,
      Development: cleanDevelopmentType(result.DevelopmentType),
      Status: result.ApplicationStatus,
      Lodged: format(new Date(result.LodgementDate), 'dd/MM/yyyy'),
      Days: Math.floor((new Date(result.DeterminationDate || new Date()) - 
        new Date(result.LodgementDate)) / (1000 * 60 * 60 * 24)),
      Cost: result.CostOfDevelopment
    }));

    const csv = Papa.unparse(csvContent);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'development_applications.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleGeoJSONDownload = () => {
    if (!searchResults) return;
    
    const geojson = {
      type: "FeatureCollection",
      features: searchResults.map(result => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            parseFloat(result.Location?.[0]?.X) || 151.2093,
            parseFloat(result.Location?.[0]?.Y) || -33.8688
          ]
        },
        properties: {
          address: result.Location?.[0]?.FullAddress,
          type: result.ApplicationType,
          development: cleanDevelopmentType(result.DevelopmentType),
          status: result.ApplicationStatus,
          lodged: result.LodgementDate,
          cost: result.CostOfDevelopment
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson)], { type: 'application/geo+json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'development_applications.geojson';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCouncilBoundary(null); // Reset boundary
    
    try {
      // First fetch the council boundary
      if (council) {
        console.log('Fetching council boundary for:', council);
        const boundary = await fetchCouncilBoundary(council);
        if (boundary) {
          console.log('Setting council boundary:', boundary);
          setCouncilBoundary(boundary);
        }
      }

      // Then fetch development applications
      const results = await fetchDevelopmentApplications();
      setSearchResults(processResults(results));
    } catch (error) {
      console.error('Search error:', error);
      setError(
        error.message.includes('timeout') 
          ? 'The search request timed out. Please try again or reduce your search criteria.'
          : 'Failed to fetch development applications. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };


const fetchCouncilBoundary = async (councilName) => {
  if (!councilName) return null;
  console.log('Fetching boundary for council:', councilName);

  const mappedName = lgaMapping[councilName];
  if (!mappedName) {
    console.log('No LGA mapping found for council:', councilName);
    return null;
  }

  const baseUrl = 'https://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Administrative_Boundaries/MapServer/1/query';
  const params = new URLSearchParams({
    where: `LGANAME='${mappedName}'`,
    outFields: '*',
    returnGeometry: 'true',
    geometryType: 'esriGeometryPolygon',
    spatialRel: 'esriSpatialRelIntersects',
    outSR: '4326',
    f: 'json'
  });

  try {
    const url = `${baseUrl}?${params}`;
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch council boundary');
    
    const data = await response.json();
    console.log('Council boundary response:', data);

    if (data.features?.length > 0) {
      const feature = data.features[0];
      // Transform ArcGIS geometry to GeoJSON format
      return {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: feature.geometry.rings
        },
        properties: feature.attributes || {}
      };
    }
    console.log('No boundary found for council');
    return null;
  } catch (error) {
    console.error('Error fetching council boundary:', error);
    return null;
  }
};

  const VerticalDivider = ({ onResize }) => {
    const handleMouseDown = (e) => {
      e.preventDefault();
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
      const containerWidth = document.body.clientWidth;
      const percentage = (e.clientX / containerWidth) * 100;
      // Limit the panel width between 20% and 80%
      const clampedPercentage = Math.min(Math.max(percentage, 20), 80);
      onResize(clampedPercentage);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    return (
      <div
        className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize active:bg-blue-600 transition-colors"
        onMouseDown={handleMouseDown}
      />
    );
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dividerRef.current?.dragging) {
        e.preventDefault();
        document.body.style.userSelect = 'none';
      }
    };

    const handleMouseUp = () => {
      if (dividerRef.current?.dragging) {
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <AnimatedDevLogo />
            <h1 className="text-xl font-semibold text-gray-900">NSW Development Applications</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-row h-full">
        {/* Left Panel */}
        <div style={{ width: `${leftPanelWidth}%` }} className="overflow-auto">
          {/* Existing search form and results content */}
          {isQueryVisible && (
            <form onSubmit={handleSearch} className="space-y-6 mb-6">
              <div>
                <label className="font-medium">Council Name</label>
                <div className="mt-1">
                  <Combobox
                    options={councils}
                    value={council}
                    onChange={setCouncil}
                    placeholder="Select a council"
                    emptyText="No matching councils found"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium">Development Category</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedCategories, "Select All")}
                    onClick={() => handleCategoryClick("Select All")}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedCategories, "Residential")}
                    onClick={() => handleCategoryClick("Residential")}
                    className="gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Residential
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedCategories, "Commercial")}
                    onClick={() => handleCategoryClick("Commercial")}
                    className="gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5z" clipRule="evenodd" />
                    </svg>
                    Commercial
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedCategories, "Industrial")}
                    onClick={() => handleCategoryClick("Industrial")}
                    className="gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    Industrial
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedCategories, "Recreational")}
                    onClick={() => handleCategoryClick("Recreational")}
                    className="gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Recreational
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedCategories, "Other")}
                    onClick={() => handleCategoryClick("Other")}
                    className="gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Other
                  </Button>
                </div>
              </div>

              <div>
                <label className="font-medium">Application Type</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedTypes, "Select All")}
                    onClick={() => handleTypeClick("Select All")}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedTypes, "Development Application")}
                    onClick={() => handleTypeClick("Development Application")}
                  >
                    Development Application
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedTypes, "Modification Application")}
                    onClick={() => handleTypeClick("Modification Application")}
                  >
                    Modification Application
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedTypes, "Review of Determination")}
                    onClick={() => handleTypeClick("Review of Determination")}
                  >
                    Review of Determination
                  </Button>
                </div>
              </div>

              <div>
                <label className="font-medium">Application Status</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedStatuses, "Select All")}
                    onClick={() => handleStatusClick("Select All")}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedStatuses, "Under Assessment")}
                    onClick={() => handleStatusClick("Under Assessment")}
                    className="gap-2"
                  >
                    <HourglassIcon className="h-4 w-4" />
                    Under Assessment
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedStatuses, "Determined")}
                    onClick={() => handleStatusClick("Determined")}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Determined
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedStatuses, "On Exhibition")}
                    onClick={() => handleStatusClick("On Exhibition")}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    On Exhibition
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedStatuses, "Additional Information Requested")}
                    onClick={() => handleStatusClick("Additional Information Requested")}
                    className="gap-2"
                  >
                    <FileQuestion className="h-4 w-4" />
                    Additional Information Requested
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedStatuses, "Pending Lodgement")}
                    onClick={() => handleStatusClick("Pending Lodgement")}
                    className="gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Pending Lodgement
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedStatuses, "Rejected")}
                    onClick={() => handleStatusClick("Rejected")}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Rejected
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedStatuses, "Pending Court Appeal")}
                    onClick={() => handleStatusClick("Pending Court Appeal")}
                    className="gap-2"
                  >
                    <Scale className="h-4 w-4" />
                    Pending Court Appeal
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedStatuses, "Withdrawn")}
                    onClick={() => handleStatusClick("Withdrawn")}
                    className="gap-2"
                  >
                    <MinusCircle className="h-4 w-4" />
                    Withdrawn
                  </Button>
                  <Button
                    type="button"
                    variant={getButtonVariant(selectedStatuses, "Deferred Commencement")}
                    onClick={() => handleStatusClick("Deferred Commencement")}
                    className="gap-2"
                  >
                    <PauseCircle className="h-4 w-4" />
                    Deferred Commencement
                  </Button>
                </div>
              </div>

              <div>
                <label className="font-medium">Cost of Development ($ millions)</label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">From:</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                        $
                      </span>
                      <Input
                        type="text"
                        value={(Number(costFrom) / 1000000).toFixed(1)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setCostFrom(Math.round(parseFloat(value) * 1000000));
                        }}
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-gray-600">To:</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                        $
                      </span>
                      <Input
                        type="text"
                        value={(Number(costTo) / 1000000).toFixed(1)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setCostTo(Math.round(parseFloat(value) * 1000000));
                        }}
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="font-medium">Lodgement Date From</label>
                  <Input
                    type="date"
                    value={lodgementDateFrom}
                    onChange={(e) => setLodgementDateFrom(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="font-medium">Lodgement Date To</label>
                  <Input
                    type="date"
                    value={lodgementDateTo}
                    onChange={(e) => setLodgementDateTo(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="font-medium">Determination Date From (optional)</label>
                  <Input
                    type="date"
                    value={determinationDateFrom}
                    onChange={(e) => setDeterminationDateFrom(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="font-medium">Determination Date To (optional)</label>
                  <Input
                    type="date"
                    value={determinationDateTo}
                    onChange={(e) => setDeterminationDateTo(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex items-center gap-2" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleCSVDownload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Download CSV
                </Button>
                <Button
                  type="button"
                  onClick={handleGeoJSONDownload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Download GeoJSON
                </Button>
              </div>

              {searchResults && searchResults.length > 0 && (
                <div className="mb-4 relative">


                  {isLayerLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="font-medium">Building layer...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}

          {/* Results */}
          {!loading && searchResults && (
            <>
              <Card className="p-4 mt-6">
                <h3 className="text-lg font-semibold mb-4">Applications by Development Type</h3>
                <div className="h-[600px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData.byType}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 150
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        interval={0}
                        tick={{ fontSize: 14 }}
                        tickFormatter={(value) => {
                          return value.length > 40 ? value.substring(0, 20) + '...' : value;
                        }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend 
                        verticalAlign="bottom"
                        align="center"
                        height={36}
                        wrapperStyle={{ 
                          bottom: 20,
                          left: 25,
                          width: '95%'
                        }}
                        formatter={(value) => {
                          const icons = {
                            "Under Assessment": <HourglassIcon className="w-4 h-4 inline mr-1" />,
                            "Determined": <CheckCircle2 className="w-4 h-4 inline mr-1" />,
                            "On Exhibition": <Eye className="w-4 h-4 inline mr-1" />,
                            "Additional Info Requested": <FileQuestion className="w-4 h-4 inline mr-1" />,
                            "Pending Lodgement": <Clock className="w-4 h-4 inline mr-1" />,
                            "Rejected": <XCircle className="w-4 h-4 inline mr-1" />,
                            "Pending Court Appeal": <Scale className="w-4 h-4 inline mr-1" />,
                            "Withdrawn": <MinusCircle className="w-4 h-4 inline mr-1" />,
                            "Deferred Commencement": <PauseCircle className="w-4 h-4 inline mr-1" />
                          };
                          return <span>{icons[value]}{value}</span>;
                        }}
                      />
                      <Bar name="Under Assessment" dataKey="underAssessment" stackId="status" fill="#ffa07a" />
                      <Bar name="Determined" dataKey="determined" stackId="status" fill="#90ee90" />
                      <Bar name="On Exhibition" dataKey="onExhibition" stackId="status" fill="#87cefa" />
                      <Bar name="Additional Info Requested" dataKey="additionalInfoRequested" stackId="status" fill="#dda0dd" />
                      <Bar name="Pending Lodgement" dataKey="pendingLodgement" stackId="status" fill="#b8c2cc" />
                      <Bar name="Rejected" dataKey="rejected" stackId="status" fill="#ffb6c1" />
                      <Bar name="Pending Court Appeal" dataKey="pendingCourtAppeal" stackId="status" fill="#f0e68c" />
                      <Bar name="Withdrawn" dataKey="withdrawn" stackId="status" fill="#d3d3d3" />
                      <Bar name="Deferred Commencement" dataKey="deferredCommencement" stackId="status" fill="#98fb98" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-4 mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Total Value by Development Type - Total ${chartData.totalValueSum} million
                </h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.totalValue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 14 }} />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(1)}M`} />
                        <Bar dataKey="value" fill="#60a5fa" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-4 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Average Cost by Development Type ($ millions)</h3>
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={chartData.averageCost}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 14 }} />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toFixed(1)}M`} />
                        <Bar dataKey="value" fill="#34d399" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-4 mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Average Days to Determination by Development Type
                  </h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.averageDays}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 14 }} />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value} days`} />
                        <Bar dataKey="value" fill="#f472b6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-4 mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Average Cost per Dwelling by Development Type ($ millions)
                  </h3>
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart 
                        data={chartData.costPerDwelling}
                        margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100} 
                          interval={0} 
                          tick={{ fontSize: 14 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${value.toFixed(1)}M`}
                        />
                        <Tooltip 
                          formatter={(value) => `$${value.toFixed(1)}M`}
                          labelFormatter={(label) => `Development Type: ${label}`}
                        />
                        <Bar dataKey="value" fill="#60a5fa" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Only showing types with 3+ developments.
                  </div>
                </Card>

                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Search Results ({sortedResults.length} applications found)
                  </h2>
                  <div className="bg-white rounded-lg shadow max-w-full">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <ResizableColumn 
                              width={columnWidths.address} 
                              onResize={(width) => handleResize('address', width)}
                            >
                              Address
                            </ResizableColumn>
                            <ResizableColumn 
                              width={columnWidths.lots}
                              onResize={(width) => handleResize('lots', width)}
                            >
                              Lots
                            </ResizableColumn>
                            <ResizableColumn 
                              width={columnWidths.type}
                              onResize={(width) => handleResize('type', width)}
                            >
                              Type
                            </ResizableColumn>
                            <ResizableColumn 
                              width={columnWidths.development}
                              onResize={(width) => handleResize('development', width)}
                            >
                              Development
                            </ResizableColumn>
                            <ResizableColumn 
                              width={columnWidths.status}
                              onResize={(width) => handleResize('status', width)}
                            >
                              Status
                            </ResizableColumn>
                            <ResizableColumn 
                              width={columnWidths.lodged}
                              onResize={(width) => handleResize('lodged', width)}
                            >
                              Lodged
                            </ResizableColumn>
                            <ResizableColumn 
                              width={columnWidths.days}
                              onResize={(width) => handleResize('days', width)}
                            >
                              Days
                            </ResizableColumn>
                            <ResizableColumn 
                              width={columnWidths.cost}
                              onResize={(width) => handleResize('cost', width)}
                            >
                              Cost
                            </ResizableColumn>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {sortedResults.map((result, index) => (
                            <tr key={result.PlanningPortalApplicationNumber || index}>
                              <td style={{ width: columnWidths.address }} className="px-2 py-2 text-gray-900 break-words text-xs">
                                {result.Location?.[0]?.FullAddress || 'N/A'}
                              </td>
                              <td style={{ width: columnWidths.lots }} className="px-2 py-2 text-gray-900 break-words text-xs">
                                {result.Location?.[0]?.Lot?.map((lot, index) => (
                                  <span key={index}>
                                    {lot.Lot && lot.PlanLabel 
                                      ? `${lot.Lot}//${lot.PlanLabel}`
                                      : lot.Lot}
                                    {index < result.Location[0].Lot.length - 1 ? ', ' : ''}
                                  </span>
                                )) || 'N/A'}
                              </td>
                              <td style={{ width: columnWidths.type }} className="px-2 py-2 text-gray-900 break-words text-xs">
                                {result.ApplicationType === "Development Application" ? "DA" :
                                 result.ApplicationType === "Modification Application" ? "MOD" :
                                 result.ApplicationType === "Review of Determination" ? "Review" : 
                                 result.ApplicationType}
                              </td>
                              <td style={{ width: columnWidths.development }} className="px-2 py-2 text-gray-900 break-words text-xs">
                                {cleanDevelopmentType(result.DevelopmentType)}
                              </td>
                              <td style={{ width: columnWidths.status }} className="px-2 py-2 text-gray-900 break-words text-xs">
                                {result.ApplicationStatus}
                              </td>
                              <td style={{ width: columnWidths.lodged }} className="px-2 py-2 text-gray-900 whitespace-nowrap text-xs">
                                {format(new Date(result.LodgementDate), 'dd MMM yyyy')}
                              </td>
                              <td style={{ width: columnWidths.days }} className="px-2 py-2 text-gray-900 text-center text-xs">
                                {Math.floor((new Date(result.DeterminationDate || new Date()) - new Date(result.LodgementDate)) / (1000 * 60 * 60 * 24))}
                              </td>
                              <td style={{ width: columnWidths.cost }} className="px-2 py-2 text-gray-900 text-right text-xs">
                                ${result.CostOfDevelopment?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <VerticalDivider onResize={setLeftPanelWidth} />

        {/* Right Panel - Map */}
        <div style={{ width: `${100 - leftPanelWidth}%` }} className="h-full">
          <div className="h-full">
            <div className="map-container">
              <MapContainer 
                center={[-33.8688, 151.2093]}
                zoom={10}
                bounds={searchResults?.length > 0 ? getBounds(searchResults) : undefined}
                className="h-full w-full"
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {councilBoundary && (
                  <GeoJSON 
                    data={councilBoundary}
                    style={{
                      color: '#ff0000',
                      weight: 2,
                      fillOpacity: 0.1
                    }}
                    eventHandlers={{
                      add: (e) => {
                        console.log('GeoJSON added to map');
                        const map = e.target._map;
                        try {
                          const bounds = e.target.getBounds();
                          console.log('Fitting to bounds:', bounds);
                          map.fitBounds(bounds, { padding: [50, 50] });
                        } catch (error) {
                          console.error('Error fitting to bounds:', error);
                        }
                      }
                    }}
                  />
                )}
                {searchResults?.map((result, index) => (
                  result.Location?.[0]?.X && result.Location?.[0]?.Y && (
                    <Marker
                      key={index}
                      position={[parseFloat(result.Location[0].Y), parseFloat(result.Location[0].X)]}
                      icon={L.divIcon({
                        className: 'bg-red-500 rounded-full w-3 h-3',
                        iconSize: [12, 12],
                        iconAnchor: [6, 6]
                      })}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold">{result.Location[0].FullAddress}</p>
                          <p>Type: {result.ApplicationType}</p>
                          <p>Development: {cleanDevelopmentType(result.DevelopmentType)}</p>
                          <p>Status: {result.ApplicationStatus}</p>
                          <p>Cost: ${result.CostOfDevelopment?.toLocaleString()}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Development;
