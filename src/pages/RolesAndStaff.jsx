import axios from "axios";
import { useEffect, useState } from "react";
import { BaseUrl } from "../BaseUrl";
import toast from "react-hot-toast";

export default function RolesAndStaff() {
  const [showAddRole, setShowAddRole] = useState(false);
  const [showEditRole, setShowEditRole] = useState(false);
  const [showDeleteRole, setShowDeleteRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const permissionsList = [
    "Dashboard",
    "User Management",
    "Host Verification",
    "Agency Onboard",
    "Payout & Rewards",
    "Gifts",
    "Rewards",
    "Pricing",
    "Coin Seller",
    "Analytics",
    "Revenue & Monetization",
    "Communication & Support",
    "Notification / Campaigns",
    "FAQ",
    "Role And Staff",
    
  ];

  // Form state for add/edit role
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [rolePermissions, setRolePermissions] = useState([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState("");
  const [phone, setPhone] = useState("");
  const [showEditAdmin, setShowEditAdmin] = useState(false);
  const [showRemoveAdmin, setShowRemoveAdmin] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const openAddAdmin = () => {
    setAdminName("");
    setAdminEmail("");
    setAdminRole("");
    setPhone("");
    setShowAddAdmin(true);
  };
  const openAddRole = () => setShowAddRole(true);
  const openEditRole = (role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setRolePermissions(role.permissions || []);
    setShowEditRole(true);
  };
  const openDeleteRole = (role) => {
    setSelectedRole(role);
    setShowDeleteRole(true);
  };
  const togglePermission = (perm) => {
    if (rolePermissions.includes(perm)) {
      setRolePermissions(rolePermissions.filter((p) => p !== perm));
    } else {
      setRolePermissions([...rolePermissions, perm]);
    }
  };
  function saveRoles() {
    let data = {
      name: roleName,
      permissions: rolePermissions,
      description: roleDescription,
    };
    axios
      .post(`${BaseUrl.baseurl}/admin/create-role`, data)
      .then((response) => {
        if (response.data.status) {
          setShowAddRole(false);
          setRoleName("");
          setRoleDescription("");
          setRolePermissions([]);
          setSelectedRole(null);
          setShowEditRole(false);
          getData();
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }
  function updateRoles() {
    let data = {
      name: roleName,
      permissions: rolePermissions,
    };
    axios
      .put(`${BaseUrl.baseurl}/admin/update-role/${selectedRole._id}`, data)
      .then((response) => {
        if (response.data.status) {
          setShowEditRole(false);
          setRoleName("");
          setRoleDescription("");
          setRolePermissions([]);
          setSelectedRole(null);
          getData();
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }
  function deleteRole() {
    axios
      .delete(`${BaseUrl.baseurl}/admin/delete-role/${selectedRole._id}`)
      .then((response) => {
        if (response.data.status) {
          setShowDeleteRole(false);
          setSelectedRole(null);
          toast.success(response.data.message);
          getData();
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }
  const [data, setData] = useState([]);
  function getData() {
    axios
      .get(`${BaseUrl.baseurl}/admin/get-all-roles`)
      .then((res) => {
        if (res.data.status) {
          setData(res.data.data);
        } else {
          setData([]);
        }
      })
      .catch((err) => {});
  }
  const [adminData, setAdminData] = useState([]);
  function getAdminData() {
    axios
      .get(`${BaseUrl.baseurl}/admin/get-all-staff`)
      .then((res) => {
        if (res.data.status) {
          setAdminData(res.data.data);
        } else {
          setAdminData([]);
        }
      })
      .catch((err) => {});
  }
  useEffect(() => {
    getData();
    getAdminData();
  }, []);
  function createAdmin() {
    let data = {
      name: adminName,
      email: adminEmail,
      role: adminRole,
      phone: phone,
    };
    axios
      .post(`${BaseUrl.baseurl}/admin/create-staff`, data)
      .then((response) => {
        if (response.data.status) {
          setShowAddAdmin(false);
          setAdminName("");
          setAdminEmail("");
          setAdminRole("");
          setPhone("");
          getAdminData();
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }
  const openEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setAdminName(admin.name);
    setAdminEmail(admin.email);
    setAdminRole(admin.role);
    setPhone(admin.phone);
    setShowEditAdmin(true);
  };
  const openRemoveAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowRemoveAdmin(true);
  };
  function updateAdmin() {
    let data = {
      name: adminName,
      email: adminEmail,
      role: adminRole,
      phone: phone,
    };
    axios
      .put(`${BaseUrl.baseurl}/admin/update-staff/${selectedAdmin._id}`, data)
      .then((response) => {
        if (response.data.status) {
          setShowEditAdmin(false);
          setAdminName("");
          setAdminEmail("");
          setAdminRole("");
          setPhone("");
          getAdminData();
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }
  function removeAdmin() {
    axios
      .delete(`${BaseUrl.baseurl}/admin/delete-staff/${selectedAdmin._id}`)
      .then((response) => {
        if (response.data.status) {
          setShowRemoveAdmin(false);
          setSelectedAdmin(null);
          getAdminData();
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }
  return (
    <>
      <div className="p-6 lg:p-8 flex gap-8 flex-col">
        {/* Page header */}
        <div>
          <p className="text-[#9aa3b2]">
            Manage access control for your admin team. Here you can define roles
            and assign specific permissions to each. This ensures that team
            members only have access to the tools and data necessary for their
            jobs, enhancing security and operational efficiency.
          </p>
        </div>

        {/* Manage Roles section */}
        <div className="flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#9aa3b2]">
              Manage Roles
            </h3>
            <button
              onClick={openAddRole}
              className="bg-[#7c3aed] text-black py-2 px-3 rounded-xl hover:bg-[#6d28d9] transition-colors text-sm font-semibold"
            >
              Add New Role
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className=" font-semibold text-[#9aa3b2] uppercase">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                    Role Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                    Description
                  </th>
                  {/* <th className="px-6 py-3">Users</th> */}
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Example static row */}
                {data &&
                  data.map((role, key) => {
                    return (
                      <tr
                        key={key}
                        className="hover:bg-slate-700/20 transition-colors text-[#e7e9ee]"
                      >
                        <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                          {role.name}
                        </td>
                        <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                          {role.description || "No description provided"}
                        </td>
                        {/* <td className="px-3 py-3 border-b border-dashed border-slate-700/50">5</td> */}
                        <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                          <button
                            onClick={() => openEditRole(role)}
                            className="text-purple-500 hover:underline mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteRole(role)}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                {/* Add dynamic rows here */}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Accounts section */}
        <div className="flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#9aa3b2]">
              Admin Accounts
            </h3>
            <button
              onClick={openAddAdmin}
              className="bg-[#7c3aed] text-black py-2 px-3 rounded-xl hover:bg-[#6d28d9] transition-colors text-sm font-semibold"
            >
              Add New Admin
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className=" font-semibold text-[#9aa3b2] uppercase">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                    Admin Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                    Email
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                    Role(s)
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                    Phone Number
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Example static row */}
                {adminData &&
                  adminData.map((admin, key) => {
                    return (
                      <tr
                        key={key}
                        className="hover:bg-slate-700/20 transition-colors text-[#e7e9ee]"
                      >
                        <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                          {admin.name}
                        </td>
                        <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                          {admin.email}
                        </td>
                        <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                          {admin.role?.name}
                        </td>
                        <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                          {admin.phone}
                        </td>
                        <td className="px-3 py-3 border-b border-dashed border-slate-700/50">
                          <button
                            onClick={() => openEditAdmin(admin)}
                            className="text-purple-500 hover:underline mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openRemoveAdmin(admin)}
                            className="text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                {/* Add dynamic rows here */}
              </tbody>
            </table>
          </div>
        </div>
        {showAddRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 w-full max-w-md overflow-y-auto max-h-screen">
              <h3 className="text-xl font-semibold mb-4 text-[#9aa3b2]">
                Add New Role
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#e7e9ee]">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full bg-[#0f1320] text-white border border-[#2d3748] rounded-lg py-2 px-4  focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e7e9ee]">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    className="w-full bg-[#0f1320] text-white border-solid border-[#2d3748] rounded-lg py-2 px-4  focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#e7e9ee]">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {permissionsList.map((perm) => (
                      <label key={perm} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={rolePermissions.includes(perm)}
                          onChange={() => togglePermission(perm)}
                          className="h-4 w-4 text-purple-600"
                        />
                        <span className="text-sm text-[#e7e9ee]">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddRole(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-[#e7e9ee] text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      saveRoles();
                    }}
                    className="px-4 py-2  text-sm rounded-lg bg-purple-500 text-black font-semibold hover:bg-purple-600"
                  >
                    Save Role
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showEditRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 w-full max-w-md overflow-y-auto max-h-screen">
              <h3 className="text-xl font-semibold mb-4 text-[#9aa3b2]">
                Edit Role
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#e7e9ee]">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full bg-[#0f1320] text-white border border-[#2d3748] rounded-lg py-2 px-4  focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                {/* <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  rows="3"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2"
                ></textarea>
              </div> */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#e7e9ee]">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {permissionsList.map((perm) => (
                      <label key={perm} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={rolePermissions.includes(perm)}
                          onChange={() => togglePermission(perm)}
                          className="h-4 w-4 text-purple-600"
                        />
                        <span className="text-sm text-[#e7e9ee]">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowEditRole(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-[#e7e9ee] text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateRoles();
                    }}
                    className="px-4 py-2 rounded-lg bg-purple-500 text-black font-semibold hover:bg-purple-600 text-sm "
                  >
                    Update Role
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-[#9aa3b2]">
                Delete Role
              </h3>
              <p className="mb-6 text-[#e7e9ee]">
                Are you sure you want to delete the role{" "}
                <span className="font-semibold">{selectedRole?.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteRole(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-[#e7e9ee] text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteRole();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm"
                >
                  Delete Role
                </button>
              </div>
            </div>
          </div>
        )}
        {showAddAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Add New Admin</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={adminRole}
                    onChange={(e) => {
                      setAdminRole(e.target.value);
                    }}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Select Role</option>
                    {data &&
                      data.map((role, key) => (
                        <option key={key} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input
                    type="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddAdmin(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      createAdmin();
                    }}
                    className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
                  >
                    Save Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showEditAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Edit Admin</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Select Role</option>
                    {data &&
                      data.map((role, key) => (
                        <option key={key} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Phone</label>
                  <input
                    type="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowEditAdmin(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateAdmin();
                    }}
                    className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
                  >
                    Update Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showRemoveAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Remove Admin</h3>
              <p className="mb-6">
                Are you sure you want to remove admin{" "}
                <span className="font-semibold">{selectedAdmin?.name}</span>?
                This cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowRemoveAdmin(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    removeAdmin();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Remove Admin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
