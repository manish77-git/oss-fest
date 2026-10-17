# 🎓 CampusConnect: Discord-Inspired College Community & Open-Source Collaboration Hub

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=flat&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **CampusConnect** is an open-source, college-exclusive community and developer collaboration platform inspired by Discord and modern open-source project hubs. It integrates an **autonomous CampusAI Copilot** at its core to talk to students, retrieve academic vault materials, senior interview debriefs, and match open-source tasks in real time.

---

## 🌟 Key Product Pillars

1. **Discord-Inspired 4-Pane Architecture**:
   - **Server Navigation Rail (72px)**: Quick switching between joined communities, active status pills, discover communities explorer, server creator, and AI Copilot summoner.
   - **Channel Sidebar (250px)**: Collapsible categories (Collaboration & Bugs, AI Copilot, Academics, Community), unread counts, and bottom user control widget with mic/audio toggles and student profile.
   - **Main Conversation Panel**: Full viewport height conversation stream with message grouping, reactions, contextual edit/delete, empty states, and anchored multiline composer.
   - **Member Sidebar (240px, collapsible)**: Grouped by roles (Core Maintainers, Mentors & Seniors, Student Contributors, AI & Automation) with live presence indicators.

2. **Open-Source Lab (The Differentiating Feature)**:
   - Dedicated channels: `#project-discussions`, `#bug-reports`, `#feature-ideas`, `#good-first-issues`, `#development`.
   - **Structured Contribution Cards**: Compact cards embedded inside the chat stream for Bug Reports, Good First Issues, Feature RFCs, and Project Milestones.
   - **Interactive Actions**: Direct links to GitHub repositories & issues, upvote counters, "Claim Issue" flow with Academic Karma rewards, and "Mark Resolved" toggles.

3. **Autonomous CampusAI Copilot (Core Concept)**:
   - Available via `#campus-ai-assistant`, in-channel `@campus-ai` mentions, or the floating AI drawer.
   - Intelligently parses natural language queries and fetches live structured data:
     - 🚀 **Good First Issues & Bug Reports**: Surfaces matching issues with claim actions.
     - 📚 **Academic Notes & Exam Papers (PYQs)**: Queries verified semester lecture notes with direct download buttons.
     - 💼 **Senior Placement Debriefs**: Pulls company interview rounds (Microsoft, Amazon, Qualcomm), coding questions asked, and preparation roadmaps.
     - 👥 **Hackathon Squads**: Finds teams looking for members for Smart India Hackathon and capstones.
     - 📊 **Channel Summaries**: Summarizes active bugs, maintainers, and recent technical discussions.

4. **Community Discovery & Creation**:
   - Discover and join/leave student technical clubs (Robotics, Competitive Programming, UI/UX, CyberSecurity).
   - Validated community server creation dialog.

5. **Student Profile & Role Switching**:
   - Academic Karma points ledger (+50 karma on claiming issues, +40 on sharing notes).
   - Instant Demo Role Switcher (Switch between CS Junior Aarav Patel and Senior Microsoft SDE Priya Nambiar).

6. **Global Search Palette (Ctrl+K / Cmd+K)**:
   - Fast instant search across channels, open-source issues, academic notes, and AI query shortcuts.

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js v18.0+ (Tested on Node v24.20)
* npm or yarn

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to explore the workspace.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 📂 Project Architecture
```text
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css                       # Discord dark theme variables & custom scrollbar
│   │   ├── layout.tsx                        # Root layout with Geist typography
│   │   └── page.tsx                          # Master 4-pane application orchestrator
│   ├── components/
│   │   ├── layout/
│   │   │   ├── ServerRail.tsx                # 72px server navigation rail with tooltips
│   │   │   ├── ChannelSidebar.tsx            # Collapsible categories, channels & user bar
│   │   │   └── MemberSidebar.tsx             # Role-grouped roster with presence status
│   │   ├── chat/
│   │   │   ├── ConversationPanel.tsx         # Centerpiece conversation, headers & filters
│   │   │   ├── MessageItem.tsx               # Grouped messages, reactions & rich payload cards
│   │   │   └── MessageComposer.tsx           # Auto-resizing composer with contribution menu
│   │   ├── contributions/
│   │   │   ├── ContributionCard.tsx          # Structured Bug / Issue / Feature card
│   │   │   └── CreateContributionModal.tsx   # Validated contribution submission dialog
│   │   ├── communities/
│   │   │   ├── DiscoverCommunitiesModal.tsx  # Searchable server discovery & join/leave
│   │   │   └── CreateCommunityModal.tsx      # Community creation dialog
│   │   ├── ai/
│   │   │   └── AIAssistantDrawer.tsx         # Conversational CampusAI Copilot side-drawer
│   │   ├── auth/
│   │   │   └── LoginPage.tsx                 # Student Sign In & Account Registration
│   │   ├── profile/
│   │   │   └── StudentProfileModal.tsx       # Student profile, karma ledger & role switcher
│   │   └── search/
│   │       └── GlobalSearchModal.tsx         # Ctrl+K global command & query palette
│   ├── services/
│   │   ├── aiAssistantService.ts             # Natural language parser & data retrieval engine
│   │   ├── apiClient.ts                      # Centralized typed API client & mock adapter
│   │   └── authService.ts                    # Student authentication & session manager
│   ├── data/
│   │   ├── communityData.ts                  # Servers, channels, contributions, roster
│   │   └── mockData.ts                       # Academic vault, placement debriefs, squads
│   └── types/
│       └── index.ts                          # TypeScript models for servers, channels, contributions
├── package.json
├── Dockerfile
└── tsconfig.json
```
