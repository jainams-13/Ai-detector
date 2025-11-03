import React from 'react';

interface RewriteOptionsProps {
  options: {
    professional: boolean;
    normal: boolean;
  };
  onOptionsChange: (options: { professional: boolean; normal: boolean }) => void;
}

const Checkbox: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; disabled: boolean }> = ({ label, checked, onChange, disabled }) => (
    <label className={`flex items-center space-x-2 text-dark-text-secondary transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-dark-text'}`}>
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="form-checkbox h-5 w-5 rounded bg-gray-700 border-gray-600 text-brand-primary focus:ring-brand-primary focus:ring-offset-dark-card disabled:opacity-50"
        />
        <span>{label}</span>
    </label>
);

const RewriteOptions: React.FC<RewriteOptionsProps> = ({ options, onOptionsChange }) => {
  const handleProfessionalChange = (checked: boolean) => {
    onOptionsChange({ ...options, professional: checked });
  };

  const handleNormalChange = (checked: boolean) => {
    onOptionsChange({ ...options, normal: checked });
  };

  return (
    <div className="bg-dark-card p-4 rounded-lg shadow-lg border border-gray-700 mb-6 animate-fade-in">
      <div className="flex items-center space-x-6">
        <h4 className="text-md font-semibold text-gray-300">Rewrite Styles:</h4>
        <div className="flex items-center space-x-4">
            <Checkbox label="Professional" checked={options.professional} onChange={handleProfessionalChange} disabled={false} />
            <Checkbox label="Normal" checked={options.normal} onChange={handleNormalChange} disabled={false} />
        </div>
      </div>
    </div>
  );
};

export default RewriteOptions;
