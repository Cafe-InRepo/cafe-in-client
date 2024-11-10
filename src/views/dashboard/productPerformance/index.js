import React from 'react'
import { CCol, CRow, CCard, CCardBody, CCardHeader, CContainer } from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilCalendar, cilChart } from '@coreui/icons'
import MostSoldProducts from './MostSoldProducts'
import RevenuePerProduct from './RevenuePerProduct'
import ProductsRate from './ProductsRate'

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
      <RevenueCard icon={cilCalendar} title="Revenue Per Product">
        <RevenuePerProduct />
      </RevenueCard>
      <RevenueCard icon={cilCalendar} title="Most Sold Products">
        <MostSoldProducts />
      </RevenueCard>
      <RevenueCard icon={cilCalendar} title=" Products Rating">
        <ProductsRate />
      </RevenueCard>
    </CContainer>
  )
}

export default Sales
