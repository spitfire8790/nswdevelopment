import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    averageCost: 0,
    statusBreakdown: [],
    monthlyTrends: [],
    councilBreakdown: [],
    medianCosts: []
  });
  
  const [availableCouncils, setAvailableCouncils] = useState([]);
  const [selectedCouncils, setSelectedCouncils] = useState(['All']);
  const [developmentTypes, setDevelopmentTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(['All']);

  // Fetch available councils and development types
  const fetchFilters = async () => {
    const { data: councilData } = await supabase
      .from('median_construction_costs')
      .select('CouncilName')
      .distinct();
    
    const { data: typeData } = await supabase
      .from('median_construction_costs')
      .select('clean_development_type')
      .distinct();

    setAvailableCouncils(['All', ...councilData.map(c => c.CouncilName).sort()]);
    setDevelopmentTypes(['All', ...typeData.map(t => t.clean_development_type).sort()]);
  };

  // Fetch median costs based on selections
  const fetchMedianCosts = async () => {
    let query = supabase
      .from('median_construction_costs')
      .select('*');

    if (!selectedCouncils.includes('All')) {
      query = query.in('CouncilName', selectedCouncils);
    }
    
    if (!selectedTypes.includes('All')) {
      query = query.in('clean_development_type', selectedTypes);
    }

    const { data } = await query;
    setStats(prev => ({ ...prev, medianCosts: data }));
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchMedianCosts();
  }, [selectedCouncils, selectedTypes]);

  const fetchDashboardStats = async () => {
    try {
      // Get total applications
      const { count: totalApplications } = await supabase
        .from('development_applications')
        .select('*', { count: 'exact', head: true });

      // Get average cost
      const { data: costData } = await supabase
        .from('development_applications')
        .select('cost_of_development')
        .not('cost_of_development', 'is', null);

      const averageCost = costData.reduce((acc, curr) => acc + curr.cost_of_development, 0) / costData.length;

      // Get status breakdown
      const { data: statusData } = await supabase
        .from('development_applications')
        .select('ApplicationStatus')
        .not('ApplicationStatus', 'is', null);

      const statusBreakdown = Object.entries(
        statusData.reduce((acc, curr) => {
          acc[curr.ApplicationStatus] = (acc[curr.ApplicationStatus] || 0) + 1;
          return acc;
        }, {})
      ).map(([status, count]) => ({ status, count }));

      // Get monthly trends (last 12 months)
      const { data: monthlyData } = await supabase
        .from('development_applications')
        .select('LodgementDate')
        .gte('LodgementDate', new Date(new Date().setMonth(new Date().getMonth() - 12)).toISOString());

      const monthlyTrends = Object.entries(
        monthlyData.reduce((acc, curr) => {
          const month = new Date(curr.LodgementDate).toLocaleString('default', { month: 'short' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {})
      ).map(([month, count]) => ({ month, count }));

      // Get council breakdown (top 10)
      const { data: councilData, error: councilError } = await supabase
        .from('development_applications')
        .select(`
          CouncilName,
          count(*) as count
        `)
        .not('CouncilName', 'is', null)
        .group('CouncilName')
        .order('count', { ascending: false })
        .limit(10);

      if (councilError) {
        console.error('Error fetching council data:', councilError);
        return;
      }

      const councilBreakdown = councilData?.map(row => ({
        council: row.CouncilName,
        count: parseInt(row.count)
      })) || [];

      // Get median residential construction cost
      const { data: residentialCostData } = await supabase
        .from('development_applications')
        .select('cost_of_development, clean_development_type')
        .not('cost_of_development', 'is', null)
        .in('clean_development_type', [
          'Dwelling', 'House', 'Dual occupancy', 'Apartments', 
          'Multi-dwelling housing', 'Terrace housing', 'Semi-attached dwelling',
          'Attached dwelling', 'Semi-detached dwelling', 'Shop top housing',
          'Boarding house', 'Seniors housing', 'Group homes', 'Build-to-rent',
          'Co-living housing', 'Manufactured home', 'Moveable dwelling',
          'Rural worker\'s dwelling', 'Independent living', 'Manor house',
          'Medium density', 'Non-standard'
        ]);

      const residentialCosts = residentialCostData
        .map(item => item.cost_of_development)
        .sort((a, b) => a - b);

      const medianResidentialCost = residentialCosts.length % 2 === 0
        ? (residentialCosts[residentialCosts.length / 2 - 1] + residentialCosts[residentialCosts.length / 2]) / 2
        : residentialCosts[Math.floor(residentialCosts.length / 2)];

      setStats({
        totalApplications,
        averageCost,
        statusBreakdown,
        monthlyTrends,
        councilBreakdown,
        medianResidentialCost
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Development Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(stats.averageCost).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Median Residential Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(stats.medianResidentialCost).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.statusBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="status" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Council Breakdown */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Top 10 Councils by Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.councilBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="council" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Median Costs Section */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Median Construction Costs</CardTitle>
          <div className="flex gap-4 mt-4">
            {/* Council Selector */}
            <div className="w-1/3">
              <Label>Councils</Label>
              <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                {availableCouncils.map(council => (
                  <div key={council} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      checked={selectedCouncils.includes(council)}
                      onCheckedChange={(checked) => {
                        if (council === 'All') {
                          setSelectedCouncils(checked ? ['All'] : []);
                        } else {
                          setSelectedCouncils(prev => {
                            if (checked) {
                              const newSelection = prev.filter(c => c !== 'All').concat(council);
                              return newSelection;
                            }
                            return prev.filter(c => c !== council);
                          });
                        }
                      }}
                    />
                    <Label className="text-sm">{council}</Label>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* Development Type Selector */}
            <div className="w-1/3">
              <Label>Development Types</Label>
              <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                {developmentTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (type === 'All') {
                          setSelectedTypes(checked ? ['All'] : []);
                        } else {
                          setSelectedTypes(prev => {
                            if (checked) {
                              const newSelection = prev.filter(t => t !== 'All').concat(type);
                              return newSelection;
                            }
                            return prev.filter(t => t !== type);
                          });
                        }
                      }}
                    />
                    <Label className="text-sm">{type}</Label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.medianCosts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="clean_development_type" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100} 
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, "Median Cost"]}
                />
                <Bar 
                  dataKey="median_cost" 
                  fill="#4f46e5" 
                  name="Median Cost"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 