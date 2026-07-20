import { useState } from "react";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import { loginSchema } from "../FormikSchemas/Schemas";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { Loader, Loader2 } from "lucide-react";
import authenticationImage from "/src/assets/signupImage.png";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import khealthLogo from '../assets/khealth-logo.png'
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    status: true,
  });
  const [spinner, setSpinner] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const navigate = useNavigate();

  const handleLogin = (values, actions) => {
    setSpinner(true);
    let data = {
      loginData: values.businessEmail,
    };
    axios
      .post(`${BaseUrl.baseurl}/admin/login-staff`, data)
      .then((res) => {
        setSpinner(false);
        setApiStatus(res.data);
        if (res.data.status) {
           navigate(`/verify-otp/${values.businessEmail}`);
          actions.resetForm();
          
        } 
      })

      .catch((err) => {
        console.log("Error");
        toast.error(err.message);
        setSpinner(false);
      });
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    // handleReset,
    isSubmitting,
    // dirty,
    // isValid,
  } = useFormik({
    initialValues: {
      businessEmail: "",
    },
    validationSchema: loginSchema,
    onSubmit: handleLogin,
  });

  return (
    <div className="flex h-[100vh] bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] shadow">
      <Helmet>
        <title>Togilo AdminLogin</title>
        <meta
          name="description"
          content="Login with app.justscheduler.com and create posts in your social media platforms within fraction of seconds, Join us today!"
        />
      </Helmet>{" "}
      <div className="relative hidden w-0 flex-1 md:block">
     
        <div className="flex items-center justify-center h-full">
          <img
            className="h-[300px] w-[400px] "
            src={authenticationImage}
            alt="cover-image"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col">
            <img
              className="h-full w-full self-center"
              // src="https://app.coldsender.com/static/media/coldemail_login.db8c86bf18a5aefb657cb8099ae9392e.svg"
              src={khealthLogo}
              alt="Your Company"
            />

            <h2 className="mt-4 text-formTitleSize font-bold leading-9 tracking-tight text-white">
              Login
            </h2>
            {!apiStatus.status && (
              <div className="bg-formApiErrorColor rounded-md mt-3 p-2">
                <p className="text-quarternarySize text-[#801a1a]">
                  {apiStatus.message}
                </p>
              </div>
            )}
          </div>
          <div className="mt-3">
            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="space-y-3"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Email address
                </label>
                <div
                  className={`border mt-1 rounded-md bg-inputBgColor ${
                    errors.businessEmail && touched.businessEmail
                      ? "border-red-500"
                      : "border-primary"
                  }`}
                >
                  <input
                    id="email"
                    name="businessEmail"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.businessEmail}
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email address"
                    className="block w-full rounded-md border-0 py-2.5 bg-transparent ring-1 ring-inset ring-transparent placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-transparent sm:text-sm sm:leading-6 focus:outline-none"
                  />
                </div>
                {errors.businessEmail && touched.businessEmail && (
                  <p className="text-quarternarySize text-red-500">
                    **{errors.businessEmail}
                  </p>
                )}
              </div>

              {/* <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div
                  className={`border mt-1 rounded-md flex items-center gap-1 pr-2 bg-inputBgColor ${
                    errors.password && touched.password
                      ? "border-red-500"
                      : "border-primary"
                  }`}
                >
                  <input
                    placeholder="Enter your password"
                    type={`${showPassword ? "text" : "password"}`}
                    id="newPassword"
                    autoComplete="off"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                    className="block w-full rounded-md border-0 py-2.5 bg-transparent ring-1 ring-inset ring-transparent placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-transparent sm:text-sm sm:leading-6 focus:outline-none"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {!showPassword ? (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="vuesax/linear/eye">
                          <g id="eye">
                            <path
                              id="Vector"
                              d="M12.9833 9.99993C12.9833 11.6499 11.6499 12.9833 9.99993 12.9833C8.34993 12.9833 7.0166 11.6499 7.0166 9.99993C7.0166 8.34993 8.34993 7.0166 9.99993 7.0166C11.6499 7.0166 12.9833 8.34993 12.9833 9.99993Z"
                              stroke="#868686"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              id="Vector_2"
                              d="M9.99987 16.8918C12.9415 16.8918 15.6832 15.1584 17.5915 12.1584C18.3415 10.9834 18.3415 9.00843 17.5915 7.83343C15.6832 4.83343 12.9415 3.1001 9.99987 3.1001C7.0582 3.1001 4.31654 4.83343 2.4082 7.83343C1.6582 9.00843 1.6582 10.9834 2.4082 12.1584C4.31654 15.1584 7.0582 16.8918 9.99987 16.8918Z"
                              stroke="#868686"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                        </g>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M12.1092 7.8916L7.89258 12.1083C7.35091 11.5666 7.01758 10.8249 7.01758 9.99993C7.01758 8.34993 8.35091 7.0166 10.0009 7.0166C10.8259 7.0166 11.5676 7.34994 12.1092 7.8916Z"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14.8499 4.8084C13.3915 3.7084 11.7249 3.1084 9.99987 3.1084C7.0582 3.1084 4.31654 4.84173 2.4082 7.84173C1.6582 9.01673 1.6582 10.9917 2.4082 12.1667C3.06654 13.2001 3.8332 14.0917 4.66654 14.8084"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.01758 16.2751C7.96758 16.6751 8.97591 16.8917 10.0009 16.8917C12.9426 16.8917 15.6842 15.1584 17.5926 12.1584C18.3426 10.9834 18.3426 9.0084 17.5926 7.8334C17.3176 7.40006 17.0176 6.99173 16.7092 6.6084"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12.9242 10.583C12.7076 11.758 11.7492 12.7163 10.5742 12.933"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.89102 12.1084L1.66602 18.3334"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18.3324 1.66699L12.1074 7.89199"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="text-quarternarySize text-red-500">
                    **{errors.password}
                  </p>
                )}
              </div> */}

              <div className="flex items-center justify-between">
                <div className="flex items-center"></div>

                {/* <div className="text-sm leading-6">
                  <Link
                    to={"/forgotpassword"}
                    className="font-semibold text-textBlueColor hover:text-indigo-500"
                  >
                    Forgot password?
                  </Link>
                </div> */}
              </div>

              <button
                type="submit"
                className="flex w-full justify-center items-center rounded-md bg-purple-600 hover:bg-purple-700  px-3 py-1.5 text-sm font-bold leading-6 text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {spinner && <Loader2 className="animate-spin h-4 mt-0.5" />}
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
