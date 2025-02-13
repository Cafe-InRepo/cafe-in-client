import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CRow,
  CCol,
  CWidgetStatsA,
  CSpinner,
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

const CurrentWeekRevenue = ({ className }) => {
  const widgetChartRef = useRef(null)
  const token = GetToken()
  const [loading, setLoading] = useState(false)
  const [weeklyRevenue, setWeeklyRevenue] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [growthRate, setGrowthRate] = useState(0)
  const t = useSelector((state) => state.language)
  const Language = translations[t]
  // Get today's date
  const today = new Date()
  const getDayName = (date) => format(date, 'EEEE')

  // Calculate the complete weekly data for today and 6 days before it
  const completeWeeklyData = Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date() // Get the current date
    currentDate.setDate(today.getDate() - index) // Set to current day minus index (going back)
    const day = currentDate.getDate()
    const revenueForDay = weeklyRevenue.find((item) => item._id.day === day)?.dailyRevenue || 0

    return {
      dayName: getDayName(currentDate),
      date: format(currentDate, 'MMMM dd, yyyy'),
      dailyRevenue: revenueForDay,
    }
  })

  const getCurrentWeekRevenue = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BaseUrl}/dashboard/weekly-revenue`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const { currentWeekRevenue, prevWeekRevenue, growthRate, dailyRevenue } = response.data

      setWeeklyRevenue(dailyRevenue)
      setGrowthRate(growthRate) // Store growth rate

      console.log(response.data)
    } catch (err) {
      console.log('Error fetching current week revenue')
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    getCurrentWeekRevenue()
  }, [])

  // Function to export table to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Current Week Revenue Details', 14, 16)
    doc.autoTable({
      head: [['Day', 'Date', 'Revenue (TND)']],
      body: completeWeeklyData.map((item) => [
        item.dayName,
        item.date,
        item.dailyRevenue.toFixed(2),
      ]),
    })
    doc.save('current-week-revenue-details.pdf')
  }

  // Function to export table to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      completeWeeklyData.map((item) => ({
        Day: item.dayName,
        Date: item.date,
        'Revenue (TND)': item.dailyRevenue.toFixed(2),
      })),
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Current Week Revenue')
    XLSX.writeFile(workbook, 'current-week-revenue-details.xlsx')
  }

  return (
    <CRow className={className} xs={{ gutter: 4 }}>
      <CCol>
        <CWidgetStatsA
          color="info"
          value={
            !loading && weeklyRevenue ? (
              <>
                {completeWeeklyData.reduce((sum, item) => sum + item.dailyRevenue, 0).toFixed(2)}{' '}
                TND{' '}
                <small className={growthRate >= 0 ? 'text-success' : 'text-danger'}>
                  {growthRate.toFixed(2)}% {growthRate >= 0 ? '↑' : '↓'}
                </small>
              </>
            ) : (
              'Loading...'
            )
          }
          title={Language.CurrentWeekRevenue}
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                // Reverse the labels and data for the chart
                labels: completeWeeklyData.map((item) => item.dayName).reverse(), // Reverse the day names
                datasets: [
                  {
                    label: 'Current Week Revenue',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: completeWeeklyData.map((item) => item.dailyRevenue).reverse(), // Reverse the daily revenue
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const dayName = context.label
                        const dayIndex = context.dataIndex + 1
                        const date = new Date(startOfWeek)
                        date.setDate(startOfWeek.getDate() + context.dataIndex)
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
                    max: Math.max(...completeWeeklyData.map((item) => item.dailyRevenue), 0) * 1.2,
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
                <CDropdownToggle color="secondary">{Language.Export}</CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={exportToPDF}>{Language.ExporttoPDF}</CDropdownItem>
                  <CDropdownItem onClick={exportToExcel}>{Language.ExporttoExel}</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </div>
          }
        />
      </CCol>

      {/* Modal for displaying data in a table */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Current Week Revenue Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">{Language.day}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{Language.date}</CTableHeaderCell>
                <CTableHeaderCell scope="col">{Language.revenue} (TND)</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {completeWeeklyData.map((item, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{item.dayName}</CTableDataCell>
                  <CTableDataCell>{item.date}</CTableDataCell>
                  <CTableDataCell>{item.dailyRevenue.toFixed(2)}</CTableDataCell>
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
    </CRow>
  )
}

CurrentWeekRevenue.propTypes = {
  className: PropTypes.string,
}

export default CurrentWeekRevenue
