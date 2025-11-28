import React from 'react';
import { Pill, Clock, Calendar, Edit2, Trash2, Check } from 'lucide-react';

const MedicineCard = ({ 
  medicine, 
  onEdit, 
  onDelete, 
  onToggleTaken 
}) => {

  const today = new Date().toISOString().split("T")[0];
  const isTakenToday = medicine.takenHistory?.[today] === true;

  const colorClasses = {
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    pink: 'from-pink-400 to-pink-600',
    green: 'from-green-400 to-green-600',
    orange: 'from-orange-400 to-orange-600',
    red: 'from-red-400 to-red-600',
    indigo: 'from-indigo-400 to-indigo-600',
    yellow: 'from-yellow-400 to-yellow-600'
  };

  const getBgColorClass = (color) => colorClasses[color] || colorClasses.blue;

  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-md p-5 transition-all duration-300
        hover:shadow-lg
        ${isTakenToday ? 'opacity-60' : ''}
      `}
    >
      <div className="flex items-start gap-4">

        <div 
          className={`
            w-14 h-14 rounded-xl bg-gradient-to-br ${getBgColorClass(medicine.color)}
            flex items-center justify-center flex-shrink-0 shadow-md
          `}
        >
          <Pill className="text-white" size={28} />
        </div>

        <div className="flex-1 min-w-0">

          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-lg truncate">
                {medicine.name}
              </h3>
              <p className="text-sm text-gray-500">{medicine.dosage}</p>
            </div>

            <div className="flex gap-2 ml-2">
              <button
                onClick={() => onEdit(medicine)}
                className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(medicine.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{medicine.time}</span>
            </div>
           
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{medicine.frequency}</span>
            </div>
          </div>

          {medicine.notes && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {medicine.notes}
            </p>
          )}

          <button
            onClick={() => onToggleTaken(medicine.id)}
            className={`
              w-full py-2.5 rounded-lg font-medium transition-all
              flex items-center justify-center gap-2
              ${isTakenToday
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
              }
            `}
          >
            {isTakenToday ? (
              <>
                <Check size={18} />
                <span>Taken</span>
              </>
            ) : (
              <span>Mark as Taken</span>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

export default MedicineCard;
