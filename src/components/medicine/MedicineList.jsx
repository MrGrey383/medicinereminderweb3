import React from 'react';
import MedicineCard from './MedicineCard';
import { Pill } from 'lucide-react';

const MedicineList = ({ 
  medicines, 
  onEdit, 
  onDelete, 
  onToggleTaken,
  emptyMessage = 'No medicines found',
  emptyAction
}) => {
  if (medicines.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="inline-block p-4 bg-indigo-50 rounded-2xl mb-4">
          <Pill className="text-indigo-300" size={48} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {emptyMessage}
        </h3>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {medicines.map((medicine) => (
        <MedicineCard
          key={medicine.id}
          medicine={medicine}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleTaken={onToggleTaken}
        />
      ))}
    </div>
  );
};

export default MedicineList;