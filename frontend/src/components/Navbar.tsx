import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          ⚙️ OHE Maintenance
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/activities">
                Activities
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/input">
                Input OHE
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/worktime">
                Work Time
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reports">
                Reports
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav">
            {user && (
              <>
                <li className="nav-item">
                  <span className="nav-link">
                    👤 {user.name} ({user.role})
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
