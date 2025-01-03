import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CRow,
  CCol,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormInput,
  CFormCheck,
  CAlert,
  CPagination,
  CPaginationItem,
  CCardImage,
  CSpinner,
} from '@coreui/react'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'
import tableImage from 'src/assets/images/table.jpg'
import { useSelector } from 'react-redux'
import translations from '../../app/Language'

const TablesDashboard = () => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalProducts, setModalProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [tableSearchQuery, setTableSearchQuery] = useState('')
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5) // Number of items per page for pagination
  //language
  const t = useSelector((state) => state.language)
  const Language = translations[t]

  const fetchTables = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${BaseUrl}/tables`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setTables(response.data)
    } catch (err) {
      setError('Error fetching tables')
      console.error(err)
    }
    setLoading(false)
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${BaseUrl}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setModalProducts(response.data)
      setShowModal(true)
    } catch (err) {
      setError('Error fetching products')
      console.error('Error fetching products', err)
    }
  }

  const handleCardClick = (tableId) => {
    fetchProducts()
    setSelectedTableId(tableId)
  }

  const handleProductChange = (productId, quantity) => {
    setSelectedProducts((prevSelectedProducts) => {
      const existingProduct = prevSelectedProducts.find((p) => p.productId === productId)
      if (existingProduct) {
        return prevSelectedProducts.map((p) => (p.productId === productId ? { ...p, quantity } : p))
      } else {
        return [...prevSelectedProducts, { productId, quantity }]
      }
    })
  }

  const handleProductSelect = (productId) => {
    setSelectedProducts((prevSelectedProducts) => {
      if (prevSelectedProducts.find((p) => p.productId === productId)) {
        return prevSelectedProducts.filter((p) => p.productId !== productId)
      } else {
        return [...prevSelectedProducts, { productId, quantity: 1 }]
      }
    })
  }

  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem('token')
      const products = selectedProducts.map((product) => ({
        product: product.productId,
        quantity: product.quantity,
      }))

      await axios.post(
        `${BaseUrl}/order/manual`,
        { products, tableId: selectedTableId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setShowModal(false)
      setSelectedProducts([])
      setSuccessMessage('Order placed successfully!')
      fetchTables()
    } catch (err) {
      setError('Error placing order')
      console.error('Error placing order', err)
    }
  }

  const filteredTables = tables.filter((table) =>
    table.number.toString().includes(tableSearchQuery),
  )

  const filteredProducts = modalProducts.filter((product) =>
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase()),
  )

  const indexOfLastProduct = currentPage * itemsPerPage
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  useEffect(() => {
    fetchTables()
  }, [])

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('')
        setError('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, error])

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CFormInput
            placeholder={Language.search + ' ' + Language.table}
            value={tableSearchQuery}
            onChange={(e) => setTableSearchQuery(e.target.value)}
            className="mb-3"
          />
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>{Language.tables}</strong>
            </CCardHeader>
            <CCardBody>
              {loading && <Loading />}
              {error && <CAlert color="danger">{error}</CAlert>}
              {successMessage && <CAlert color="success">{successMessage}</CAlert>}
              <CRow>
                {filteredTables.map((table) => (
                  <CCol xs={6} sm={3} md={2} key={table._id}>
                    <CCard
                      style={{ cursor: 'pointer', marginBottom: 10 }}
                      onClick={() => handleCardClick(table._id)}
                      className={table.unpaidOrders ? 'bg-danger text-white' : ''}
                    >
                      <CCardImage height="150" orientation="top" src={tableImage} />

                      <CCardBody>
                        <CCardTitle>
                          {Language.table} {table.number}
                        </CCardTitle>
                      </CCardBody>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal
        visible={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedTableId(null)
        }}
      >
        <CModalHeader>
          <CModalTitle>{Language.selectProducts}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            placeholder={Language.search + ' ' + Language.products}
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
            className="mb-3"
          />
          {currentProducts.map((product) => (
            <div key={product._id} className="d-flex justify-content-between align-items-center">
              <CFormCheck
                checked={!!selectedProducts.find((p) => p.productId === product._id)}
                onChange={() => handleProductSelect(product._id)}
              />
              <span>{product.name}</span>
              <CFormInput
                type="number"
                min="1"
                value={selectedProducts.find((p) => p.productId === product._id)?.quantity || ''}
                onChange={(e) => handleProductChange(product._id, e.target.value)}
                style={{ maxWidth: '60px' }}
              />
            </div>
          ))}
          <CPagination aria-label="Product Pagination">
            {Array.from({
              length: Math.ceil(filteredProducts.length / itemsPerPage),
            }).map((_, index) => (
              <CPaginationItem
                key={index}
                active={index + 1 === currentPage}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </CPaginationItem>
            ))}
          </CPagination>
        </CModalBody>
        <CModalFooter>
          <CButton disabled={loading} color="primary" onClick={handlePlaceOrder}>
            {loading ? (
              <>
                {' '}
                <CSpinner />
                "Loading"
              </>
            ) : (
              Language.place + ' ' + Language.order
            )}
          </CButton>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            {Language.close}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default TablesDashboard
