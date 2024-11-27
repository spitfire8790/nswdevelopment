import React, { useState } from 'react';
import { TileLayer } from 'react-leaflet';
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ChevronUp, ChevronDown } from "lucide-react";

export const LayerControl = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [layers, setLayers] = useState({
    todSites: {
      visible: false,
      opacity: 0.7
    },
    landZoning: {
      visible: false,
      opacity: 0.7
    }
  });

  const toggleLayer = (layerId) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        visible: !prev[layerId].visible
      }
    }));
  };

  const updateOpacity = (layerId, value) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        opacity: value[0]
      }
    }));
  };

  return (
    <div className="absolute bottom-5 right-5 z-[1000]">
      <Card className="w-64 bg-white shadow-lg">
        <div 
          className="p-2 border-b flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="font-medium">Map Overlays</span>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
        
        {isExpanded && (
          <div className="p-3 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">TOD Sites</label>
                <Switch 
                  checked={layers.todSites.visible}
                  onCheckedChange={() => toggleLayer('todSites')}
                />
              </div>
              {layers.todSites.visible && (
                <div className="pl-4">
                  <label className="text-xs text-gray-600">Opacity</label>
                  <Slider
                    value={[layers.todSites.opacity]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => updateOpacity('todSites', value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Land Zoning</label>
                <Switch 
                  checked={layers.landZoning.visible}
                  onCheckedChange={() => toggleLayer('landZoning')}
                />
              </div>
              {layers.landZoning.visible && (
                <div className="pl-4">
                  <label className="text-xs text-gray-600">Opacity</label>
                  <Slider
                    value={[layers.landZoning.opacity]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={(value) => updateOpacity('landZoning', value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Render layers */}
      {layers.todSites.visible && (
        <TileLayer
          url="https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/SEPP_Housing_2021/MapServer/3/tile/{z}/{y}/{x}"
          opacity={layers.todSites.opacity}
          zIndex={10}
        />
      )}
      {layers.landZoning.visible && (
        <TileLayer
          url="https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Principal_Planning_Layers/MapServer/11/tile/{z}/{y}/{x}"
          opacity={layers.landZoning.opacity}
          zIndex={9}
        />
      )}
    </div>
  );
}; 