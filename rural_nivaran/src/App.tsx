import { NavProvider, useNav } from './context/NavContext'
import MobileShell from './components/MobileShell'
import SplashScreen from './screens/SplashScreen'
import RoleSelect from './screens/RoleSelect'
import VillagerHome from './screens/villager/VillagerHome'
import SymptomInput from './screens/villager/SymptomInput'
import TriageResult from './screens/villager/TriageResult'
import PHCLocator from './screens/villager/PHCLocator'
import ASHADashboard from './screens/asha/ASHADashboard'
import LogVisit from './screens/asha/LogVisit'
import PHCAdmin from './screens/admin/PHCAdmin'
import OutbreakAlert from './screens/OutbreakAlert'
import AIChatbot from './screens/villager/AIChatbot'

function AppRouter() {
  const { screen } = useNav()

  return (
    <MobileShell>
      {screen === 'splash' && <SplashScreen />}
      {screen === 'role-select' && <RoleSelect />}
      {screen === 'villager-home' && <VillagerHome />}
      {screen === 'symptom-input' && <SymptomInput />}
      {screen === 'triage-result' && <TriageResult />}
      {screen === 'phc-locator' && <PHCLocator />}
      {screen === 'asha-dashboard' && <ASHADashboard />}
      {screen === 'log-visit' && <LogVisit />}
      {screen === 'admin-dashboard' && <PHCAdmin />}
      {screen === 'outbreak-alert' && <OutbreakAlert />}
      {screen === 'ai-chatbot' && <AIChatbot />}
      

    </MobileShell>
  )
}

export default function App() {
  return (
    <NavProvider>
      <AppRouter />
    </NavProvider>
  )
}
