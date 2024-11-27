import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from "@/components/ui/button";
import { useMap } from 'react-leaflet';
import { ChevronDown, ChevronUp, Home, ClipboardList } from 'lucide-react';

export function MapFilters({ selectedTypes, setSelectedTypes, searchResults, setFilteredResults, cleanDevelopmentType }) {
  const map = useMap();
  const [container, setContainer] = React.useState(null);
  const [isResFilterExpanded, setIsResFilterExpanded] = React.useState(false);
  const [isStatusFilterExpanded, setIsStatusFilterExpanded] = React.useState(false);
  const [selectedStatuses, setSelectedStatuses] = React.useState([]);
  
  // Calculate counts for residential types
  const typeCounts = React.useMemo(() => {
    if (!searchResults) return {};
    return searchResults.reduce((acc, result) => {
      const cleanedType = cleanDevelopmentType(result.DevelopmentType);
      if (cleanedType) {
        acc[cleanedType] = (acc[cleanedType] || 0) + 1;
      }
      return acc;
    }, {});
  }, [searchResults, cleanDevelopmentType]);

  // Calculate counts for status types based on filtered development types
  const statusCounts = React.useMemo(() => {
    if (!searchResults) return {};
    return searchResults.reduce((acc, result) => {
      const cleanedType = cleanDevelopmentType(result.DevelopmentType);
      // Only count statuses for currently selected development types
      if ((selectedTypes.length === 0 || selectedTypes.includes(cleanedType)) && result.ApplicationStatus) {
        acc[result.ApplicationStatus] = (acc[result.ApplicationStatus] || 0) + 1;
      }
      return acc;
    }, {});
  }, [searchResults, selectedTypes, cleanDevelopmentType]);

  // Get available statuses from the current results
  const availableStatuses = React.useMemo(() => {
    return Object.keys(statusCounts).sort();
  }, [statusCounts]);

  // Filter results when either selection changes
  React.useEffect(() => {
    if (!searchResults) return;
    
    const filtered = searchResults.filter(result => {
      const typeMatch = selectedTypes.length === 0 || 
        selectedTypes.includes(cleanDevelopmentType(result.DevelopmentType));
      
      const statusMatch = selectedStatuses.length === 0 || 
        selectedStatuses.includes(result.ApplicationStatus);
      
      return typeMatch && statusMatch;
    });
    
    setFilteredResults(filtered);
  }, [selectedTypes, selectedStatuses, searchResults, cleanDevelopmentType]);

  // Status filter handlers
  const handleSelectAllStatuses = () => {
    const availableStatusList = availableStatuses.filter(status => statusCounts[status] > 0);
    setSelectedStatuses(availableStatusList);
  };

  const handleClearAllStatuses = () => {
    setSelectedStatuses([]);
  };

  const toggleStatus = (status) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  React.useEffect(() => {
    const controlDiv = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
    controlDiv.style.backgroundColor = 'white';
    controlDiv.style.padding = '0.5rem';
    controlDiv.style.margin = '0.5rem';
    controlDiv.style.marginTop = '10px';
    controlDiv.style.borderRadius = '0.5rem';
    controlDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    controlDiv.style.maxHeight = '80vh';
    controlDiv.style.overflowY = 'auto';
    
    const control = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: function() {
        return controlDiv;
      }
    });
    
    const filterControl = new control();
    filterControl.addTo(map);
    setContainer(controlDiv);
    
    return () => {
      map.removeControl(filterControl);
    };
  }, [map]);

  const handleSelectAll = () => {
    // Only select types that have results
    const availableTypes = Object.keys(typeCounts).sort();
    setSelectedTypes(availableTypes);
  };

  const handleClearAll = () => {
    setSelectedTypes([]);
  };

  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  if (!container) return null;

  return ReactDOM.createPortal(
    <div className="w-64 space-y-4 bg-white/80 backdrop-blur">
      {/* Residential Filter */}
      <div className="bg-white rounded-lg shadow-sm">
        <div 
          className="flex items-center justify-between cursor-pointer p-1"
          onClick={() => setIsResFilterExpanded(!isResFilterExpanded)}
        >
          <div className="flex items-center gap-2">
            <Home size={16} />
            <span className="font-semibold text-sm">Development Filters</span>
          </div>
          {isResFilterExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {isResFilterExpanded && (
          <div className="mt-2">
            <div className="flex gap-2 mb-2">
              <Button 
                size="sm"
                onClick={handleSelectAll}
                variant="outline"
                className="text-xs py-1"
              >
                Select All
              </Button>
              <Button 
                size="sm"
                onClick={handleClearAll}
                variant="outline"
                className="text-xs py-1"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-1">
              {Object.keys(typeCounts).sort().map(type => {
                const count = typeCounts[type] || 0;
                const isDisabled = count === 0;
                
                return (
                  <div key={type} className={`flex items-center ${isDisabled ? 'opacity-50' : ''}`}>
                    <input
                      type="checkbox"
                      id={type}
                      checked={selectedTypes.includes(type)}
                      onChange={() => !isDisabled && toggleType(type)}
                      disabled={isDisabled}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={type} 
                      className={`text-sm flex justify-between w-full ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span>{type}</span>
                      <span className="text-gray-500 ml-2">({count})</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-lg shadow-sm">
        <div 
          className="flex items-center justify-between cursor-pointer p-1"
          onClick={() => setIsStatusFilterExpanded(!isStatusFilterExpanded)}
        >
          <div className="flex items-center gap-2">
            <ClipboardList size={16} />
            <span className="font-semibold text-sm">Status Filters</span>
          </div>
          {isStatusFilterExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        
        {isStatusFilterExpanded && (
          <div className="mt-2">
            <div className="flex gap-2 mb-2">
              <Button 
                size="sm"
                onClick={handleSelectAllStatuses}
                variant="outline"
                className="text-xs py-1"
              >
                Select All
              </Button>
              <Button 
                size="sm"
                onClick={handleClearAllStatuses}
                variant="outline"
                className="text-xs py-1"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-1">
              {availableStatuses.map(status => {
                const isDisabled = statusCounts[status] === 0;
                
                return (
                  <div key={status} className={`flex items-center ${isDisabled ? 'opacity-50' : ''}`}>
                    <input
                      type="checkbox"
                      id={`status-${status}`}
                      checked={selectedStatuses.includes(status)}
                      onChange={() => !isDisabled && toggleStatus(status)}
                      disabled={isDisabled}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`status-${status}`}
                      className={`text-sm w-full ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {status}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>,
    container
  );
} 