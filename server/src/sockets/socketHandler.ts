import { Server, Socket } from 'socket.io';
import { Session } from '../models/Session';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join session room and role room
    socket.on('session:join', async (data: { sessionId: string; roleId: string; userId: string; isInstructor?: boolean }) => {
      try {
        const { sessionId, roleId, userId, isInstructor } = data;
        if (!sessionId) return;

        // Join general session room
        socket.join(sessionId);

        // Join role room for strictly targeted information delivery
        if (roleId) {
          const roleRoom = `${sessionId}:role:${roleId}`;
          socket.join(roleRoom);
          console.log(`[Socket] User ${userId} (${socket.id}) joined role room: ${roleRoom}`);
        }

        // If instructor, join instructor room to receive unvarnished global audit feed
        if (isInstructor) {
          const instructorRoom = `${sessionId}:instructor`;
          socket.join(instructorRoom);
          console.log(`[Socket] Instructor ${userId} (${socket.id}) joined instructor room: ${instructorRoom}`);
        }

        // Update online status in session
        const session = await Session.findById(sessionId);
        if (session) {
          const p = session.participantIds.find((x) => (x.userId as any).toString() === userId);
          if (p) {
            p.isOnline = true;
            p.socketId = socket.id;
            await session.save();
          }

          io.to(sessionId).emit('session:participant_status', {
            userId,
            roleId,
            isOnline: true,
            totalOnline: session.participantIds.filter((p) => p.isOnline).length,
          });
        }

        socket.emit('session:joined', {
          sessionId,
          roleId,
          connected: true,
          simulatedTimeSec: session?.currentSimulatedTimeSec || 0,
          status: session?.status || 'created',
        });
      } catch (err) {
        console.error('[Socket] Error in session:join:', err);
        socket.emit('error', { message: 'Failed to join session socket room' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      try {
        const sessions = await Session.find({ 'participantIds.socketId': socket.id });
        for (const session of sessions) {
          const p = session.participantIds.find((x) => x.socketId === socket.id);
          if (p) {
            p.isOnline = false;
            p.socketId = undefined;
            await session.save();

            io.to((session._id as any).toString()).emit('session:participant_status', {
              userId: (p.userId as any).toString(),
              roleId: p.roleId,
              isOnline: false,
            });
          }
        }
      } catch (err) {
        console.error('[Socket] Error handling disconnect cleanup:', err);
      }
    });
  });
}
