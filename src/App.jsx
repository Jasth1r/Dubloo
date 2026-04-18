import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { Homepage } from './Homepage';
import Onboarding from './Onboarding';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/home" element={<Homepage />} />
      </Routes>
    </Router>
  );
}

export default App;
