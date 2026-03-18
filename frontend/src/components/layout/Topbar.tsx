import './Topbar.css';

export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-search">
        {/* Mock Search Bar for prototype */}
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Pesquisar..." className="search-input" />
      </div>

      <div className="topbar-actions">
        {/* Notifications Mock */}
        <button className="icon-btn">
          <span className="icon">🔔</span>
          <span className="badge">3</span>
        </button>
        
        {/* User Profile Mock */}
        <div className="user-profile">
          <div className="avatar">A</div>
          <div className="user-info">
            <span className="user-name">Administrador</span>
            <span className="user-role">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
