import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [user_id, setUserId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ user_id, pin });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card bg-white">
        <h2 className="login-title">OHE Maintenance</h2>
        <p className="text-center text-muted mb-4">Overall Human Efficiency Tracking System</p>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="user_id" className="form-label">
              User ID
            </label>
            <input
              type="text"
              className="form-control"
              id="user_id"
              value={user_id}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your User ID"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="pin" className="form-label">
              PIN
            </label>
            <input
              type="password"
              className="form-control"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter your PIN"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-3 text-center text-muted small">
          <p className="mb-0">Default credentials:</p>
          <p className="mb-0">Admin: ADMIN001 / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
