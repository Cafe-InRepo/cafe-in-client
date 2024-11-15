import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react';
import axios from 'axios';
import { BaseUrl } from '../../../helpers/BaseUrl';
import { GetToken } from '../../../helpers/GetToken';

const AverageProcessingTime = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [avgTimes, setAvgTimes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = GetToken();

  const fetchAverageProcessingTime = async () => {
    setLoading(true);
    setError(null);
    setAvgTimes(null);

    try {
      const response = await axios.post(
        `${BaseUrl}/dashboard/average-processing-time`,
        { startDate, endDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAvgTimes(response.data);
    } catch (error) {
      console.error('Error fetching average processing time:', error);
      setError('Failed to fetch average processing time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>Average Processing Time</CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <CButton color="primary" onClick={fetchAverageProcessingTime} disabled={loading}>
          {loading ? <CSpinner size="sm" /> : 'Get Average Time'}
        </CButton>

        {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}

        {avgTimes && (
          <div className="mt-4">
            <h5>Results:</h5>
            <p><strong>Average Pending to Preparing Time:</strong> {avgTimes.avgPendingToPreparing} mins</p>
            <p><strong>Average Preparing to Completed Time:</strong> {avgTimes.avgPreparingToCompleted} mins</p>
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};

export default AverageProcessingTime;
