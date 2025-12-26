import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [alert, setAlert] = useState("");
  const [page, setPage] = useState("home"); // home, users, accounts, transactions

  /** ------------------- USER MODULE ------------------- **/
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "USER" });

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/users");
      setUsers(res.data);
    } catch (err) {
      showAlert("Error fetching users");
      console.error(err);
    }
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      showAlert("Please fill all fields");
      return;
    }
    try {
      const res = await axios.post("http://localhost:8080/api/users", newUser);
      setUsers([...users, res.data]);
      setNewUser({ name: "", email: "", password: "", role: "USER" });
      showAlert("User added successfully!");
    } catch (err) {
      showAlert("Error adding user");
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/users/${id}`);
      setUsers(users.filter((u) => u.id !== id));
      showAlert("User deleted successfully!");
    } catch (err) {
      showAlert("Error deleting user");
      console.error(err);
    }
  };

  const updateUser = async (id) => {
    try {
      const updatedName = prompt("Enter new name:");
      const updatedEmail = prompt("Enter new email:");
      const updatedPassword = prompt("Enter new password:");
      const updatedRole = prompt("Enter role (USER/ADMIN):");
      const res = await axios.put(`http://localhost:8080/api/users/${id}`, {
        name: updatedName,
        email: updatedEmail,
        password: updatedPassword,
        role: updatedRole,
      });
      setUsers(users.map((u) => (u.id === id ? res.data : u)));
      showAlert("User updated successfully!");
    } catch (err) {
      showAlert("Error updating user");
      console.error(err);
    }
  };

  useEffect(() => {
    if (page === "users") fetchUsers();
  }, [page]);

  /** ------------------- ACCOUNT MODULE ------------------- **/
  const [accounts, setAccounts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newAccount, setNewAccount] = useState({ accountNumber: "", accountType: "SAVINGS", balance: 0 });

  const fetchAccounts = async (userId) => {
    const id = Number(userId);
    if (!id) return showAlert("Enter valid User ID");
    try {
      const res = await axios.get(`http://localhost:8080/api/accounts/user/${id}`);
      setAccounts(res.data);
    } catch (err) {
      showAlert("Error fetching accounts");
      console.error(err);
    }
  };

  const addAccount = async () => {
    const userId = Number(selectedUserId);
    if (!userId || !newAccount.accountNumber) {
      showAlert("Enter valid User ID and Account details");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:8080/api/accounts/user/${userId}`, newAccount);
      setAccounts([...accounts, res.data]);
      setNewAccount({ accountNumber: "", accountType: "SAVINGS", balance: 0 });
      showAlert("Account created successfully!");
    } catch (err) {
      showAlert("Error creating account");
      console.error(err);
    }
  };

  /** ------------------- TRANSACTION MODULE ------------------- **/
  const [transactions, setTransactions] = useState([]);
  const [transAccountId, setTransAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [totalBalance, setTotalBalance] = useState(null); // <-- NEW STATE
const fetchTransactions = async (accountId) => {
  const id = Number(accountId);
  if (!id) return showAlert("Enter valid Account ID");

  try {
    const res = await axios.get(`http://localhost:8080/api/accounts/${id}/transactions`);
    setTransactions(res.data);

    // Calculate total balance from transaction history
    const total = res.data.reduce((acc, t) => {
      if (t.type.toLowerCase() === "deposit") return acc + t.amount;
      if (t.type.toLowerCase() === "withdraw") return acc - t.amount;
      return acc;
    }, 0);

    setTotalBalance(total);

  } catch (err) {
    showAlert("Error fetching transactions");
    console.error(err);
  }
};


  const deposit = async () => {
    const id = Number(transAccountId);
    const amt = Number(amount);
    if (!id || !amt) return showAlert("Enter valid Account ID and Amount");
    try {
      await axios.post(`http://localhost:8080/api/accounts/${id}/deposit?amount=${amt}`);
      showAlert("Deposit successful!");
      setAmount("");
      fetchTransactions(id);
    } catch (err) {
      showAlert(err.response?.data?.message || "Error depositing money");
      console.error(err);
    }
  };

  const withdraw = async () => {
    const id = Number(transAccountId);
    const amt = Number(amount);
    if (!id || !amt) return showAlert("Enter valid Account ID and Amount");
    try {
      await axios.post(`http://localhost:8080/api/accounts/${id}/withdraw?amount=${amt}`);
      showAlert("Withdrawal successful!");
      setAmount("");
      fetchTransactions(id);
    } catch (err) {
      showAlert(err.response?.data?.message || "Error withdrawing money");
      console.error(err);
    }
  };

  /** ------------------- ALERT ------------------- **/
  const showAlert = (msg) => {
    setAlert(msg);
    setTimeout(() => setAlert(""), 3000);
  };

  return (
    <div className="app">
      {/* Particle Background */}
      <ul className="particles">
        {Array.from({ length: 150 }).map((_, i) => (
          <li
            key={i}
            style={{
              "--i": i / 150,
              "--tx": Math.random(),
              "--ty": Math.random(),
            }}
          ></li>
        ))}
      </ul>

      {/* Navbar */}
      <nav className="navbar">
        <h2>NeoBank</h2>
        <div>
          <button className="nav-btn" onClick={() => setPage("home")}>Home</button>
          <button className="nav-btn" onClick={() => setPage("users")}>Users</button>
          <button className="nav-btn" onClick={() => setPage("accounts")}>Accounts</button>
          <button className="nav-btn" onClick={() => setPage("transactions")}>Transactions</button>
        </div>
      </nav>

      {/* Home Page */}
      {page === "home" && (
        <div className="hero">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135679.png"
            alt="Bank User"
            className="hero-img"
          />
          <h1>Smart Bank Management System</h1>
          <p>Secure • Modern • Intelligent Banking Platform</p>
          <div className="hero-buttons">
            <button className="btn" onClick={() => { setPage("users"); showAlert("Redirecting to User Module"); }}>User Module</button>
            <button className="btn" onClick={() => { setPage("accounts"); showAlert("Redirecting to Account Module"); }}>Account Module</button>
            <button className="btn" onClick={() => { setPage("transactions"); showAlert("Redirecting to Transaction Module"); }}>Transaction Module</button>
          </div>
        </div>
      )}

      {/* User Module */}
      {page === "users" && (
        <div className="hero">
          <h1>User Module</h1>
          <div className="hero-buttons" style={{ flexDirection: "column", gap: "15px" }}>
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="btn"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="btn"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="btn"
            />
            <button className="btn" onClick={addUser}>Add User</button>
          </div>
          <h2 style={{ marginTop: "30px" }}>All Users</h2>
          <div className="hero-buttons" style={{ flexDirection: "column", gap: "10px" }}>
            {users.map((user) => (
              <div key={user.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "350px", margin: "5px auto", padding: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "10px" }}>
                <span>ID: {user.id} | {user.name} ({user.role})</span>
                <div>
                  <button className="btn" onClick={() => updateUser(user.id)}>Edit</button>
                  <button className="btn" onClick={() => deleteUser(user.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Module */}
      {page === "accounts" && (
        <div className="hero">
          <h1>Account Module</h1>
          <div className="hero-buttons" style={{ flexDirection: "column", gap: "15px" }}>
            <input
              type="text"
              placeholder="User ID"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="btn"
            />
            <input
              type="text"
              placeholder="Account Number"
              value={newAccount.accountNumber}
              onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
              className="btn"
            />
            <select
              value={newAccount.accountType}
              onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value })}
              className="btn"
            >
              <option value="SAVINGS">SAVINGS</option>
              <option value="CURRENT">CURRENT</option>
            </select>
            <button className="btn" onClick={addAccount}>Add Account</button>
            <button className="btn" onClick={() => fetchAccounts(selectedUserId)}>Load Accounts</button>
          </div>

          <div className="hero-buttons" style={{ flexDirection: "column", gap: "10px", marginTop: "20px" }}>
            {accounts.map((acc) => (
              <div key={acc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "400px", margin: "5px auto", padding: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "10px" }}>
                <span>User ID: {selectedUserId} | Acc: {acc.accountNumber} | Type: {acc.accountType} </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Module */}
      {page === "transactions" && (
        <div className="hero">
          <h1>Transaction Module</h1>

          <div className="hero-buttons" style={{ flexDirection: "column", gap: "15px" }}>
            <input
              type="number"
              placeholder="Account ID"
              value={transAccountId}
              onChange={(e) => setTransAccountId(e.target.value)}
              className="btn"
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="btn"
            />
            <button className="btn" onClick={deposit}>Deposit</button>
            <button className="btn" onClick={withdraw}>Withdraw</button>
            <button className="btn" onClick={() => fetchTransactions(transAccountId)}>Load Transactions</button>
          </div>

          <div className="hero-buttons" style={{ flexDirection: "column", gap: "10px", marginTop: "20px" }}>
            {/* Transactions list */}
            {transactions.map((t, index) => (
              <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "400px", margin: "5px auto", padding: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "10px" }}>
                <span>{t.type}: {t.amount}</span>
              </div>
            ))}

            {/* Total Balance at end */}
            {totalBalance !== null && (
              <div style={{ width: "400px", margin: "10px auto", padding: "10px", background: "rgba(255,255,255,0.15)", borderRadius: "10px", textAlign: "center", fontWeight: "bold" }}>
                Total Balance: {totalBalance}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alert */}
      {alert && <div className="alert">{alert}</div>}
    </div>
  );
}

export default App;
