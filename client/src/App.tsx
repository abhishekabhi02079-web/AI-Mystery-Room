import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { CreateMysteryPage } from './pages/CreateMysteryPage.tsx';
import { InvestigationPage } from './pages/InvestigationPage.tsx';
import { AccusationPage } from './pages/AccusationPage.tsx';
import { ResultsPage } from './pages/ResultsPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="create" element={<CreateMysteryPage />} />

          {/* Investigation Room Routes */}
          <Route path="case/:caseId" element={<InvestigationPage />} />
          <Route path="case/:caseId/accuse" element={<AccusationPage />} />
          <Route path="case/:caseId/result" element={<ResultsPage />} />

          {/* Support :id parameter alias as specified */}
          <Route path="case/:id" element={<InvestigationPage />} />
          <Route path="case/:id/accuse" element={<AccusationPage />} />
          <Route path="case/:id/result" element={<ResultsPage />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
