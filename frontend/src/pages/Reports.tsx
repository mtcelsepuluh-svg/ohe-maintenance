import React, { useState, useEffect } from 'react';
import { oheService } from '../services/oheService';
import { authService } from '../services/authService';
import { OHEInput } from '../types';
import { format } from 'date-fns';

const Reports = () => {
  const [oheInputs, setOheInputs] = useState<OHEInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-01');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<OHEInput | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadActivities();
  }, [selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const inputsData = await oheService.getInputs({ month: selectedMonth });
      console.log('Loaded data:', inputsData.length, 'records');
      setOheInputs(inputsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      // Load activities from ValueTimeList, DirectList, IndirectList, LossTimeList
      const [valueTimes, directs, indirects, lossTimes] = await Promise.all([
        fetch('/api/valuetimes', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json()),
        fetch('/api/directs', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json()),
        fetch('/api/indirects', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json()),
        fetch('/api/losstimes', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json())
      ]);

      const allActivities = [
        ...(valueTimes.data || []).map((a: any) => ({ ...a, category: 'VALUE TIME' })),
        ...(directs.data || []).map((a: any) => ({ ...a, category: 'DIRECT' })),
        ...(indirects.data || []).map((a: any) => ({ ...a, category: 'INDIRECT' })),
        ...(lossTimes.data || []).map((a: any) => ({ ...a, category: 'LOSS' }))
      ];

      setActivities(allActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const handleEditCategory = (item: OHEInput) => {
    setEditItem(item);
    setShowEditModal(true);
  };

  const handleSaveCategory = async () => {
    if (!editItem) return;

    try {
      // Get selected category from dropdown
      const selectElement = document.getElementById('categorySelect') as HTMLSelectElement;
      const selectedCategory = selectElement.value;
      
      if (selectedCategory) {
        // Map category to kategori_pekerjaan
        const categoryMap: {[key: string]: string} = {
          'VALUE TIME': 'Corective',
          'DIRECT': 'Preventive',
          'INDIRECT': 'Indirect',
          'LOSS': 'Loss'
        };

        console.log('Updating category:', {
          id: editItem._id,
          from: editItem.kategori_pekerjaan || editItem.category,
          to: selectedCategory,
          mappedTo: categoryMap[selectedCategory]
        });

        // Update the OHE input with new category
        const response = await fetch(`/api/oheinputs/${editItem._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            category: selectedCategory,
            kategori_pekerjaan: categoryMap[selectedCategory] || selectedCategory
          })
        });

        const result = await response.json();
        console.log('Update result:', result);

        if (result.success) {
          // Reload data
          console.log('Reloading data...');
          await loadData();
          setShowEditModal(false);
          setEditItem(null);
          alert('Category updated successfully! Activity will move to the new section.');
        } else {
          alert('Failed to update category: ' + (result.message || 'Unknown error'));
        }
      } else {
        alert('Please select a category');
      }
    } catch (error: any) {
      console.error('Failed to update category:', error);
      alert('Failed to update category: ' + error.message);
    }
  };

  // Categorize data
  const valueTimeData = oheInputs.filter(item =>
    ['Corective', 'Preventive', 'Proyek'].includes(item.kategori_pekerjaan || item.category || '')
  );

  const indirectData = oheInputs.filter(item =>
    (item.kategori_pekerjaan || item.category || '') === 'Indirect'
  );

  const lossData = oheInputs.filter(item => {
    const lossTime = item.loss_time || '';
    const lossKeywords = ['menunggu', 'waiting', 'loss', 'delay', 'idle'];
    return lossKeywords.some(keyword => lossTime.toLowerCase().includes(keyword));
  });

  console.log('Categorized data:', {
    valueTime: valueTimeData.length,
    indirect: indirectData.length,
    loss: lossData.length,
    total: oheInputs.length
  });

  // Calculate totals
  const totalValueTime = valueTimeData.reduce((sum, item) => sum + (item.actual_time_min || 0), 0);
  const totalIndirect = indirectData.reduce((sum, item) => sum + (item.actual_time_min || 0), 0);
  const totalLoss = lossData.reduce((sum, item) => sum + (item.actual_time_min || 0), 0);

  // Group by activity
  const groupByActivity = (data: OHEInput[]) => {
    const grouped: {[key: string]: {name: string, category: string, _id: string, days: {[key: number]: {count: number, duration: number}}, total: number}} = {};
    data.forEach(item => {
      const name = item.activity_name || item.jenis_pekerjaan || 'Unknown';
      const category = item.kategori_pekerjaan || item.category || 'Unknown';
      const day = new Date(item.date).getDate();

      if (!grouped[name]) {
        grouped[name] = { name, category, _id: item._id, days: {}, total: 0 };
      }
      if (!grouped[name].days[day]) {
        grouped[name].days[day] = { count: 0, duration: 0 };
      }
      grouped[name].days[day].count++;
      grouped[name].days[day].duration += item.actual_time_min || 0;
      grouped[name].total += item.actual_time_min || 0;
    });
    return Object.values(grouped);
  };

  const groupedValueTime = groupByActivity(valueTimeData);
  const groupedIndirect = groupByActivity(indirectData);
  const groupedLoss = groupByActivity(lossData);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>OHE Report</h1>
      </div>

      {/* Month Filter */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h5 className="mb-0">Filter by Month</h5>
            </div>
            <div className="col-md-6">
              <input
                type="month"
                className="form-control"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6>Value Time</h6>
              <h3>{totalValueTime.toFixed(2)} min</h3>
              <small>{valueTimeData.length} records</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h6>Indirect Time</h6>
              <h3>{totalIndirect.toFixed(2)} min</h3>
              <small>{indirectData.length} records</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h6>Loss Time</h6>
              <h3>{totalLoss.toFixed(2)} min</h3>
              <small>{lossData.length} records</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6>OHE Average</h6>
              <h3>83%</h3>
              <small>BM: 83% | TGT: 100%</small>
            </div>
          </div>
        </div>
      </div>

      {/* OHE Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">OHE Calculation Table - {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive" style={{maxHeight: '600px', overflow: 'auto'}}>
            <table className="table table-sm table-bordered" style={{fontSize: '10px', minWidth: '2000px'}}>
              <thead style={{position: 'sticky', top: 0, background: '#4472C4', color: 'white', zIndex: 1}}>
                <tr>
                  <th rowSpan={3} style={{minWidth: '30px'}}>No</th>
                  <th rowSpan={3} style={{minWidth: '200px'}}>Activity</th>
                  <th rowSpan={3} style={{minWidth: '80px'}}>Category</th>
                  <th rowSpan={3} style={{minWidth: '80px'}}>Standard<br/>(min)</th>
                  <th colSpan={62}>Daily Data ({format(new Date(selectedMonth + '-01'), 'MMMM yyyy')})</th>
                  <th rowSpan={3} style={{minWidth: '100px'}}>Total<br/>Month</th>
                </tr>
                <tr>
                  {Array.from({length: 31}, (_, i) => (
                    <th key={i} colSpan={2} style={{minWidth: '80px'}}>
                      {i + 1}-{selectedMonth.split('-')[1]}
                    </th>
                  ))}
                </tr>
                <tr>
                  {Array.from({length: 31}, (_, i) => (
                    <React.Fragment key={i}>
                      <th style={{minWidth: '40px'}}>#</th>
                      <th style={{minWidth: '60px'}}>min</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Value Time Section */}
                <tr style={{background: '#D9E1F2'}}>
                  <td colSpan={67} style={{fontWeight: 'bold'}}>Value Time (Corrective & Preventive)</td>
                </tr>
                {groupedValueTime.map((item, idx) => {
                  const daysInMonth = Object.keys(item.days).map(d => parseInt(d)).sort((a, b) => a - b);
                  return (
                    <tr key={`value-${idx}`}>
                      <td>{idx + 1}</td>
                      <td>{item.name}</td>
                      <td>
                        <span className="badge bg-success" style={{cursor: 'pointer'}} onClick={() => handleEditCategory({...item, _id: item._id} as any)}>
                          Value ✏️
                        </span>
                      </td>
                      <td>-</td>
                      {Array.from({length: 31}, (_, i) => {
                        const day = i + 1;
                        const dayData = item.days[day];
                        return (
                          <React.Fragment key={i}>
                            <td>{dayData ? dayData.count : 0}</td>
                            <td>{dayData ? dayData.duration.toFixed(2) : '0.00'}</td>
                          </React.Fragment>
                        );
                      })}
                      <td style={{fontWeight: 'bold'}}>{item.total.toFixed(2)}</td>
                    </tr>
                  );
                })}
                <tr style={{background: '#FFF2CC', fontWeight: 'bold'}}>
                  <td colSpan={3}>Total Value Time</td>
                  <td>min</td>
                  <td colSpan={62}></td>
                  <td>{totalValueTime.toFixed(2)} min</td>
                </tr>

                {/* Indirect Time Section */}
                <tr style={{background: '#D9E1F2'}}>
                  <td colSpan={67} style={{fontWeight: 'bold'}}>Indirect Time</td>
                </tr>
                {groupedIndirect.map((item, idx) => {
                  const daysInMonth = Object.keys(item.days).map(d => parseInt(d)).sort((a, b) => a - b);
                  return (
                    <tr key={`indirect-${idx}`}>
                      <td>{idx + 1}</td>
                      <td>{item.name}</td>
                      <td>
                        <span className="badge bg-warning text-dark" style={{cursor: 'pointer'}} onClick={() => handleEditCategory({...item, _id: item._id} as any)}>
                          Indirect ✏️
                        </span>
                      </td>
                      <td>-</td>
                      {Array.from({length: 31}, (_, i) => {
                        const day = i + 1;
                        const dayData = item.days[day];
                        return (
                          <React.Fragment key={i}>
                            <td>{dayData ? dayData.count : 0}</td>
                            <td>{dayData ? dayData.duration.toFixed(2) : '0.00'}</td>
                          </React.Fragment>
                        );
                      })}
                      <td style={{fontWeight: 'bold'}}>{item.total.toFixed(2)}</td>
                    </tr>
                  );
                })}
                <tr style={{background: '#FFF2CC', fontWeight: 'bold'}}>
                  <td colSpan={3}>Total Indirect Time</td>
                  <td>min</td>
                  <td colSpan={62}></td>
                  <td>{totalIndirect.toFixed(2)} min</td>
                </tr>

                {/* Loss Time Section */}
                <tr style={{background: '#D9E1F2'}}>
                  <td colSpan={67} style={{fontWeight: 'bold'}}>Loss Time</td>
                </tr>
                {groupedLoss.map((item, idx) => {
                  const daysInMonth = Object.keys(item.days).map(d => parseInt(d)).sort((a, b) => a - b);
                  return (
                    <tr key={`loss-${idx}`}>
                      <td>{idx + 1}</td>
                      <td>{item.name}</td>
                      <td>
                        <span className="badge bg-danger" style={{cursor: 'pointer'}} onClick={() => handleEditCategory({...item, _id: item._id} as any)}>
                          Loss ️
                        </span>
                      </td>
                      <td>-</td>
                      {Array.from({length: 31}, (_, i) => {
                        const day = i + 1;
                        const dayData = item.days[day];
                        return (
                          <React.Fragment key={i}>
                            <td>{dayData ? dayData.count : 0}</td>
                            <td>{dayData ? dayData.duration.toFixed(2) : '0.00'}</td>
                          </React.Fragment>
                        );
                      })}
                      <td style={{fontWeight: 'bold'}}>{item.total.toFixed(2)}</td>
                    </tr>
                  );
                })}
                <tr style={{background: '#FFF2CC', fontWeight: 'bold'}}>
                  <td colSpan={3}>Total Loss Time</td>
                  <td>min</td>
                  <td colSpan={62}></td>
                  <td>{totalLoss.toFixed(2)} min</td>
                </tr>

                {/* OHE Summary */}
                <tr style={{background: '#E2EFDA', fontWeight: 'bold'}}>
                  <td colSpan={4}>BM (Bermanfaat)</td>
                  <td colSpan={62}></td>
                  <td>83%</td>
                </tr>
                <tr style={{background: '#FCE4D6', fontWeight: 'bold'}}>
                  <td colSpan={4}>TGT (Target)</td>
                  <td colSpan={62}></td>
                  <td>100%</td>
                </tr>
                <tr style={{background: '#DAEEF3', fontWeight: 'bold', fontSize: '12px'}}>
                  <td colSpan={4}>OHE Average</td>
                  <td colSpan={62}></td>
                  <td>83%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      {showEditModal && editItem && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Category</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Activity:</strong> {editItem.activity_name || editItem.jenis_pekerjaan}</p>
                <p><strong>Current Category:</strong> {editItem.kategori_pekerjaan || editItem.category}</p>
                <hr/>
                <div className="mb-3">
                  <label className="form-label"><strong>Select New Category:</strong></label>
                  <select className="form-select" id="categorySelect" defaultValue={editItem.category || editItem.kategori_pekerjaan}>
                    <option value="VALUE TIME">Value Time (Corrective & Preventive)</option>
                    <option value="DIRECT">Direct Time</option>
                    <option value="INDIRECT">Indirect Time</option>
                    <option value="LOSS">Loss Time</option>
                  </select>
                </div>
                <div className="alert alert-info">
                  <small>
                    <strong>Note:</strong> 
                    <ul className="mb-0 mt-2">
                      <li><strong>Value Time:</strong> Corrective & Preventive maintenance</li>
                      <li><strong>Direct Time:</strong> Direct work activities</li>
                      <li><strong>Indirect Time:</strong> Support activities (briefing, 5R, meeting, etc)</li>
                      <li><strong>Loss Time:</strong> Waiting time, delays, idle time</li>
                    </ul>
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveCategory}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
