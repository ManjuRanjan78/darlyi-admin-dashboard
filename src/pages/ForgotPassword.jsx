import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";
import { BaseUrl } from "../BaseUrl";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import authenticationImage from "/src/assets/signupImage.png";
import { Helmet } from "react-helmet";
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [spinner, setSpinner] = useState(false);
  const [emailStatus, setEmailStatus] = useState({
    clicked: false,
    error: false,
  });
  const [apiStatus, setApiStatus] = useState({
    status: true,
  });
  const [emailValid, setEmailValid] = useState(false);
  const [email, setEmail] = useState("");

  function isValidEmail(email) {
    // Regular expression pattern for a basic email validation
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    // Test the email against the pattern
    return emailPattern.test(email);
  }

  function verifyEmail() {
    setSpinner(true);
    
    axios
      .post(`${BaseUrl.baseurl}/phlebo/send-otp-update-password`, { Email: email })
      .then((res) => {
        setSpinner(false);
        setApiStatus(res.data);
        if (res.data.status) {
          toast.success(res.data.message);
          navigate(`/verify-otp/${res.data.details}`);
          
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
    <div className="login-parent-container md:grid md:grid-cols-2 md:gap-4">
       <Helmet>
        <title>Technician Forgot Password</title>
        <meta
          name="description"
          content="Login with app.justscheduler.com and create posts in your social media platforms within fraction of seconds, Join us today!"
        />
      </Helmet>
      <div className="hidden md:block">
      <div className="flex items-center justify-center h-full">
          <img
            className="h-[400px] w-[400px] object-cover"
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
          <div className="loginTypo">Forgot password</div>
          {!apiStatus.status && (
            <p className="emailpasswrong bg-formApiErrorColor rounded-md mt-3 p-2">
              {apiStatus.message}!
            </p>
          )}
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email address
            </label>
            <div
              className={`border mt-1 rounded-md bg-inputBgColor border-primary`}
            >
              <input
                className="block w-full rounded-md border-0 py-2.5 bg-transparent ring-1 ring-inset ring-transparent placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-transparent sm:text-sm sm:leading-6 focus:outline-none"
                autoComplete="off"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isValidEmail(e.target.value)) {
                    setEmailValid(true);
                  } else {
                    setEmailValid(false);
                  }
                }}
                onClick={() => {
                  setEmailStatus({
                    clicked: true,
                    error: false,
                  });
                }}
                placeholder="Enter your email address"
              />
            </div>
          </div>
          {!emailValid ? (
            <div className="verifyBtnBlurr">Verify</div>
          ) : (
            <div
              onClick={() => {
                verifyEmail();
              }}
              className="loginBtn"
            >
              {spinner ? <Loader className="animate-spin" /> : "Verify"}
            </div>
          )}
          <div className="text-center">
            <span className="text-quarternarySize text-titleBold">
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
