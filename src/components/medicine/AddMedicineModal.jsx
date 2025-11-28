import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const AddMedicineModal = ({ medicine, onClose }) => {
  const { addMedicine, updateMedicine } = useApp();
  const [formData, setFormData] = useState({
    name: medicine?.name || '',
    dosage: medicine?.dosage || '',
    time: medicine?.time || '08:00',
    frequency: medicine?.frequency || 'Daily',
    notes: medicine?.notes || '',
    color: medicine?.color || 'blue'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = [
    { name: 'blue', class: 'bg-gradient-to-br from-blue-400 to-blue-600' },
    { name: 'purple', class: 'bg-gradient-to-br from-purple-400 to-purple-600' },
    { name: 'pink', class: 'bg-gradient-to-br from-pink-400 to-pink-600' },
    { name: 'green', class: 'bg-gradient-to-br from-green-400 to-green-600' },
    { name: 'orange', class: 'bg-gradient-to-br from-orange-400 to-orange-600' }
  ];

  const frequencies = [
    'Once Daily',
    'Twice Daily',
    'Three Times Daily',
    'Four Times Daily',
    'Weekly',
    'As Needed'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Medicine name is required');
      return;
    }

    if (!formData.dosage.trim()) {
      setError('Dosage is required');
      return;
    }

    setLoading(true);

    try {
      if (medicine) {
        // Update existing medicine
        await updateMedicine(medicine.id, formData);
      } else {
        // Add new medicine
        await addMedicine(formData);
      }
      onClose();
    } catch (err) {
      console.error('Error saving medicine:', err);
      setError('Failed to save medicine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={medicine ? 'Edit Medicine' : 'Add New Medicine'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Medicine Name */}
        <Input
          label="Medicine Name"
          value={formData.name}
          onChange={(val) => setFormData({ ...formData, name: val })}
          placeholder="e.g., Panadol, Aspirin"
          required
        />

        {/* Dosage */}
        <Input
          label="Dosage"
          value={formData.dosage}
          onChange={(val) => setFormData({ ...formData, dosage: val })}
          placeholder="e.g., 2 tablets, 10mg"
          required
        />

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors"
          >
            {frequencies.map(freq => (
              <option key={freq} value={freq}>{freq}</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special instructions..."
            rows="3"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Color Tag */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Color Tag
          </label>
          <div className="flex gap-3 flex-wrap">
            {colors.map(color => (
              <button
                key={color.name}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.name })}
                className={`
                  w-12 h-12 rounded-xl transition-all ${color.class}
                  ${formData.color === color.name 
                    ? 'ring-4 ring-offset-2 ring-indigo-300 scale-110' 
                    : 'hover:scale-105'
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Saving...' : medicine ? 'Update Medicine' : 'Add Medicine'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMedicineModal;