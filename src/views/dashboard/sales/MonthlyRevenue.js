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

const CurrentMonthRevenue = ({ className }) => {
  //language
  const t = useSelector((state) => state.language)
  const Language = translations[t]
  
  const widgetChartRef = useRef(null)
  const token = GetToken()
  const [loading, setLoading] = useState(false)
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [previousMonthRevenue, setPreviousMonthRevenue] = useState(0)

  const [modalVisible, setModalVisible] = useState(false)

  const [growth, setGrowth] = useState(0)

  const today = new Date().getDate()

  const getCurrentMonthRevenue = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BaseUrl}/dashboard/monthly-revenue`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setMonthlyRevenue(response.data)
    } catch (err) {
      console.log('Error fetching current month revenue')
      console.error(err)
    }
    setLoading(false)
  }

  const getCurrentMonthGrowthRate = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BaseUrl}/dashboard/monthly-revenue-growth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setGrowth(response.data.growthRate)
      setPreviousMonthRevenue(response.data.previousMonthRevenue)
      console.log(response.data.previousMonthRevenue)
      console.log(response.data.growthRate)
    } catch (err) {
      console.log('Error fetching current month growth rate')
      console.error(err)
    }
    setLoading(false)
  }
  const getDayName = (date) => format(date, 'EEEE')

  const completeMonthlyData = Array.from({ length: today }, (_, index) => {
    const day = index + 1
    const revenueForDay = monthlyRevenue.find((item) => item._id.day === day)?.dailyRevenue || 0
    return {
      dayName: getDayName(new Date(new Date().getFullYear(), new Date().getMonth(), day)),
      date: format(new Date(new Date().getFullYear(), new Date().getMonth(), day), 'MMMM dd, yyyy'),
      dailyRevenue: revenueForDay,
    }
  })

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef.current) {
        setTimeout(() => {
          widgetChartRef.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef.current.update()
        })
      }
    })
    getCurrentMonthRevenue()
    getCurrentMonthGrowthRate()
  }, [widgetChartRef])

  // Function to export table to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Current Month Revenue Details', 14, 16)
    doc.autoTable({
      head: [['Day', 'Date', 'Revenue (TND)']],
      body: completeMonthlyData.map((item) => [
        item.dayName,
        item.date,
        item.dailyRevenue.toFixed(2),
      ]),
    })
    doc.save('current-month-revenue-details.pdf')
  }

  // Function to export table to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      completeMonthlyData.map((item) => ({
        Day: item.dayName,
        Date: item.date,
        'Revenue (TND)': item.dailyRevenue.toFixed(2),
      })),
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Current Month Revenue')
    XLSX.writeFile(workbook, 'current-month-revenue-details.xlsx')
  }

  return (
    <CRow className={className} xs={{ gutter: 4 }}>
      <CCol>
        <CWidgetStatsA
          color="info"
          value={
            !loading && monthlyRevenue ? (
              <>
                {completeMonthlyData.reduce((sum, item) => sum + item.dailyRevenue, 0).toFixed(2)}{' '}
                TND{' '}
                <small className={growth >= 0 ? 'text-success' : 'text-danger'}>
                  {growth}% {growth >= 0 ? '↑' : '↓'}
                </small>
                <span> ({previousMonthRevenue + '  TND'})</span>
              </>
            ) : (
              'Loading...'
            )
          }
          title={Language.CurrentMonthRevenue}
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: completeMonthlyData.map((item) => item.dayName),
                datasets: [
                  {
                    label: 'Current Month Revenue',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: completeMonthlyData.map((item) => item.dailyRevenue),
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
                    max: Math.max(...completeMonthlyData.map((item) => item.dailyRevenue), 0) * 1.2,
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
          <CModalTitle>Current Month Revenue Details</CModalTitle>
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
              {completeMonthlyData.map((item, index) => (
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
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

CurrentMonthRevenue.propTypes = {
  className: PropTypes.string,
}

export default CurrentMonthRevenue
