import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CRow,
  CCol,
  CWidgetStatsA,
  CSpinner,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CFormInput,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import axios from 'axios'
import { BaseUrl } from '../../../helpers/BaseUrl'
import { GetToken } from '../../../helpers/GetToken'

const OrderProcessingEfficiency = (props) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const token = GetToken()
  const [loading, setLoading] = useState(false)
  const [avgTimes, setAvgTimes] = useState(null)
  const [error, setError] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchAverageProcessingTime = async () => {
    setLoading(true)
    setError(null)
    setAvgTimes(null)

    try {
      const response = await axios.post(
        `${BaseUrl}/dashboard/average-processing-time`,
        { startDate, endDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setAvgTimes(response.data)
    } catch (error) {
      console.error('Error fetching average processing time:', error)
      setError('Failed to fetch average processing time. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
    fetchAverageProcessingTime()
  }, [widgetChartRef1, widgetChartRef2])

  return (
    <CCard className="mb-4">
      <CCardHeader>Order Processing Efficiency</CCardHeader>
      <CCardBody>
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
        <CButton color="primary" onClick={fetchAverageProcessingTime} disabled={loading}>
          {loading ? <CSpinner size="sm" /> : 'Get Average Time'}
        </CButton>

        {error && (
          <CAlert color="danger" className="mt-3">
            {error}
          </CAlert>
        )}

        <CRow className="mt-4" xs={{ gutter: 4 }}>
          <CCol>
            {!loading ? (
              <CWidgetStatsA
                color="primary"
                value={avgTimes ? `${avgTimes.avgPendingToPreparing} mins` : 'N/A'}
                title="Pending to Preparing"
              />
            ) : (
              <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
            )}
          </CCol>
          <CCol>
            {!loading ? (
              <CWidgetStatsA
                color="info"
                value={avgTimes ? `${avgTimes.avgPreparingToCompleted} mins` : 'N/A'}
                title="Preparing to Completed"
              />
            ) : (
              <CSpinner color="info" style={{ width: '3rem', height: '3rem' }} />
            )}
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

OrderProcessingEfficiency.propTypes = {
  className: PropTypes.string,
}

export default OrderProcessingEfficiency
