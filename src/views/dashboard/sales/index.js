import React from 'react'
import { CCol, CRow, CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilCalendar, cilChart } from '@coreui/icons'
import DailyRevenue from './DailyReveue'
import YearlyRevenue from './YearlyRevenue'
import CurrentMonthRevenue from './MonthlyRevenue'
import CurrentWeekRevenue from './WeeklyRevenue'
import RevenueBetweenDates from './RevenueBetweenDates'

// Reusable Card Component to avoid repetition
const RevenueCard = ({ icon, title, children }) => (
  <CRow className="w-100 mb-4 justify-content-center">
    <CCol xs={12} md={8} lg={8}>
      <CCard>
        <CCardHeader className="d-flex align-items-center justify-content-center">
          <CIcon icon={icon} className="me-2" />
          <strong>{title}</strong>
        </CCardHeader>
        <CCardBody>{children}</CCardBody>
      </CCard>
    </CCol>
  </CRow>
)

const Sales = () => {
  return (
    <CContainer className="d-flex flex-column align-items-center">
      <RevenueCard icon={cilCalendar} title="Daily Revenue">
        <DailyRevenue />
      </RevenueCard>

      <RevenueCard icon={cilChart} title="Weekly Revenue">
        <CurrentWeekRevenue />
      </RevenueCard>

      <RevenueCard icon={cilChart} title="Monthly Revenue">
        <CurrentMonthRevenue />
      </RevenueCard>

      <RevenueCard icon={cilChart} title="Yearly Revenue">
        <YearlyRevenue />
      </RevenueCard>

      <RevenueCard icon={cilChart} title="Revenue Between 2 Dates">
        <RevenueBetweenDates />
      </RevenueCard>
    </CContainer>
  )
}

export default Sales
