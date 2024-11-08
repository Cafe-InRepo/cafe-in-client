import CIcon from '@coreui/icons-react'
import { CButton, CButtonGroup, CCard, CCardBody, CCardFooter, CCol, CRow } from '@coreui/react'
import MainChart from '../MainChart'
import RevenuePerProductPerDay from '../RevenuePerProductPerDay'
import { useState } from 'react'
import { cilCloudDownload } from '@coreui/icons'
import RevenuePerProduct2dates from '../RevenuePerProduct2dates'

const RevenuePerProduct = () => {
  const [chartValue, setChartValue] = useState('Day')

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
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
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
          {chartValue === 'Month' ? <MainChart /> : <RevenuePerProductPerDay />}
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
