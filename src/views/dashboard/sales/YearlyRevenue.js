import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CRow,
  CCol,
  CWidgetStatsA,
  CSpinner,
  CButton,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
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
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartLine } from '@coreui/react-chartjs'
import axios from 'axios'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { BaseUrl } from '../../../helpers/BaseUrl'
import { GetToken } from '../../../helpers/GetToken'

const YearlyRevenue = ({ className }) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  // Function to export table to PDF
  const exportToPDF = (yearlyRevenue) => {
    const doc = new jsPDF()
    doc.text('Yearly Revenue Details', 14, 16)
    doc.autoTable({
      head: [['Month', 'Revenue (TND)']],
      body: yearlyRevenue.map((item, index) => [months[index], item.revenue.toFixed(2)]),
    })
    doc.save('yearly-revenue-details.pdf')
  }

  // Function to export table to Excel
  const exportToExcel = (yearlyRevenue) => {
    const worksheet = XLSX.utils.json_to_sheet(
      yearlyRevenue.map((item, index) => ({
        Month: months[index],
        'Revenue (TND)': item.revenue.toFixed(2),
      })),
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Yearly Revenue')
    XLSX.writeFile(workbook, 'yearly-revenue-details.xlsx')
  }

  const token = GetToken()
  const [loading, setLoading] = useState(false)
  const [yearlyRevenue, setYearlyRevenue] = useState([])
  const [modalVisible, setModalVisible] = useState(false)

  // Fetching yearly revenue data
  const getYearlyRevenue = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BaseUrl}/dashboard/revenue-year`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setYearlyRevenue(response.data)
    } catch (err) {
      console.log('Error fetching yearly revenue')
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    getYearlyRevenue()
  }, [])

  const totalRevenue = yearlyRevenue.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)

  return (
    <CRow className={className} xs={{ gutter: 4 }}>
      <CCol>
        <CWidgetStatsA
          color="info"
          value={!loading ? <>{totalRevenue} TND</> : <CSpinner color="secondary" />}
          title="Yearly Revenue"
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: months,
                datasets: [
                  {
                    label: 'Yearly Revenue',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: yearlyRevenue.map((item) => item.revenue),
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    display: false,
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
                    max: Math.max(...yearlyRevenue.map((item) => item.revenue), 0) * 1.2,
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
                Details
              </CButton>
              <CDropdown>
                <CDropdownToggle color="secondary">Export</CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={() => exportToPDF(yearlyRevenue)}>
                    Export to PDF
                  </CDropdownItem>
                  <CDropdownItem onClick={() => exportToExcel(yearlyRevenue)}>
                    Export to Excel
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </div>
          }
        />
      </CCol>

      {/* Modal for Detailed Table */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader onClose={() => setModalVisible(false)}>
          <CModalTitle>Yearly Revenue Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Month</CTableHeaderCell>
                <CTableHeaderCell>Revenue (TND)</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {yearlyRevenue.map((item, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{months[index]}</CTableDataCell>
                  <CTableDataCell>{item.revenue.toFixed(2)}</CTableDataCell>
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

YearlyRevenue.propTypes = {
  className: PropTypes.string,
}

export default YearlyRevenue
