import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AttendeePortal from './pages/AttendeePortal';
import StaffPortal from './pages/StaffPortal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/attendee/*" element={<AttendeePortal />} />
        <Route path="/staff/*" element={<StaffPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
