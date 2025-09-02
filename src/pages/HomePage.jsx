import React, { useState } from 'react';
import Header from '../components/Header'
import HeroSection from '../components/HeroSection';
import QuickActions from '../components/QuickActions';
import FeaturesSection from '../components/FeaturesSection';
import StatsSection from '../components/StatsSection';
import BrandsSection from '../components/BrandsSection';
import WhereToNextSection from '../components/WhereToNextSection';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <QuickActions />
      <FeaturesSection />
      <StatsSection />
      <BrandsSection />
      <WhereToNextSection />
      <Footer />
    </div>
  );
};

export default HomePage;