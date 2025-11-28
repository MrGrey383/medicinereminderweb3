import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  generateCaregiverLinkCode,
  getLinkedCaregivers,
  removeCaregiverLink
} from '../../services/caregiverService';
import {
  Link as LinkIcon,
  Copy,
  RefreshCw,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";


const CaregiverLinking = () => {
  const { user } = useApp();
  const [linkCode, setLinkCode] = useState(null);
  const [linkedCaregivers, setLinkedCaregivers] = useState([]);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (user) {
      loadLinkedCaregivers();
    }
  }, [user]);

  useEffect(() => {
    if (linkCode && linkCode.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((linkCode.expiresAt - now) / 1000));
        setTimeRemaining(remaining);

        if (remaining === 0) {
          setLinkCode(null);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [linkCode]);

  const loadLinkedCaregivers = async () => {
    try {
      const caregivers = await getLinkedCaregivers(user.uid);
      setLinkedCaregivers(caregivers);
    } catch (error) {
      console.error('Error loading caregivers:', error);
    }
  };

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const result = await generateCaregiverLinkCode(user.uid);
      setLinkCode(result);
      setShowCodeModal(true);
    } catch (error) {
      alert('Failed to generate code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(linkCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemoveCaregiver = async (linkId, caregiverName) => {
    if (window.confirm(`Remove ${caregiverName} as your caregiver?`)) {
      try {
        await removeCaregiverLink(linkId);
        await loadLinkedCaregivers();
      } catch (error) {
        alert('Failed to remove caregiver');
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Caregiver Access</h2>
            <p className="text-sm text-gray-600">
              Allow family or caregivers to monitor your health
            </p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Users className="text-indigo-600" size={24} />
          </div>
        </div>

        <Button
          onClick={handleGenerateCode}
          disabled={loading}
          icon={LinkIcon}
          fullWidth
        >
          {loading ? 'Generating...' : 'Generate Link Code'}
        </Button>
      </Card>

      {/* Linked Caregivers */}
      {linkedCaregivers.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Linked Caregivers ({linkedCaregivers.length})
          </h3>
          <div className="space-y-3">
            {linkedCaregivers.map((caregiver) => (
              <div
                key={caregiver.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {(caregiver.displayName || caregiver.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {caregiver.displayName || 'Caregiver'}
                    </p>
                    <p className="text-sm text-gray-500">{caregiver.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Linked {new Date(caregiver.linkedAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCaregiver(
                    caregiver.linkId,
                    caregiver.displayName || caregiver.email
                  )}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">What caregivers can see:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Your medicine schedule</li>
              <li>Adherence rate and history</li>
              <li>Missed doses</li>
            </ul>
            <p className="mt-2 font-semibold">What they cannot do:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Add, edit, or delete your medicines</li>
              <li>Access your personal information</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Link Code Modal */}
      <Modal
        isOpen={showCodeModal}
        onClose={() => {
          setShowCodeModal(false);
          setCopied(false);
        }}
        title="Share This Code"
      >
        <div className="space-y-6">
          {/* Code Display */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Share this 6-digit code with your caregiver
            </p>
            
            {linkCode && (
              <>
                {/* Large Code Display */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-8 mb-4">
                  <div className="flex justify-center gap-2">
                    {linkCode.code.split('').map((digit, index) => (
                      <div
                        key={index}
                        className="w-12 h-16 bg-white rounded-lg flex items-center justify-center"
                      >
                        <span className="text-3xl font-bold text-gray-800">
                          {digit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="text-orange-500" size={20} />
                  <span className={`font-mono text-lg font-bold ${
                    timeRemaining < 60 ? 'text-red-600' : 'text-gray-700'
                  }`}>
                    {formatTime(timeRemaining)}
                  </span>
                  <span className="text-sm text-gray-500">remaining</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      timeRemaining < 60 ? 'bg-red-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${(timeRemaining / (15 * 60)) * 100}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleCopyCode}
              icon={copied ? CheckCircle : Copy}
              variant={copied ? 'success' : 'primary'}
              fullWidth
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>

            <Button
              onClick={async () => {
                setShowCodeModal(false);
                await handleGenerateCode();
              }}
              icon={RefreshCw}
              variant="secondary"
              fullWidth
            >
              Generate New Code
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-800 mb-2">
              Instructions for Caregiver:
            </p>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Open the Medicine Reminder app</li>
              <li>Sign up or log in as a Caregiver</li>
              <li>Click "Link with Patient"</li>
              <li>Enter this 6-digit code</li>
              <li>Start monitoring your health!</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-500 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-orange-800 mb-1">
                  Important
                </p>
                <p className="text-sm text-orange-700">
                  This code expires in 15 minutes. Only share it with people you trust.
                  You can remove caregiver access at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CaregiverLinking;