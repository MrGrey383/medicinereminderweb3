// src/pages/caregiver/CaregiverDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getLinkedPatients,
  linkCaregiverWithCode,
  removeCaregiverLink,
  getPatientAdherenceData,
  sendCaregiverMessage
} from '../../services/caregiverService';
import {
  Users,
  Plus,
  Pill,
  Check,
  X,
  MessageCircle,
  Link as LinkIcon,
  Trash2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ProgressRing from '../../components/common/ProgressRing';

const CaregiverDashboard = () => {
  const { user } = useApp();
  const [linkedPatients, setLinkedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (user) loadLinkedPatients(); }, [user]);
  useEffect(() => { if (selectedPatient) loadPatientData(selectedPatient.id); }, [selectedPatient]);

  const loadLinkedPatients = async () => {
    try {
      const patients = await getLinkedPatients(user.uid);
      setLinkedPatients(patients);
      if (patients.length > 0 && !selectedPatient) setSelectedPatient(patients[0]);
    } catch (err) { console.error(err); }
  };

  const loadPatientData = async (patientId) => {
    try {
      setLoading(true);
      const data = await getPatientAdherenceData(patientId);
      setPatientData(data);
    } catch (err) {
      console.error('Error loading patient data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPatient = async () => {
    if (!linkCode || linkCode.length !== 6) { setError('Please enter a valid 6-digit code'); return; }
    setLoading(true); setError('');
    try {
      const result = await linkCaregiverWithCode(user.uid, linkCode);
      alert(`Linked with ${result.patientName}`);
      setShowLinkModal(false); setLinkCode('');
      await loadLinkedPatients();
    } catch (err) {
      setError(err.message || 'Failed to link');
    } finally { setLoading(false); }
  };

  const handleRemoveLink = async (linkId, patientName) => {
    if (!confirm(`Remove link with ${patientName}?`)) return;
    try {
      await removeCaregiverLink(linkId);
      await loadLinkedPatients();
      if (selectedPatient?.linkId === linkId) { setSelectedPatient(null); setPatientData(null); }
    } catch (err) { alert('Failed to remove link'); }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) { setError('Please enter a message'); return; }
    setLoading(true); setError('');
    try {
      await sendCaregiverMessage(user.uid, selectedPatient.id, message, 'reminder');
      alert('Message sent!');
      setShowMessageModal(false); setMessage('');
    } catch (err) { setError(err.message || 'Failed to send'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pb-24">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-2xl font-bold mb-1">Caregiver Dashboard</h1><p className="text-indigo-100">Monitor your patients' health</p></div>
          <button onClick={() => setShowLinkModal(true)} className="p-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-colors"><Plus size={24} /></button>
        </div>
        <div className="bg-white bg-opacity-20 rounded-2xl p-4 text-center">
          <Users className="mx-auto mb-2" size={32} />
          <p className="text-3xl font-bold text-indigo-800">{linkedPatients.length}</p>
          <p className="text-sm text-indigo-700">Linked Patients</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {linkedPatients.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="inline-block p-4 bg-indigo-50 rounded-2xl mb-4"><LinkIcon className="text-indigo-300" size={48} /></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Patients Linked</h3>
            <p className="text-gray-600 mb-4">Ask a patient for their 6-digit code to start monitoring.</p>
            <Button onClick={() => setShowLinkModal(true)} icon={Plus}>Link with Patient</Button>
          </Card>
        ) : (
          <>
            <Card className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Your Patients</h3>
              <div className="space-y-2">
                {linkedPatients.map(p => (
                  <div key={p.id} onClick={() => setSelectedPatient(p)} className={`p-4 rounded-xl border-2 cursor-pointer ${selectedPatient?.id === p.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center"><span className="text-white font-bold">{(p.displayName || p.email || 'P').charAt(0).toUpperCase()}</span></div>
                        <div><p className="font-semibold text-gray-800">{p.displayName || 'Patient'}</p><p className="text-sm text-gray-500">{p.email}</p></div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveLink(p.linkId, p.displayName || p.email); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {selectedPatient && patientData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500 mb-1">Total Medicines</p><p className="text-3xl font-bold text-gray-800">{patientData.stats.totalMedicines}</p></div><div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500"><Pill className="text-white" size={24} /></div></div></Card>

                  <Card className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500 mb-1">Taken Today</p><p className="text-3xl font-bold text-green-600">{patientData.stats.takenToday}</p></div><div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500"><Check className="text-white" size={24} /></div></div></Card>

                  <Card className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500 mb-1">Missed Today</p><p className="text-3xl font-bold text-red-600">{patientData.stats.missedToday}</p></div><div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-500"><X className="text-white" size={24} /></div></div></Card>
                </div>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Adherence Rate</h2>
                    <Button onClick={() => setShowMessageModal(true)} icon={MessageCircle} size="sm">Send Reminder</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <ProgressRing percentage={patientData.stats.adherenceRate} />
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-800">{patientData.stats.takenToday}/{patientData.stats.totalMedicines}</p>
                      <p className="text-gray-500">Medicines taken today</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Medicines Schedule</h2>
                  {patientData.medicines.length === 0 ? (<p className="text-center text-gray-500 py-8">No medicines scheduled</p>) : (
                    <div className="space-y-3">
                      {patientData.medicines.map(m => (
                        <div key={m.id} className={`p-4 rounded-xl border-2 ${m.takenHistory && m.takenHistory[new Date().toISOString().split('T')[0]] ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-800">{m.name}</h3>
                                {m.takenHistory && m.takenHistory[new Date().toISOString().split('T')[0]] && (<span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">✓ Taken</span>)}
                              </div>
                              <p className="text-sm text-gray-600">{m.dosage}</p>
                              <p className="text-sm text-gray-500 mt-1">⏰ {m.time} • {m.frequency}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            )}
          </>
        )}
      </div>

      <Modal isOpen={showLinkModal} onClose={() => { setShowLinkModal(false); setLinkCode(''); setError(''); }} title="Link with Patient">
        <div className="space-y-4">
          <p className="text-gray-600">Enter the 6-digit code provided by the patient to link your accounts.</p>
          <Input label="6-Digit Code" value={linkCode} onChange={setLinkCode} placeholder="000000" maxLength={6} />
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { setShowLinkModal(false); setLinkCode(''); setError(''); }} fullWidth>Cancel</Button>
            <Button onClick={handleLinkPatient} disabled={loading || linkCode.length !== 6} fullWidth>{loading ? 'Linking...' : 'Link Patient'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showMessageModal} onClose={() => { setShowMessageModal(false); setMessage(''); setError(''); }} title="Send Reminder">
        <div className="space-y-4">
          <p className="text-gray-600">Send a friendly reminder to {selectedPatient?.displayName || 'the patient'}.</p>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Don't forget to take your evening medicines!" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none resize-none" />
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { setShowMessageModal(false); setMessage(''); setError(''); }} fullWidth>Cancel</Button>
            <Button onClick={handleSendMessage} disabled={loading || !message.trim()} fullWidth>{loading ? 'Sending...' : 'Send Message'}</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CaregiverDashboard;
