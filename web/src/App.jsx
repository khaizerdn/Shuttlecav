import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentSteps from './pages/PaymentSteps';
import UsersManual from './pages/users-manual';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentSteps />} />
        <Route path="/users-manual" element={<UsersManual />} />
      </Routes>
    </Router>
  );
}

export default App;