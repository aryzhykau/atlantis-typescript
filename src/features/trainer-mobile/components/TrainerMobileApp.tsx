import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MobileTrainerLayout } from '../../../layouts/MobileTrainerLayout';
import { TrainerSchedule } from './TrainerSchedule';
import { TrainerPayments } from './TrainerPayments';
import { TrainerProfile } from './TrainerProfile';
import { TrainerExpenses } from './TrainerExpenses';
import TrainerSalaryPage from './TrainerSalaryPage'; // Import TrainerSalaryPage as default

export const TrainerMobileApp: React.FC = () => {
  return (
    <MobileTrainerLayout>
      <Routes>
        <Route index element={<Navigate to="payments" replace />} />
        <Route path="/payments" element={<TrainerPayments />} />
        <Route path="/expenses" element={<TrainerExpenses />} />
        <Route path="/salary" element={<TrainerSalaryPage />} /> {/* New Salary Page Route */}
        <Route path="/schedule" element={<TrainerSchedule />} />
        <Route path="/profile" element={<TrainerProfile />} />
      </Routes>
    </MobileTrainerLayout>
  );
}; 