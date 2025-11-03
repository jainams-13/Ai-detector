import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-dark-card/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-200">
            AI Media Toolkit
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;