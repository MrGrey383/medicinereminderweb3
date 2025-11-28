import React from 'react';

const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  className = '',
  variant = 'rectangular'
}) => {
  const variants = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded'
  };

  return (
    <div
      className={`skeleton ${variants[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
    <div className="flex items-start gap-4">
      <Skeleton width="56px" height="56px" variant="circular" />
      <div className="flex-1 space-y-3">
        <Skeleton width="60%" height="20px" />
        <Skeleton width="40%" height="16px" />
        <Skeleton width="100%" height="16px" />
      </div>
    </div>
    <Skeleton width="100%" height="40px" />
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export default Skeleton;