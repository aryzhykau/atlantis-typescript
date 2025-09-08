import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MobileTrainerLayout } from '../../../layouts/MobileTrainerLayout';
import { TrainerSchedule } from './TrainerSchedule';
import { TrainerPayments } from './TrainerPayments';
import { TrainerProfile } from './TrainerProfile';
import { TrainerExpenses } from './TrainerExpenses';

export const TrainerMobileApp: React.FC = () => {
  return (
    <MobileTrainerLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/trainer-mobile/payments" replace />} />
        <Route path="/payments" element={<TrainerPayments />} />
        <Route path="/expenses" element={<TrainerExpenses />} />
        <Route path="/schedule" element={<TrainerSchedule />} />
        <Route path="/profile" element={<TrainerProfile />} />
      </Routes>
    </MobileTrainerLayout>
  );
}; 