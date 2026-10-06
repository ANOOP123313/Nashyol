import React from 'react';

interface AEDIconProps {
  className?: string;
  style?: React.CSSProperties;
}

export const AEDIcon: React.FC<AEDIconProps> = ({ className = '', style }) => {
  return (
    <span className={`inline-block font-semibold ${className}`} style={style}>
      AED&nbsp;
    </span>
  );
};

export const CURRENCY_SYMBOL = 'AED';

export const formatAED = (amount: number | string, decimals: number = 2): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'AED 0.00';
  return `AED ${num.toFixed(decimals)}`;
};

export default AEDIcon;
