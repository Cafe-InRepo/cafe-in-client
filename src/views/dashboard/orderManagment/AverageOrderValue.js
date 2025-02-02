import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader, CButton, CSpinner, CAlert, CBadge } from '@coreui/react'
import axios from 'axios'
import { BaseUrl } from '../../../helpers/BaseUrl'
import { GetToken } from '../../../helpers/GetToken'

const AverageOrderValue = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [threshold, setThreshold] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const token = GetToken()

  const fetchAverageOrderValue = async () => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await axios.post(
        `${BaseUrl}/dashboard/average-order-value`,
        { startDate, endDate, highValueThreshold: threshold },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setData(response.data)
    } catch (error) {
      console.error('Error fetching average order value:', error)
      setError('Failed to fetch average order value. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>Average Order Value and High-Value Orders</CCardHeader>
      <CCardBody>
        {/* Input Fields */}
        <div className="row mb-3">
          <div className="col-md-4 mb-3">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="col-md-4 mb-3">
            <label htmlFor="threshold">Threshold (High-Value Orders):</label>
            <input
              type="number"
              id="threshold"
              className="form-control"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
        </div>

        <CButton color="primary" onClick={fetchAverageOrderValue} disabled={loading}>
          {loading ? <CSpinner size="sm" /> : 'Get Data'}
        </CButton>

        {/* Error Message */}
        {error && (
          <CAlert color="danger" className="mt-3">
            {error}
          </CAlert>
        )}

        {/* Results */}
        {data && (
          <div className="mt-4">
            <h5 className="text-primary mb-4">Results</h5>
            <div className="mb-4">
              <p className="fs-5 text-success">
                <strong>Average Order Value:</strong> {data.averageOrderValue.toFixed(2)} TND
              </p>
            </div>
            <div>
              <h6 className="text-secondary mb-3">High-Value Orders:</h6>
              <div className="row">
                {data.highValueOrders.map((order, index) => (
                  <div key={order._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                    <div
                      className="p-3 border rounded shadow-sm bg-light h-100"
                      style={{
                        borderLeft: '5px solid #4caf50',
                        borderTopRightRadius: '0.5rem',
                        borderBottomRightRadius: '0.5rem',
                      }}
                    >
                      <p className="mb-2">
                        <strong>Order:</strong> <CBadge color="info">{index}</CBadge>
                      </p>
                      <p className="mb-2">
                        <strong>Total Price:</strong> {order.totalPrice.toFixed(2)} TND
                      </p>
                      <p>
                        <strong>Timestamp:</strong> {new Date(order.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default AverageOrderValue
