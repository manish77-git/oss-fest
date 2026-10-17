'use client';

import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  ShieldCheck, 
  MoreHorizontal, 
  ExternalLink, 
  Code2, 
  Calendar, 
  MapPin, 
  Send,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Post, Comment } from '@/types';

interface PostCardProps {
  post: Post;
  currentUserName: string;
  onBookmarkToggle?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUserName, onBookmarkToggle }) => {
  const [hasLiked, setHasLiked] = useState(post.hasLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [hasSaved, setHasSaved] = useState(post.hasSaved || false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);

  const handleDoubleTap = () => {
    if (!hasLiked) {
      setHasLiked(true);
      setLikesCount((prev) => prev + 1);
    }
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 800);
  };
  
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c_1',
      author: {
        id: 'usr_kartik',
        name: 'Kartik Kulkarni',
        handle: 'kartik_k',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        email: 'kartik@ait.edu',
        college: 'AIT',
        department: 'Computer Science',
        year: 'Senior (4th Yr)',
        isVerified: true,
        bio: 'Senior',
        points: 410,
      },
      content: 'Incredible work on the quantization for edge devices! Did you guys use ONNX runtime or TensorRT?',
      createdAt: '1h ago',
      likesCount: 5,
    },
    {
      id: 'c_2',
      author: {
        id: 'usr_ananya',
        name: 'Ananya Bose',
        handle: 'ananya_bose',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
        email: 'ananya@ait.edu',
        college: 'AIT',
        department: 'Information Tech',
        year: 'Junior (3rd Yr)',
        isVerified: true,
        bio: 'CR',
        points: 620,
      },
      content: 'Super proud of this team! Everyone please star their GitHub repository. 🌟',
      createdAt: '45m ago',
      likesCount: 8,
    }
  ]);

  const handleLike = () => {
    if (hasLiked) {
      setHasLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setHasLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleSave = () => {
    setHasSaved(!hasSaved);
    if (onBookmarkToggle) {
      onBookmarkToggle(post.id);
    }
  };

  const handleShare = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      author: {
        id: 'usr_me',
        name: currentUserName,
        handle: 'aarav_p',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        email: 'aarav.cs23@ait.edu',
        college: 'AIT',
        department: 'Computer Science',
        year: 'Junior (3rd Yr)',
        isVerified: true,
        bio: 'Me',
        points: 480,
      },
      content: commentInput,
      createdAt: 'Just now',
      likesCount: 0,
    };

    setComments((prev) => [...prev, newComment]);
    setCommentInput('');
  };

  return (
    <article className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xs transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30"
            />
            {post.author.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-950 rounded-full p-0.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 fill-indigo-100 dark:fill-indigo-950" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:underline cursor-pointer">
                {post.author.name}
              </span>
              <span className="text-xs text-neutral-400">@{post.author.handle}</span>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
                {post.author.year}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>{post.author.department}</span>
              {post.author.company && (
                <>
                  <span>•</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    {post.author.company}
                  </span>
                </>
              )}
              <span>•</span>
              <span>{post.createdAt}</span>
            </div>
          </div>
        </div>

        <button className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>

        {/* Hashtags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Project Meta Card (if project showcase) */}
      {post.projectMeta && (
        <div className="mx-4 mb-3 p-3.5 rounded-xl bg-gradient-to-r from-neutral-50 to-indigo-50/30 dark:from-neutral-900 dark:to-indigo-950/20 border border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Project Showcase
            </span>
            <div className="flex items-center gap-2">
              {post.projectMeta.demoUrl && (
                <a
                  href={post.projectMeta.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Live Demo
                </a>
              )}
              {post.projectMeta.repoUrl && (
                <a
                  href={post.projectMeta.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Code2 className="w-3 h-3" />
                  GitHub
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.projectMeta.techStack.map((tech, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-md"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Event Meta Card (if campus event) */}
      {post.eventMeta && (
        <div className="mx-4 mb-3 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                {post.eventMeta.date}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {post.eventMeta.venue}
              </p>
            </div>
          </div>
          <button className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
            Set Reminder
          </button>
        </div>
      )}

      {/* Post Images Gallery (Instagram-Style Carousel with Double-Tap to Like) */}
      {post.images && post.images.length > 0 && (
        <div 
          onDoubleClick={handleDoubleTap}
          className="relative w-full bg-neutral-900 select-none group cursor-pointer overflow-hidden flex items-center justify-center min-h-[320px]"
        >
          <img
            src={post.images[activeImageIdx] || post.images[0]}
            alt="Post content"
            className="w-full max-h-[480px] object-cover transition-opacity duration-200"
          />

          {/* Double Tap Heart Pop Animation */}
          {showHeartPop && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <Heart className="w-28 h-28 fill-white/90 text-white/90 drop-shadow-2xl animate-ping" />
            </div>
          )}

          {/* Multi-Image Carousel Controls */}
          {post.images.length > 1 && (
            <>
              {/* Counter Pill */}
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                {activeImageIdx + 1}/{post.images.length}
              </div>

              {/* Prev Button */}
              {activeImageIdx > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx((prev) => prev - 1);
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-opacity z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next Button */}
              {activeImageIdx < post.images.length - 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIdx((prev) => prev + 1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-opacity z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Dots indicator at bottom */}
              <div className="absolute bottom-2.5 left-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {post.images.map((_, dotIdx) => (
                  <span
                    key={dotIdx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      activeImageIdx === dotIdx ? 'bg-white w-3' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Action Bar (Instagram-style) */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 group transition-transform active:scale-125"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                hasLiked
                  ? 'fill-red-500 text-red-500'
                  : 'text-neutral-600 dark:text-neutral-400 group-hover:text-red-500'
              }`}
            />
            <span
              className={`text-xs font-bold ${
                hasLiked ? 'text-red-500' : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {likesCount}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-bold">{comments.length}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {copiedLink ? (
              <Check className="w-5 h-5 text-emerald-500" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">
              {copiedLink ? 'Copied' : post.sharesCount}
            </span>
          </button>
        </div>

        {/* Bookmark / Save */}
        <button
          onClick={handleSave}
          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-transform active:scale-110"
        >
          <Bookmark
            className={`w-5 h-5 ${
              hasSaved ? 'fill-indigo-600 text-indigo-600' : ''
            }`}
          />
        </button>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 pt-1 border-t border-neutral-100 dark:border-neutral-900 flex flex-col gap-3">
          <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-6 h-6 rounded-full object-cover mt-0.5"
                />
                <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-xl">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                      {comment.author.name}
                    </span>
                    <span className="text-[10px] text-neutral-400">{comment.createdAt}</span>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write a comment or ask for advice..."
              className="flex-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="p-2 rounded-xl bg-indigo-600 disabled:opacity-40 text-white hover:bg-indigo-500 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
};
