import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:bg-slate-750 placeholder-slate-600 text-sm"
        {...props}
      />
    </div>
  );
};