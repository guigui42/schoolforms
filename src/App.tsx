import { Routes, Route } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import { Dashboard } from './pages/Dashboard';
import { FormFiller } from './pages/FormFiller';
import { PDFPreview } from './pages/PDFPreview';
import { Settings } from './pages/Settings';
import { AppHeader } from './components/layout/AppHeader';
import { AppNavbar } from './components/layout/AppNavbar';
import { FamilyForm } from './components/forms/FamilyForm';

function App() {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <AppHeader />
      </AppShell.Header>
      
      <AppShell.Navbar>
        <AppNavbar />
      </AppShell.Navbar>
      
      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/family" element={<FamilyForm />} />
          <Route path="/form/:formType" element={<FormFiller />} />
          <Route path="/preview/:formType" element={<PDFPreview />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
