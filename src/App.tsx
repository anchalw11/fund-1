import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import RiskDisclosure from './pages/RiskDisclosure';
import UserMT5 from './pages/UserMT5';
import AdminMT5 from './pages/AdminMT5';
import AdminDashboard from './pages/AdminDashboard';
import AdminChallenges from './pages/AdminChallenges';
import AdminSupport from './pages/AdminSupport';
import CryptoPayment from './pages/CryptoPayment';
import ChallengeTypes from './pages/ChallengeTypes';
import Leaderboard from './pages/Leaderboard';
import Notifications from './pages/Notifications';
import Certificate from './pages/Certificate';
import Affiliate from './pages/Affiliate';
import Support from './pages/Support';
import TestEmails from './pages/TestEmails';
import SystemTest from './pages/SystemTest';
import EmailVerification from './pages/EmailVerification';
import MiniChallenge from './pages/MiniChallenge';
import Badges from './pages/Badges';
import Subscriptions from './pages/Subscriptions';
import SecondChance from './pages/SecondChance';
import CompetitionDetail from './pages/CompetitionDetail';
import CompetitionRules from './pages/CompetitionRules';
import CompetitionSignup from './pages/CompetitionSignup';
import ContractSigning from './pages/ContractSigning';
import AdminCompetitionProfiles from './pages/AdminCompetitionProfiles';
import CardDemo from './pages/CardDemo';
import CompetitionPopup from './components/CompetitionPopup';

function App() {
  return (
    <BrowserRouter>
      <CompetitionPopup />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/challenge-types" element={<ChallengeTypes />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/risk-disclosure" element={<RiskDisclosure />} />
        <Route path="/mt5" element={<UserMT5 />} />
        <Route path="/admin/mt5" element={<AdminMT5 />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/challenges" element={<AdminChallenges />} />
        <Route path="/admin/support" element={<AdminSupport />} />
        <Route path="/admin/competition-profiles" element={<AdminCompetitionProfiles />} />
        <Route path="/payment" element={<CryptoPayment />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/certificate/:accountId" element={<Certificate />} />
        <Route path="/affiliate" element={<Affiliate />} />
        <Route path="/support" element={<Support />} />
        <Route path="/test-emails" element={<TestEmails />} />
        <Route path="/system-test" element={<SystemTest />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/mini-challenge" element={<MiniChallenge />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/second-chance" element={<SecondChance />} />
          <Route path="/competition" element={<CompetitionDetail />} />
          <Route path="/competition-rules" element={<CompetitionRules />} />
          <Route path="/competition-signup" element={<CompetitionSignup />} />
          <Route path="/contract-signing" element={<ContractSigning />} />
          <Route path="/card-demo" element={<CardDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
