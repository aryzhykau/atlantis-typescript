import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MobileTrainerLayout } from '../../../layouts/MobileTrainerLayout';
import { TrainerSchedule } from './TrainerSchedule';
import { TrainerAttendance } from './TrainerAttendance';
import { TrainerPayments } from './TrainerPayments';
import { TrainerStats } from './TrainerStats';
import { TrainerProfile } from './TrainerProfile';

export const TrainerMobileApp: React.FC = () => {
  return (
    <MobileTrainerLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/trainer-mobile/payments" replace />} />
        <Route path="/payments" element={<TrainerPayments />} />
        <Route path="/stats" element={<TrainerStats />} />
        <Route path="/schedule" element={<TrainerSchedule />} />
        <Route path="/attendance" element={<TrainerAttendance />} />
        <Route path="/profile" element={<TrainerProfile />} />
      </Routes>
    </MobileTrainerLayout>
  );
}; 