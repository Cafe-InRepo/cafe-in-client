import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormSelect,
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
} from '@coreui/react'
import axios from 'axios'
import { BaseUrl } from '../../../helpers/BaseUrl'
import { GetToken } from '../../../helpers/GetToken'

const RevenueByWaiterAndPeriod = () => {
  const [waiters, setWaiters] = useState([])
  const [selectedWaiter, setSelectedWaiter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const token = GetToken()

  // Set default dates to the current month
  useEffect(() => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // Format dates as "YYYY-MM-DD" for the input fields
    const formatDate = (date) => date.toISOString().split('T')[0]

    setStartDate(formatDate(firstDayOfMonth))
    setEndDate(formatDate(lastDayOfMonth))
  }, [])

  // Fetch all waiters (clients) for the superClient
  const fetchWaiters = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/auth/superClient/getUsers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setWaiters(response.data)
    } catch (error) {
      console.error('Error fetching waiters:', error)
      setError('Failed to fetch waiters. Please try again.')
    }
  }

  // Fetch revenue data
  const fetchRevenue = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post(
        `${BaseUrl}/dashboard/revenue-by-waiter-and-period`,
        { clientId: selectedWaiter, startDate, endDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setRevenueData(response.data)
    } catch (error) {
      console.error('Error fetching revenue:', error)
      setError('Failed to fetch revenue data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch waiters and revenue data on component mount
  useEffect(() => {
    fetchWaiters()
    fetchRevenue() // Fetch revenue data with default values
  }, [])

  return (
    <CCard className="mb-4">
      <CCardHeader>Revenue by Waiter for specific Period</CCardHeader>
      <CCardBody>
        <div className="mb-3">
          <label htmlFor="waiter">Select Waiter:</label>
          <CFormSelect
            id="waiter"
            value={selectedWaiter}
            onChange={(e) => setSelectedWaiter(e.target.value)}
          >
            <option value="">All Waiters</option>
            {waiters.map((waiter) => (
              <option key={waiter._id} value={waiter._id}>
                {waiter.fullName}
              </option>
            ))}
          </CFormSelect>
        </div>
        <div className="mb-3">
          <label htmlFor="startDate">Start Date:</label>
          <CFormInput
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="endDate">End Date:</label>
          <CFormInput
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <CButton color="primary" onClick={fetchRevenue} disabled={loading}>
          {loading ? <CSpinner size="sm" /> : 'Get Revenue'}
        </CButton>

        {error && (
          <CAlert color="danger" className="mt-3">
            {error}
          </CAlert>
        )}

        {revenueData.length > 0 ? (
          <CTable striped hover responsive className="mt-4">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Waiter Name</CTableHeaderCell>
                <CTableHeaderCell>Total Revenue</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {revenueData.map((waiter) => (
                <CTableRow key={waiter.clientId}>
                  <CTableDataCell>{waiter.clientName}</CTableDataCell>
                  <CTableDataCell>{waiter.totalRevenue.toFixed(2)} TND</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        ) : (
          <>
            <CAlert color="info" className="mt-3">
              There is no revenue for the current period or selected waiter
            </CAlert>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default RevenueByWaiterAndPeriod
