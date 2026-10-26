import { useState, useEffect } from 'react';

interface Mekanik {
  _id: string;
  nama_mekanik: string;
  machine_code: string;
  machine_name: string;
  target_ohe: number;
  benchmark_ohe: number;
  status: string;
}

const MekanikManagement = () => {
  const [mekaniks, setMekaniks] = useState<Mekanik[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMekanik, setEditingMekanik] = useState<Mekanik | null>(null);
  const [formData, setFormData] = useState({
    nama_mekanik: '',
    machine_code: '',
    machine_name: '',
    target_ohe: 85,
    benchmark_ohe: 90
  });

  useEffect(() => {
    loadMekaniks();
  }, []);

  const loadMekaniks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mekaniks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setMekaniks(data.data || []);
    } catch (error) {
      console.error('Failed to load mekaniks:', error);
      alert('Failed to load mekaniks');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMekanik(null);
    setFormData({
      nama_mekanik: '',
      machine_code: '',
      machine_name: '',
      target_ohe: 85,
      benchmark_ohe: 90
    });
    setShowModal(true);
  };

  const handleEdit = (mekanik: Mekanik) => {
    setEditingMekanik(mekanik);
    setFormData({
      nama_mekanik: mekanik.nama_mekanik,
      machine_code: mekanik.machine_code,
      machine_name: mekanik.machine_name,
      target_ohe: mekanik.target_ohe,
      benchmark_ohe: mekanik.benchmark_ohe
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove mekanik "${name}"? This will deactivate the account.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/mekaniks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();

      if (result.success) {
        alert('Mekanik deactivated successfully');
        loadMekaniks();
      } else {
        alert('Failed to deactivate: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to delete mekanik:', error);
      alert('Failed to deactivate mekanik');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingMekanik ? `/api/mekaniks/${editingMekanik._id}` : '/api/mekaniks';
      const method = editingMekanik ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        alert(editingMekanik ? 'Mekanik updated successfully!' : 'Mekanik added successfully!');
        setShowModal(false);
        loadMekaniks();
      } else {
        alert('Failed to save: ' + result.message);
      }
    } catch (error) {
      console.error('Failed to save mekanik:', error);
      alert('Failed to save mekanik');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Mekanik Management</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Mekanik
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Total {mekaniks.length} Mekaniks</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Machine Code</th>
                  <th>Machine Name</th>
                  <th>Target OHE (%)</th>
                  <th>Benchmark OHE (%)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mekaniks.map((mekanik) => (
                  <tr key={mekanik._id}>
                    <td>{mekanik.nama_mekanik}</td>
                    <td>{mekanik.machine_code}</td>
                    <td>{mekanik.machine_name}</td>
                    <td>{mekanik.target_ohe}%</td>
                    <td>{mekanik.benchmark_ohe}%</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(mekanik)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(mekanik._id, mekanik.nama_mekanik)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mekaniks.length === 0 && (
            <div className="text-center text-muted py-5">
              <h5>No mekaniks found</h5>
              <p>Click "Add Mekanik" to add a new mekanik</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingMekanik ? 'Edit Mekanik' : 'Add New Mekanik'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nama_mekanik}
                      onChange={(e) => setFormData({...formData, nama_mekanik: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Machine Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.machine_code}
                      onChange={(e) => setFormData({...formData, machine_code: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Machine Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.machine_name}
                      onChange={(e) => setFormData({...formData, machine_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Target OHE (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.target_ohe}
                      onChange={(e) => setFormData({...formData, target_ohe: Number(e.target.value)})}
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Benchmark OHE (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.benchmark_ohe}
                      onChange={(e) => setFormData({...formData, benchmark_ohe: Number(e.target.value)})}
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingMekanik ? 'Update' : 'Add'} Mekanik
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MekanikManagement;
