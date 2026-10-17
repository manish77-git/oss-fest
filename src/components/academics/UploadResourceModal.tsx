'use client';

import React, { useState } from 'react';
import { X, UploadCloud, BookOpen, ShieldCheck, Sparkles, CheckCircle } from 'lucide-react';
import { ResourceNote, User, Department, Semester, ResourceCategory } from '@/types';

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onAddResource: (resource: ResourceNote) => void;
}

export const UploadResourceModal: React.FC<UploadResourceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddResource,
}) => {
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [department, setDepartment] = useState<Department>('Computer Science');
  const [semester, setSemester] = useState<Semester>(4);
  const [category, setCategory] = useState<ResourceCategory>('Lecture Notes');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('Operating_Systems_Module_1_to_3.pdf');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseCode.trim()) return;

    const newResource: ResourceNote = {
      id: `res_${Date.now()}`,
      title,
      courseCode: courseCode.toUpperCase().trim(),
      courseName: courseName.trim() || courseCode.toUpperCase().trim(),
      department,
      semester,
      category,
      fileSize: '5.4 MB',
      fileType: 'pdf',
      uploader: currentUser,
      upvotes: 1,
      downloads: 0,
      hasUpvoted: true,
      verifiedByFacultyOrCR: true,
      downloadUrl: '#',
      createdAt: 'Just now',
      description,
    };

    onAddResource(newResource);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Contribute to Academic Vault
              </h3>
              <p className="text-[11px] text-neutral-400">
                Earn +40 Academic Karma points per verified upload
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* File Drag & Drop Simulation */}
          <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 bg-indigo-50/30 dark:bg-indigo-950/20 cursor-pointer hover:bg-indigo-50/60 transition-colors">
            <UploadCloud className="w-8 h-8 text-indigo-600" />
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Drag & Drop PDF, Notes, or Solved Papers
            </span>
            <span className="text-[10px] text-neutral-400">
              Selected: <strong className="font-mono text-indigo-600">{fileName}</strong> (Max 25MB)
            </span>
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
              Resource Title
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design & Analysis of Algorithms Handwritten Notes with Recurrence Proofs"
              className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                Course Code
              </label>
              <input
                required
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. CS401"
                className="w-full p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                Course Name
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics & Comm.">Electronics</option>
                <option value="Information Tech">Information Tech</option>
                <option value="Mechanical">Mechanical</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value) as Semester)}
                className="w-full p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Sem {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                className="w-full p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              >
                <option value="Lecture Notes">Lecture Notes</option>
                <option value="PYQ (Exam Papers)">PYQ (Exam Papers)</option>
                <option value="Lab Manuals">Lab Manuals</option>
                <option value="Cheat Sheets">Cheat Sheets</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1 block">
              What does this document cover? (Topics / Exam Year)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Covers Units 1 to 3 with step-by-step solved numericals for Deadlocks and CPU Scheduling..."
              className="w-full p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Honor Code Notice */}
          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-2 text-[10px] text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              By uploading, you confirm that this material complies with campus honor code and does not violate test confidentiality.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Publish & Earn +40 Karma</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
