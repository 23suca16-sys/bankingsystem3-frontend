import React, { useState, useEffect } from "react";
import apiService from "../apiService";
import "./UserModule.css"; // we will create this CSS file

function UserModule() {
  const [users, setUsers] = useState([]);
  const [alert, setAlert] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "USER" });

  // Show alert for 3 seconds
  const showAlert = (msg) => {
    setAlert(msg);
    setTimeout(() => setAlert(""), 3000);
  };

  // Fetch all users
  const fetchUsers = async () => {
    const { data, error, notice } = await apiService.getUsers();
    if (notice) showAlert(notice);
    if (error) showAlert(error);

    setUsers(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create user
  const handleCreate = async () => {
    const { error, notice } = await apiService.createUser(form);
    if (notice) showAlert(notice);

    if (error) {
      showAlert(error);
      return;
    }

    showAlert("User Created Successfully!");
    setForm({ name: "", email: "", password: "", role: "USER" });
    fetchUsers();
  };

  return (
    <div className="user-module">
      {/* Alert */}
      {alert && <div className="alert">{alert}</div>}

      {/* User Form */}
      <div className="user-form">
        <h2>Create New User</h2>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button onClick={handleCreate} className="btn">Create User</button>
      </div>

      {/* Users List */}
      <div className="users-list">
        <h2>All Users</h2>
        <div className="users-grid">
          {users.length === 0 && <p>No data available</p>}
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserModule;
