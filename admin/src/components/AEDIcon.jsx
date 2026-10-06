import React from 'react';

export const AEDIcon = ({ className = '', style }) => {
  return (
    <span className={`inline-block font-semibold ${className}`} style={style}>
      AED&nbsp;
    </span>
  );
};

export const CURRENCY_SYMBOL = 'AED';

export const formatAED = (amount, decimals = 2) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'AED 0.00';
  return `AED ${num.toFixed(decimals)}`;
};

export default AEDIcon;
