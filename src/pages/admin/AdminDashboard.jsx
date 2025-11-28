import React, { useState, useEffect } from 'react';
import {
  getSystemAnalytics,
  getUserGrowthData,
  getMedicineStatistics,
  getSystemActivity,
  getAdherenceDistribution
} from '../../services/adminService';
import {
  Users,
  Pill,
  Activity,
  TrendingUp,
  BarChart3,
  Clock,
  Shield,
  RefreshCw,
  LogOut
} from 'lucide-react';
import Card from '../../components/common/Card';
import StatsCard from '../../components/common/StatsCard';

const AdminDashboard = ({ onLogout }) => {
  const [analytics, setAnalytics] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [medicineStats, setMedicineStats] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [adherenceDistribution, setAdherenceDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);

      const [
        analyticsData,
        growth,
        medStats,
        activity,
        adherence
      ] = await Promise.all([
        getSystemAnalytics(),
        getUserGrowthData(30),
        getMedicineStatistics(),
        getSystemActivity(15),
        getAdherenceDistribution()
      ]);

      setAnalytics(analyticsData);
      setGrowthData(growth);
      setMedicineStats(medStats);
      setActivityLogs(activity);
      setAdherenceDistribution(adherence);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-300 text-sm">System Analytics & Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock size={16} />
            <span>Last updated: {new Date(analytics?.lastUpdated).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={Users}
            label="Total Users"
            value={analytics?.totalUsers || 0}
            color="indigo"
          />
          <StatsCard
            icon={Users}
            label="Patients"
            value={analytics?.patientCount || 0}
            color="green"
          />
          <StatsCard
            icon={Users}
            label="Caregivers"
            value={analytics?.caregiverCount || 0}
            color="purple"
          />
          <StatsCard
            icon={Pill}
            label="Total Medicines"
            value={analytics?.totalMedicines || 0}
            color="orange"
          />
        </div>

        {/* Adherence Overview */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={24} className="text-indigo-600" />
            System Adherence Rate
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="#e5e7eb"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="url(#gradient)"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${(analytics?.avgAdherence / 100) * 502.4} 502.4`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-800">
                      {analytics?.avgAdherence || 0}%
                    </span>
                    <span className="text-sm text-gray-500">Average</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-3">Distribution</h3>
              {adherenceDistribution && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Excellent (80-100%)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${adherenceDistribution.excellent}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                        {adherenceDistribution.excellent}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Good (60-79%)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: `${adherenceDistribution.good}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                        {adherenceDistribution.good}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fair (40-59%)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${adherenceDistribution.fair}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                        {adherenceDistribution.fair}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Needs Attention (&lt;40%)</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${adherenceDistribution.poor}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                        {adherenceDistribution.poor}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* User Growth Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={24} className="text-green-600" />
            User Growth (Last 30 Days)
          </h2>
          <div className="h-64 flex items-end justify-between gap-1">
            {growthData.slice(-14).map((day, index) => {
              const maxValue = Math.max(...growthData.map(d => d.patients + d.caregivers));
              const totalHeight = ((day.patients + day.caregivers) / maxValue) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse gap-1" style={{ height: '200px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t"
                      style={{ height: `${(day.patients / maxValue) * 200}px` }}
                      title={`Patients: ${day.patients}`}
                    />
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t"
                      style={{ height: `${(day.caregivers / maxValue) * 200}px` }}
                      title={`Caregivers: ${day.caregivers}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-500 rounded"></div>
              <span className="text-sm text-gray-600">Patients</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-600">Caregivers</span>
            </div>
          </div>
        </Card>

        {/* Medicine Statistics */}
        {medicineStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Frequency */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 size={24} className="text-orange-600" />
                Medicines by Frequency
              </h2>
              <div className="space-y-3">
                {Object.entries(medicineStats.byFrequency || {}).map(([freq, count]) => (
                  <div key={freq} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{freq}</span>
                    <div className="flex items-center gap-2 flex-1 mx-4">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ 
                            width: `${(count / medicineStats.totalMedicines) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* By Time Slot */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={24} className="text-blue-600" />
                Medicines by Time Slot
              </h2>
              <div className="space-y-3">
                {Object.entries(medicineStats.byTimeSlot || {}).map(([slot, count]) => (
                  <div key={slot} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{slot}</span>
                    <div className="flex items-center gap-2 flex-1 mx-4">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ 
                            width: `${(count / medicineStats.totalMedicines) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">System Activity</h2>
          {activityLogs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{log.action || 'System Event'}</p>
                    <p className="text-sm text-gray-500">
                      {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString() : 'Unknown time'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;