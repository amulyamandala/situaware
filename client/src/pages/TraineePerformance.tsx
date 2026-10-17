import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ScoresReportView } from '../components/analytics/ScoresReportView';
import { sessionApi } from '../services/api';
import { useSession } from '../context/SessionContext';

export const TraineePerformance: React.FC = () => {
  const { session } = useSession();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId') || session?._id || '6ad35cc7e5bbd19e285565ac';

  const [sessionDetails, setSessionDetails] = useState<any | null>(null);

  useEffect(() => {
    if (sessionId) {
      sessionApi
        .get(sessionId)
        .then((res) => setSessionDetails(res.data.session))
        .catch(() => {});
    }
  }, [sessionId]);

  return (
    <div className="h-[calc(100vh-42px)] flex flex-col bg-[#f8fafc] overflow-hidden">
      <ScoresReportView
        sessionCode={sessionDetails?.sessionCode || 'SITU-8800'}
        onSwitchToTactical={() => navigate('/aar')}
      />
    </div>
  );
};
