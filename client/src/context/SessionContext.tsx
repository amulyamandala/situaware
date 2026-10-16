import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, FeedReport, TeamMessageRecord, SessionStatus } from '../types';
import { getSocket, connectSocket } from '../services/socket';
import { sessionApi, decisionApi } from '../services/api';
import { useAuth } from './AuthContext';

interface SessionContextType {
  session: Session | null;
  assignedRoleId: string;
  setAssignedRoleId: (roleId: string) => void;
  feed: FeedReport[];
  teamMessages: TeamMessageRecord[];
  simTime: number;
  sessionStatus: SessionStatus;
  instructorAudit: any[];
  loadSession: (sessionId: string, roleId?: string) => Promise<void>;
  startSession: () => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  completeSession: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  submitDecision: (data: {
    action: string;
    rationale: string;
    evidenceIds: string[];
    confidence: number;
    checkpointId?: string;
  }) => Promise<any>;
  injectDisruption: (data: any) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [assignedRoleId, setAssignedRoleId] = useState<string>('land_lead');
  const [feed, setFeed] = useState<FeedReport[]>([]);
  const [teamMessages, setTeamMessages] = useState<TeamMessageRecord[]>([]);
  const [simTime, setSimTime] = useState<number>(0);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('created');
  const [instructorAudit, setInstructorAudit] = useState<any[]>([]);

  // Load session from server
  const loadSession = useCallback(async (sessionId: string, targetRoleId?: string) => {
    try {
      const res = await sessionApi.get(sessionId);
      const sess = res.data.session;
      setSession(sess);
      setSessionStatus(sess.status);
      setSimTime(sess.currentSimulatedTimeSec || 0);

      // Determine role
      let role = targetRoleId;
      if (!role && user) {
        const participant = sess.participantIds?.find(
          (p: any) => p.userId === user._id || (p.userId?._id && p.userId._id === user._id)
        );
        if (participant) {
          role = participant.roleId;
        }
      }
      const effectiveRole = role || assignedRoleId || 'land_lead';
      setAssignedRoleId(effectiveRole);

      // Load initial feed
      const feedRes = await sessionApi.getFeed(sessionId, effectiveRole);
      setFeed(feedRes.data.feed || []);

      // Load messages
      const msgRes = await sessionApi.getMessages(sessionId);
      setTeamMessages(msgRes.data.messages || []);

      // If instructor, also load timeline as initial audit log
      if (user?.role === 'instructor' || user?.role === 'admin') {
        const timeRes = await sessionApi.getTimeline(sessionId);
        setInstructorAudit(timeRes.data.events || []);
      }

      // Connect Socket.IO
      const socket = connectSocket();
      socket.emit('session:join', {
        sessionId,
        roleId: effectiveRole,
        userId: user?._id,
        isInstructor: user?.role === 'instructor' || user?.role === 'admin',
      });
    } catch (err) {
      console.error('[SessionContext] Failed to load session:', err);
    }
  }, [user, assignedRoleId]);

  // Socket event listeners
  useEffect(() => {
    const socket = getSocket();

    const handleTime = (data: { simulatedTimeSec: number }) => {
      setSimTime(data.simulatedTimeSec);
    };

    const handleStarted = (data: any) => {
      setSessionStatus('active');
      setSimTime(data.simulatedTimeSec || 0);
    };

    const handlePaused = () => {
      setSessionStatus('paused');
    };

    const handleCompleted = () => {
      setSessionStatus('completed');
    };

    const handleFeedReport = (report: FeedReport) => {
      setFeed((prev) => {
        // Prevent duplicate delivery items
        if (prev.some((r) => r.deliveryId === report.deliveryId || r.eventId === report.eventId)) {
          return prev;
        }
        return [report, ...prev];
      });
    };

    const handleTeamMessage = (msg: TeamMessageRecord) => {
      setTeamMessages((prev) => [...prev, msg]);
    };

    const handleInstructorEvent = (auditEvent: any) => {
      setInstructorAudit((prev) => [auditEvent, ...prev]);
    };

    const handleDisruptionApplied = (disruption: any) => {
      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          activeDisruptions: [disruption, ...(prev.activeDisruptions || [])],
        };
      });
    };

    socket.on('session:time', handleTime);
    socket.on('session:started', handleStarted);
    socket.on('session:paused', handlePaused);
    socket.on('session:completed', handleCompleted);
    socket.on('feed:report', handleFeedReport);
    socket.on('team:message', handleTeamMessage);
    socket.on('instructor:event_dispatched', handleInstructorEvent);
    socket.on('instructor:disruption_applied', handleDisruptionApplied);

    return () => {
      socket.off('session:time', handleTime);
      socket.off('session:started', handleStarted);
      socket.off('session:paused', handlePaused);
      socket.off('session:completed', handleCompleted);
      socket.off('feed:report', handleFeedReport);
      socket.off('team:message', handleTeamMessage);
      socket.off('instructor:event_dispatched', handleInstructorEvent);
      socket.off('instructor:disruption_applied', handleDisruptionApplied);
    };
  }, []);

  const startSession = async () => {
    if (!session) return;
    const res = await sessionApi.start(session._id);
    setSession(res.data.session);
    setSessionStatus('active');
  };

  const pauseSession = async () => {
    if (!session) return;
    const res = await sessionApi.pause(session._id);
    setSession(res.data.session);
    setSessionStatus('paused');
  };

  const resumeSession = async () => {
    if (!session) return;
    const res = await sessionApi.resume(session._id);
    setSession(res.data.session);
    setSessionStatus('active');
  };

  const completeSession = async () => {
    if (!session) return;
    const res = await sessionApi.complete(session._id);
    setSession(res.data.session);
    setSessionStatus('completed');
  };

  const sendMessage = async (text: string) => {
    if (!session || !text.trim()) return;
    await sessionApi.sendMessage(session._id, {
      message: text.trim(),
      recipientScope: 'ALL',
      senderRoleId: assignedRoleId,
    });
  };

  const submitDecision = async (data: {
    action: string;
    rationale: string;
    evidenceIds: string[];
    confidence: number;
    checkpointId?: string;
  }) => {
    if (!session) throw new Error('No active session');
    const res = await decisionApi.submit(session._id, {
      ...data,
      traineeRoleId: assignedRoleId,
    });
    return res.data;
  };

  const injectDisruption = async (data: any) => {
    if (!session) return;
    const res = await sessionApi.injectDisruption(session._id, data);
    return res.data;
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        assignedRoleId,
        setAssignedRoleId,
        feed,
        teamMessages,
        simTime,
        sessionStatus,
        instructorAudit,
        loadSession,
        startSession,
        pauseSession,
        resumeSession,
        completeSession,
        sendMessage,
        submitDecision,
        injectDisruption,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
