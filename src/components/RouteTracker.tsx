import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { MEASUREMENT_ID } from '../services/analytics';

const RouteTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent');

    if (consent === 'granted' && MEASUREMENT_ID) {
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }
  }, [location]);

  return null;
};

export default RouteTracker;
