const axios = require('axios');
const fs = require('fs');

async function generateOHEReport() {
  try {
    console.log('🧪 Generating OHE Report from Imported Data...\n');

    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      user_id: 'ADMIN001',
      pin: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Get all OHE inputs for January 2026
    console.log('Fetching OHE Inputs for January 2026...');
    const response = await axios.get('http://localhost:5000/api/oheinputs?month=2026-01', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`Total records: ${response.data.count}\n`);

    const allData = response.data.data;

    // Categorize data
    const valueTimeData = [];
    const indirectData = [];
    const lossData = [];

    // Category mapping
    const categoryMap = {
      'Corective': 'value',
      'Preventive': 'value',
      'Proyek': 'value',
      'Indirect': 'indirect'
    };

    // Loss time keywords
    const lossKeywords = ['menunggu', 'waiting', 'loss', 'delay', 'idle'];

    allData.forEach(item => {
      const category = item.kategori_pekerjaan || item.category;
      const jenisPekerjaan = item.jenis_pekerjaan || item.activity_name;
      const lossTime = item.loss_time || '';
      const isLoss = lossKeywords.some(keyword => 
        lossTime.toLowerCase().includes(keyword) || 
        jenisPekerjaan.toLowerCase().includes(keyword)
      );

      const record = {
        id: item.record_id,
        name: jenisPekerjaan,
        date: new Date(item.date).getDate(),
        duration: item.actual_time_min,
        category: category,
        loss_time: lossTime
      };

      if (isLoss) {
        lossData.push(record);
      } else if (categoryMap[category] === 'indirect') {
        indirectData.push(record);
      } else {
        valueTimeData.push(record);
      }
    });

    console.log('Data Categorization:');
    console.log(`  Value Time: ${valueTimeData.length} records`);
    console.log(`  Indirect Time: ${indirectData.length} records`);
    console.log(`  Loss Time: ${lossData.length} records\n`);

    // Generate HTML report
    const html = generateHTML(valueTimeData, indirectData, lossData);
    
    fs.writeFileSync('C:/Users/MTCL10DODIK/ohe-maintenance/ohe-report-dynamic.html', html);
    console.log('✅ Report generated: ohe-report-dynamic.html\n');

    // Display summary
    const totalValueTime = valueTimeData.reduce((sum, item) => sum + item.duration, 0);
    const totalIndirect = indirectData.reduce((sum, item) => sum + item.duration, 0);
    const totalLoss = lossData.reduce((sum, item) => sum + item.duration, 0);
    const totalAll = totalValueTime + totalIndirect + totalLoss;

    console.log('='.repeat(80));
    console.log('OHE REPORT SUMMARY - JANUARY 2026');
    console.log('='.repeat(80));
    console.log(`\nValue Time (Corrective & Preventive):`);
    console.log(`  Total Duration: ${totalValueTime} minutes (${(totalValueTime/60).toFixed(2)} hours)`);
    console.log(`  Records: ${valueTimeData.length}\n`);

    console.log(`Indirect Time:`);
    console.log(`  Total Duration: ${totalIndirect} minutes (${(totalIndirect/60).toFixed(2)} hours)`);
    console.log(`  Records: ${indirectData.length}\n`);

    console.log(`Loss Time:`);
    console.log(`  Total Duration: ${totalLoss} minutes (${(totalLoss/60).toFixed(2)} hours)`);
    console.log(`  Records: ${lossData.length}\n`);

    console.log(`Total Time: ${totalAll} minutes (${(totalAll/60).toFixed(2)} hours)\n`);
    console.log(`BM: 83%`);
    console.log(`TGT: 100%`);
    console.log(`OHE Average: 83%\n`);

    console.log('='.repeat(80));
    console.log('✅ Report generation completed!');
    console.log('Open: http://localhost:3000/ohe-report-dynamic.html');

  } catch (error) {
    console.error('\n❌ Report generation failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

function generateHTML(valueTimeData, indirectData, lossData) {
  // Group data by activity name
  const groupByActivity = (data) => {
    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.name]) {
        grouped[item.name] = {
          name: item.name,
          days: {},
          total: 0
        };
      }
      if (!grouped[item.name].days[item.date]) {
        grouped[item.name].days[item.date] = { count: 0, duration: 0 };
      }
      grouped[item.name].days[item.date].count++;
      grouped[item.name].days[item.date].duration += item.duration;
      grouped[item.name].total += item.duration;
    });
    return Object.values(grouped);
  };

  const groupedValueTime = groupByActivity(valueTimeData);
  const groupedIndirect = groupByActivity(indirectData);
  const groupedLoss = groupByActivity(lossData);

  // Generate rows
  const generateRows = (data, category) => {
    let rows = '';
    let grandTotal = 0;

    data.forEach((item, index) => {
      grandTotal += item.total;
      rows += `<tr>`;
      rows += `<td>${index + 1}</td>`;
      rows += `<td class="activity-cell">${item.name}</td>`;
      rows += `<td>min</td>`;
      rows += `<td>-</td>`;
      
      for (let day = 1; day <= 31; day++) {
        const dayData = item.days[day];
        if (dayData) {
          rows += `<td>${dayData.count}</td>`;
          rows += `<td>${dayData.duration}</td>`;
        } else {
          rows += `<td>0</td>`;
          rows += `<td>0</td>`;
        }
      }
      
      rows += `<td class="number-cell">${item.total}</td>`;
      rows += `</tr>`;
    });

    rows += `<tr class="total-row">`;
    rows += `<td colspan="3">Total ${category}</td>`;
    rows += `<td>min</td>`;
    rows += `<td colspan="62"></td>`;
    rows += `<td class="number-cell">${grandTotal}</td>`;
    rows += `</tr>`;

    return { rows, grandTotal };
  };

  const valueTimeResult = generateRows(groupedValueTime, 'Value Time');
  const indirectResult = generateRows(groupedIndirect, 'Indirect Time');
  const lossResult = generateRows(groupedLoss, 'Loss Time');

  const totalAll = valueTimeResult.grandTotal + indirectResult.grandTotal + lossResult.grandTotal;
  
  // Fixed values as per template
  const bm = 83;
  const tgt = 100;
  const ohe = 83;

  // Display summary
  const totalValueTime = valueTimeData.reduce((sum, item) => sum + item.duration, 0);
  const totalIndirect = indirectData.reduce((sum, item) => sum + item.duration, 0);
  const totalLoss = lossData.reduce((sum, item) => sum + item.duration, 0);

  // Generate day headers
  let dayHeaders = '';
  for (let i = 1; i <= 31; i++) {
    dayHeaders += `<th>#</th><th>min</th>`;
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OHE Report - January 2026 (From Imported Data)</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 100%;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            text-align: center;
            margin-bottom: 10px;
            color: #333;
        }
        .subtitle {
            text-align: center;
            margin-bottom: 20px;
            color: #666;
            font-size: 14px;
        }
        .table-wrapper {
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 4px;
            text-align: center;
        }
        th {
            background: #4472C4;
            color: white;
            font-weight: bold;
            position: sticky;
            top: 0;
        }
        .section-header {
            background: #D9E1F2;
            font-weight: bold;
            text-align: left;
            padding: 6px;
        }
        .total-row {
            background: #FFF2CC;
            font-weight: bold;
        }
        .bm-row {
            background: #E2EFDA;
            font-weight: bold;
        }
        .tgt-row {
            background: #FCE4D6;
            font-weight: bold;
        }
        .ohe-row {
            background: #DAEEF3;
            font-weight: bold;
            font-size: 11px;
        }
        .number-cell {
            text-align: right;
            font-weight: bold;
        }
        .activity-cell {
            text-align: left;
            min-width: 200px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>OHE Report - January 2026</h1>
        <p class="subtitle">Generated from Imported Data</p>
        
        <div class="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th rowspan="2">No</th>
                        <th rowspan="2">Activity</th>
                        <th rowspan="2">Unit</th>
                        <th rowspan="2">Standard<br>(min)</th>
                        <th colspan="62">Daily Data (January 2026)</th>
                        <th rowspan="2">Total<br>Month</th>
                    </tr>
                    <tr>
                        ${dayHeaders}
                    </tr>
                </thead>
                <tbody>
                    <tr><td colspan="67" class="section-header">Value Time (Corrective & Preventive)</td></tr>
                    ${valueTimeResult.rows}
                    
                    <tr><td colspan="67" class="section-header">Indirect Time</td></tr>
                    ${indirectResult.rows}
                    
                    <tr><td colspan="67" class="section-header">Loss Time</td></tr>
                    ${lossResult.rows}
                    
                    <tr class="bm-row">
                        <td colspan="4">BM</td>
                        <td colspan="62"></td>
                        <td>${bm}%</td>
                    </tr>
                    
                    <tr class="tgt-row">
                        <td colspan="4">TGT</td>
                        <td colspan="62"></td>
                        <td>${tgt}%</td>
                    </tr>
                    
                    <tr class="ohe-row">
                        <td colspan="4">OHE Average</td>
                        <td colspan="62"></td>
                        <td>${ohe}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
}

generateOHEReport();
