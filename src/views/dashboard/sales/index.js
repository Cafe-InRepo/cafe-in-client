import React from 'react'
import { CCol, CRow, CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilCalendar, cilChart } from '@coreui/icons'
import DailyRevenue from './DailyReveue'
import YearlyRevenue from './YearlyRevenue'
import CurrentMonthRevenue from './MonthlyRevenue'
import CurrentWeekRevenue from './WeeklyRevenue'
import RevenueBetweenDates from './RevenueBetweenDates'
import { useSelector } from 'react-redux'
import translations from '../../../app/Language'

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
  const t = useSelector((state) => state.language)
  const Language = translations[t]
  return (
    <CContainer className="d-flex flex-column align-items-center">
      <RevenueCard icon={cilCalendar} title={Language.DailyRevenue}>
        <DailyRevenue />
      </RevenueCard>

      <RevenueCard icon={cilChart} title={Language.WeeklyRevenue}>
        <CurrentWeekRevenue />
      </RevenueCard>

      <RevenueCard icon={cilChart} title={Language.MonthlyRevenue}>
        <CurrentMonthRevenue />
      </RevenueCard>

      <RevenueCard icon={cilChart} title={Language.YearlyRevenue}>
        <YearlyRevenue />
      </RevenueCard>

      <RevenueCard icon={cilChart} title={Language.RevenueBetween2Dates}>
        <RevenueBetweenDates />
      </RevenueCard>
    </CContainer>
  )
}

export default Sales
