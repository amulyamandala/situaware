import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TacticalCockpit } from '../components/simulation/TacticalCockpit';
import { sessionApi, decisionApi } from '../services/api';
import { useSession } from '../context/SessionContext';

export const AARReplay: React.FC = () => {
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
    <div className="h-[calc(100vh-42px)] flex flex-col bg-[#1e2633] overflow-hidden">
      <TacticalCockpit
        sessionCode={sessionDetails?.sessionCode || 'SITU-8800'}
        onSwitchToScores={() => navigate('/performance')}
      />
    </div>
  );
};
