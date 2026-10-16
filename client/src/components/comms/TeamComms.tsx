import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Radio, User, Shield } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

export const TeamComms: React.FC = () => {
  const { teamMessages, sendMessage, assignedRoleId } = useSession();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [teamMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await sendMessage(inputText.trim());
    setInputText('');
  };

  const sendMacro = async (macro: string) => {
    await sendMessage(macro);
  };

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      case 'land_lead':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
      case 'air_controller':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
      case 'cyber_officer':
        return 'text-purple-400 bg-purple-950/60 border-purple-800';
      case 'ew_officer':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
      default:
        return 'text-slate-300 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="bg-situ-900 border border-situ-800 rounded-lg p-3 h-[360px] flex flex-col justify-between shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-situ-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h3 className="font-mono text-xs font-bold text-slate-100">
            TACTICAL COMMS NET (CROSS-DOMAIN)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-situ-950 px-2 py-0.5 rounded border border-slate-800">
          FREQ: 284.5 MHz • SECURE
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
        {teamMessages.length === 0 ? (
          <div className="text-slate-500 text-center py-10 font-mono text-xs">
            Radio net quiet. Transmit situational observations to coordinate with other domain leads.
          </div>
        ) : (
          teamMessages.map((msg) => {
            const isMe = msg.senderRoleId === assignedRoleId;
            return (
              <div
                key={msg._id}
                className={`p-2 rounded-lg border ${
                  isMe
                    ? 'bg-situ-850/90 border-cyan-900/80 ml-4'
                    : 'bg-situ-950/80 border-slate-800 mr-4'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${getRoleColor(
                        msg.senderRoleId
                      )}`}
                    >
                      {msg.senderRoleId.toUpperCase()}
                    </span>
                    <span className="font-semibold text-slate-200 text-[11px]">
                      {msg.senderName}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">
                    T+{msg.simulatedTimeSec}s
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{msg.message}</p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Transmission Macros */}
      <div className="pt-2 border-t border-situ-800 flex flex-wrap gap-1 mb-2">
        <button
          type="button"
          onClick={() => sendMacro('Radio check on tactical net. Confirm telemetry status.')}
          className="text-[10px] font-mono bg-situ-950 hover:bg-situ-850 text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded border border-slate-800"
        >
          Radio Check
        </button>
        <button
          type="button"
          onClick={() => sendMacro('Observing contradictory intelligence reports. Request corroboration.')}
          className="text-[10px] font-mono bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded border border-amber-800/60"
        >
          Conflict Alert
        </button>
        <button
          type="button"
          onClick={() => sendMacro('Primary data link congested. Switching to Troposcatter mesh.')}
          className="text-[10px] font-mono bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded border border-purple-800/60"
        >
          Troposcatter Failover
        </button>
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Transmit message to joint tactical net..."
          className="flex-1 bg-situ-950 border border-situ-700 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded flex items-center justify-center transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
