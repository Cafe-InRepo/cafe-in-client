import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import {
  CRow,
  CCol,
  CWidgetStatsA,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CDropdown,
  CDropdownMenu,
  CDropdownToggle,
  CDropdownItem,
  CFormInput,
  CAlert,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartLine } from '@coreui/react-chartjs'
import axios from 'axios'
import { format } from 'date-fns'
import { GetToken } from '../../../helpers/GetToken'
import { BaseUrl } from '../../../helpers/BaseUrl'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { useSelector } from 'react-redux'
import translations from '../../../app/Language'

const RevenueBetweenDates = ({ className }) => {
  //language
  const t = useSelector((state) => state.language)
  const Language = translations[t]

  const token = GetToken()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [revenueData, setRevenueData] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const widgetChartRef = useRef(null)

  // Fetch default dates from the server on component mount
  useEffect(() => {
    const fetchDefaultDates = async () => {
      try {
        setLoading(true)
        const response = await axios.post(
          `${BaseUrl}/dashboard/revenue-between-dates`,
          {}, // No body, let server use default (today and 14 days before)
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        setRevenueData(response.data)
        console.log(response.data)

        // Set default dates from server
        const today = format(new Date(), 'yyyy-MM-dd')
        const fourteenDaysAgo = format(
          new Date(new Date().setDate(new Date().getDate() - 14)),
          'yyyy-MM-dd',
        )
        setStartDate(fourteenDaysAgo)
        setEndDate(today)
      } catch (err) {
        setErrorMessage('Failed to fetch default dates.')
      } finally {
        setLoading(false)
      }
    }

    fetchDefaultDates()
  }, [token])

  const fetchRevenueBetweenDates = async (newStartDate, newEndDate) => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${BaseUrl}/dashboard/revenue-between-dates`,
        { startDate: newStartDate, endDate: newEndDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setRevenueData(response.data)
      setErrorMessage('') // Clear any previous errors
    } catch (err) {
      setErrorMessage('Error fetching revenue between dates.')
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target

    // Validate endDate to ensure it doesn't go beyond today
    if (name === 'endDate' && new Date(value) > new Date()) {
      setErrorMessage("End date can't be greater than today.")
      return
    }

    setErrorMessage('') // Clear previous error message
    if (name === 'startDate') {
      setStartDate(value)
      fetchRevenueBetweenDates(value, endDate)
    } else if (name === 'endDate') {
      setEndDate(value)
      fetchRevenueBetweenDates(startDate, value)
    }
  }

  const getDayName = (date) => format(date, 'EEEE')

  const completeRevenueData = Array.isArray(revenueData)
    ? revenueData.map((item) => {
        const year = item._id.year || 0
        const month = item._id.month || 1
        const day = item._id.day || 1
        const date = new Date(year, month - 1, day)

        return !isNaN(date)
          ? {
              dayName: getDayName(date),
              date: format(date, 'MMMM, dd, yyyy'),
              dailyRevenue: item.dailyRevenue,
            }
          : {
              dayName: 'Invalid Date',
              date: 'Invalid Date',
              dailyRevenue: 0,
            }
      })
    : []

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Revenue Between Dates', 14, 16)
    doc.autoTable({
      head: [['Day', 'Date', 'Revenue (TND)']],
      body: completeRevenueData.map((item) => [
        item.dayName,
        item.date,
        item.dailyRevenue.toFixed(2),
      ]),
    })
    doc.save('revenue-between-dates.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      completeRevenueData.map((item) => ({
        Day: item.dayName,
        Date: item.date,
        'Revenue (TND)': item.dailyRevenue.toFixed(2),
      })),
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue Between Dates')
    XLSX.writeFile(workbook, 'revenue-between-dates.xlsx')
  }

  return (
    <CRow className={className} xs={{ gutter: 4 }}>
      <div className="mb-2 mb-md-0 me-md-2">
        <CFormInput
          type="date"
          name="startDate"
          value={startDate}
          onChange={handleDateChange}
          placeholder={Language.startDate}
        />
        <CFormInput
          type="date"
          name="endDate"
          value={endDate}
          onChange={handleDateChange}
          placeholder={Language.endDate}
          className="mt-2"
        />
      </div>
      <CCol>
        {errorMessage && <CAlert color="danger">{errorMessage}</CAlert>}
        <CWidgetStatsA
          color="info"
          value={
            loading ? (
              'Loading...'
            ) : revenueData.length === 0 ||
              completeRevenueData.every((item) => item.dailyRevenue === 0) ? (
              <>No revenue data available for the selected dates.</>
            ) : (
              <>
                {completeRevenueData.reduce((sum, item) => sum + item.dailyRevenue, 0).toFixed(2)}{' '}
                TND{' '}
              </>
            )
          }
          title="Revenue Between Dates"
          chart={
            !loading &&
            revenueData.length > 0 &&
            completeRevenueData.some((item) => item.dailyRevenue > 0) ? (
              <CChartLine
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: completeRevenueData.map((item) => item.dayName),
                  datasets: [
                    {
                      label: 'Revenue Between Dates',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-info'),
                      data: completeRevenueData.map((item) => item.dailyRevenue),
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const dayName = context.label
                          const dayIndex = context.dataIndex + 1
                          const date = new Date(
                            new Date().getFullYear(),
                            new Date().getMonth(),
                            dayIndex,
                          )
                          const formattedDate = format(date, 'MMMM dd, yyyy')
                          return `${dayName} (${formattedDate}): ${context.raw} TND`
                        },
                      },
                    },
                  },
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      border: { display: false },
                      grid: { display: false, drawBorder: false },
                      ticks: { display: true },
                    },
                    y: {
                      min: 0,
                      max:
                        Math.max(...completeRevenueData.map((item) => item.dailyRevenue), 0) * 1.2,
                      display: false,
                      grid: { display: false },
                      ticks: { display: false },
                    },
                  },
                  elements: {
                    line: { borderWidth: 1 },
                    point: { radius: 4, hitRadius: 10, hoverRadius: 4 },
                  },
                }}
              />
            ) : null
          }
          action={
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
              <CButton
                color="primary"
                onClick={() => setModalVisible(true)}
                className="mb-2 mb-md-0 me-md-2"
              >
                {Language.details}
              </CButton>
              <CDropdown>
                <CDropdownToggle color="secondary">{Language.details}</CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={exportToPDF}>{Language.ExporttoPDF}</CDropdownItem>
                  <CDropdownItem onClick={exportToExcel}>{Language.ExporttoExel}</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </div>
          }
        />

        <CModal size="lg" visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader onClose={() => setModalVisible(false)}>
            <CModalTitle>{Language.RevenueBetween2Dates}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CTable striped>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>{Language.day}</CTableHeaderCell>
                  <CTableHeaderCell>{Language.date}</CTableHeaderCell>
                  <CTableHeaderCell>{Language.revenue} (TND)</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {completeRevenueData.map((item, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{item.dayName}</CTableDataCell>
                    <CTableDataCell>{item.date}</CTableDataCell>
                    <CTableDataCell>{item.dailyRevenue.toFixed(2)} TND</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              {Language.close}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

RevenueBetweenDates.propTypes = {
  className: PropTypes.string,
}

export default RevenueBetweenDates
