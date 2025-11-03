
import React from 'react';
import { Verdict } from '../types';

interface GaugeProps {
  value: number;
  verdict: Verdict;
}

const Gauge: React.FC<GaugeProps> = ({ value, verdict }) => {
  const circumference = 2 * Math.PI * 45; // r = 45
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    switch (verdict) {
      case Verdict.LIKELY_AI:
        return 'stroke-red-400';
      case Verdict.LIKELY_HUMAN:
        return 'stroke-green-400';
      case Verdict.UNCERTAIN:
      default:
        return 'stroke-yellow-400';
    }
  };
  
  const getTextColor = () => {
    switch (verdict) {
      case Verdict.LIKELY_AI:
        return 'fill-red-300';
      case Verdict.LIKELY_HUMAN:
        return 'fill-green-300';
      case Verdict.UNCERTAIN:
      default:
        return 'fill-yellow-300';
    }
  };

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className="text-gray-600"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        {/* Progress circle */}
        <circle
          className={`${getColor()} transition-all duration-1000 ease-out`}
          strokeWidth="10"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
        {/* Text */}
        <text
          x="50"
          y="50"
          className={`text-2xl font-bold ${getTextColor()}`}
          textAnchor="middle"
          dy=".3em"
        >
          {`${Math.round(value)}%`}
        </text>
         <text
          x="50"
          y="68"
          className="text-xs fill-dark-text-secondary"
          textAnchor="middle"
        >
          Confidence
        </text>
      </svg>
    </div>
  );
};

export default Gauge;
