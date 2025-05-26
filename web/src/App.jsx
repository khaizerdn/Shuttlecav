// src/App.jsx Update
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentSteps from './pages/PaymentSteps';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentSteps />} />
      </Routes>
    </Router>
  );
}

export default App;