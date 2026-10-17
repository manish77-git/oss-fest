'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Bot, 
  Sparkles, 
  Send, 
  Terminal, 
  BookOpen, 
  Building2, 
  Users, 
  ExternalLink, 
  Download, 
  Check, 
  HelpCircle,
  FolderGit2
} from 'lucide-react';
import { User, StructuredContribution, ResourceNote, PlacementDebrief, TeammateListing } from '@/types';
import { AIAssistantService, AIResponse } from '@/services/aiAssistantService';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onNavigateChannel?: (channelId: string) => void;
  onOpenProfile: (user: User) => void;
}

interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  payload?: AIResponse['payload'];
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigateChannel,
  onOpenProfile,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'ai_welcome',
      sender: 'assistant',
      text: 'Hey there! I am **CampusAI Copilot** 🤖.\n\nI have indexed the Open-Source Lab, Academic Vault, and Senior Placement Archives. Ask me anything or click a prompt below to see me fetch live data!',
      timestamp: 'Just now',
      payload: {
        intent: 'general',
      },
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!isOpen) return null;

  const handleSendQuery = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isThinking) return;

    const userMsg: AIMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const result = await AIAssistantService.queryAssistant(q);
      const aiMsg: AIMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: result.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        payload: result.payload,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const samplePrompts = [
    { label: '🚀 Good First Issues', query: 'Show me Good First Issues in the Open-Source Lab' },
    { label: '📚 Sem 5 Notes & PYQs', query: 'Find Semester 5 Operating Systems and DBMS notes' },
    { label: '💼 Microsoft Interview Debrief', query: 'Show senior placement debrief for Microsoft' },
    { label: '👥 Find Hackathon Squad', query: 'Find teammate squads for Smart India Hackathon' },
    { label: '📊 Summarize Channel Bugs', query: 'Summarize active open bugs' },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] md:w-[460px] bg-[#0c0f17] border-l border-[#20273a] shadow-2xl z-50 flex flex-col select-none">
      {/* Header */}
      <div className="h-14 px-4 border-b border-[#1b2234] flex items-center justify-between bg-[#090c14]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>CampusAI Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-purple-300 font-medium">Autonomous College & Open-Source Agent</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181f30] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                  : 'bg-[#151a28] text-slate-200 border border-[#222b40] rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Render AI Payload items inside drawer */}
              {m.payload?.issues && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-[#232d44]">
                  {m.payload.issues.map((iss) => (
                    <div key={iss.id} className="p-2 bg-[#0d111a] rounded border border-[#1e273c]">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-emerald-400">{iss.type}</span>
                        <span className="text-[10px] text-slate-400">{iss.difficulty || iss.severity}</span>
                      </div>
                      <div className="font-bold text-white text-[11px] mb-1">{iss.title}</div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{iss.description}</p>
                      {iss.repoUrl && (
                        <a 
                          href={iss.repoUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="mt-1.5 text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <FolderGit2 className="w-3 h-3" />
                          View Repository
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {m.payload?.resources && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-[#232d44]">
                  {m.payload.resources.map((res) => (
                    <div key={res.id} className="p-2 bg-[#0d111a] rounded border border-[#1e273c]">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold text-amber-400">{res.courseCode} · Sem {res.semester}</span>
                        <span className="text-[10px] text-slate-400">{res.fileSize}</span>
                      </div>
                      <div className="font-bold text-white text-[11px]">{res.title}</div>
                      <div className="mt-1 flex justify-end">
                        <button
                          onClick={() => alert(`Downloading verified ${res.title}`)}
                          className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px] font-medium flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {m.payload?.debriefs && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-[#232d44]">
                  {m.payload.debriefs.map((d) => (
                    <div key={d.id} className="p-2 bg-[#0d111a] rounded border border-[#1e273c]">
                      <div className="font-bold text-white text-[11px] flex items-center justify-between">
                        <span>{d.companyName} · {d.role}</span>
                        <span className="text-emerald-400 text-[10px]">{d.stipendOrPackage}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">By {d.senior.name}</div>
                      <div className="mt-1 text-[10px] text-slate-300 font-medium">
                        Tip: {d.prepTips[0]}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {m.payload?.teammates && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-[#232d44]">
                  {m.payload.teammates.map((t) => (
                    <div key={t.id} className="p-2 bg-[#0d111a] rounded border border-[#1e273c]">
                      <div className="font-bold text-white text-[11px]">{t.title}</div>
                      <div className="text-[10px] text-slate-400 mb-1">{t.competitionOrGoal}</div>
                      <button
                        onClick={() => alert('Application sent to squad leader!')}
                        className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold"
                      >
                        Request to Join Squad
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 p-3 bg-[#151a28] rounded-xl border border-[#222b40] text-purple-300 text-xs w-max animate-pulse">
            <Bot className="w-4 h-4 animate-spin" />
            <span>CampusAI is querying repositories and vaults...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Action Prompts */}
      <div className="p-2.5 border-t border-[#1a2133] bg-[#090c14] space-y-1.5">
        <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Click to Query Data:
        </div>
        <div className="flex flex-wrap gap-1">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(p.query)}
              className="px-2 py-1 bg-[#141926] hover:bg-purple-950/80 border border-[#20293f] hover:border-purple-600 text-slate-300 hover:text-purple-200 text-[11px] rounded-lg transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Composer */}
      <div className="p-3 bg-[#0a0d16] border-t border-[#1a2133]">
        <div className="flex items-center gap-2 bg-[#141926] border border-[#222b40] focus-within:border-purple-500 rounded-xl px-3 py-1.5">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            placeholder="Ask AI anything about campus, code, notes..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => handleSendQuery()}
            disabled={!inputQuery.trim() || isThinking}
            className={`p-1.5 rounded-lg transition-colors ${
              inputQuery.trim() && !isThinking
                ? 'bg-purple-600 text-white hover:bg-purple-500'
                : 'text-slate-600'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
