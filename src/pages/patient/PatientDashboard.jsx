// src/pages/patient/PatientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Bell, Pill, Check, TrendingUp, Calendar, Clock, Users } from 'lucide-react';
import MedicineCard from '../../components/medicine/MedicineCard';
import AddMedicineModal from '../../components/medicine/AddMedicineModal';
import CaregiverLinking from "./CaregiverLinking";
import ProgressRing from '../../components/common/ProgressRing';
import { migrateMedicineData } from '../../utils/migrateMedicineData';

const todayKey = () => new Date().toISOString().split('T')[0];

const PatientDashboard = () => {
  const { medicines, toggleMedicineTaken, deleteMedicine, updateMedicine, user } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('schedule');
  const [migrationStatus, setMigrationStatus] = useState(null);

  // Run migration once
  useEffect(() => {
    if (user?.uid) {
      const hasMigrated = localStorage.getItem(`medicines_migrated_${user.uid}`);
      
      if (!hasMigrated) {
        console.log('🔄 Running medicine data migration...');
        setMigrationStatus('migrating');
        
        migrateMedicineData(user.uid)
          .then(result => {
            if (result.success) {
              localStorage.setItem(`medicines_migrated_${user.uid}`, 'true');
              console.log('✅ Migration completed:', result.migratedCount, 'medicines updated');
              setMigrationStatus('success');
              setTimeout(() => setMigrationStatus(null), 3000);
            } else {
              console.error('❌ Migration failed:', result.error);
              setMigrationStatus('error');
            }
          })
          .catch(error => {
            console.error('❌ Migration error:', error);
            setMigrationStatus('error');
          });
      }
    }
  }, [user]);

  const totalMedicines = medicines.length;
  const takenToday = medicines.filter(m => m.takenHistory && m.takenHistory[todayKey()]).length;
  const adherenceRate = totalMedicines > 0 ? (takenToday / totalMedicines) * 100 : 0;

  const todayMedicines = medicines;
  const nextReminder = todayMedicines.find(m => !(m.takenHistory && m.takenHistory[todayKey()]));
  const sortedMedicines = [...todayMedicines].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleEdit = (med) => setEditingMedicine(med);
  
  const handleDelete = async (id) => { 
    if (window.confirm('Delete this medicine?')) {
      try {
        await deleteMedicine(id);
      } catch (error) {
        alert('Failed to delete medicine');
      }
    }
  };
  
  const handleToggleTaken = async (id) => { 
    try { 
      await toggleMedicineTaken(id); 
    } catch (error) {
      console.error('Failed to toggle medicine:', error);
      alert('Failed to update medicine status'); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-24">

      {/* Migration Status Banner */}
      {migrationStatus === 'migrating' && (
        <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm">
          🔄 Updating your medicine data...
        </div>
      )}
      {migrationStatus === 'success' && (
        <div className="bg-green-500 text-white px-4 py-2 text-center text-sm">
          ✅ Data updated successfully!
        </div>
      )}
      {migrationStatus === 'error' && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
          ⚠️ Migration had issues. Please refresh the page.
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">{getGreeting()}! 👋</h1>
            <p className="text-indigo-100">{user?.displayName || user?.email?.split('@')[0] || 'User'}</p>
          </div>

          <button className="p-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-colors">
            <Bell size={24} />
          </button>
        </div>

        {/* Stats Cards Grid — FIXED */}
        <div className="grid grid-cols-3 gap-3">

          <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
            <Pill className="mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{totalMedicines}</p>
            <p className="text-xs text-white/80">Medicines</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
            <Check className="mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{takenToday}</p>
            <p className="text-xs text-white/80">Taken</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
            <TrendingUp className="mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-white">{Math.round(adherenceRate)}%</p>
            <p className="text-xs text-white/80">Rate</p>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white rounded-xl p-2 shadow-md">
          <button 
            onClick={() => setActiveTab('schedule')} 
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'schedule' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Pill size={20} />
              <span>Schedule</span>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab('caregivers')} 
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'caregivers' 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users size={20} />
              <span>Caregivers</span>
            </div>
          </button>
        </div>

        {activeTab === 'schedule' ? (
          <>
            {/* Progress Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Progress</h2>

              <div className="flex items-center justify-between">
                <ProgressRing percentage={adherenceRate} />

                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-800">
                    {takenToday}/{totalMedicines}
                  </p>
                  <p className="text-gray-500 mb-3">Medicines taken</p>

                  {nextReminder && (
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-indigo-700 font-medium flex items-center gap-2">
                        <Clock size={16}/>
                        Next: {nextReminder.name}
                      </p>
                      <p className="text-xs text-indigo-600">{nextReminder.time}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date Card */}
            <div className="bg-white rounded-2xl shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="text-indigo-600" size={20} />
                  <span className="font-medium text-gray-800">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Medicines List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Today's Schedule</h2>

                <button 
                  onClick={() => setShowAddModal(true)} 
                  className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                >
                  <Plus size={20}/>
                  Add
                </button>
              </div>

              {sortedMedicines.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                  <div className="inline-block p-4 bg-indigo-50 rounded-2xl mb-4">
                    <Pill className="text-indigo-300" size={48} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Medicines Yet</h3>
                  <p className="text-gray-500 mb-4">Start by adding your first medicine to track</p>

                  <button 
                    onClick={() => setShowAddModal(true)} 
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Add Your First Medicine
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedMedicines.map(m => (
                    <MedicineCard
                      key={m.id}
                      medicine={m}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleTaken={handleToggleTaken}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <CaregiverLinking />
        )}
      </div>

      {/* Floating Add Button */}
      {activeTab === 'schedule' && (
        <button 
          onClick={() => setShowAddModal(true)} 
          className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center z-10 hover:shadow-xl transition-all hover:scale-110"
        >
          <Plus className="text-white" size={28} />
        </button>
      )}

      {/* Add/Edit Medicine Modal */}
      {(showAddModal || editingMedicine) && (
        <AddMedicineModal 
          medicine={editingMedicine} 
          onClose={() => { 
            setShowAddModal(false); 
            setEditingMedicine(null); 
          }} 
        />
      )}
    </div>
  );
};

export default PatientDashboard;
