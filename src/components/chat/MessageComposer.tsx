'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Plus, 
  Sparkles, 
  Terminal, 
  Bug, 
  BookOpen, 
  Smile, 
  Bot,
  Paperclip,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Channel } from '@/types';

interface MessageComposerProps {
  activeChannel: Channel;
  onSendMessage: (content: string) => Promise<void>;
  onOpenCreateContribution: () => void;
  onOpenUploadNote?: () => void;
  isAiChannel?: boolean;
  onPromptAi?: (promptText: string) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  activeChannel,
  onSendMessage,
  onOpenCreateContribution,
  onOpenUploadNote,
  isAiChannel = false,
  onPromptAi,
}) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;

    const messageContent = text.trim();
    setText('');
    setIsSubmitting(true);

    try {
      await onSendMessage(messageContent);
    } catch (err) {
      console.error('Failed to send message:', err);
      setText(messageContent); // Restore on error
    } finally {
      setIsSubmitting(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  };

  const quickPrompts = [
    { label: '🚀 Good First Issues', query: 'Show me all Good First Issues in the Open-Source Lab' },
    { label: '📚 Sem 5 OS & DBMS Notes', query: 'Find Semester 5 Operating Systems and DBMS notes' },
    { label: '💼 Microsoft Interview Debrief', query: 'Show senior placement debrief for Microsoft SDE' },
    { label: '👥 SIH Hackathon Teammates', query: 'Find teammate squads for Smart India Hackathon' },
    { label: '📊 Summarize Bug Reports', query: 'Summarize the active open bug reports in this channel' },
  ];

  return (
    <div className="p-3 bg-[#0f121a] border-t border-[#1a1f2e] select-none">
      {/* AI Quick Prompt Suggestions (shown when in AI channel or when asking bot) */}
      {isAiChannel && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3" />
            Quick AI Queries:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (onPromptAi) {
                  onPromptAi(p.query);
                } else {
                  setText(p.query);
                  if (textareaRef.current) textareaRef.current.focus();
                }
              }}
              className="px-2.5 py-1 bg-[#171c2b] hover:bg-purple-950/80 border border-[#232b40] hover:border-purple-600/70 text-slate-300 hover:text-purple-200 text-xs rounded-full whitespace-nowrap transition-all shadow-sm"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative bg-[#171c2a] border border-[#242b3e] focus-within:border-indigo-500 rounded-xl flex items-end p-2 transition-colors">
        {/* Plus (+) Action Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg bg-[#22293d] hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors cursor-pointer mr-2 shrink-0"
            title="Create Contribution or Upload"
          >
            <Plus className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-45' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className="absolute bottom-11 left-0 w-64 bg-[#0a0d14] border border-[#232c42] rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenCreateContribution();
                }}
                className="w-full px-3 py-2 text-left rounded-lg hover:bg-[#151a28] text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-2.5 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div>New Open-Source Card</div>
                  <div className="text-[10px] text-slate-400 font-normal">Bug, Good First Issue, Feature</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setText(prev => (prev ? `@campus-ai ${prev}` : '@campus-ai '));
                  if (textareaRef.current) textareaRef.current.focus();
                }}
                className="w-full px-3 py-2 text-left rounded-lg hover:bg-[#151a28] text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-2.5 transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-purple-950 border border-purple-700 flex items-center justify-center text-purple-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div>Summon CampusAI Copilot</div>
                  <div className="text-[10px] text-slate-400 font-normal">Query notes, debriefs or issues</div>
                </div>
              </button>

              {onOpenUploadNote && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenUploadNote();
                  }}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-[#151a28] text-xs font-semibold text-amber-300 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-amber-950 border border-amber-700 flex items-center justify-center text-amber-400">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div>Share Academic Resource</div>
                    <div className="text-[10px] text-slate-400 font-normal">Upload notes, PYQ papers</div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isAiChannel
              ? 'Ask CampusAI: "Find sem 5 notes", "Show Good First Issues", "Microsoft interview tips"...'
              : `Message #${activeChannel.name} (type @campus-ai to summon AI assistant)`
          }
          rows={1}
          disabled={isSubmitting}
          className="flex-1 bg-transparent border-0 text-[13px] text-white placeholder-slate-500 focus:outline-none resize-none max-h-32 py-1 leading-relaxed"
        />

        {/* Send Action */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() || isSubmitting}
          className={`p-2 rounded-lg ml-2 transition-all cursor-pointer shrink-0 ${
            text.trim() && !isSubmitting
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
              : 'bg-transparent text-slate-600 cursor-not-allowed'
          }`}
          title="Send Message (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Helper text footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1.5">
        <span>
          <strong>Enter</strong> to send · <strong>Shift + Enter</strong> for newline
        </span>
        <span>
          Tip: Type <code className="text-purple-400 bg-[#171c2b] px-1 rounded">@campus-ai</code> to query real campus data
        </span>
      </div>
    </div>
  );
};
