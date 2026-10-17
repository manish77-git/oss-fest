'use client';

import React, { useState } from 'react';
import { 
  Send, 
  Search, 
  ShieldCheck, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  Info,
  CheckCheck,
  Sparkles
} from 'lucide-react';
import { ChatConversation, ChatMessage, User } from '@/types';

interface CampusChatProps {
  conversations: ChatConversation[];
  currentUser: User;
}

export const CampusChat: React.FC<CampusChatProps> = ({ conversations, currentUser }) => {
  const [conversationList, setConversationList] = useState<ChatConversation[]>(conversations);
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || '');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeConversation = conversationList.find((c) => c.id === selectedConvId) || conversationList[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    const newMessage: ChatMessage = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    const updated = conversationList.map((conv) => {
      if (conv.id === activeConversation.id) {
        return {
          ...conv,
          lastMessage: messageText,
          lastMessageTime: 'Just now',
          messages: [...conv.messages, newMessage],
        };
      }
      return conv;
    });

    setConversationList(updated);
    const sentText = messageText;
    setMessageText('');

    // Simulated peer/senior automated response for realistic interactive feel
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let reply = 'Sounds great! I will take a look right away.';
      if (activeConversation.id === 'conv_1') {
        reply = 'Got your message! I will share my DSA roadmap and interview notes with you during our session tomorrow.';
      } else if (activeConversation.id === 'conv_2') {
        reply = 'Awesome progress! Let us sync up in the cafeteria at 4 PM to finalize the SIH presentation.';
      }

      const autoReplyMessage: ChatMessage = {
        id: `m_reply_${Date.now()}`,
        senderId: 'partner',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: false,
      };

      setConversationList((prev) =>
        prev.map((c) => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              lastMessage: reply,
              lastMessageTime: 'Just now',
              messages: [...c.messages, autoReplyMessage],
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  const filteredConversations = conversationList.filter((c) =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participantRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xs h-[78vh] max-h-[750px] flex">
      {/* Left Chat Contacts Panel */}
      <div className="w-80 border-r border-neutral-200 dark:border-neutral-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
              Campus Direct
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Verified DMs
            </span>
          </div>

          {/* Search Contacts */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search seniors, peers, squads..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-50 dark:divide-neutral-900">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === activeConversation?.id;
            return (
              <div
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-neutral-100/80 dark:bg-neutral-900/80'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/40'
                }`}
              >
                <div className="relative">
                  <img
                    src={conv.participantAvatar}
                    alt={conv.participantName}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs text-neutral-900 dark:text-white truncate flex items-center gap-1">
                      {conv.participantName}
                      {conv.isVerified && (
                        <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" />
                      )}
                    </span>
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {conv.lastMessage}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Conversation Window */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col justify-between h-full bg-neutral-50/40 dark:bg-neutral-900/20">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={activeConversation.participantAvatar}
                alt={activeConversation.participantName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                  {activeConversation.participantName}
                  {activeConversation.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                </h4>
                <p className="text-[11px] text-neutral-400">
                  {activeConversation.participantRole}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-neutral-400">
              <button className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <Video className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            <div className="text-center my-2">
              <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-3 py-1 rounded-full">
                Encrypted Campus Direct Chat
              </span>
            </div>

            {activeConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[75%] ${
                  msg.isSelf ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    msg.isSelf
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200/80 dark:border-neutral-700/80 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-400 px-1">
                  <span>{msg.timestamp}</span>
                  {msg.isSelf && <CheckCheck className="w-3 h-3 text-indigo-500" />}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="self-start bg-white dark:bg-neutral-800 p-2.5 rounded-2xl rounded-bl-xs border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 text-[11px] text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Message Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
          >
            <button
              type="button"
              className="p-2 text-neutral-400 hover:text-neutral-600 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Message ${activeConversation.participantName}...`}
              className="flex-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />

            <button
              type="submit"
              disabled={!messageText.trim()}
              className="p-2.5 rounded-full bg-indigo-600 disabled:opacity-40 text-white hover:bg-indigo-500 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-neutral-400">
          Select a chat to begin conversation
        </div>
      )}
    </div>
  );
};
