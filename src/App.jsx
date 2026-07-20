import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { CommonPage } from "./pages/CommonPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./pages/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import ForgotPasswordVerify from "./pages/ForgotPasswordVerify";
import "./App.css";
import Privacy from "./Privacy";
import Terms from "./Terms";
import ForgotPassOtpVerify from "./pages/ForgotPassOtpVerify";

import UserManagement from "./pages/UserManagement";
import RolesAndStaff from "./pages/RolesAndStaff";

import NotificationAndCampaign from "./pages/NotificationAndCampaign";
import Analytics from "./pages/Analytics";
import FaqComponant from "./pages/FaqComponant";
import DashboardNew from "./pages/DashBoardNew";
import HostManagement from "./pages/HostManagement";
import RevenueAndMonetization from "./pages/RevenueAndMonitirization";
import CommunicationAndSupport from "./pages/CommunicationAndSupport";
import HostVerification from "./pages/HostVerification";
import AgencyOnboard from "./pages/AgencyOnboard";
import AgentHostDetails from "./pages/AgentHostDetails";
import CoinsHistory from "./pages/CoinsHistory";
import TransactionHistory from "./pages/TransactionHistory";
import PricingDistribution from "./pages/PricingDistribution";
import InvoiceAutoPage from "./pages/InvoiceAutoPage";
import GiftsDashboard from "./pages/GiftsDashboard";
import PricingDashboard from "./pages/PricingDashboard";
import RewardConfigDashboard from "./pages/RewardConfigDashboard";
import CreateHost from "./pages/CreateHost";
import CoinSeller from "./pages/CoinSellerDashboard";
import CoinSellerDashboard from "./pages/CoinSellerDashboard";
import OnlineUserComponant from "./pages/OnlineUserComponant";
import HostCallHistoryDashboard from "./pages/HostCallHistoryDashboard";
import PostModerationDashboard from "./pages/PostModerationDashboard";
import TopUsersDashboard from "./pages/TopUsersDashboard";
import axios from "axios";
import AdminChatViewer from "./pages/AdminChatViewer";
import AdminPayoutDashboard from "./pages/AdminPayoutDashboard";
import io from "socket.io-client";
import { BaseUrl } from "./BaseUrl";
import { useEffect } from "react";
import AdminChatDashboard from "./pages/AdminChatDashboard";
import UserRewards from "./pages/UserRewards";
import LocationTransactions from "./pages/LocationTransactions";
import SendOfferNotification from "./pages/SendOfferNotification";
import UserCallHistory from "./pages/UserCallHistory";
import InvoiceAutoPageFlirty from "./pages/InvoiceAutoPageFlirty";
var socket = io.connect(BaseUrl.baseurl, {
  transports: ["websocket"],
});
function App() {
  const raw = localStorage.getItem("LiveStreamAdminDetails");
  const userDetails = raw ? JSON.parse(raw) : null;
  if (userDetails && userDetails.token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${userDetails.token}`;
  }
  console.log("useinfo", userDetails);
  const routesData = [
    {
      name: "Dashboard",
      route: "",
      element: <DashboardNew />,
    },
    {
      name: "User Management",
      route: "User-Management",
      element: <UserManagement />,
    },
    {
      name: "Role And Staff",
      route: "Roles-Staff",
      element: <RolesAndStaff />,
    },

    {
      name: "Notification / Campaigns",
      route: "Notifications-And-Campaigns",
      element: <NotificationAndCampaign />,
    },
    {
      name: "Analytics",
      route: "Analytics",
      element: <Analytics />,
    },
    {
      name: "FAQ",
      route: "Faq",
      element: <FaqComponant />,
    },
    {
      name: "Payout & Rewards",
      route: "Payout-Rewards",
      element: <HostManagement />,
    },
    {
      name: "Agency Onboard",
      route: "Agency-Onboard",
      element: <AgencyOnboard />,
    },
    {
      name: "Host Verification",
      route: "Host-Verification",
      element: <HostVerification />,
    },
    {
      name: "Revenue & Monetization",
      route: "Revenue-And-Monetization",
      element: <RevenueAndMonetization />,
    },
    {
      name: "Communication & Support",
      route: "Communication-And-Support",
      element: <CommunicationAndSupport />,
    },
    {
      name: "Gifts",
      route: "Gifts",
      element: <GiftsDashboard />,
    },
    {
      name: "Rewards",
      route: "Rewards",
      element: <RewardConfigDashboard />,
    },
    {
      name: "Pricing",
      route: "Pricing",
      element: <PricingDashboard />,
    },
    {
      name: "Coin Seller",
      route: "Coin-Seller",
      element: <CoinSellerDashboard />,
    },
  ];
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log("jabbba supporrt socket", data);
    };

    socket.on(
      `staff_notification_${userDetails?.data?._id}`,
      handleReceiveMessage,
    );

    return () => {
      socket.off(
        `staff_notification_${userDetails?.data?._id}`,
        handleReceiveMessage,
      );
    };
  }, []);
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="pricing-distribution/:type"
        element={<PricingDistribution />}
      />

      {/* <Route path="privacy-policy" element={<Privacy />} />
      <Route path="terms-and-conditions" element={<Terms />} /> */}
      <Route path="/invoice/:userId" element={<InvoiceAutoPage />} />
      <Route path="/invoice-flirtyvoice/:userId" element={<InvoiceAutoPageFlirty />} />
      <Route path="forgotpassword" element={<ForgotPassword />} />
      <Route path="verify-otp/:id" element={<ForgotPassOtpVerify />} />
      <Route
        path="ForgotPassword-verify/:id"
        element={<ForgotPasswordVerify />}
      />

      <Route element={<ProtectedRoute />}>
        <Route path="" element={<CommonPage />}>
          {/* {userDetails &&
            userDetails?.data?.role?.permissions.includes("Dashboard") && (
              <Route index element={<DashboardNew />} />
            )} */}
          {routesData.map((val, i) => {
            if (
              userDetails &&
              !userDetails?.data?.role?.permissions.includes(val.name)
            ) {
              return;
            }
            return (
              <Route
                key={i}
                path={val.route}
                index={val.route === ""}
                element={val.element}
              />
            );
          })}
          {userDetails &&
            userDetails?.data?.role?.permissions.includes("Agency Onboard") && (
              <Route
                path="Agent-Host-Details/:id"
                element={<AgentHostDetails />}
              />
            )}
          {userDetails &&
            (userDetails?.data?.role?.permissions.includes("User Management") ||
              userDetails?.data?.role?.permissions.includes("Agency Onboard") ||
              userDetails?.data?.role?.permissions.includes(
                "Revenue & Monetization",
              ) ||
              userDetails?.data?.role?.permissions.includes("Coin Seller") ||
              userDetails?.data?.role?.permissions.includes(
                "Communication & Support",
              ) ||
              userDetails?.data?.role?.permissions.includes(
                "Host Verification",
              ) ||
              userDetails?.data?.role?.permissions.includes("Dashboard")) && (
              <Route path="Coins-History/:id" element={<CoinsHistory />} />
            )}
          {userDetails &&
            (userDetails?.data?.role?.permissions.includes("User Management") ||
              userDetails?.data?.role?.permissions.includes("Agency Onboard") ||
              userDetails?.data?.role?.permissions.includes(
                "Revenue & Monetization",
              ) ||
              userDetails?.data?.role?.permissions.includes("Coin Seller") ||
              userDetails?.data?.role?.permissions.includes(
                "Communication & Support",
              ) ||
              userDetails?.data?.role?.permissions.includes(
                "Host Verification",
              ) ||
              userDetails?.data?.role?.permissions.includes("Dashboard")) && (
              <>
                <Route
                  path="Transaction-History/:id"
                  element={<TransactionHistory />}
                />
                <Route path="Reward-List/:id" element={<UserRewards />} />
                <Route path="User-Calls/:type/:id" element={<UserCallHistory />} />
              </>
            )}
          {userDetails &&
            userDetails?.data?.role?.permissions.includes(
              "Host Verification",
            ) && (
              <Route
                path="view-rejected-calls"
                element={<HostCallHistoryDashboard />}
              />
            )}
          {userDetails &&
            userDetails?.data?.role?.permissions.includes("Dashboard") && (
              <>
                <Route
                  path="view-online-user/:type"
                  element={<OnlineUserComponant />}
                />
                <Route
                  path="New-User-Location-Analytic"
                  element={<LocationTransactions />}
                />
              </>
            )}
          {userDetails &&
            userDetails?.data?.role?.permissions.includes(
              "User Management",
            ) && (
              <Route path="view-posts" element={<PostModerationDashboard />} />
            )}
          {userDetails &&
            userDetails?.data?.role?.permissions.includes("Rewards") && (
              <Route
                path="top-user-dashboard"
                element={<TopUsersDashboard />}
              />
            )}
          {userDetails &&
            userDetails?.data?.role?.permissions.includes(
              "User Management",
            ) && (
              <>
                <Route path="admin-chat" element={<AdminChatDashboard />} />
                <Route path="user-notification" element={<SendOfferNotification />} />
              </>
            )}
          {userDetails &&
            (userDetails?.data?.role?.permissions.includes("User Management") ||
              userDetails?.data?.role?.permissions.includes("Agency Onboard") ||
              userDetails?.data?.role?.permissions.includes(
                "Communication & Support",
              ) ||
              userDetails?.data?.role?.permissions.includes(
                "Host Verification",
              ) ||
              userDetails?.data?.role?.permissions.includes("Dashboard")) && (
              <Route path="user-chat/:id" element={<AdminChatViewer />} />
            )}
          {userDetails &&
            (userDetails?.data?.role?.permissions.includes(
              "Payout & Rewards",
            ) ||
              userDetails?.data?.role?.permissions.includes("Agency Onboard") ||
              userDetails?.data?.role?.permissions.includes(
                "Communication & Support",
              ) ||
              userDetails?.data?.role?.permissions.includes(
                "Host Verification",
              )) && (
              <Route
                path="user-payout/:id"
                element={<AdminPayoutDashboard />}
              />
            )}
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
