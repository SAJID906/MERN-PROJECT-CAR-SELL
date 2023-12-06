import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Add Navigate

import Login from './Login';
import HomePage from './HomePage';

const App = () => {
  return (
    <Router>
      <Routes>
        
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<Navigate to="/login" />} /> {/* Update this line */}
        <Route path="/login" element={<Login />} /> {/* Add this line */}
      </Routes>
    </Router>
  );
};

export default App;