import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CProgress,
} from '@coreui/react'
import axios from 'axios'
import { BaseUrl } from '../../../helpers/BaseUrl'
import { GetToken } from '../../../helpers/GetToken'

const DailyRevenuePerWaiter = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]) // Default to today
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const token = GetToken()

  // Fetch daily revenue per waiter
  const fetchDailyRevenue = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(
        `${BaseUrl}/dashboard/daily-revenue-per-waiter`,
        { date },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setRevenueData(response.data)
    } catch (error) {
      console.error('Error fetching daily revenue:', error)
      setError('Failed to fetch daily revenue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount or when date changes
  useEffect(() => {
    fetchDailyRevenue()
  }, [date])

  return (
    <CCard className="mb-4">
      <CCardHeader>Daily Revenue per Waiter</CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <label htmlFor="date">Select Date:</label>
          <CFormInput
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {loading ? (
          <CSpinner color="primary" />
        ) : error ? (
          <CAlert color="danger">{error}</CAlert>
        ) : (
          <>
            {revenueData.length > 0 ? (
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Waiter Name</CTableHeaderCell>
                    <CTableHeaderCell>Total Revenue</CTableHeaderCell>
                    <CTableHeaderCell>Performance</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {revenueData.map((waiter, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{waiter.name}</CTableDataCell>
                      <CTableDataCell>{waiter.totalRevenue.toFixed(2)} TND</CTableDataCell>
                      <CTableDataCell>
                        <CProgress
                          value={(waiter.totalRevenue / 100) * 100} // Example: Scale revenue to 1000 TND
                          color={
                            waiter.totalRevenue >= 80
                              ? 'success'
                              : waiter.totalRevenue >= 50
                                ? 'warning'
                                : 'danger'
                          }
                        >
                          {waiter.totalRevenue.toFixed(2)} TND
                        </CProgress>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            ) : (
              <CAlert color="info">No revenue data available for this date.</CAlert>
            )}
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default DailyRevenuePerWaiter
