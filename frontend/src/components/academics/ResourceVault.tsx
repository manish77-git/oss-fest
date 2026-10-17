'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUp, 
  Download, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  X, 
  CheckCircle,
  PlusCircle,
  BookOpen
} from 'lucide-react';
import { ResourceNote, Department, Semester, ResourceCategory } from '@/types';

interface ResourceVaultProps {
  resources: ResourceNote[];
  onOpenUploadModal: () => void;
}

export const ResourceVault: React.FC<ResourceVaultProps> = ({ resources, onOpenUploadModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePreview, setActivePreview] = useState<ResourceNote | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const [resourceList, setResourceList] = useState<ResourceNote[]>(resources);

  const departments = ['All', 'Computer Science', 'Electronics & Comm.', 'Information Tech'];
  const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];
  const categories: (string)[] = [
    'All',
    'PYQ (Exam Papers)',
    'Lecture Notes',
    'Lab Manuals',
    'Cheat Sheets'
  ];

  // Upvote handler
  const handleUpvote = (id: string) => {
    setResourceList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const hasUpvoted = item.hasUpvoted;
          return {
            ...item,
            hasUpvoted: !hasUpvoted,
            upvotes: hasUpvoted ? item.upvotes - 1 : item.upvotes + 1,
          };
        }
        return item;
      })
    );
  };

  const handleDownload = (res: ResourceNote) => {
    setDownloadSuccess(`Downloaded "${res.title}" successfully!`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Filter logic
  const filteredResources = resourceList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'All' || item.department === selectedDept;
    const matchesSem = selectedSemester === 'All' || item.semester.toString() === selectedSemester;
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesDept && matchesSem && matchesCat;
  });

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Vault Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-indigo-200 mb-2 border border-white/10">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Campus Open Knowledge Vault</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Centralized Study Materials & Solved PYQs
          </h2>
          <p className="text-xs text-indigo-100/80 mt-1 leading-relaxed">
            Stop digging through WhatsApp groups and dead Google Drive links. Discover peer-verified lecture notes, mid-sem exam papers, and lab manuals organized by branch & semester.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onOpenUploadModal}
              className="px-4 py-2 bg-white text-indigo-950 font-bold text-xs rounded-xl hover:bg-neutral-100 shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Contribute Material (+40 Karma)</span>
            </button>
            <span className="text-[11px] text-indigo-200">
              Verified by Course Representatives
            </span>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-10 opacity-15 text-white pointer-events-none">
          <BookOpen className="w-64 h-64" />
        </div>
      </div>

      {/* Download Alert Toast */}
      {downloadSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col gap-3 shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code (e.g. CS401), subject name, topic (e.g. Normalization)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Department Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
            Branch:
          </span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDept === dept
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Semester & Category Sub-Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-900">
          {/* Semester Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
              Semester:
            </span>
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                  selectedSemester === sem
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                }`}
              >
                {sem === 'All' ? 'All' : `S${sem}`}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 ring-1 ring-purple-400'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Count / Summary */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-neutral-500">
          Found {filteredResources.length} verified academic resources
        </span>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-900 transition-all shadow-2xs group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {item.courseCode}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-medium text-neutral-400">
                    Sem {item.semester}
                  </span>
                </div>

                {item.verifiedByFacultyOrCR && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {item.title}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Card Footer: Uploader & Download Actions */}
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
              {/* Uploader info */}
              <div className="flex items-center gap-2">
                <img
                  src={item.uploader.avatar}
                  alt={item.uploader.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="text-[11px]">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {item.uploader.name}
                  </span>
                  <p className="text-[10px] text-neutral-400">
                    {item.fileSize} • {item.downloads} DLs
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                {/* Upvote button */}
                <button
                  onClick={() => handleUpvote(item.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    item.hasUpvoted
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                  }`}
                  title="Upvote resource"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>{item.upvotes}</span>
                </button>

                {/* Preview button */}
                <button
                  onClick={() => setActivePreview(item)}
                  className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 transition-colors"
                  title="Preview Document"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>

                {/* Download button */}
                <button
                  onClick={() => handleDownload(item)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1">
                    {activePreview.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {activePreview.courseCode} • {activePreview.courseName} • Sem {activePreview.semester}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Simulated PDF Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    Document High-Yield Index
                  </span>
                  <span className="text-[10px] text-neutral-400">{activePreview.fileSize}</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {activePreview.description}
                </p>
              </div>

              {/* Sample Document Section */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-900/40">
                <h4 className="font-bold text-neutral-900 dark:text-white mb-2">
                  Sample Content Excerpt (Page 1 of 18):
                </h4>
                <div className="space-y-2 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-950 p-3 rounded-lg">
                  <p>1. Explain the conditions necessary for a Deadlock to occur in an OS:</p>
                  <p className="pl-4 text-indigo-600 dark:text-indigo-400 font-sans">
                    • Mutual Exclusion (resources cannot be shared)<br/>
                    • Hold and Wait (process holds 1 resource and requests another)<br/>
                    • No Preemption (resource released only voluntarily)<br/>
                    • Circular Wait (closed loop of processes waiting for next)
                  </p>
                  <p>2. Solve the Banker’s Safety Algorithm for given allocation matrix...</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-300">
                <span className="text-[11px]">
                  Uploaded by <strong className="font-bold">{activePreview.uploader.name}</strong> ({activePreview.uploader.year})
                </span>
                <span className="text-[11px] font-bold">
                  {activePreview.upvotes} Students found this helpful
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50">
              <button
                onClick={() => handleUpvote(activePreview.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${
                  activePreview.hasUpvoted
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
                <span>Upvote Helpful</span>
              </button>

              <button
                onClick={() => {
                  handleDownload(activePreview);
                  setActivePreview(null);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF ({activePreview.fileSize})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
