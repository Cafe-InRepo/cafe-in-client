import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
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

const RevenueByClient = () => {
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const token = GetToken()

  // Fetch revenue data
  const fetchRevenueByClient = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${BaseUrl}/dashboard/revenue-by-client`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setRevenueData(response.data)
    } catch (error) {
      console.error('Error fetching revenue by client:', error)
      setError('Failed to fetch revenue data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchRevenueByClient()
  }, [])

  return (
    <CCard className="mb-4">
      <CCardHeader>Revenue by Waiter</CCardHeader>
      <CCardBody>
        {loading ? (
          <CSpinner color="primary" />
        ) : error ? (
          <CAlert color="danger">{error}</CAlert>
        ) : (
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Client Name</CTableHeaderCell>
                <CTableHeaderCell>Month</CTableHeaderCell>
                <CTableHeaderCell>Total Revenue</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {revenueData.length > 0 ? (
                revenueData.map((client) =>
                  client.monthlyRevenue.map((monthlyData, index) => (
                    <CTableRow key={`${client.clientId}-${index}`}>
                      <CTableDataCell>{client.clientName}</CTableDataCell>
                      <CTableDataCell>{monthlyData.month}</CTableDataCell>
                      <CTableDataCell>{monthlyData.totalRevenue.toFixed(2)} TND</CTableDataCell>
                    </CTableRow>
                  )),
                )
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="3" className="text-center">
                    No revenue data available.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

export default RevenueByClient
