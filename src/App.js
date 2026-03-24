import React, { useState, useEffect } from "react";
import "./App.css";
import apiService from "./apiService";

function App() {
  const [alert, setAlert] = useState("");
  const [page, setPage] = useState("home"); // home, users, accounts, transactions

  /** ------------------- USER MODULE ------------------- **/
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "USER" });

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      showAlert("Please fill all fields");
      return;
    }
    const { data, error, notice } = await apiService.createUser(newUser);

    if (notice) showAlert(notice);
    if (error) {
      showAlert(error);
      return;
    }

    setUsers([...users, data]);
    setNewUser({ name: "", email: "", password: "", role: "USER" });
    showAlert("User added successfully!");
  };

const deleteUser = async (id) => {
  const deletePassword = prompt("Enter delete password:");
  if (deletePassword !== "2005") {
    showAlert("Invalid password. Delete canceled.");
    return;
  }

  const { error, notice } = await apiService.deleteUser(id);

  if (notice) showAlert(notice);
  if (error) {
    showAlert(error);
    return;
  }

  setUsers(users.filter((u) => u.id !== id));
  showAlert("User deleted successfully!");
};

  const updateUser = async (id) => {
    const updatedName = prompt("Enter new name:");
    const updatedEmail = prompt("Enter new email:");
    const updatedPassword = prompt("Enter new password:");
    const updatedRole = prompt("Enter role (USER/ADMIN):");

    const { data, error, notice } = await apiService.updateUser(id, {
      name: updatedName,
      email: updatedEmail,
      password: updatedPassword,
      role: updatedRole,
    });

    if (notice) showAlert(notice);
    if (error) {
      showAlert(error);
      return;
    }

    setUsers(users.map((u) => (u.id === id ? data : u)));
    showAlert("User updated successfully!");
  };

  useEffect(() => {
    const loadUsers = async () => {
      if (page !== "users") return;

      const { data, error, notice } = await apiService.getUsers();
      if (notice) showAlert(notice);
      if (error) showAlert(error);

      setUsers(Array.isArray(data) ? data : []);
    };

    loadUsers();
  }, [page]);

  /** ------------------- ACCOUNT MODULE ------------------- **/
  const [accounts, setAccounts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newAccount, setNewAccount] = useState({ accountNumber: "", accountType: "SAVINGS", balance: 0 });

  const fetchAccounts = async (userId) => {
    const id = Number(userId);
    if (!id) return showAlert("Enter valid User ID");

    const { data, error, notice } = await apiService.getAccountsByUser(id);
    if (notice) showAlert(notice);
    if (error) showAlert(error);

    setAccounts(Array.isArray(data) ? data : []);
  };

  const addAccount = async () => {
    const userId = Number(selectedUserId);
    if (!userId || !newAccount.accountNumber) {
      showAlert("Enter valid User ID and Account details");
      return;
    }

    const { data, error, notice } = await apiService.createAccountForUser(userId, newAccount);
    if (notice) showAlert(notice);
    if (error) {
      showAlert(error);
      return;
    }

    setAccounts([...accounts, data]);
    setNewAccount({ accountNumber: "", accountType: "SAVINGS", balance: 0 });
    showAlert("Account created successfully!");
  };

  /** ------------------- TRANSACTION MODULE ------------------- **/
  const [transactions, setTransactions] = useState([]);
  const [transAccountId, setTransAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [totalBalance, setTotalBalance] = useState(null); // <-- NEW STATE
const fetchTransactions = async (accountId) => {
  const id = Number(accountId);
  if (!id) return showAlert("Enter valid Account ID");

  const { data, error, notice } = await apiService.getTransactionsByAccount(id);
  if (notice) showAlert(notice);
  if (error) showAlert(error);

  const safeTransactions = Array.isArray(data) ? data : [];
  setTransactions(safeTransactions);

  const total = safeTransactions.reduce((acc, transaction) => {
    const type = String(transaction?.type || "").toLowerCase();
    const transactionAmount = Number(transaction?.amount || 0);

    if (type === "deposit") return acc + transactionAmount;
    if (type === "withdraw") return acc - transactionAmount;
    return acc;
  }, 0);

  setTotalBalance(total);
};


  const deposit = async () => {
    const id = Number(transAccountId);
    const amt = Number(amount);
    if (!id || !amt) return showAlert("Enter valid Account ID and Amount");

    const { error, notice } = await apiService.deposit(id, amt);
    if (notice) showAlert(notice);
    if (error) {
      showAlert(error);
      return;
    }

    showAlert("Deposit successful!");
    setAmount("");
    fetchTransactions(id);
  };

  const withdraw = async () => {
    const id = Number(transAccountId);
    const amt = Number(amount);
    if (!id || !amt) return showAlert("Enter valid Account ID and Amount");

    const { error, notice } = await apiService.withdraw(id, amt);
    if (notice) showAlert(notice);
    if (error) {
      showAlert(error);
      return;
    }

    showAlert("Withdrawal successful!");
    setAmount("");
    fetchTransactions(id);
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
            {users.length === 0 && <div>No data available</div>}
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
            {accounts.length === 0 && <div>No data available</div>}
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
            {transactions.length === 0 && <div>No data available</div>}
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
