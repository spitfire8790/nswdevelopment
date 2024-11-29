import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea, LineChart, Line } from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import { councils as councilList } from '@/data/councilList';
import { format, parseISO } from 'date-fns';

const COLORS = [
  "#FF483B", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0", 
  "#00BCD4", "#FF5722", "#3F51B5", "#E91E63", "#009688",
  "#CDDC39", "#607D8B", "#795548", "#F44336", "#8BC34A"
];

const DWELLING_COLORS = [
  '#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3',
  '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd',
  '#ccebc5', '#ffed6f', '#a6cee3', '#fb9a99', '#fdbf6f',
  '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'
];

const MIN_COST_THRESHOLD = 100000; // Minimum cost per dwelling threshold

const DEFAULT_RESIDENTIAL_TYPES = [
  'House',
  'Dual occupancy',
];

const ALL_RESIDENTIAL_TYPES = [
  'House',
  'Secondary dwelling',
  'Dual occupancy',
  'Apartments',
  'Multi-dwelling housing',
  'Terrace housing',
  'Semi-detached dwelling',
  'Attached dwelling',
  'Shop top housing',
  'Boarding house',
  'Seniors housing',
  'Group homes',
  'Build-to-rent',
  'Co-living housing',
  'Manufactured home',
  'Moveable dwelling',
  'Independent living',
  'Manor house',
  'Medium density',
  'Non-standard',
  'Rural worker\'s dwelling'
];

const DEFAULT_COUNCILS = [
  "Blacktown City Council",
  "Inner West Council",
  "City of Parramatta Council"
];

const loadingSpinnerStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 20px auto;
  }
`;

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <style>{loadingSpinnerStyles}</style>
    <div className="loading-spinner"></div>
    <p className="text-gray-500 mt-4">Loading data...</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    residentialCosts: [],
    determinationTimes: [],
    totalDwellings: [],
    medianStoreys: [], // Add new state
    allResidentialTypes: []
  });
  const [selectedCouncils, setSelectedCouncils] = useState(DEFAULT_COUNCILS);
  const [selectedTypes, setSelectedTypes] = useState(DEFAULT_RESIDENTIAL_TYPES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeSearchTerm, setTypeSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [lodgedFrom, setLodgedFrom] = useState('');
  const [costOverTime, setCostOverTime] = useState([]);

  useEffect(() => {
    fetchLastUpdated();
  }, []);

  useEffect(() => {
    if (selectedCouncils.length > 0 && selectedTypes.length > 0) {
      fetchAllResidentialCosts();
      fetchMedianStoreys();
      fetchDeterminationTimes();
      fetchTotalDwellings();
      fetchCostOverTime();
    }
  }, [selectedCouncils, selectedTypes, lodgedFrom]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMonthYear = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      year: '2-digit'
    });
  };

  const fetchLastUpdated = async () => {
    let retries = 3;
    
    while (retries > 0) {
      try {
        const { data, error } = await supabase
          .from('development_applications')
          .select('fetched_at')
          .order('fetched_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching last updated date:', error);
          throw error;
        }

        if (data && data.length > 0) {
          const date = new Date(data[0].fetched_at);
          const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
          setLastUpdated(formattedDate);
          return; // Success - exit the retry loop
        }
      } catch (error) {
        console.error(`Attempt ${4 - retries} failed:`, error);
        retries--;
        
        if (retries === 0) {
          console.error('All retry attempts failed');
          // Optionally set an error state here
          return;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, 3 - retries) * 1000));
      }
    }
  };

  const fetchAllResidentialCosts = async () => {
    try {
      setIsLoading(true);
      let allData = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        try {
          const { data, error, count } = await supabase
            .from('development_applications')
            .select('clean_development_type, cost_of_development, number_of_new_dwellings, council_name', { count: 'exact' })
            .in('clean_development_type', selectedTypes)
            .in('council_name', selectedCouncils)
            .not('cost_of_development', 'is', null)
            .not('number_of_new_dwellings', 'is', null)
            .gt('cost_of_development', 0)
            .gt('number_of_new_dwellings', 0)
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (error) throw error;

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            page++;
            hasMore = data.length === pageSize;
            
            // Log progress
            console.log(`Fetched page ${page}, got ${data.length} records. Total so far: ${allData.length}`);
          } else {
            hasMore = false;
          }
        } catch (error) {
          console.error(`Error fetching page ${page}:`, error);
          hasMore = false;
        }
      }

      // Debug: Log initial data counts per council
      const initialCounts = selectedCouncils.reduce((acc, council) => {
        acc[council] = allData.filter(row => row.council_name === council).length;
        return acc;
      }, {});
      console.log('Initial data counts per council:', initialCounts);

      // Debug: Log unique development types found
      const uniqueTypes = [...new Set(allData.map(row => row.clean_development_type))];
      console.log('Unique development types found:', uniqueTypes);

      // Process the data
      const processedData = selectedTypes.map(type => {
        // Filter data for this type
        const typeData = allData.filter(row => row.clean_development_type === type);
        
        // Debug: Log data counts per council for this type
        const typeCountsByCouncil = selectedCouncils.reduce((acc, council) => {
          acc[council] = typeData.filter(row => row.council_name === council).length;
          return acc;
        }, {});
        console.log(`Data counts for type ${type}:`, typeCountsByCouncil);

        // Calculate overall median
        const allCosts = typeData
          .map(row => parseFloat(row.cost_of_development) / parseInt(row.number_of_new_dwellings))
          .filter(cost => !isNaN(cost) && cost >= MIN_COST_THRESHOLD)
          .sort((a, b) => a - b);
        
        const result = {
          type,
          count: allCosts.length,
          overallMedian: allCosts.length > 0 ? calculateMedian(allCosts) : 0
        };

        // Calculate council-specific medians
        selectedCouncils.forEach(council => {
          const councilData = typeData.filter(row => row.council_name === council);
          const councilCosts = councilData
            .map(row => parseFloat(row.cost_of_development) / parseInt(row.number_of_new_dwellings))
            .filter(cost => !isNaN(cost) && cost >= MIN_COST_THRESHOLD)
            .sort((a, b) => a - b);

          // Debug: Log filtering steps for each council
          console.log(`${council} - ${type}:`, {
            totalRecords: councilData.length,
            afterCostThreshold: councilCosts.length,
            medianCost: councilCosts.length > 0 ? calculateMedian(councilCosts) : 0
          });

          result[council] = councilCosts.length > 0 ? calculateMedian(councilCosts) : 0;
          result[`${council}Count`] = councilCosts.length;
          result.count += councilCosts.length;
        });

        return result;
      });

      // Sort by highest median cost
      const sortedData = processedData.sort((a, b) => {
        const aMax = Math.max(...selectedCouncils.map(council => a[council] || 0));
        const bMax = Math.max(...selectedCouncils.map(council => b[council] || 0));
        return bMax - aMax;
      });

      // Debug: Log final processed data
      console.log('Final processed data:', sortedData.map(item => ({
        type: item.type,
        councils: selectedCouncils.reduce((acc, council) => {
          acc[council] = {
            median: item[council],
            count: item[`${council}Count`]
          };
          return acc;
        }, {})
      })));

      setStats(prev => ({ 
        ...prev, 
        residentialCosts: sortedData
      }));

    } catch (error) {
      console.error('Error in fetchResidentialCosts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMedianStoreys = async () => {
    try {
      setIsLoading(true);
      let allData = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('development_applications')
          .select('clean_development_type, number_of_storeys, council_name')
          .in('clean_development_type', selectedTypes)
          .in('council_name', selectedCouncils)
          .not('number_of_storeys', 'is', null)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error('Error fetching median storeys:', error);
          return;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          page++;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      // Calculate medians by type and council
      const storeysByType = {};
      selectedTypes.forEach(type => {
        storeysByType[type] = {
          type,
          overallMedian: 0
        };
        selectedCouncils.forEach(council => {
          storeysByType[type][council] = 0;
        });
      });

      // Group data by type and council
      const groupedData = {};
      allData.forEach(row => {
        const type = row.clean_development_type;
        const council = row.council_name;
        if (!groupedData[type]) {
          groupedData[type] = {};
        }
        if (!groupedData[type][council]) {
          groupedData[type][council] = [];
        }
        groupedData[type][council].push(row.number_of_storeys);
      });

      // Calculate medians
      Object.entries(groupedData).forEach(([type, councilData]) => {
        const allStoreysForType = [];
        Object.entries(councilData).forEach(([council, storeys]) => {
          const median = calculateMedian(storeys);
          storeysByType[type][council] = median;
          allStoreysForType.push(...storeys);
        });
        storeysByType[type].overallMedian = calculateMedian(allStoreysForType);
      });

      setStats(prev => ({
        ...prev,
        medianStoreys: Object.values(storeysByType)
      }));
    } catch (error) {
      console.error('Error in fetchMedianStoreys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMedian = (sortedArr) => {
    if (sortedArr.length === 0) return 0;
    const mid = Math.floor(sortedArr.length / 2);
    return sortedArr.length % 2 === 0
      ? (sortedArr[mid - 1] + sortedArr[mid]) / 2
      : sortedArr[mid];
  };

  const calculateDaysBetween = (lodgement, determination) => {
    if (!lodgement || !determination) return null;
    const lodgeDate = new Date(lodgement);
    const determineDate = new Date(determination);
    
    // Ensure determination date is after lodgement date
    if (determineDate < lodgeDate) {
      console.warn('Invalid dates: determination date before lodgement date');
      return null;
    }
    
    const diffTime = determineDate - lodgeDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const fetchDeterminationTimes = async () => {
    try {
      setIsLoading(true);
      let allData = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('development_applications')
          .select('clean_development_type, lodgement_date, determination_date, council_name')
          .in('clean_development_type', selectedTypes)
          .in('council_name', selectedCouncils)
          .not('lodgement_date', 'is', null)
          .not('determination_date', 'is', null)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          page++;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      // Process the data
      const processedData = selectedTypes.map(type => {
        // Filter data for this type
        const typeData = allData.filter(row => row.clean_development_type === type);
        
        // Calculate overall median
        const allTimes = typeData
          .map(row => calculateDaysBetween(row.lodgement_date, row.determination_date))
          .filter(days => days !== null && days >= 0) // Ensure only valid positive days are included
          .sort((a, b) => a - b);
        
        const result = {
          type,
          count: 0,
          overallMedian: allTimes.length > 0 ? calculateMedian(allTimes) : 0
        };

        // Calculate council-specific medians
        selectedCouncils.forEach(council => {
          const councilData = typeData.filter(row => row.council_name === council);
          const councilTimes = councilData
            .map(row => calculateDaysBetween(row.lodgement_date, row.determination_date))
            .filter(days => days !== null && days >= 0) // Ensure only valid positive days are included
            .sort((a, b) => a - b);

          result[council] = councilTimes.length > 0 ? calculateMedian(councilTimes) : 0;
          result[`${council}Count`] = councilTimes.length;
          result.count += councilTimes.length;
        });

        return result;
      });

      // Sort by highest median time
      const sortedData = processedData.sort((a, b) => {
        const aMax = Math.max(...selectedCouncils.map(council => a[council] || 0));
        const bMax = Math.max(...selectedCouncils.map(council => b[council] || 0));
        return bMax - aMax;
      });

      setStats(prev => ({ 
        ...prev, 
        determinationTimes: sortedData
      }));

    } catch (error) {
      console.error('Error in fetchDeterminationTimes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTotalDwellings = async () => {
    try {
      setIsLoading(true);
      let allData = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('development_applications')
          .select('clean_development_type, planning_portal_application_number, lodgement_date, number_of_new_dwellings, council_name')
          .in('clean_development_type', selectedTypes)
          .in('council_name', selectedCouncils)
          .not('number_of_new_dwellings', 'is', null)
          .not('lodgement_date', 'is', null)
          .order('lodgement_date', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error('Error fetching total dwellings:', error);
          return;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          page++;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      // Track latest application versions and organize by month
      const latestApplications = new Map();
      allData.forEach(row => {
        const appNumber = row.planning_portal_application_number;
        const currentDate = new Date(row.lodgement_date);
        
        if (!latestApplications.has(appNumber) || 
            currentDate > new Date(latestApplications.get(appNumber).lodgement_date)) {
          latestApplications.set(appNumber, {
            lodgement_date: row.lodgement_date,
            council_name: row.council_name,
            number_of_new_dwellings: row.number_of_new_dwellings
          });
        }
      });

      // Create monthly cumulative data
      const monthlyData = {};
      const councilTotals = {};
      selectedCouncils.forEach(council => {
        councilTotals[council] = 0;
      });

      // Sort applications by date and calculate cumulative totals
      Array.from(latestApplications.values())
        .sort((a, b) => new Date(a.lodgement_date) - new Date(b.lodgement_date))
        .forEach(app => {
          const date = new Date(app.lodgement_date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: monthKey,
              ...councilTotals
            };
          }
          
          councilTotals[app.council_name] += app.number_of_new_dwellings;
          monthlyData[monthKey][app.council_name] = councilTotals[app.council_name];
        });

      // Convert to array and sort by date
      const timeSeriesData = Object.values(monthlyData)
        .sort((a, b) => a.month.localeCompare(b.month));

      setStats(prev => ({
        ...prev,
        totalDwellings: timeSeriesData
      }));
    } catch (error) {
      console.error('Error in fetchTotalDwellings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCostOverTime = async () => {
    try {
      setIsLoading(true);
      let allData = [];

      // Helper function to generate array of all months between two dates
      const generateMonthRange = (startDate, endDate) => {
        const months = [];
        const currentDate = new Date(startDate);
        const end = new Date(endDate);
        
        while (currentDate <= end) {
          months.push(format(currentDate, 'yyyy-MM'));
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        return months;
      };

      // Fetch data for each selected type
      for (const type of selectedTypes) {
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;
        let typeData = [];

        while (hasMore) {
          let query = supabase
            .from('development_applications')
            .select('clean_development_type, cost_of_development, number_of_new_dwellings, lodgement_date, council_name')
            .eq('clean_development_type', type)
            .in('council_name', selectedCouncils)
            .not('cost_of_development', 'is', null)
            .not('number_of_new_dwellings', 'is', null)
            .not('lodgement_date', 'is', null)
            .gt('cost_of_development', 0)
            .gt('number_of_new_dwellings', 0)
            .order('lodgement_date', { ascending: true })
            .range(page * pageSize, (page + 1) * pageSize - 1);

          if (lodgedFrom) {
            query = query.gte('lodgement_date', `${lodgedFrom}T00:00:00Z`);
          }

          const { data, error } = await query;

          if (error) throw error;

          if (data && data.length > 0) {
            typeData = [...typeData, ...data];
            page++;
            hasMore = data.length === pageSize;
          } else {
            hasMore = false;
          }
        }

        if (typeData.length > 0) {
          // Get date range
          const startDate = lodgedFrom 
            ? new Date(lodgedFrom) 
            : new Date(Math.min(...typeData.map(d => new Date(d.lodgement_date))));
          const endDate = new Date(Math.max(...typeData.map(d => new Date(d.lodgement_date))));
          
          // Generate all months in range
          const allMonths = generateMonthRange(startDate, endDate);
          
          // Initialize data structure for all months and councils
          const monthlyData = {};
          allMonths.forEach(month => {
            selectedCouncils.forEach(council => {
              const key = `${month}-${council}`;
              monthlyData[key] = {
                month,
                council,
                costs: []
              };
            });
          });

          // Fill in actual data
          typeData.forEach(record => {
            const month = format(new Date(record.lodgement_date), 'yyyy-MM');
            const costPerDwelling = parseFloat(record.cost_of_development) / parseInt(record.number_of_new_dwellings);
            const key = `${month}-${record.council_name}`;
            
            if (monthlyData[key] && costPerDwelling >= MIN_COST_THRESHOLD) {
              monthlyData[key].costs.push(costPerDwelling);
            }
          });

          // Calculate medians and create final dataset
          const processedData = Object.values(monthlyData)
            .map(({ month, council, costs }) => ({
              month: new Date(month).toISOString(),  // Store as ISO string
              council,
              type,
              medianCost: costs.length > 0 ? calculateMedian(costs) : null
            }))
            .filter(item => item.medianCost !== null)
            .sort((a, b) => new Date(a.month) - new Date(b.month));  // Ensure correct sorting

          allData = [...allData, ...processedData];
        }
      }

      setCostOverTime(allData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchCostOverTime:', error);
      setIsLoading(false);
    }
  };

  const handleCouncilToggle = (council) => {
    setSelectedCouncils(prev => {
      if (prev.includes(council)) {
        return prev.filter(c => c !== council);
      } else {
        return [...prev, council];
      }
    });
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const filteredCouncils = councilList.filter(council =>
    council.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedResidentialTypes = useMemo(() => {
    return [...ALL_RESIDENTIAL_TYPES].sort((a, b) => a.localeCompare(b));
  }, []);

  const filteredTypes = useMemo(() => {
    if (!typeSearchTerm) return sortedResidentialTypes;
    return sortedResidentialTypes.filter(type =>
      type.toLowerCase().includes(typeSearchTerm.toLowerCase())
    );
  }, [typeSearchTerm, sortedResidentialTypes]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => {
            const council = entry.dataKey;
            const count = entry.payload[`${council}Count`];
            
            if (entry.value > 0) {
              // Format monetary values
              const formattedValue = entry.value >= 1000000
                ? `$${(entry.value / 1000000).toFixed(1)}m`
                : `$${(entry.value / 1000).toFixed(0)}k`;

              // Format counts with commas
              const formattedCount = count?.toLocaleString('en-US') || '0';
              
              // Special handling for NSW Median
              if (council === 'overallMedian') {
                const totalCount = entry.payload.count || 0;
                const formattedTotalCount = totalCount.toLocaleString('en-US');
                return (
                  <p key={index} style={{ color: entry.color }}>
                    NSW Median: {formattedValue} ({formattedTotalCount} developments)
                  </p>
                );
              }

              // Regular council entries
              return (
                <p key={index} style={{ color: entry.color }}>
                  {council}: {formattedValue} ({formattedCount} developments)
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  const CustomDeterminationTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => {
            const council = entry.dataKey;
            const count = entry.payload[`${council}Count`];
            if (entry.value > 0) {
              if (council === "overallMedian") {
                return (
                  <p key={index} style={{ color: entry.color }}>
                    NSW Median: {Math.round(entry.value)} days ({entry.payload.count?.toLocaleString()} applications)
                  </p>
                );
              }
              return (
                <p key={index} style={{ color: entry.color }}>
                  {council}: {Math.round(entry.value)} days ({count} applications)
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  const CustomDwellingsTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-semibold">{formatMonthYear(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} dwellings
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomStoreysTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => {
            if (entry.value > 0) {
              return (
                <p key={index} style={{ color: entry.color }}>
                  {entry.name === "NSW Median" 
                    ? `NSW Median: ${entry.value.toFixed(1)} storeys`
                    : `${entry.name}: ${entry.value.toFixed(1)} storeys`
                  }
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Query Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        {/* Last Updated Text */}
        {lastUpdated && (
          <p className="text-sm text-gray-500 mb-4">
            Last updated: {lastUpdated}
          </p>
        )}

        {/* Controls Section - Updated to flex row */}
        <div className="flex flex-row gap-6">
          {/* Council Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Councils
            </label>
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold mr-2">Councils</h3>
              <button
                onClick={() => setSelectedCouncils([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Remove All
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedCouncils.map(council => (
                <span
                  key={council}
                  className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {council}
                  <button
                    onClick={() => handleCouncilToggle(council)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search councils..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border rounded"
              />
              {filteredCouncils.length > 0 && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                  {filteredCouncils.map(council => (
                    <button
                      key={council}
                      onClick={() => {
                        handleCouncilToggle(council);
                        setSearchTerm('');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {council}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date Picker */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lodged From
            </label>
            <input
              type="date"
              value={lodgedFrom}
              onChange={(e) => setLodgedFrom(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Development Type Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Development Types
            </label>
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold mr-2">Residential Types</h3>
              <button
                onClick={() => setSelectedTypes([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Remove All
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTypes.map(type => (
                <span
                  key={type}
                  className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded"
                >
                  {type}
                  <button
                    onClick={() => handleTypeToggle(type)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search residential types..."
                  value={typeSearchTerm}
                  onChange={(e) => setTypeSearchTerm(e.target.value)}
                  onFocus={() => setIsTypeDropdownOpen(true)}
                  className="w-full p-2 border rounded-l"
                />
                <button
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="px-3 bg-gray-100 border border-l-0 rounded-r hover:bg-gray-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {(isTypeDropdownOpen || (typeSearchTerm && filteredTypes.length > 0)) && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                  {(typeSearchTerm ? filteredTypes : sortedResidentialTypes)
                    .filter(type => !selectedTypes.includes(type))
                    .map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          handleTypeToggle(type);
                          setTypeSearchTerm('');
                          setIsTypeDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        {type}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Charts Section */}
      <div className="flex-1 overflow-auto p-6">
        {/* Original Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cost Chart */}
          <div className="bg-white rounded-lg shadow p-4 h-[600px]">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Median Cost per Dwelling by Residential Type</h2>
            </div>
            <div className="h-[calc(100%-6rem)]">
              {isLoading ? (
                <LoadingSpinner />
              ) : stats.residentialCosts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.residentialCosts}
                    margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                  >
                    <defs>
                      <pattern id="nswMedianPattern" patternUnits="userSpaceOnUse" width="10" height="10">
                        <rect width="10" height="10" fill="#FCD34D"/>
                        <path d="M-2,2 l4,-4 M0,10 l10,-10 M8,12 l4,-4" stroke="white" strokeWidth="2"/>
                      </pattern>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="type"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickFormatter={formatCurrency}
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: "0px", fontSize: '12px' }}
                      iconSize={10}
                    />
                    {selectedCouncils.map((council, index) => (
                      <Bar
                        key={council}
                        dataKey={council}
                        name={council}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                    <Bar
                      dataKey="overallMedian"
                      name="NSW Median"
                      fill="url(#nswMedianPattern)"
                      stroke="#B45309"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for selected criteria
                </div>
              )}
            </div>
          </div>

          {/* Determination Time Chart */}
          <div className="bg-white rounded-lg shadow p-4 h-[600px]">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Median Time to Determination by Residential Type</h2>
            </div>
            <div className="h-[calc(100%-6rem)]">
              {isLoading ? (
                <LoadingSpinner />
              ) : stats.determinationTimes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.determinationTimes}
                    margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                  >
                    <defs>
                      <pattern id="nswMedianTimePattern" patternUnits="userSpaceOnUse" width="10" height="10">
                        <rect width="10" height="10" fill="#FCD34D"/>
                        <path d="M-2,2 l4,-4 M0,10 l10,-10 M8,12 l4,-4" stroke="white" strokeWidth="2"/>
                      </pattern>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="type"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      width={60}
                      tick={{ fontSize: 11 }}
                      label={{ 
                        value: 'Days', 
                        angle: -90, 
                        position: 'insideLeft',
                        offset: -5,
                        style: { fontSize: 11 }
                      }}
                    />
                    <Tooltip content={<CustomDeterminationTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: "0px", fontSize: '12px' }}
                      iconSize={10}
                    />
                    {selectedCouncils.map((council, index) => (
                      <Bar
                        key={council}
                        dataKey={council}
                        name={council}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                    <Bar
                      dataKey="overallMedian"
                      name="NSW Median"
                      fill="url(#nswMedianTimePattern)"
                      stroke="#B45309"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for selected criteria
                </div>
              )}
            </div>
          </div>

          {/* Total Dwellings Chart */}
          <div className="bg-white rounded-lg shadow p-4 h-[600px]">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Cumulative New Dwellings Over Time</h2>
            </div>
            <div className="h-[calc(100%-6rem)]">
              {isLoading ? (
                <LoadingSpinner />
              ) : stats.totalDwellings.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={stats.totalDwellings}
                    margin={{ top: 20, right: 120, left: 40, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={1}
                      tick={{ fontSize: 11 }}
                      tickFormatter={formatMonthYear}
                    />
                    <YAxis
                      tickFormatter={(value) => value.toLocaleString()}
                      label={{ 
                        value: 'Number of Dwellings', 
                        angle: -90, 
                        position: 'insideLeft',
                        offset: -10,
                        style: { 
                          textAnchor: 'middle',
                          fill: '#666',
                          fontSize: 12
                        }
                      }}
                      dx={-10}
                      width={80}
                    />
                    <Tooltip 
                      content={<CustomDwellingsTooltip />}
                      formatter={(value) => value.toLocaleString()}
                      labelFormatter={formatMonthYear}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: "0px", fontSize: '12px' }}
                      iconSize={10}
                    />
                    {selectedCouncils.map((council, index) => {
                      const lastDataPoint = stats.totalDwellings[stats.totalDwellings.length - 1]?.[council];
                      return (
                        <React.Fragment key={council}>
                          <Line
                            type="monotone"
                            dataKey={council}
                            name={council}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                          />
                          {lastDataPoint && (
                            <text
                              x="100%"
                              y={0}
                              dx={10}
                              dy={25 + (index * 20)}
                              fill={COLORS[index % COLORS.length]}
                              fontSize={12}
                              textAnchor="start"
                              className="animate-fadeIn"
                            >
                              {lastDataPoint.toLocaleString('en-US', {
                                maximumFractionDigits: 0,
                                useGrouping: true
                              })}
                            </text>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for selected criteria
                </div>
              )}
            </div>
          </div>

          {/* Median Storeys Chart */}
          <div className="bg-white rounded-lg shadow p-4 h-[600px]">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Median Number of Storeys by Residential Type</h2>
            </div>
            <div className="h-[calc(100%-6rem)]">
              {isLoading ? (
                <LoadingSpinner />
              ) : stats.medianStoreys.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.medianStoreys}
                    margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                    height={500}
                  >
                    <defs>
                      <pattern id="nswMedianStoreysPattern" patternUnits="userSpaceOnUse" width="10" height="10">
                        <rect width="10" height="10" fill="#FCD34D"/>
                        <path d="M-2,2 l4,-4 M0,10 l10,-10 M8,12 l4,-4" stroke="white" strokeWidth="2"/>
                      </pattern>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="type"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      width={60}
                      tick={{ fontSize: 11 }}
                      label={{ 
                        value: 'Storeys', 
                        angle: -90, 
                        position: 'insideLeft',
                        offset: -5,
                        style: { fontSize: 11 }
                      }}
                    />
                    <Tooltip content={<CustomStoreysTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: "0px", fontSize: '12px' }}
                      iconSize={10}
                    />
                    {selectedCouncils.map((council, index) => (
                      <Bar
                        key={council}
                        dataKey={council}
                        name={council}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                    <Bar
                      dataKey="overallMedian"
                      name="NSW Median"
                      fill="url(#nswMedianStoreysPattern)"
                      stroke="#B45309"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for selected criteria
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cost Over Time Charts - Full Width */}
        {selectedTypes.map((type) => {
          const typeData = costOverTime.filter(d => d.type === type);
          const councils = [...new Set(typeData.map(d => d.council))];
          
          return (
            <div key={type} className="bg-white rounded-lg shadow p-4 mb-6 h-[400px]">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  {type} - Median Cost per Dwelling Over Time
                </h2>
              </div>
              <div className="h-[calc(100%-4rem)]">
                {isLoading ? (
                  <LoadingSpinner />
                ) : typeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={typeData}
                      margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={1}
                        tickFormatter={formatMonthYear}
                        allowDuplicatedCategory={false}
                      />
                      <YAxis
                        tickFormatter={(value) => {
                          if (value >= 1000000) {
                            return `$${(value / 1000000).toFixed(1)}m`;
                          }
                          return `$${(value / 1000).toFixed(0)}k`;
                        }}
                        label={{ 
                          value: 'Median Cost per Dwelling', 
                          angle: -90, 
                          position: 'insideLeft',
                          offset: -10,
                          style: { 
                            textAnchor: 'middle',
                            fill: '#666',
                            fontSize: 12
                          }
                        }}
                        dx={-10}
                        width={80}
                      />
                      <Tooltip
                        formatter={(value) => {
                          if (value >= 1000000) {
                            return [`$${(value / 1000000).toFixed(1)}m`, 'Median Cost'];
                          }
                          return [`$${(value / 1000).toFixed(0)}k`, 'Median Cost'];
                        }}
                        labelFormatter={(label) => `Date: ${formatMonthYear(label)}`}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        align="center"
                        layout="horizontal"
                        wrapperStyle={{
                          paddingTop: "20px",
                          bottom: 0,
                          fontSize: '12px'
                        }}
                      />
                      {councils.map((council, index) => (
                        <Line
                          key={council}
                          type="monotone"
                          data={typeData.filter(d => d.council === council)}
                          dataKey="medianCost"
                          name={council}
                          stroke={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                          dot={false}
                          strokeWidth={2}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available for selected criteria
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;