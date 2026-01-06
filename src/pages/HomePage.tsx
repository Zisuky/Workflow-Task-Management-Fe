import React, { useState, useEffect } from 'react';
import { HomeView } from '../views';
import { mockHomeData } from '../data';

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <HomeView 
      data={mockHomeData} 
      isLoading={isLoading}
    />
  );
};

export default HomePage;