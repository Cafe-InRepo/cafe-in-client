import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CButton,
} from '@coreui/react'
import { cilStar } from '@coreui/icons'
import { BaseUrl } from '../../../helpers/BaseUrl'
import CIcon from '@coreui/icons-react'

const ProductsRate = () => {
  const [productRatings, setProductRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Number of items per page

  useEffect(() => {
    const fetchProductRatings = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${BaseUrl}/products/rates`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setProductRatings(response.data)
      } catch (error) {
        console.error('Failed to fetch product ratings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProductRatings()
  }, [])

  const lastIndex = currentPage * itemsPerPage
  const firstIndex = lastIndex - itemsPerPage
  const currentProducts = productRatings.slice(firstIndex, lastIndex)
  const totalPages = Math.ceil(productRatings.length / itemsPerPage)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  if (loading) {
    return <CSpinner color="primary" />
  }

  return (
    <div>
      <h3 className="mb-4">Product Ratings</h3>
      <CTable hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Product Name</CTableHeaderCell>
            <CTableHeaderCell>Rate</CTableHeaderCell>
            <CTableHeaderCell>Number of Raters</CTableHeaderCell>
            <CTableHeaderCell>Price (TND)</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentProducts.map((product) => (
            <CTableRow key={product.productId}>
              <CTableDataCell>{product.productName}</CTableDataCell>
              <CTableDataCell>
                {product.rate.toFixed(2)} <CIcon icon={cilStar} className="me-2" />
              </CTableDataCell>
              <CTableDataCell>{product.raters}</CTableDataCell>
              <CTableDataCell>{product.price.toFixed(2)} TND</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <div className="d-flex justify-content-between mt-3">
        <CButton color="primary" onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </CButton>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <CButton color="primary" onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </CButton>
      </div>
    </div>
  )
}

export default ProductsRate
