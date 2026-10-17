'use client';

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { CommunityServer } from '@/types';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateServer: (serverData: Partial<CommunityServer>) => void;
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  onCreateServer,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryType, setCategoryType] = useState<CommunityServer['categoryType']>('Clubs');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a community name.');
      return;
    }
    if (name.trim().length < 3) {
      setError('Community name must be at least 3 characters.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a short description of the community.');
      return;
    }

    onCreateServer({
      name: name.trim(),
      description: description.trim(),
      categoryType,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#101420] border border-[#212a40] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1b2234] flex items-center justify-between bg-[#0b0e17]">
          <div>
            <h3 className="font-bold text-base text-white">Create a Campus Community</h3>
            <p className="text-xs text-slate-400">Build a new server for your study group, club, or hackathon</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2134] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Community Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Autonomous Drones Lab"
              className="w-full bg-[#151a28] border border-[#232c42] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Community Category
            </label>
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value as CommunityServer['categoryType'])}
              className="w-full bg-[#151a28] border border-[#232c42] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Clubs">Student Technical Club</option>
              <option value="Open Source">Open-Source Project</option>
              <option value="Hackathons">Hackathon Squad</option>
              <option value="Department">Departmental Guild</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this community about? Who should join?"
              className="w-full bg-[#151a28] border border-[#232c42] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              required
            />
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-[#1b2234] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#1a2134] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Create Server
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
