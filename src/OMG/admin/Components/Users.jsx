import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { db } from "../../db/Firebase"; // Import Firestore instance
import "./Users.css"; // Plain CSS for styling

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10; // Pagination limit

  const auth = getAuth(); // Initialize Firebase Auth

  // Fetch users from Firestore & Authentication
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users from Firestore
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        let userList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          firstName: doc.data().firstName || "NA",
          lastName: doc.data().lastName || "",
          provider: doc.data().provider || "Unknown", // Placeholder until fetched from Auth
        }));

        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteDoc(doc(db, "users", id));
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  // Update user role
  const handleRoleChange = async (id, newRole) => {
    if (window.confirm(`Change this user's role to ${newRole}?`)) {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { role: newRole });

      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, role: newRole } : user
        )
      );
    }
  };

  // Filter users based on provider
  const filteredUsers = users.filter((user) => {
    if (filter !== "all" && user.provider !== filter) return false;

    const searchLower = searchQuery.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phoneNumber?.includes(searchLower)
    );
  });

  // Sort users
  const sortedUsers = filteredUsers.sort((a, b) => {
    return sortOrder === "newest"
      ? b.createdAt?.toDate() - a.createdAt?.toDate()
      : a.createdAt?.toDate() - b.createdAt?.toDate();
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="users-container">
      <h1>User Management</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="all">All Users</option>
          <option value="google.com">Google Users</option>
          <option value="password">Email Users</option>
          <option value="phone">Phone Users</option>
        </select>

        <select
          onChange={(e) => setSortOrder(e.target.value)}
          value={sortOrder}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Users Table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Created At</th>
            <th>Last Login</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length > 0 ? (
            currentUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.email || "N/A"}</td>
                <td>{user.phoneNumber || "N/A"}</td>
                <td>{user.createdAt?.toDate().toLocaleString()}</td>
                <td>{user.lastLogin?.toDate().toLocaleString() || "N/A"}</td>
                <td>
                  {user.role || "Customer"}
                  <br />
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>

                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        {Array.from(
          { length: Math.ceil(filteredUsers.length / usersPerPage) },
          (_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default Users;
