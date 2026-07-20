import React, {useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navigation } from "../StaticDataFolder";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon } from "lucide-react";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const Sidebar = ({ setter,setSidebarOpen }) => {
  const userDetails = JSON.parse(
    localStorage.getItem("LiveStreamAdminDetails")
  );
  const loaction = useLocation();
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
   
  return (
    <ul role="list" className="flex flex-1 flex-col gap-y-7">
      <li>
        <ul role="list" className="space-y-1">
          {navigation.map((item) => {
            if(!userDetails?.data?.role?.permissions.includes(item.name)){
             return 
            }
            return (
              <li onClick={()=>{setSidebarOpen(false)}} key={item.name} className="cursor-pointer">
                {!item.children ? (
                  <Link to={item.pathValue}>
                    <span
                      className={`${
                        loaction.pathname === item.pathValue
                          ? "active-sibar-item border"
                          : loaction.pathname.slice(0, 10) === "/analytics" &&
                            item.childPaths === true
                          ? "active-sibar-item"
                          : "in-active-sibar-item"
                      }
                          group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-white`}
                    >
                      <label className="text-lg">{loaction.pathname === item.pathValue
                        ? item.activeSvgPath
                        : item.svgPath}</label>
                      {item.name}
                    </span>
                  </Link>
                ) : (
                  <Disclosure as="div">
                    {() => (
                      <>
                        <Disclosure.Button
                          onClick={() => setIsPanelOpen((prev) => !prev)}
                          className={classNames(
                            item.current ? "bg-gray-50" : "hover:bg-subPrimary",
                            "flex justify-between items-center w-full text-left rounded-md p-2 gap-x-3 text-sm leading-6 font-semibold text-gray-700"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {item.svgPath}
                            {item.name}
                          </span>
                          <ChevronUpIcon
                            className={classNames(
                              isPanelOpen
                                ? "rotate-180 text-primary"
                                : "text-gray-400",
                              "h-5 w-5 shrink-0"
                            )}
                            aria-hidden="true"
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel as="ul" className="mt-1 space-y-1">
                          {item.children.map((subItem) => (
                            <li
                              key={subItem.name}
                              className={`${
                                location.pathname === item.pathValue
                                  ? "active-sibar-item"
                                  : "in-active-sibar-item"
                              } rounded-md`}
                            >
                              <Disclosure.Button
                                as={Link}
                                to={subItem.pathValue}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(subItem.pathValue);
                                }}
                                className={classNames(
                                  location.pathname === subItem.pathValue
                                    ? "active-sibar-item text-primary"
                                    : "bg-transparent",
                                  "block rounded-md decoration-primary py-2 pr-2 pl-4 text-sm leading-6 hover:text-primary"
                                )}
                              >
                                {subItem.name}
                              </Disclosure.Button>
                            </li>
                          ))}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                )}
              </li>
            );
          })}
        </ul>
      </li>
      {/* <li className="mt-auto in-active-sibar-item rounded-md mb-1 cursor-pointer">
        <ul>
          <li
            onClick={() => {
              setter(true);
            }}
            className="mt-auto group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M10.1331 9.05841C10.0498 9.05008 9.9498 9.05008 9.85814 9.05841C7.8748 8.99175 6.2998 7.36675 6.2998 5.36675C6.2998 3.32508 7.9498 1.66675 9.9998 1.66675C12.0415 1.66675 13.6998 3.32508 13.6998 5.36675C13.6915 7.36675 12.1165 8.99175 10.1331 9.05841Z"
                stroke="#4C4C61"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.9666 12.1333C3.94993 13.4833 3.94993 15.6833 5.9666 17.0249C8.25827 18.5583 12.0166 18.5583 14.3083 17.0249C16.3249 15.6749 16.3249 13.4749 14.3083 12.1333C12.0249 10.6083 8.2666 10.6083 5.9666 12.1333Z"
                stroke="#4C4C61"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Profile
          </li>
        </ul>
      </li> */}
    </ul>
  );
};

export default Sidebar;
