import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/api";
import "./Admin.css";

const emptyForm = { name: "", email: "", password: "", role: "user" };

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const loadUsers = async (nextPage = page, nextSearch = search, nextRole = roleFilter) => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(nextPage), limit: String(limit) });
      if (nextSearch) params.set("search", nextSearch);
      if (nextRole !== "all") params.set("role", nextRole);
      const response = await apiRequest(`/api/admin/users?${params.toString()}`);
      const payload = response.data || response;
      setUsers(payload.users || []);
      setPagination(payload.pagination || { page: nextPage, limit, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Unable to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(page, search, roleFilter);
  }, [page, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadUsers(1, search, roleFilter);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const totalUsers = useMemo(() => users.length, [users]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      setShowForm(false);
      await loadUsers(1, search, roleFilter);
    } catch (err) {
      setError(err.message || "Unable to create user");
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await apiRequest(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      await loadUsers(page, search, roleFilter);
    } catch (err) {
      setError(err.message || "Unable to update user role");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    try {
      await apiRequest(`/api/admin/users/${userId}`, { method: "DELETE" });
      await loadUsers(page, search, roleFilter);
    } catch (err) {
      setError(err.message || "Unable to delete user");
    }
  };

  return (
    <section className="admin-page">
      <header className="admin-header">
        <div>
          <span className="section-label">ADMIN / USERS</span>
          <h1>User management</h1>
        </div>
        <button className="admin-primary-button" type="button" onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Close" : "Create user"}
        </button>
      </header>

      {error && <div className="admin-alert" role="alert">{error}</div>}

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              Password
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>
          </div>
          <button className="admin-primary-button" type="submit">Save user</button>
        </form>
      )}

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
          <option value="all">All roles</option>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </div>

      {loading ? (
        <p>Loading users…</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Vehicles</th>
                <th>Sessions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-pill ${user.role === "admin" ? "status-admin" : "status-user"}`}>{user.role}</span>
                    <div style={{ marginTop: "8px" }}>
                      <select value={user.role} onChange={(event) => handleRoleChange(user.id, event.target.value)}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </div>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>{user.vehicle_count}</td>
                  <td>{user.session_count}</td>
                  <td>
                    <button className="text-button" type="button" onClick={() => handleDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="admin-pagination">
        <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
        <span>Page {pagination.page} / {pagination.totalPages}</span>
        <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
      </div>
      <p className="admin-summary">{totalUsers} users shown</p>
    </section>
  );
}

export default AdminUsers;
