import { Fragment, useContext, useEffect, useState } from "react";
import { Dialog, Disclosure, Menu, Transition } from "@headlessui/react";
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
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";

import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../BaseUrl";
import appLogoImage from "../assets/khealth-logo.png";
import { ModalWrapperComponent } from "../Components/ModalWrapperComponent";
import { useFormik } from "formik";
import { formSchema } from "../FormikSchemas/Schemas";
import { Check, ChevronUp, Eye, EyeOff, X } from "lucide-react";
import Context from "../Contex/Context";
import toast from "react-hot-toast";
import DialogueCloseButtonIcon from "../Components/DialogueCloseButtonIcon";
import Sidebar from "../Components/Sidebar";
// import io from "socket.io-client";
import {
  CircularProgress,
  DialogContent,
  DialogTitle,
  Dialog as MuiDialog,
} from "@mui/material";
export const hexValueArray = [
  { type: "image", color: "#FE9526" },
  { type: "carousal", color: "#1C485F" },
  { type: "text", color: "#3A974A" },
  { type: "video", color: "#FF3434" },
];
const userNavigation = [
  { name: "Your profile", href: "#" },
  { name: "Sign out", href: "#" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
// var socket = io.connect(`${BaseUrl.baseurl}`, {
//   transports: ["websocket"],
// });
export const CommonPage = () => {
  const [userInformation, setuserInformation] = useState("");
  const userDetails = JSON.parse(
    localStorage.getItem("LiveStreamAdminDetails"),
  );
  const location = useLocation();
  const {
    setAllProjects,
    setSelectedProject,
    setAnalyticPostsPageData,
    analyticPagesPageData,
    setAnalyticPagesPageData,
    setAnalyticContentPageData,
    setHomePageDataContext2,
    setHomePageDataContext,
    setHomePageGraphDataContext,
    setEngageMentPageData,
    setUserSubscription,
    selectedProject,
    allProjects,
    setSelectedPageId,
    setSelectedEngagementId,
  } = useContext(Context);
  const loaction = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reloadPage, setReloadPage] = useState(false);
  const [openProfileSideBar, setOpenProfileSideBar] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [editName, setEditName] = useState(false);
  const [changeEmail, setChangeEmail] = useState(false);

  const handleChangePassword = (values, actions) => {
    let userData = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    };
    axios
      .post(
        `${BaseUrl.baseurl}/user/update-user-password/${
          userDetails && userDetails.details._id
        }`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${userDetails && userDetails.token}`,
          },
        },
      )
      .then((response) => {
        if (response.data.status) {
          userDetails.token = response.data.token;
          localStorage.setItem(
            "LiveStreamAdminDetails",
            JSON.stringify(userDetails),
          );
          actions.resetForm();
          setOpenChangePasswordModal(false);

          toast.success(response.data.message);
        } else {
          // setWrongCurrentPassword(response.data.message);

          toast.error(response.data.message);
          if (response.data.tokenExpire) {
            localStorage.removeItem("MailSenderuserDetails");
            window.location.reload();
          }
        }
      })
      .catch((err) => console.log("Error"));
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    dirty,
    isValid,
  } = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: formSchema,
    onSubmit: handleChangePassword,
  });
  function getUserDetails() {
    axios
      .get(
        `${BaseUrl.baseurl}/user/get-user-info-by-id/${
          userDetails && userDetails.details._id
        }`,
        {
          headers: {
            Authorization: `Bearer ${userDetails && userDetails.token}`,
          },
        },
      )
      .then((res) => {
        if (res.data.status) {
          setuserInformation(res.data);
          setUserName(res.data?.details?.FirstName);
          setUserEmail(res.data?.details?.Email);
          res.data.details.Projects.map((val) => {
            if (val.ProjectTabStatus) {
              setSelectedProject(val);
              if (val.Accounts.length !== 0) {
                val.Accounts.some((acc, i) => {
                  if (
                    acc.ServiceName === "Facebook" ||
                    acc.ServiceName === "Instagram" ||
                    acc.ServiceName === "Threads"
                  ) {
                    setSelectedPageId(acc._id);
                    setSelectedEngagementId(acc._id);
                    return true;
                  }
                  return false;
                });
              } else {
                setSelectedPageId("");
                setSelectedEngagementId("");
              }
              if (selectedProject._id !== undefined) {
                getAllAnalyticsPage(val);
              }
            }
          });
          // setSelectedProject(res.data.details.Projects[0]);
        } else {
          if (res.data.tokenExpire) {
            localStorage.removeItem("LiveStreamAdminDetails");
            window.location.reload();
          }
        }
      })
      .catch((err) => console.log("Error", err));
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  function getAllAnalyticsPage(selectedProject) {
    console.log("called common page page");
    axios
      .get(
        `${BaseUrl.baseurl}/post/get-pages-analytics/${
          selectedProject && selectedProject._id
        }/${userDetails && userDetails.details._id}`,
      )
      .then((res) => {
        if (res.data.status) {
          setAnalyticPagesPageData({
            data: res.data,
            isFetching: false,
            error: false,
            interNetLost: false,
          });
        } else {
          setAnalyticPagesPageData({
            data: {},
            isFetching: false,
            error: true,
            interNetLost: false,
          });
          toast.error(res.data.message);
        }
      })
      .catch((err) => {
        toast.error(err);
        setAnalyticPagesPageData({
          data: {},
          isFetching: false,
          error: false,
          interNetLost: true,
        });
      });
  }

  function changeProjectStatus(proId) {
    let data = {};
    axios
      .put(
        `${BaseUrl.baseurl}/project/change-project-tab-status/${
          userDetails && userDetails.details._id
        }/${proId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${userDetails && userDetails.token}`,
          },
        },
      )
      .then((res) => {
        if (res.data.status) {
          toast.success(res.data.message);
        } else {
          toast.error(res.data.message);
          if (res.data.tokenExpire) {
            localStorage.removeItem("LiveStreamAdminDetails");
            window.location.reload();
          }
        }
      })
      .catch((err) => console.log("Error", err));
  }
  const handleChangeProject = (project) => {
    if (project._id !== selectedProject._id) {
      changeProjectStatus(project._id);
      setAnalyticPostsPageData({
        data: {},
        isFetching: true,
        error: false,
        interNetLost: false,
      });
      setAnalyticPagesPageData({
        data: {},
        isFetching: true,
        error: false,
        interNetLost: false,
      });
      setAnalyticContentPageData({
        data: {},
        isFetching: true,
        error: false,
        interNetLost: false,
      });
      setHomePageDataContext2({
        data: {},
        isFetching: true,
        error: false,
        interNetLost: false,
      });
      setHomePageDataContext({
        data: {},
        isFetching: true,
        error: false,
        interNetLost: false,
      });
      setHomePageGraphDataContext({
        data: {},
        isFetching: true,
        error: false,
        interNetLost: false,
      });
      setEngageMentPageData({
        data: {},
        isFetching: true,
        error: false,
        interNetLost: false,
      });
      // getAllAnalytics(project);

      getAllAnalyticsPage(project);
      // getAllAnalyticsContent(project);
      // getAllAnalyticsTotal(project);
      setSelectedProject(project);
      if (project.Accounts.length !== 0) {
        project.Accounts.some((acc, i) => {
          if (
            acc.ServiceName === "Facebook" ||
            acc.ServiceName === "Instagram" ||
            acc.ServiceName === "Threads"
          ) {
            setSelectedPageId(acc._id);
            setSelectedEngagementId(acc._id);
            return true;
          }
          return false;
        });
      } else {
        setSelectedPageId("");
        setSelectedEngagementId("");
      }

      // setFetchingData(true);
      setReloadPage(true);
    }
  };

  function getAdminData() {
    axios
      .get(`${BaseUrl.baseurl}/admin/get-staff/${userDetails.data._id}`, {
        headers: {
          Authorization: `Bearer ${userDetails && userDetails.token}`,
        },
      })
      .then((res) => {
        if (res.data.status) {
          console.log(
            "Before API:",
            JSON.parse(localStorage.getItem("LiveStreamAdminDetails"))
          );
          const updatedDetails = {
            ...userDetails,
            data: res.data.data || res.data.details || userDetails?.data,
            details: res.data.details || userDetails?.details,
            status: res.data.status,
            token: userDetails?.token,
          };
          localStorage.setItem(
            "LiveStreamAdminDetails",
            JSON.stringify(updatedDetails)
          );
          console.log(
            "After Save:",
            JSON.parse(localStorage.getItem("LiveStreamAdminDetails"))
          );
        } else {
          localStorage.removeItem("LiveStreamAdminDetails");
          window.location.reload();
        }
      })
      .catch((err) => {
        localStorage.removeItem("LiveStreamAdminDetails");
        window.location.reload();
      });
  }
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
      name: "Coin Seller",
      route: "Coin-Seller",
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
  useEffect(() => {
    if (location.pathname === "/") {
      if (userDetails?.data?.role?.permissions.includes("Dashboard")) {
        navigate("/");
      } else {
        routesData.map((val) => {
          if (userDetails?.data?.role?.permissions[0] === val.name) {
            navigate(`/${val.route}`);
          }
        });
      }
    }
    getAdminData();
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuBar = () => {
    return (
      <Menu as="div" className="relative block text-left">
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-1 w-full origin-top-right rounded-md bg-white ring-1 ring-black ring-opacity-5 focus:outline-none max-h-40 overflow-y-auto menu-bar">
            <div className="py-0">
              {allProjects?.details?.map((item, idx) => {
                if (
                  userInformation.details?.Projects?.some(
                    (user) => user._id === item._id,
                  ) &&
                  item.ProjectActiveStatus
                ) {
                  // console.log("jabba")
                } else {
                  return null;
                }
                return (
                  <Menu.Item key={idx}>
                    {({ active }) => (
                      <span
                        onClick={() => {
                          handleChangeProject(item);
                        }}
                        className={`block px-4 py-3 text-quarternarySize font-bold tracking-wide cursor-pointer ${
                          idx < allProjects?.details?.length - 1
                            ? "border-b border-borderColor"
                            : "none"
                        } text-primary hover:bg-subPrimary`}
                      >
                        {item.ProjectName}
                      </span>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    );
  };
  function changeuserNamebyid() {
    let userData = {
      firstName: userName,
    };
    axios
      .put(
        `${BaseUrl.baseurl}/user/update-user-name-by-id/${
          userDetails && userDetails.details._id
        }`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${userDetails && userDetails.token}`,
          },
        },
      )
      .then((res) => {
        if (res.data.status) {
          getUserDetails();
          setEditName(false);
          toast.success(res.data.message);
        } else {
          toast.error(res.data.message);
          if (res.data.tokenExpire) {
            localStorage.removeItem("LiveStreamAdminDetails");
            window.location.reload();
          }
        }
      })
      .catch((err) => console.log("Error", err));
  }
  const userProfileInformationUi = () => {
    return (
      <Transition.Root show={openProfileSideBar} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[60]"
          onClose={() => {
            if (openChangePasswordModal === false) {
              setOpenProfileSideBar(false);
            } else {
              setOpenProfileSideBar(true);
            }
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-xl">
                    <div className="flex h-full flex-col bg-white pt-4 shadow-xl">
                      <div className="px-4 sm:px-6 pb-4 border-b border-borderColor">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Profile Information
                          </Dialog.Title>
                          <button
                            type="button"
                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={() => setOpenProfileSideBar(false)}
                          >
                            <DialogueCloseButtonIcon />
                          </button>
                        </div>
                      </div>
                      <div className="relative flex-1 overflow-auto px-4 sm:px-0">
                        <div className="grid grid-cols-12 gap-2 py-4">
                          <div className="col-span-12 sm:col-span-4 sm:flex sm:flex-col sm:gap-2 sm:items-center">
                            <div>
                              <span className=" inline-flex h-36 w-36 items-center justify-center rounded-full bg-subPrimary">
                                <span className="text-bigSize leading-none font-bold text-primary">
                                  {userDetails?.data.name
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2 py-2 col-span-12 sm:col-span-8 rounded-md sm:pr-4">
                            <p className="text-primary font-semibold text-tertiarySize">
                              General Information
                            </p>
                            <div>
                              <label
                                htmlFor="name"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Name
                              </label>
                              <div className="mt-1 flex items-center gap-2">
                                <input
                                  readOnly
                                  value={userDetails.data.name}
                                  type="name"
                                  name="name"
                                  id="name"
                                  className="block w-full rounded-md border border-borderColor bg-btnBgColor py-2 text-gray-900 placeholder:text-gray-400  sm:text-sm sm:leading-6"
                                  placeholder="enter name"
                                  style={{ outline: "none" }}
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor="email"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Email
                              </label>
                              <div className="mt-1 flex items-center gap-2">
                                <input
                                  readOnly
                                  value={userDetails.data.email}
                                  type="name"
                                  name="name"
                                  id="name"
                                  className="block w-full rounded-md border border-borderColor bg-btnBgColor py-2 text-gray-900 placeholder:text-gray-400  sm:text-sm sm:leading-6"
                                  placeholder="you@example.com"
                                  style={{ outline: "none" }}
                                />
                              </div>
                            </div>
                            {/* <p
                              className="text-primary font-semibold text-tertiarySize cursor-pointer"
                              onClick={() => setOpenChangePasswordModal(true)}
                            >
                              Change Password
                            </p> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    );
  };

  const hasUpperCase = /[A-Z]/.test(values.newPassword);
  const hasLowerCase = /[a-z]/.test(values.newPassword);
  const hasNumber = /\d/.test(values.newPassword);
  // eslint-disable-next-line no-useless-escape
  const specialCharacterRegex = /[!@#\$%\^&\*]/;
  const containsSpecialCharacter = specialCharacterRegex.test(
    values.newPassword,
  );
  const initialSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M7.99935 1.33366C4.33268 1.33366 1.33268 4.33366 1.33268 8.00033C1.33268 11.667 4.33268 14.667 7.99935 14.667C11.666 14.667 14.666 11.667 14.666 8.00033C14.666 4.33366 11.666 1.33366 7.99935 1.33366Z"
        stroke="#868686"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10.667V7.33366"
        stroke="#868686"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00391 5.33301H7.99792"
        stroke="#868686"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const activeSvg = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.99935 1.33366C4.33268 1.33366 1.33268 4.33366 1.33268 8.00033C1.33268 11.667 4.33268 14.667 7.99935 14.667C11.666 14.667 14.666 11.667 14.666 8.00033C14.666 4.33366 11.666 1.33366 7.99935 1.33366Z"
        stroke="#4BC25F"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 8L6.5 10.5L11.5 6"
        stroke="#4BC25F"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const errorSvg = (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.49996 1.33317C4.83329 1.33317 1.83329 4.33317 1.83329 7.99984C1.83329 11.6665 4.83329 14.6665 8.49996 14.6665C12.1666 14.6665 15.1666 11.6665 15.1666 7.99984C15.1666 4.33317 12.1666 1.33317 8.49996 1.33317Z"
        stroke="#FF3434"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 10.7321L8.4641 7.86603L11.4282 5"
        stroke="#FF3434"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.76795 5L8.63397 7.9641L11.5 10.9282"
        stroke="#FF3434"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const changePasswordModalUI = () => {
    return (
      <MuiDialog
        open={openChangePasswordModal}
        maxWidth="xs"
        fullWidth={true}
        onClose={() => setOpenChangePasswordModal(false)}
      >
        <DialogTitle>
          <p className="text-modalTitleColor font-bold text-primarySize font-primaryFamily">
            Change Password
          </p>
        </DialogTitle>
        <DialogContent dividers={true}>
          <div className="flex flex-col gap-6">
            <div className="space-y-2 py-2 col-span-12 sm:col-span-8 rounded-md">
              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Current Password
                  </label>
                  <div className="mt-0.5">
                    <input
                      onBlur={handleBlur}
                      placeholder="Enter your current password"
                      type={`${showCurrentPassword ? "text" : "password"}`}
                      onChange={handleChange}
                      value={values.currentPassword}
                      id="currentPassword"
                      className={`block w-full rounded-md ${
                        errors.currentPassword && touched.currentPassword
                          ? "border-red-600 bg-red-100"
                          : "border-borderColor bg-btnBgColor"
                      }  py-2 text-gray-900 placeholder:text-primary  sm:text-sm sm:leading-6`}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    New Password
                  </label>
                  <div className="relative mt-0.5 mb-1 rounded-md shadow-sm">
                    <input
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your new password"
                      type={`${showNewPassword ? "text" : "password"}`}
                      id="newPassword"
                      value={values.newPassword}
                      className={`block w-full rounded-md ${
                        errors.newPassword && touched.newPassword
                          ? "border-red-600 bg-red-100"
                          : "border-borderColor bg-btnBgColor"
                      }  py-2 text-gray-900 placeholder:text-primary  sm:text-sm sm:leading-6`}
                    />
                    <button
                      onClick={() => {
                        setShowNewPassword(!showNewPassword);
                      }}
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showNewPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  <span className="flex items-center gap-3 text-smallSize font-normal">
                    {values.newPassword.length >= 8 &&
                    hasUpperCase &&
                    hasLowerCase
                      ? activeSvg
                      : values.newPassword.length === 0
                        ? initialSvg
                        : errorSvg}
                    Include both lower and upper case characters , at least 8
                    characters
                  </span>
                  <span className="flex items-center gap-3 text-smallSize font-normal">
                    {hasNumber && (hasUpperCase || hasLowerCase)
                      ? activeSvg
                      : values.newPassword.length === 0
                        ? initialSvg
                        : errorSvg}
                    Contains a number & Contains a letter
                  </span>
                  <span className="flex items-center gap-3 text-smallSize font-normal">
                    {containsSpecialCharacter
                      ? activeSvg
                      : values.newPassword.length === 0
                        ? initialSvg
                        : errorSvg}
                    {`Contains a special character !,@,#,$,%,^,&,*`}
                  </span>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Confirm new Password
                  </label>
                  <div className="relative mt-0.5 rounded-md shadow-sm">
                    <input
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your confirm password"
                      type={`${showConfirmPassword ? "text" : "password"}`}
                      id="confirmPassword"
                      value={values.confirmPassword}
                      className={`block w-full rounded-md ${
                        errors.confirmPassword && touched.confirmPassword
                          ? "border-red-600 bg-red-100"
                          : "border-borderColor bg-btnBgColor"
                      }  py-2 text-gray-900 placeholder:text-primary  sm:text-sm sm:leading-6`}
                    />
                    <button
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end pt-2">
                  <button
                    onClick={() => {
                      setOpenChangePasswordModal(false);
                      handleReset();
                    }}
                    type="button"
                    className="bg-subPrimary py-2 px-4 rounded-md text-primary text-mediumSize"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary py-2 px-6 rounded-md text-white text-mediumSize"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </MuiDialog>
    );
  };

  return (
    <div className="z-50">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 " onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-400/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                {/* className="flex grow flex-col overflow-y-auto bg-[#EEF6FF] pb-4" old side bar color*/}
                <div className="flex grow flex-col overflow-y-auto bg-[linear-gradient(180deg,#121623,#0e1220)] pb-4">
                  <div className="flex mx-4 mt-4  ">
                    {/* <img
                      className="w-full h-[100%]  object-center"
                      src={appLogoImage}
                      alt="Your Company"
                      onClick={() => navigate("/")}
                    /> */}
                    <div className="brand">
                      <div className="logo">❤</div>
                      <h1>
                        Togilo CRM
                        <br />
                        <span className="subtext">
                          Admin : {userDetails.data.name}
                        </span>
                      </h1>
                    </div>
                  </div>
                  <nav className="flex flex-1 flex-col mx-4">
                    <div className="relative mt-2 rounded-md shadow-sm mb-2">
                      {menuBar()}
                    </div>

                    <Sidebar
                      setSidebarOpen={setSidebarOpen}
                      setter={setOpenProfileSideBar}
                    />
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      {/* <div className="hidden lg:fixed lg:inset-y-0 min-h-screen lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className={`flex grow flex-col border-r border-gray-200 `}>
          <div className="flex h-16 items-center bg-white border-b justify-center px-9">
            <img
              className="w-full h-full  object-center"
              src={appLogoImage}
              alt="Your Company"
              onClick={() => navigate("/")}
            />
          </div>
          <nav className="flex flex-1 flex-col px-4 h-full overflow-auto">
            <div className="relative mt-2 rounded-md shadow-sm mb-4">
              {menuBar()}
            </div>
            <Sidebar setter={setOpenProfileSideBar} />
          </nav>
        </div>
      </div> */}

      <div className=" flex flex-col ">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4  border-gray-200 bg-[linear-gradient(180deg,#121623,#0e1220)] px-4 shadow-sm sm:gap-x-6 sm:px-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 "
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6 text-[#e7e9ee]" aria-hidden="true" />
          </button>
          <div className="flex h-16 items-center bg-white border-b justify-center ">
            {/* <img
              className="w-full h-[100%]  object-center"
              src={appLogoImage}
              alt="Your Company"
              onClick={() => navigate("/")}
            /> */}
          </div>
          <div className="text-[#e7e9ee]  font-semibold  leading-[38.87px] items-center justify-center flex w-full sm:font-[18px] lg:text-[27.76px]">
            {console.log("location ", location.pathname.split("/"))}
            {location.pathname === "/"
              ? "Dashboard"
              : location.pathname.split("/").length === 3
                ? location.pathname.split("/")[1].replaceAll("-", " ")
                : location.pathname.split("/").length === 4
                  ? location.pathname.split("/")[1].replaceAll("-", " ")
                  : location.pathname.replaceAll("/", "").replaceAll("-", " ")}
          </div>
          <div className="flex flex-1 gap-x-4 lg:gap-x-6 justify-end">
            <div className="flex items-center gap-x-4 lg:gap-x-6 ">
              {/* <div className="relative flex flex-1 bg-slate-200">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <MagnifyingGlassIcon
                  className="absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">View notifications</span>
                <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
              </button> */}
              {/* <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button> */}
              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <Menu.Button className="-m-1.5 flex items-center p-1.5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <span className="text-lg font-medium leading-none text-white">
                      {userDetails?.data.name[0].toUpperCase()}
                    </span>
                  </span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    {userNavigation.map((item, index) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <p
                            className={classNames(
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900 cursor-pointer",
                            )}
                            onClick={() => {
                              if (index === 1) {
                                localStorage.removeItem(
                                  "LiveStreamAdminDetails",
                                );
                                window.location.reload();
                              } else {
                                setOpenProfileSideBar(true);
                              }
                            }}
                          >
                            {item.name}
                          </p>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <main className="px-4 sm:px-6 py-6  flex-grow bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)]">
          <section>
            {fetchingData ? (
              <div className="flex items-center justify-center py-44">
                <CircularProgress
                  size={45}
                  style={{
                    color: "#1C485F",
                  }}
                />
              </div>
            ) : (
              <Outlet />
            )}
          </section>
        </main>
      </div>
      {openProfileSideBar && userProfileInformationUi()}
      {openChangePasswordModal && changePasswordModalUI()}
    </div>
  );
};
