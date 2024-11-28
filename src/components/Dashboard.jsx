import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea, LineChart, Line } from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import { councils as councilList } from '@/data/councilList';

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
  'Attached dwelling',
  'Semi-detached dwelling',
  'Terrace housing'
];

const ALL_RESIDENTIAL_TYPES = [
  'Dwelling',
  'House',
  'Secondary dwelling',
  'Dual occupancy',
  'Multi-dwelling housing',
  'Terrace housing',
  'Semi-attached dwelling',
  'Attached dwelling',
  'Semi-detached dwelling',
  'Shop top housing',
  'Boarding house',
  'Seniors housing',
  'Group homes',
  'Build-to-rent',
  'Co-living housing',
  'Manufactured home',
  'Moveable dwelling',
  'Independent living',
  'Manor house'
];

const DEFAULT_COUNCILS = [
  "Blacktown City Council",
  "Central Coast Council",
  "The Hills Shire Council",
  "Parramatta City Council"
];

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

  useEffect(() => {
    fetchLastUpdated();
  }, []);

  useEffect(() => {
    if (selectedCouncils.length > 0 && selectedTypes.length > 0) {
      fetchAllResidentialCosts();
      fetchMedianStoreys();
      fetchDeterminationTimes();
      fetchTotalDwellings();
    }
  }, [selectedCouncils, selectedTypes]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMonthYear = (dateString) => {
    const [year, month] = dateString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const fetchLastUpdated = async () => {
    const { data, error } = await supabase
      .from('development_applications')
      .select('fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      const date = new Date(data[0].fetched_at);
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      setLastUpdated(formattedDate);
    }
  };

  const fetchAllResidentialCosts = async () => {
    try {
      setIsLoading(true);

      let allData = [];
      let overallData = {};
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      // First, fetch overall medians for selected types
      for (const type of selectedTypes) {
        const { data, error } = await supabase
          .from('development_applications')
          .select('CostOfDevelopment, NumberOfNewDwellings')
          .eq('clean_development_type', type)
          .not('CostOfDevelopment', 'is', null)
          .not('NumberOfNewDwellings', 'is', null)
          .gt('CostOfDevelopment', 0)
          .gt('NumberOfNewDwellings', 0);

        if (!error && data) {
          const costs = data
            .map(row => parseFloat(row.CostOfDevelopment) / parseInt(row.NumberOfNewDwellings))
            .filter(cost => !isNaN(cost) && cost >= MIN_COST_THRESHOLD)
            .sort((a, b) => a - b);
          
          if (costs.length > 0) {
            overallData[type] = calculateMedian(costs);
          }
        }
      }

      // Then fetch data for selected councils
      while (hasMore) {
        const { data, error } = await supabase
          .from('development_applications')
          .select('clean_development_type, CostOfDevelopment, NumberOfNewDwellings, CouncilName')
          .in('clean_development_type', selectedTypes)
          .in('CouncilName', selectedCouncils)
          .not('CostOfDevelopment', 'is', null)
          .not('NumberOfNewDwellings', 'is', null)
          .gt('CostOfDevelopment', 0)
          .gt('NumberOfNewDwellings', 0)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error('Error fetching residential costs:', error);
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

      const costsByTypeAndCouncil = allData.reduce((acc, curr) => {
        const cost = parseFloat(curr.CostOfDevelopment);
        const dwellings = parseInt(curr.NumberOfNewDwellings);
        
        if (isNaN(cost) || cost <= 0 || isNaN(dwellings) || dwellings <= 0) {
          return acc;
        }

        const costPerDwelling = cost / dwellings;
        
        // Skip if cost per dwelling is below threshold
        if (costPerDwelling < MIN_COST_THRESHOLD) {
          return acc;
        }

        const key = curr.clean_development_type;

        if (!acc[key]) {
          acc[key] = {
            type: key,
            count: 0
          };
          selectedCouncils.forEach(council => {
            acc[key][council] = [];
            acc[key][`${council}Count`] = 0;
          });
        }

        acc[key][curr.CouncilName].push(costPerDwelling);
        acc[key][`${curr.CouncilName}Count`]++;
        acc[key].count++;

        return acc;
      }, {});

      const chartData = Object.values(costsByTypeAndCouncil).map(item => {
        const result = {
          type: item.type,
          count: item.count,
          overallMedian: overallData[item.type] || 0
        };

        selectedCouncils.forEach(council => {
          const costs = item[council];
          if (costs.length > 0) {
            const sortedCosts = costs.sort((a, b) => a - b);
            result[council] = calculateMedian(sortedCosts);
            result[`${council}Count`] = item[`${council}Count`];
          } else {
            result[council] = 0;
            result[`${council}Count`] = 0;
          }
        });

        return result;
      }).sort((a, b) => {
        const aMax = Math.max(...selectedCouncils.map(council => a[council] || 0));
        const bMax = Math.max(...selectedCouncils.map(council => b[council] || 0));
        return bMax - aMax;
      });

      setStats(prev => ({ 
        ...prev, 
        residentialCosts: chartData,
        overallMedians: overallData 
      }));
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchResidentialCosts:', error);
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
          .select('clean_development_type, NumberOfStoreys, CouncilName')
          .in('clean_development_type', selectedTypes)
          .in('CouncilName', selectedCouncils)
          .not('NumberOfStoreys', 'is', null)
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
        const council = row.CouncilName;
        if (!groupedData[type]) {
          groupedData[type] = {};
        }
        if (!groupedData[type][council]) {
          groupedData[type][council] = [];
        }
        groupedData[type][council].push(row.NumberOfStoreys);
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
    const diffTime = determineDate - lodgeDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };

  const fetchDeterminationTimes = async () => {
    try {
      setIsLoading(true);

      let allData = [];
      let overallData = {};
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      // First, fetch overall medians for selected types
      for (const type of selectedTypes) {
        const { data, error } = await supabase
          .from('development_applications')
          .select('LodgementDate, DeterminationDate')
          .eq('clean_development_type', type)
          .not('LodgementDate', 'is', null)
          .not('DeterminationDate', 'is', null);

        if (!error && data) {
          const times = data
            .map(row => calculateDaysBetween(row.LodgementDate, row.DeterminationDate))
            .filter(days => days !== null)
            .sort((a, b) => a - b);
          
          if (times.length > 0) {
            overallData[type] = calculateMedian(times);
          }
        }
      }

      // Then fetch data for selected councils
      while (hasMore) {
        const { data, error } = await supabase
          .from('development_applications')
          .select('clean_development_type, LodgementDate, DeterminationDate, CouncilName')
          .in('clean_development_type', selectedTypes)
          .in('CouncilName', selectedCouncils)
          .not('LodgementDate', 'is', null)
          .not('DeterminationDate', 'is', null)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error('Error fetching determination times:', error);
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

      const timesByTypeAndCouncil = allData.reduce((acc, curr) => {
        const days = calculateDaysBetween(curr.LodgementDate, curr.DeterminationDate);
        if (days === null) return acc;

        const key = curr.clean_development_type;

        if (!acc[key]) {
          acc[key] = {
            type: key,
            count: 0
          };
          selectedCouncils.forEach(council => {
            acc[key][council] = [];
            acc[key][`${council}Count`] = 0;
          });
        }

        acc[key][curr.CouncilName].push(days);
        acc[key][`${curr.CouncilName}Count`]++;
        acc[key].count++;

        return acc;
      }, {});

      const chartData = Object.values(timesByTypeAndCouncil).map(item => {
        const result = {
          type: item.type,
          count: item.count,
          overallMedian: overallData[item.type] || 0
        };

        selectedCouncils.forEach(council => {
          const times = item[council];
          if (times.length > 0) {
            const sortedTimes = times.sort((a, b) => a - b);
            result[council] = calculateMedian(sortedTimes);
            result[`${council}Count`] = item[`${council}Count`];
          } else {
            result[council] = 0;
            result[`${council}Count`] = 0;
          }
        });

        return result;
      }).sort((a, b) => {
        const aMax = Math.max(...selectedCouncils.map(council => a[council] || 0));
        const bMax = Math.max(...selectedCouncils.map(council => b[council] || 0));
        return bMax - aMax;
      });

      setStats(prev => ({ 
        ...prev, 
        determinationTimes: chartData
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

      // Fetch data for selected councils and types
      while (hasMore) {
        const { data, error } = await supabase
          .from('development_applications')
          .select('clean_development_type, PlanningPortalApplicationNumber, LodgementDate, NumberOfNewDwellings, CouncilName')
          .in('clean_development_type', selectedTypes)
          .in('CouncilName', selectedCouncils)
          .not('NumberOfNewDwellings', 'is', null)
          .not('LodgementDate', 'is', null)
          .order('LodgementDate', { ascending: true })
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
        const appNumber = row.PlanningPortalApplicationNumber;
        const currentDate = new Date(row.LodgementDate);
        
        if (!latestApplications.has(appNumber) || 
            currentDate > new Date(latestApplications.get(appNumber).lodgementDate)) {
          latestApplications.set(appNumber, {
            lodgementDate: row.LodgementDate,
            councilName: row.CouncilName,
            dwellings: row.NumberOfNewDwellings
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
        .sort((a, b) => new Date(a.lodgementDate) - new Date(b.lodgementDate))
        .forEach(app => {
          const date = new Date(app.lodgementDate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: monthKey,
              ...councilTotals
            };
          }
          
          councilTotals[app.councilName] += app.dwellings;
          monthlyData[monthKey][app.councilName] = councilTotals[app.councilName];
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
              return (
                <p key={index} style={{ color: entry.color }}>
                  {council}: {formatCurrency(entry.value)} ({count} developments)
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
                  {entry.name}: {entry.value.toFixed(1)} storeys
                  {entry.name === "NSW Median" && ` (${entry.payload.applicationCount} applications)`}
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
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">NSW Development Dashboard</h1>
        <p className="text-gray-600 mb-1">Development Applications lodged in last 12 months</p>
        {lastUpdated && (
          <p className="text-gray-600">
            Data last updated {lastUpdated}
          </p>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col gap-6">
        {/* Left Sidebar Controls */}
        <div className="bg-white rounded-lg shadow p-4">
          {/* Council Selection */}
          <div className="mb-6">
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

          {/* Residential Type Selection */}
          <div>
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

        {/* Right Side Charts Grid */}
        <div className="flex flex-col space-y-6">
          {/* Charts Grid */}
          <div className="flex flex-col gap-6">
            {/* Cost Chart */}
            <div className="bg-white rounded-lg shadow p-4 h-[600px]">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Median Cost per Dwelling by Residential Type</h2>
              </div>
              <div className="h-[calc(100%-6rem)]">
                {!isLoading && stats.residentialCosts.length > 0 ? (
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
                    {isLoading ? "Loading data..." : "No data available"}
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
                {!isLoading && stats.determinationTimes.length > 0 ? (
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
                    {isLoading ? "Loading data..." : "No data available"}
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
                {!isLoading && stats.totalDwellings.length > 0 ? (
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
                        width={80}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => value.toLocaleString('en-US', {
                          maximumFractionDigits: 0,
                          notation: 'standard'
                        })}
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
                    {isLoading ? "Loading data..." : "No data available"}
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
                {!isLoading && stats.medianStoreys.length > 0 ? (
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
                    {isLoading ? "Loading data..." : "No data available"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;