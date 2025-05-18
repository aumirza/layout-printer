
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';

const Index = () => {
  const navigate = useNavigate();
  
  // Check if there's a previous session
  useEffect(() => {
    const collageSettings = localStorage.getItem('collageSettings');
    if (collageSettings) {
      // If user has already set up settings, redirect to editor
      navigate('/editor');
    }
  }, [navigate]);

  return <LandingPage />;
};

export default Index;
