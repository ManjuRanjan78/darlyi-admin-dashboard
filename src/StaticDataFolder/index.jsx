import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChevronUpIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export const navigation = [
  {
    name: "Dashboard",
    href: "#",
    icon: HomeIcon,
    current: true,
    svgPath: "🏠",
    activeSvgPath: "🏠",
    pathValue: "/",
    // children:[{
    //   name:"vighnesh",
    //   pathValue:"vikki"
    // }]
  },

  {
    name: "User Management",
    href: "#",
    icon: UsersIcon,
    current: false,
    svgPath: "👤",
    activeSvgPath: "👤",
    pathValue: "/User-Management",
  },
  {
    name: "Host Verification",
    href: "#",
    icon: UsersIcon,
    current: false,
    svgPath: "✅",
    activeSvgPath: "✅",
    pathValue: "/Host-Verification",
  },
  {
    name: "Agency Onboard",
    href: "#",
    icon: UsersIcon,
    current: false,
    svgPath: "🤝",
    activeSvgPath: "🤝",
    pathValue: "/Agency-Onboard",
  },
   {
    name: "Revenue & Monetization",
    href: "#",
    icon: UsersIcon,
    current: false,
    svgPath: "💰",
    activeSvgPath: "💰",
    pathValue: "/Revenue-And-Monetization",
  },
  {
    name: "Coin Seller",
    href: "#",
    icon: UsersIcon,
    current: false,
    svgPath: "🏦",
    activeSvgPath: "🏦",
    pathValue: "/Coin-Seller",
  },

  {
    name: "Payout & Rewards",
    href: "#",
    icon: UsersIcon,
    current: false,
    svgPath: "💸",
    activeSvgPath: "💸",
    pathValue: "/Payout-Rewards",
  },
  {
    name: "Gifts",
    href: "#",
    icon: UsersIcon,
    current: false,
    svgPath: "🎁",
    activeSvgPath: "🎁",
    pathValue: "/Gifts",
  },
  {
    name: "Rewards",
    href: "#",
    icon: UsersIcon,
    current: false,
    svgPath: "🏆",
    activeSvgPath: "🏆",
    pathValue: "/Rewards",
  },
   {
    name: "Pricing",
    href: "#",
    icon: UsersIcon,
    current: false,
    svgPath: "💳",
    activeSvgPath: "💳",
    pathValue: "/Pricing",
  },
  {
    name: "Analytics",
    href: "#",
    icon: FolderIcon,
    current: false,
    svgPath: "📈",
    activeSvgPath: "📈",
    pathValue: "/Analytics",
  },
 
  // {
  //   name: "Content Moderation",
  //   href: "#",
  //   icon: FolderIcon,
  //   current: false,
  //   svgPath: "📝",
  //   activeSvgPath: "📝",
  //   pathValue: "/Content-Moderation",
  //   childPaths: true,
  // },
  {
    name: "Communication & Support",
    href: "#",
    icon: UsersIcon,
    current: false,
    svgPath: "🎟️",
    activeSvgPath: "🎟️",
    pathValue: "/Communication-And-Support",
  },
  // {
  //   name: "Chat Monitor",
  //   href: "#",
  //   icon: UsersIcon,
  //   current: false,
  //   svgPath: "💬",
  //   activeSvgPath: "💬",
  //   pathValue: "/Chat-Monitor",
  // },
  // {
  //   name: "Report And Abuse",
  //   href: "#",
  //   icon: CalendarIcon,
  //   current: false,
  //   svgPath: "🚨",
  //   activeSvgPath: "🚨",
  //   pathValue: "/Report-And-Abuse",
  // },

  // {
  //   name: "Subscriptions And Payment",
  //   href: "#",
  //   icon: FolderIcon,
  //   current: false,
  //   svgPath: "💳",
  //   activeSvgPath: "💳",
  //   pathValue: "/Subscription-And-Payments",
  // },
  // {
  //   name: "Subscription Details",
  //   href: "#",
  //   icon: FolderIcon,
  //   current: false,
  //   svgPath: "💎",
  //   activeSvgPath:"💎",
  //   pathValue: "/Subscription-Details",
  // },
  {
    name: "Notification / Campaigns",
    href: "#",
    icon: FolderIcon,
    current: false,
    svgPath: "🔔",
    activeSvgPath: "🔔",
    pathValue: "/Notifications-And-Campaigns",
  },
  // {
  //   name: "Features & Config",
  //   href: "#",
  //   icon: FolderIcon,
  //   current: false,
  //   svgPath: "🛠️",
  //   activeSvgPath: "🛠️",
  //   pathValue: "/Features-And-Config",
  // },

  // {
  //   name: "Audit & Logs",
  //   href: "#",
  //   icon: FolderIcon,
  //   current: false,
  //   svgPath: "📋",
  //   activeSvgPath: "📋",
  //   pathValue: "/Audit-And-Logs",
  // },
  {
    name: "FAQ",
    href: "#",
    icon: FolderIcon,
    current: false,
    svgPath: "❓",
    activeSvgPath: "❓",
    pathValue: "/Faq",
  },
  {
    name: "Role And Staff",
    href: "#",
    icon: CalendarIcon,
    current: false,
    svgPath: "🔒",
    activeSvgPath: "🔒",
    pathValue: "/Roles-Staff",
  },
];

export const AnalyticsChildPageObj = {
  AnalyticsFollowers: {
    id: 1,
    title: "Followers",
    subtitle: "",
    cardTitle: "follower",
    graphKey: "followMonthArray",
    data: [
      {
        title: "Change",
        lable: "change",
      },
      {
        title: "Growth",
        lable: "growth",
      },
      {
        title: "Avg daily growth",
        lable: "averagedailygrowth",
      },
      {
        title: "Outflow",
        lable: "outflow",
      },
      {
        title: "Avg daily outflow",
        lable: "averagedailyoutflow",
      },
    ],
  },
  AnalyticsReachers: {
    id: 2,
    title: "Reach",
    subtitle: `Page reach for the selected period. It includes all media
    objects (Organic posts, advertising posts, and home page
    reach).`,
    cardTitle: "reach",
    graphKey: "totalPageReachArray",
    data: [
      {
        title: "Views",
        lable: "totalPageViews",
      },
      {
        title: "Reach",
        lable: "totalPageReach",
      },
      {
        title: "Org. reach",
        lable: "totalPageOrgReach",
      },
      {
        title: "Ad. reach",
        lable: "totalPageAdReach",
      },
      {
        title: "Vir. reach",
        lable: "totalPageViralReach",
      },
    ],
  },
  AnalyticsAcivity: {
    id: 3,
    title: "Activity",
    subtitle: `The number of clicks , likes , repost and comments on posts.
    Everyday diagram shows the number of interactions with posts
    published on that day.`,
    cardTitle: "activity",
    graphKey: "totalPageActivityArray",
    data: [
      {
        title: "Clicks",
        lable: "totalPageClicks",
      },
      {
        title: "Likes",
        lable: "totalPageLikes",
      },
      {
        title: "Comments",
        lable: "totalComments",
      },
      {
        title: "Reposts",
        lable: "totalShares",
      },
      {
        title: "Saving",
        lable: "totalSaves",
      },
    ],
  },
};

export const AnalyticsFollowers = [
  {
    title: "Change",
    lable: "change",
  },
  {
    title: "Growth",
    lable: "growth",
  },
  {
    title: "Avg daily growth",
    lable: "averagedailygrowth",
  },
  {
    title: "Outflow",
    lable: "outflow",
  },
  {
    title: "Avg daily outflow",
    lable: "averagedailyoutflow",
  },
];

export const AnalyticsReachers = [
  {
    title: "Views",
    lable: "totalPageViews",
  },
  {
    title: "Reach",
    lable: "totalPageReach",
  },
  {
    title: "Org. reach",
    lable: "totalPageOrgReach",
  },
  {
    title: "Ad. reach",
    lable: "totalPageAdReach",
  },
  {
    title: "Vir. reach",
    lable: "totalPageViralReach",
  },
];

export const AnalyticsAcivity = [
  {
    title: "Clicks",
    lable: "totalPageClicks",
  },
  {
    title: "Likes",
    lable: "totalPageLikes",
  },
  {
    title: "Comments",
    lable: "totalComments",
  },
  {
    title: "Reposts",
    lable: "totalShares",
  },
  {
    title: "Saving",
    lable: "totalSaves",
  },
];

export const AnalyticsContentVideo = [
  {
    title: "Videos View",
    lable: "totalPageVideoViews",
  },
  {
    title: "Average video view per post",
    lable: "averageVideoViewPerPost",
  },
];

export const AnalyticStoriesArray = [
  {
    title: "Impresssion",
    lable: "totoalImpression",
  },
  {
    title: "Average Reach",
    lable: "avgImpression",
  },
  {
    title: "Average completion rate",
    lable: "avgcompletion",
  },
];

export const AnalyticStoriesPublishedArray = [
  {
    title: "Image",
    lable: "image",
    hex: "#FE9526",
  },
  {
    title: "Video",
    lable: "videos",
    hex: "#FF3434",
  },
];

export const MySubScriptionArray = [
  {
    title: "Status",
    lable: "status",
  },
  {
    title: "Next payment",
    lable: "current_period_end",
  },
  {
    title: "Prices",
    lable: "prices",
  },
];
