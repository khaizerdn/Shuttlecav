// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IdlePage from './pages/IdlePage';
import SelectAmount from './pages/SelectAmount';
import CustomAmount from './pages/CustomAmount'; // Import the new page
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IdlePage />} />
        <Route path="/select-amount" element={<SelectAmount />} />
        <Route path="/custom-amount" element={<CustomAmount />} /> {/* New route */}
      </Routes>
    </Router>
  );
}

export default App;