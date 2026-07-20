import axios from "axios";
import { useEffect, useState } from "react";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
const getStatusColor = (status) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};
function formatDateTime(isoString) {
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const formattedTime = `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;

  return formattedTime;
}

export default function TransactionHistory() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 15;

  const filteredUsers = users;

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  function getData(count, from) {
    axios
      .get(`${BaseUrl.baseurl}/user/get-user-transactions/${id}/${count}`)
      .then((res) => {
        if (res.data.status) {
          if (from === "update") {
            setUsers(res.data.data);
          } else {
            setUsers([...users, ...res.data.data]);
          }
        } else {
          console.log("error no more data");
          toast.error("No more data");
        }
      })
      .catch((err) => {});
  }
  useEffect(() => {
    getData(users.length, "next");
  }, []);

  return (
    <div className=" flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl min-h-screen">
      <div className=" p-4 rounded-xl shadow-md">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <button
            onClick={() => {
              navigate(-1);
            }}
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700"
          >
            Back
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-[#9aa3b2] uppercase bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)]">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Transaction Id
                </th>
                <th scope="col" className="px-6 py-3">
                  Plan Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Plan Price
                </th>
                <th scope="col" className="px-6 py-3">
                  Plan Coins
                </th>
              </tr>
            </thead>
            <tbody className="bg-[radial-gradient(1200px_800px_at_10%_-10%,#1a1f33_0%,#0b0d12_60%)] divide-y divide-slate-200">
              {currentUsers.map((user) => {
                const names = user?.name?.split(" ");
                const firstInitial = names ? names[0][0]?.toUpperCase() : "";
                const lastInitial = names
                  ? names?.length > 1
                    ? names?.slice(-1)[0][0]?.toUpperCase()
                    : ""
                  : "";
                return (
                  <tr key={user._id} className="hover:bg-slate-600">
                    <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                     {user.pricingId.currencyType==="USD"?"$":"₹"} {user.amount}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                      {user.transactionDetails}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                      {user.pricingId.playStoreId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                     {user.pricingId.currencyType==="USD"?"$":"₹"} {user.pricingId.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#e7e9ee]">
                      {user.pricingId.coins}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
       <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-slate-600 space-y-3 sm:space-y-0 overflow-x-auto">
          {/* Showing count */}
          <div className="min-w-fit text-center sm:text-left">
            Showing {indexOfFirstUser + 1} to{" "}
            {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
            {filteredUsers.length} Transactions
          </div>

          {/* Pagination buttons */}
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 text-black">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600  hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`py-2 px-4 rounded-lg border border-slate-300 ${
                  currentPage === number
                    ? "text-sm font-semibold bg-purple-600  hover:bg-purple-700"
                    : "bg-slate-100 hover:bg-slate-200"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600  hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>

            <button
              onClick={() => getData(users.length, "next")}
              className="px-3 py-2 rounded-lg text-sm font-semibold bg-purple-600  hover:bg-purple-700"
            >
              More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
