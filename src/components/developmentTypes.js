import {
  Home,
  Wrench,
  Building2,
  UtensilsCrossed,
  GraduationCap,
  Stethoscope,
  Bike,
  Hotel,
  Factory,
  Car,
  Anchor,
  Settings,
  Map as MapIcon,
  Building,
  Briefcase,
  Hammer,
  FileText,
  Tractor,
  Pickaxe
} from "lucide-react";

export const developmentCategories = {
  'Residential Types': { icon: Home, color: '#FF483B' },
  'Alterations and Modifications': { icon: Wrench, color: '#9333ea' },
  'Commercial and Business': { icon: Building2, color: '#04aae5' },
  'Food and Beverage': { icon: UtensilsCrossed, color: '#ea580c' },
  'Education and Childcare': { icon: GraduationCap, color: '#16a34a' },
  'Health and Medical': { icon: Stethoscope, color: '#ef4444' },
  'Recreation and Entertainment': { icon: Bike, color: '#4daf4a' },
  'Tourism and Accommodation': { icon: Hotel, color: '#f59e0b' },
  'Industrial and Warehousing': { icon: Factory, color: '#64748b' },
  'Transport and Vehicle Related': { icon: Car, color: '#0891b2' },
  'Marine and Water Related': { icon: Anchor, color: '#0ea5e9' },
  'Infrastructure and Utilities': { icon: Settings, color: '#475569' },
  'Subdivision and Land Development': { icon: MapIcon, color: '#330000' },
  'Mixed Use and Other Development Types': { icon: Building, color: '#7c3aed' },
  'Home Business and Occupation': { icon: Briefcase, color: '#0d9488' },
  'Secondary Structures and Modifications': { icon: Hammer, color: '#737373' },
  'Miscellaneous and Administrative': { icon: FileText, color: '#525252' },
  'Agriculture': { icon: Tractor, color: '#166534' },
  'Mining and Resource Extraction': { icon: Pickaxe, color: '#78350f' }
};

export const devTypesData = [
  {
    category: 'Residential Types',
    types: [
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
        { oldtype: 'Independent living units', newtype: 'Independent living', secondary: '' },
        { oldtype: 'Manor house', newtype: 'Manor house', secondary: '' },
        { oldtype: 'Medium Density Housing', newtype: 'Medium density', secondary: '' },
        { oldtype: 'Non-standard Housing', newtype: 'Non-standard', secondary: '' },
    ]
  },
  {
    category: 'Agriculture',
    types: [
        { oldtype: 'Agricultural produce industry', newtype: 'Agricultural produce', secondary: '' },
        { oldtype: 'Agriculture', newtype: 'Agriculture', secondary: '' },
        { oldtype: 'Agritourism', newtype: 'Agritourism', secondary: '' },
        { oldtype: 'Aquaculture', newtype: 'Aquaculture', secondary: '' },
        { oldtype: 'Bee keeping', newtype: 'Bee keeping', secondary: '' },
        { oldtype: 'Commercial cultivation of irrigated crops', newtype: 'Crop cultivation', secondary: '' },
        { oldtype: 'Commercial livestock grazing', newtype: 'Livestock grazing', secondary: '' },
        { oldtype: 'Crop or fodder production', newtype: 'Crop production', secondary: '' },
        { oldtype: 'Dairy (pasture-based)', newtype: 'Dairy', secondary: '' },
        { oldtype: 'Extensive agriculture', newtype: 'Agriculture', secondary: '' },
        { oldtype: 'Farm experience premise', newtype: 'Farm experience', secondary: '' },
        { oldtype: 'Farm gate premise', newtype: 'Farm gate', secondary: '' },
        { oldtype: 'Feedlot', newtype: 'Feedlot', secondary: '' },
        { oldtype: 'Horticulture', newtype: 'Horticulture', secondary: '' },
        { oldtype: 'Intensive livestock agriculture', newtype: 'Livestock', secondary: '' },
        { oldtype: 'Intensive plant agriculture', newtype: 'Plant agriculture', secondary: '' },
        { oldtype: 'Livestock processing industry', newtype: 'Livestock processing', secondary: '' },
        { oldtype: 'Oyster aquaculture', newtype: 'Aquaculture', secondary: '' },
        { oldtype: 'Pig farm', newtype: 'Pig farm', secondary: '' },
        { oldtype: 'Plant nursery', newtype: 'Plant nursery', secondary: '' },
        { oldtype: 'Pond-based aquaculture', newtype: 'Aquaculture', secondary: '' },
        { oldtype: 'Poultry farm', newtype: 'Poultry farm', secondary: '' },
        { oldtype: 'Rural industry', newtype: 'Rural industry', secondary: '' },
        { oldtype: 'Rural supplies', newtype: 'Rural supplies', secondary: '' },
        { oldtype: 'Tank-based aquaculture', newtype: 'Aquaculture', secondary: '' },
        { oldtype: 'Turf farming', newtype: 'Turf farming', secondary: '' },
        { oldtype: 'Viticulture', newtype: 'Viticulture', secondary: '' },
    ]
  },
  {
    category: 'Alterations and Modifications',
    types: [
        { oldtype: 'Alterations and additions to residential development', newtype: '', secondary: 'X' },
        { oldtype: 'Alterations and additions to commercial development', newtype: '', secondary: 'X' },
        { oldtype: 'Alterations and additions to industrial development', newtype: '', secondary: 'X' },
        { oldtype: 'Alterations or additions to an existing building or structure', newtype: '', secondary: 'X' },
        { oldtype: 'Minor building alterations (external)', newtype: '', secondary: 'X' },
        { oldtype: 'Minor building alterations (internal)', newtype: '', secondary: 'X' },
    ]
  },
  {
    category: 'Commercial and Business',
    types: [
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
        { oldtype: 'Amusement centre', newtype: 'Amusement centre', secondary: '' },
        { oldtype: 'Automatic teller machine', newtype: 'ATM', secondary: '' },
        { oldtype: 'Garden centre', newtype: 'Garden centre', secondary: '' },
        { oldtype: 'Goods repair and reuse premise', newtype: 'Repair facility', secondary: '' },
        { oldtype: 'High technology industry', newtype: 'High tech industry', secondary: '' },
        { oldtype: 'Industrial retail outlet', newtype: 'Industrial retail', secondary: '' },
        { oldtype: 'Kiosk', newtype: 'Kiosk', secondary: '' },
        { oldtype: 'Landscaping material supply', newtype: 'Landscape supply', secondary: '' },
    ]
  },
  {
    category: 'Food and Beverage',
    types: [
        { oldtype: 'Restaurant or cafe', newtype: 'Food and beverage', secondary: '' },
        { oldtype: 'Food and drink premises', newtype: 'Food and beverage', secondary: '' },
        { oldtype: 'Take-away food and drink premises', newtype: 'Food and beverage', secondary: '' },
        { oldtype: 'Food and drink premise', newtype: 'Food and beverage', secondary: '' },
        { oldtype: 'Take away food and drink', newtype: 'Food and beverage', secondary: '' },
        { oldtype: 'Artisanal food and drink', newtype: 'Food and beverage', secondary: '' },
        { oldtype: 'Artisan food and drink industry', newtype: 'Food and beverage', secondary: '' },
        { oldtype: 'Pub', newtype: 'Pub', secondary: '' },
        { oldtype: 'Small bar', newtype: 'Pub', secondary: '' },
    ]   
  },
  {
    category: 'Education and Childcare',
    types: [
        { oldtype: 'Educational establishment', newtype: 'Educational establishment', secondary: '' },
        { oldtype: 'Centre based childcare', newtype: 'Childcare', secondary: '' },
        { oldtype: 'Centre-based child care', newtype: 'Childcare', secondary: '' },
        { oldtype: 'School based child care', newtype: 'Childcare', secondary: '' },
        { oldtype: 'School-based child care', newtype: 'Childcare', secondary: '' },
        { oldtype: 'Home based child care', newtype: 'Childcare', secondary: '' },
        { oldtype: 'Early Education and Care Facility', newtype: 'Childcare', secondary: '' },
        { oldtype: 'School', newtype: 'School', secondary: '' },
        { oldtype: 'Out of school hours care', newtype: 'Out of school hours care', secondary: '' },  
    ]
  },
  {
    category: 'Health and Medical',
    types: [
        { oldtype: 'Health services facilities', newtype: 'Health services', secondary: '' },
        { oldtype: 'Health services facility', newtype: 'Health services', secondary: '' },
        { oldtype: 'Health consulting room', newtype: 'Health services', secondary: '' },
        { oldtype: 'Health Infrastructure', newtype: 'Health Infrastructure', secondary: '' },
        { oldtype: 'Medical centre', newtype: 'Medical centre', secondary: '' },
        { oldtype: 'Hospital', newtype: 'Hospital', secondary: '' },
        { oldtype: 'Community health service facility', newtype: 'Health services', secondary: '' },   
    ]
  },
  {
    category: 'Recreation and Entertainment',
    types: [
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
    ]
  },
  {
    category: 'Tourism and Accommodation',
    types: [
        { oldtype: 'Tourist and visitor accommodation', newtype: 'Tourist and visitor accommodation', secondary: '' },
        { oldtype: 'Hotel or motel accommodation', newtype: 'Hotel', secondary: '' },
        { oldtype: 'Hotel or motel accomodation', newtype: 'Hotel', secondary: '' },
        { oldtype: 'Serviced apartment', newtype: 'Serviced apartment', secondary: '' },
        { oldtype: 'Bed and breakfast accommodation', newtype: 'Bed and breakfast accommodation', secondary: '' },
        { oldtype: 'Backpackers\' accommodation', newtype: 'Backpackers', secondary: '' },
        { oldtype: 'Farm stay accommodation', newtype: 'Farm stay accommodation', secondary: '' },
        { oldtype: 'Eco-tourist facility', newtype: 'Eco-tourist facility', secondary: '' },
    ]
  },
  {
    category: 'Industrial and Warehousing',
    types: [
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
    ]
  },
  {
    category: 'Transport and Vehicle Related',
    types: [
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
        { oldtype: 'Classified road', newtype: 'Road infrastructure', secondary: '' },
        { oldtype: 'Controlled access road', newtype: 'Road infrastructure', secondary: '' },
        { oldtype: 'Freeway', newtype: 'Road infrastructure', secondary: '' },
        { oldtype: 'Main road', newtype: 'Road infrastructure', secondary: '' },
        { oldtype: 'Secondary road', newtype: 'Road infrastructure', secondary: '' },
        { oldtype: 'Tourist road', newtype: 'Road infrastructure', secondary: '' },
        { oldtype: 'Freight support facility', newtype: 'Freight facility', secondary: '' },
        { oldtype: 'Freight transport facility', newtype: 'Freight facility', secondary: '' },
    ]
  },
  {
    category: 'Marine and Water Related',
    types: [
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
    ]   
  },
  { 
    category: 'Infrastructure and Utilities',
    types: [
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
        { oldtype: 'Biosolids treatment facility', newtype: 'Waste treatment', secondary: '' },
        { oldtype: 'Container recycling equipment', newtype: 'Recycling facility', secondary: '' },
        { oldtype: 'Data centre', newtype: 'Data centre', secondary: '' },
        { oldtype: 'Emergency services facility', newtype: 'Emergency services', secondary: '' },
        { oldtype: 'Environmental protection works', newtype: 'Environmental protection', secondary: '' },
        { oldtype: 'Flood mitigation work', newtype: 'Flood mitigation', secondary: '' },
        { oldtype: 'Information and education facility', newtype: 'Education facility', secondary: '' },
        { oldtype: 'Monitoring station', newtype: 'Monitoring station', secondary: '' },
        { oldtype: 'Rail infrastructure facility', newtype: 'Rail infrastructure', secondary: '' },
        { oldtype: 'Research station', newtype: 'Research station', secondary: '' },
        { oldtype: 'Resource recovery facility', newtype: 'Resource recovery', secondary: '' },
        { oldtype: 'Sewage reticulation system', newtype: 'Sewage system', secondary: '' },
        { oldtype: 'Sewage treatment plant', newtype: 'Sewage treatment', secondary: '' },
        { oldtype: 'Sewerage system', newtype: 'Sewage system', secondary: '' },
        { oldtype: 'Stormwater management system', newtype: 'Stormwater management', secondary: '' },
        { oldtype: 'Waste disposal facility', newtype: 'Waste disposal', secondary: '' },
        { oldtype: 'Waste Infrastructure', newtype: 'Waste infrastructure', secondary: '' },
        { oldtype: 'Waste or resource management facility', newtype: 'Waste management', secondary: '' },
        { oldtype: 'Waste or resource transfer station', newtype: 'Waste transfer', secondary: '' },
        { oldtype: 'Waste storage facility', newtype: 'Waste storage', secondary: '' },
        { oldtype: 'Water reticulation system', newtype: 'Water system', secondary: '' },
    ]
  },
  {
    category: 'Subdivision and Land Development',
    types: [
        { oldtype: 'Subdivision of land', newtype: 'Subdivision', secondary: '' },
        { oldtype: 'Subdivision', newtype: 'Subdivision', secondary: '' },
        { oldtype: 'Stratum / community title subdivision', newtype: 'Subdivision', secondary: 'X' },
        { oldtype: 'Earthworks / change in levels', newtype: '', secondary: 'X' },
        { oldtype: 'Earthworks, retaining walls and structural support', newtype: '', secondary: 'X' },
    ]
  },
  {
    category: 'Mixed Use and Other Development Types',
    types: [
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
        { oldtype: 'Cemetery', newtype: 'Cemetery', secondary: '' },
        { oldtype: 'Community facility', newtype: 'Community facility', secondary: '' },
        { oldtype: 'Crematorium', newtype: 'Crematorium', secondary: '' },
        { oldtype: 'Funeral home', newtype: 'Funeral home', secondary: '' },
        { oldtype: 'Mobile food and drink outlet', newtype: 'Mobile food', secondary: '' },
        { oldtype: 'Place of public worship', newtype: 'Place of worship', secondary: '' },
        { oldtype: 'Public administration building', newtype: 'Public admin', secondary: '' },
        { oldtype: 'Public Reserve', newtype: 'Public reserve', secondary: '' },
        { oldtype: 'Roadside stall', newtype: 'Roadside stall', secondary: '' },
        { oldtype: 'Stock and sale yard', newtype: 'Stock yard', secondary: '' },
    ]   
  },
  {
    category: 'Home Business and Occupation',
    types: [
        { oldtype: 'Home business', newtype: 'Home business', secondary: '' },
        { oldtype: 'Home occupation', newtype: 'Home occupation', secondary: '' },
        { oldtype: 'Home industry', newtype: 'Home industry', secondary: '' },
    ]
  },
  {
    category: 'Secondary Structures and Modifications',
    types: [
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
        { oldtype: 'Air-conditioning units', newtype: '', secondary: 'X' },
        { oldtype: 'Aerials', newtype: '', secondary: 'X' },
        { oldtype: 'Barbecues and outdoor cooking structures', newtype: '', secondary: 'X' },
        { oldtype: 'Clothes hoists and clothes lines', newtype: '', secondary: 'X' },
        { oldtype: 'Evaporative cooling units (roof mounted)', newtype: '', secondary: 'X' },
        { oldtype: 'Flagpoles', newtype: '', secondary: 'X' },
        { oldtype: 'Fuel tanks and gas storage', newtype: '', secondary: 'X' },
        { oldtype: 'Garbage bin storage enclosure', newtype: '', secondary: 'X' },
        { oldtype: 'Hot water systems', newtype: '', secondary: 'X' },
        { oldtype: 'Landscaping structures', newtype: '', secondary: 'X' },
        { oldtype: 'Letterboxes', newtype: '', secondary: 'X' },
        { oldtype: 'Pathways and paving', newtype: '', secondary: 'X' },
        { oldtype: 'Playground equipment', newtype: '', secondary: 'X' },
        { oldtype: 'Portable offices', newtype: '', secondary: 'X' },
        { oldtype: 'Rainwater tanks', newtype: '', secondary: 'X' },
        { oldtype: 'Roller shutter doors adjoining lanes', newtype: '', secondary: 'X' },
        { oldtype: 'Sculptures and artworks', newtype: '', secondary: 'X' },
        { oldtype: 'Shade structures of canvas', newtype: '', secondary: 'X' },
        { oldtype: 'Skylights', newtype: '', secondary: 'X' },
    ]
  },
  {
    category: 'Miscellaneous and Administrative',
    types: [
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
    ]
  },
  {
    category: 'Mining and Resource Extraction',
    types: [
        { oldtype: 'Extractive Industries (non-mining)', newtype: 'Extractive industry', secondary: '' },
        { oldtype: 'Mine', newtype: 'Mine', secondary: '' },
        { oldtype: 'Open cut mining', newtype: 'Mining', secondary: '' },
        { oldtype: 'Petroleum production', newtype: 'Petroleum', secondary: '' },
        { oldtype: 'Sawmill or log processing works', newtype: 'Processing facility', secondary: '' },
    ]
  } 
];

// Helper function to get development category
export const getDevelopmentCategory = (developmentType) => {
  if (!developmentType) return 'Miscellaneous and Administrative';
  
  const categoryEntry = devTypesData.find(category => 
    category.types.some(type => 
      type.oldtype === developmentType || type.newtype === developmentType
    )
  );
  
  return categoryEntry ? categoryEntry.category : 'Miscellaneous and Administrative';
};

// Create type mapping
export const typeMap = new Map(
  devTypesData.flatMap(category => 
    category.types.map(row => [
      row.oldtype, 
      { 
        newtype: row.newtype || row.oldtype,
        secondary: row.secondary === 'X',
        category: category.category
      }
    ])
  )
); 