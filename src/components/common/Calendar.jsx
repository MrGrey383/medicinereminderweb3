import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ selectedDate, onDateSelect, markedDates = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isMarked = (day) => {
    return markedDates.some(date => 
      date.getDate() === day &&
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  };

  const handleDateClick = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(date);
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      <button
        key={day}
        onClick={() => handleDateClick(day)}
        className={`
          p-2 rounded-lg text-center transition-all relative
          ${isSelected(day)
            ? 'bg-indigo-600 text-white font-bold'
            : isToday(day)
            ? 'bg-indigo-100 text-indigo-600 font-semibold'
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
      >
        {day}
        {isMarked(day) && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(name => (
          <div key={name} className="text-center text-xs font-medium text-gray-500 p-2">
            {name}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

export default Calendar;