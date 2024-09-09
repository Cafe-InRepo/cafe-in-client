import React, { useEffect, useRef, useState } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import { GetToken } from '../../helpers/GetToken'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CCol, CForm, CFormLabel, CRow, CSpinner } from '@coreui/react'

const RevenuePerProduct2dates = () => {
  const chartRef = useRef(null)
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)
  const [maxValue, setMaxValue] = useState()
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7))) // 7 days ago
  const [endDate, setEndDate] = useState(new Date()) // Today
  const token = GetToken()

  useEffect(() => {
    const getRevenueByProductBetweenDates = async () => {
      setLoading(true)
      try {
        const response = await axios.post(
          `${BaseUrl}/dashboard/revenue-by-product-between-dates`,
          {
            startDate,
            endDate,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        setRevenueData(response.data)

        // Calculate the maximum value for the y-axis
        const allValues = response.data.flatMap((product) => product.totalRevenue)
        setMaxValue(Math.max(...allValues, 60)) // Ensure at least 60 as default
      } catch (err) {
        console.error('Error fetching revenue by product:', err)
      }
      setLoading(false)
    }

    getRevenueByProductBetweenDates()
  }, [token, startDate, endDate])

  useEffect(() => {
    if (chartRef.current) {
      setTimeout(() => {
        chartRef.current.options.scales.x.grid.borderColor = getStyle(
          '--cui-border-color-translucent',
        )
        chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
        chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
        chartRef.current.options.scales.y.grid.borderColor = getStyle(
          '--cui-border-color-translucent',
        )
        chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
        chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
        chartRef.current.update()
      })
    }
  }, [chartRef, maxValue])

  // Map the revenue data to chart labels and datasets
  const labels = revenueData.map((data) => data.productName)

  const datasets = [
    {
      label: 'Revenue',
      backgroundColor: 'transparent',
      borderColor: getStyle('--cui-info'),
      pointHoverBackgroundColor: getStyle('--cui-info'),
      borderWidth: 2,
      data: revenueData.map((data) => data.totalRevenue),
    },
  ]

  return (
    <>
      <div className="p-4">
        <CRow className="align-items-center mb-3">
          <CCol md="6">
            <CForm>
              <CFormLabel>Select Start Date</CFormLabel>
              <div className="input-group">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="form-control"
                  dateFormat="MM/dd/yyyy"
                />
              </div>
            </CForm>
          </CCol>
          <CCol md="6">
            <CForm>
              <CFormLabel>Select End Date</CFormLabel>
              <div className="input-group">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  className="form-control"
                  dateFormat="MM/dd/yyyy"
                />
              </div>
            </CForm>
          </CCol>
        </CRow>
      </div>

      {loading ? (
        <CSpinner />
      ) : (
        <CChartLine
          ref={chartRef}
          style={{ height: '300px', marginTop: '40px' }}
          data={{
            labels,
            datasets,
          }}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
              },
            },
            scales: {
              x: {
                grid: {
                  color: getStyle('--cui-border-color-translucent'),
                  drawOnChartArea: false,
                },
                ticks: {
                  color: getStyle('--cui-body-color'),
                },
              },
              y: {
                beginAtZero: true,
                border: {
                  color: getStyle('--cui-border-color-translucent'),
                },
                grid: {
                  color: getStyle('--cui-border-color-translucent'),
                },
                max: maxValue, // Set the max value dynamically
                ticks: {
                  color: getStyle('--cui-body-color'),
                  maxTicksLimit: 5,
                  stepSize: Math.ceil(maxValue / 5),
                },
              },
            },
            elements: {
              line: {
                tension: 0.4,
              },
              point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 4,
                hoverBorderWidth: 3,
              },
            },
          }}
        />
      )}
    </>
  )
}

export default RevenuePerProduct2dates
