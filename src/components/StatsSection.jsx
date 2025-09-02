import React from 'react';

const StatsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Premier choix de voyage pour {' '}
            <span className="text-[#73D700]"> +1000 personnes </span>{' '}
            en Côte d'Ivoire en 2025.
          </h2>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;