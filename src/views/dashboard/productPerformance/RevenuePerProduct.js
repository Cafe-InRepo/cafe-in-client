import CIcon from '@coreui/icons-react'
import { CButton, CButtonGroup, CCard, CCardBody, CCol, CRow } from '@coreui/react'
import MainChart from '../MainChart'
import RevenuePerProductPerDay from '../RevenuePerProductPerDay'
import { useState } from 'react'
import { cilCloudDownload } from '@coreui/icons'
import RevenuePerProduct2dates from '../RevenuePerProduct2dates'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable' // for table formatting in PDF
import * as XLSX from 'xlsx'

const RevenuePerProduct = () => {
  const [chartValue, setChartValue] = useState('Day')
  const [data, setData] = useState([]) // Assuming you store chart data here
  const [dataDay, setDataDay] = useState([]) // Assuming you store chart data here

  // Function to receive data from child components
  const handleDataUpdate = (newData) => {
    setData(newData)
    console.log(newData)
  }
  const handleDataUpdateDay = (newData) => {
    setDataDay(newData)
    console.log('newdata', newData)
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF()
    doc.text('Revenue per Product per month for current year', 10, 10)

    // Flatten the nested arrays of product data into a single array for autoTable
    const tableBody = data.flatMap((entry) =>
      entry?.products.map((item) => [item.productName, item.totalRevenue]),
    )

    autoTable(doc, {
      head: [['Product', 'Revenue en TND']],
      body: tableBody,
    })

    doc.save('revenue_per_product.pdf')
  }
  const handleDownloadPDFDay = () => {
    const doc = new jsPDF()
    doc.text('Revenue per Product per day for the current week', 10, 10)

    // Flatten the nested arrays of product data into a single array for autoTable
    const tableBody = dataDay.flatMap((entry) =>
      entry.products.map((item) => [item.productName, item.totalRevenue]),
    )

    autoTable(doc, {
      head: [['Product', 'Revenue en TND']],
      body: tableBody,
    })

    doc.save('revenue_per_product.pdf')
  }

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'RevenueData')
    XLSX.writeFile(workbook, 'revenue_per_product.xlsx')
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Revenue per product
              </h4>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton
                color="primary"
                className="float-end"
                onClick={chartValue === 'Month' ? handleDownloadPDF : handleDownloadPDFDay}
              >
                <CIcon icon={cilCloudDownload} /> PDF
              </CButton>
              <CButton color="primary" className="float-end me-2" onClick={handleDownloadExcel}>
                <CIcon icon={cilCloudDownload} /> Excel
              </CButton>
              <CButtonGroup className="float-end me-3">
                {['Day', 'Month'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === chartValue}
                    onClick={() => setChartValue(value)}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          {chartValue === 'Month' ? (
            <MainChart onDataUpdate={handleDataUpdate} />
          ) : (
            <RevenuePerProductPerDay onDataUpdate={handleDataUpdateDay} />
          )}
        </CCardBody>
      </CCard>
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Product's Revenue between 2 dates
              </h4>
            </CCol>
          </CRow>
          <RevenuePerProduct2dates />
        </CCardBody>
      </CCard>
    </>
  )
}

export default RevenuePerProduct
