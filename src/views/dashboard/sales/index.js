import React from 'react'
import { CCol, CRow, CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilCalendar, cilChart } from '@coreui/icons'
import DailyRevenue from './DailyReveue'
import YearlyRevenue from './YearlyRevenue'
import CurrentMonthRevenue from './MonthlyRevenue'
import CurrentWeekRevenue from './WeeklyRevenue'
import RevenueBetweenDates from './RevenueBetweenDates'


const Sales = (props) => {
  return (
    <CContainer className="d-flex flex-column align-items-center">
      <CRow className="w-100 mb-4 justify-content-center">
        <CCol xs={12} md={8} lg={8}>
          <CCard>
            <CCardHeader className="d-flex align-items-center justify-content-center">
              <CIcon icon={cilCalendar} className="me-2" />
              <strong>Daily Revenue</strong>
            </CCardHeader>
            <CCardBody>
              <DailyRevenue />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow className="w-100 mb-4 justify-content-center">
        <CCol xs={12} md={8} lg={8}>
          <CCard>
            <CCardHeader className="d-flex align-items-center justify-content-center">
              <CIcon icon={cilChart} className="me-2" />
              <strong>Weekly Revenue</strong>
            </CCardHeader>
            <CCardBody>
              <CurrentWeekRevenue />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow className="w-100 mb-4 justify-content-center">
        <CCol xs={12} md={8} lg={8}>
          <CCard>
            <CCardHeader className="d-flex align-items-center justify-content-center">
              <CIcon icon={cilChart} className="me-2" />
              <strong>Monthly Revenue</strong>
            </CCardHeader>
            <CCardBody>
              <CurrentMonthRevenue />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="w-100 justify-content-center">
        <CCol xs={12} md={8} lg={8}>
          <CCard>
            <CCardHeader className="d-flex align-items-center justify-content-center">
              <CIcon icon={cilChart} className="me-2" />
              <strong>Yearly Revenue</strong>
            </CCardHeader>
            <CCardBody>
              <YearlyRevenue />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow className="w-100 justify-content-center">
        <CCol xs={12} md={8} lg={8}>
          <CCard>
            <CCardHeader className="d-flex align-items-center justify-content-center">
              <CIcon icon={cilChart} className="me-2" />
              <strong>2 dates Revenue</strong>
            </CCardHeader>
            <CCardBody>
              <RevenueBetweenDates />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Sales
