import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";
import { BaseUrl } from "../BaseUrl";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import authenticationImage from "/src/assets/signupImage.png";
import OTPInput, { ResendOTP } from "otp-input-react";
export default function ForgotPassOtpVerify() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spinner, setSpinner] = useState(false);

  const [apiStatus, setApiStatus] = useState({
    status: true,
  });
  const [OTP, setOTP] = useState("");

  const routesData = [
    {
      name: "Dashboard",
      route: "",
    },
    {
      name: "User Management",
      route: "User-Management",
    },
    {
      name: "Role And Staff",
      route: "Roles-Staff",
    },

    {
      name: "Notification / Campaigns",
      route: "Notifications-And-Campaigns",
    },
    {
      name: "Analytics",
      route: "Analytics",
    },
    {
      name: "FAQ",
      route: "Faq",
    },
    {
      name: "Payout & Rewards",
      route: "Payout-Rewards",
    },
    {
      name: "Gifts",
      route: "Gifts",
    },
     {
      name: "Rewards",
      route: "Rewards",
    },
    {
      name: "Pricing",
      route: "Pricing",
    },
    {
      name:"Coin Seller",
      route:"Coin-Seller"
    },
    {
      name: "Agency Onboard",
      route: "Agency-Onboard",
    },
    {
      name: "Host Verification",
      route: "Host-Verification",
    },
    {
      name: "Revenue & Monetization",
      route: "Revenue-And-Monetization",
    },
    {
      name: "Communication & Support",
      route: "Communication-And-Support",
    },
  ];

  function verifyOtp() {
    setSpinner(true);
    axios
      .post(`${BaseUrl.baseurl}/admin/verify-staff`, {
        otp: OTP,
        loginData: id,
      })
      .then((res) => {
        console.log("VERIFY OTP RESPONSE");
        console.log(res.data);
        setSpinner(false);
        setApiStatus(res.data);
        if (res.data.status) {
          toast.success(res.data.message);
          localStorage.setItem(
            "LiveStreamAdminDetails",
            JSON.stringify(res.data)
          );
          axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
          if (res.data?.data?.role?.permissions.includes("Dashboard")) {
            navigate("/");
          } else {
            routesData.map((val) => {
              if (res.data?.data?.role?.permissions[0] === val.name) {
                navigate(`/${val.route}`);
              }
            });
          }
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.error(err.message);
        console.log("Error", err);
      });
  }

  return (
    <div className="login-parent-container md:grid md:grid-cols-2 md:gap-4  bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] shadow">
      <div className="hidden md:block">
        <div className="flex items-center justify-center h-full">
          <img
            className="h-[300px] w-[400px] "
            src={authenticationImage}
            alt="cover-image"
          />
        </div>
      </div>
      <div className="loginLayout">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            padding: "12px",
          }}
        >
          <div className="font-bold text-3xl text-white">Verify OTP</div>
          {!apiStatus.status && (
            <p className="emailpasswrong bg-formApiErrorColor rounded-md mt-3 p-2">
              {apiStatus.message}!
            </p>
          )}
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-[#9AA3B2]"
            >
              Otp Sent to Mobile Number
            </label>
            <div className={` mt-1 rounded-md border-primary`}>
              <OTPInput
                inputStyles={{
                  width: "50%",
                  height: 68,
                  color: "#135334",
                }}
                value={OTP}
                onChange={setOTP}
                autoFocus
                OTPLength={4}
                otpType="number"
                disabled={false}
              />
            </div>
          </div>
          {OTP.length !== 4 ? (
            <button className="px-3 py-3 rounded-lg text-sm font-bold bg-purple-200 hover:bg-purple-300">
              Verify
            </button>
          ) : (
            <button
              onClick={() => {
                verifyOtp();
              }}
              className="px-3 py-3 rounded-lg text-sm font-bold bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
            >
              {spinner ? <Loader className="animate-spin" /> : "Verify"}
            </button>
          )}
          <div className="text-center">
            <span className="text-quarternarySize text-[#94a3B8]">
              If you remember your password?
              <Link
                to={"/login"}
                className="text-textBlueColor ml-2 text-quarternarySize"
              >
                Back to login
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
