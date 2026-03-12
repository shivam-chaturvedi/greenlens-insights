export type CommentType = {
  id: number;
  author: string;
  role: string;
  content: string;
  time: string;
};

export type PostType = {
  id: number;
  title: string;
  content: string;
  author: string;
  role: string;
  avatar: string;
  category: string;
  likes: number;
  comments: CommentType[];
  time: string;
  hasDirectData: boolean;
  uploadType: string;
  isDeleted?: boolean;
  userLiked?: boolean;
  tags?: string[];
};

export type CalculationHistoryItem = {
  id: string;
  title: string;
  summary: string;
  impact: string;
  timestamp: string;
  change: number | null;
};

export const SUBTOPICS = [
  "Circular Economy",
  "Recycling & Compost",
  "Decarbonization",
  "Energy & Renewable Energy",
  "Electric Vehicles",
  "Policy",
  "Greenhouse Gas Emissions",
  "Pesticides, Invasives, & Deforestation",
] as const;

export const CATEGORIES = ["All", ...SUBTOPICS];

export const UPLOAD_OPTIONS = [
  {
    label: "Links",
    description: "Share datasets, dashboards, or supporting research",
  },
  { label: "Videos", description: "Upload walkthroughs or town halls" },
  { label: "Images", description: "Illustrate findings with charts" },
  {
    label: "Writing",
    description: "Publish reflections, policy briefs, and narratives",
  },
];

export const SUGGESTED_TITLES = [
  "Decarbonizing our local bus fleet with direct energy data",
  "How our neighborhood compost rates feed the circular economy",
  "Policy ask: expedite incentives for small businesses installing solar",
  "Tracking pesticide runoff with citizen sensors",
];

export const DEFAULT_HISTORY: CalculationHistoryItem[] = [
  {
    id: "history-1",
    title: "Neighborhood energy footprint",
    summary: "Blended grid data vs. rooftop solar estimates",
    impact: "-1.8 tCO₂e",
    timestamp: "Mar 2, 2026",
    change: -3.1,
  },
  {
    id: "history-2",
    title: "EV charging infrastructure",
    summary: "Public station utilization with new demand curves",
    impact: "-0.4 tCO₂e",
    timestamp: "Feb 25, 2026",
    change: 1.2,
  },
  {
    id: "history-3",
    title: "City compost diversion rate",
    summary: "Estimate from community weigh-ins",
    impact: "+0.2 tCO₂e",
    timestamp: "Feb 18, 2026",
    change: 0.4,
  },
];

export const BASE_POSTS: PostType[] = [
  {
    id: 1,
    title: "Community-led river cleanup and compost relay",
    content:
      "We are recruiting volunteers for a river cleanup this Saturday at 10 AM. The plan also includes a compost relay so we can capture the organic waste before it reaches the watershed.",
    author: "Emma Rodriguez",
    role: "Circular Economy Organizer",
    avatar: "ER",
    category: "Recycling & Compost",
    hasDirectData: true,
    uploadType: "Links",
    likes: 45,
    comments: [
      {
        id: 101,
        author: "John D.",
        role: "City Planner",
        content: "Count me in — do you have direct load tracking from the cleanup so we can report the carbon avoided?",
        time: "2 hours ago",
      },
    ],
    time: "4 hours ago",
    tags: ["river cleanup", "compost"],
  },
  {
    id: 2,
    title: "City board approves new renewable energy rebates",
    content:
      "The council approved a generous rebate for small businesses that install rooftop solar and storage. We need volunteers to help publicize the program and collect monthly output data.",
    author: "Dr. Sarah Chen",
    role: "Energy Policy Researcher",
    avatar: "SC",
    category: "Policy",
    hasDirectData: true,
    uploadType: "Writing",
    likes: 112,
    comments: [],
    time: "1 day ago",
    tags: ["solar rebate", "small business"],
  },
  {
    id: 3,
    title: "Is the industrial park hitting its GHG promises?",
    content:
      "I've been scraping the permit data with GreenLens and the actual emissions aren't matching the commitments. The difference is too large to ignore.",
    author: "Mark Thompson",
    role: "Sustainability Journalist",
    avatar: "MT",
    category: "Greenhouse Gas Emissions",
    hasDirectData: true,
    uploadType: "Images",
    likes: 89,
    comments: [
      {
        id: 102,
        author: "Alice W.",
        role: "Research Scientist",
        content: "I tracked the same values. Happy to coordinate a full dataset review.",
        time: "4 hours ago",
      },
      {
        id: 103,
        author: "Tom H.",
        role: "Investigative Reporter",
        content: "Let's compile and publish a shared dataset before the meeting next week.",
        time: "1 hour ago",
      },
    ],
    time: "2 days ago",
    tags: ["GHG tracking", "journalism"],
  },
  {
    id: 4,
    title: "EV commuter survey and charging heat map",
    content:
      "New data from the last two months shows peak load at mid-day. I'm collecting more driver surveys to model demand with real usage data.",
    author: "Kai Patel",
    role: "Electric Mobility Strategist",
    avatar: "KP",
    category: "Electric Vehicles",
    hasDirectData: false,
    uploadType: "Videos",
    likes: 58,
    comments: [
      {
        id: 104,
        author: "Nora I.",
        role: "Grid Analyst",
        content: "Can you include the station-level telemetry? It would help refine the load shape.",
        time: "3 hours ago",
      },
    ],
    time: "6 hours ago",
    tags: ["EV demand", "driver survey"],
  },
];
