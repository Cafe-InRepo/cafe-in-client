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
  CBadge,
  CFormInput,
  CForm,
  CCardImage,
  CFormCheck,
  CAlert, // Import for alert messages
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'
import tableImage from 'src/assets/images/table.png'

const TablesDashboard = () => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalProducts, setModalProducts] = useState([]) // State for products list
  const [selectedProducts, setSelectedProducts] = useState([]) // State for selected products and their quantities
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('') // State for success messages
  const [searchQuery, setSearchQuery] = useState('') // State for search query
  const navigate = useNavigate()

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

  const fetchProducts = async (tableId) => {
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
    fetchProducts(tableId)
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
        { products, tableId: tables.find((table) => table._id)._id }, // Assuming the table is selected
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setShowModal(false)
      setSelectedProducts([])
      setSuccessMessage('Order placed successfully!')
    } catch (err) {
      setError('Error placing order')
      console.error('Error placing order', err)
    }
  }

  const filteredProducts = modalProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  useEffect(() => {
    fetchTables()
  }, [])

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Tables</strong>
              <CButton color="primary" onClick={() => setShowModal(true)}>
                Create Table
              </CButton>
            </CCardHeader>
            <CCardBody>
              {loading && <Loading />}
              {error && <CAlert color="danger">{error}</CAlert>}
              {successMessage && <CAlert color="success">{successMessage}</CAlert>}
              <CRow>
                {tables.map((table) => (
                  <CCol xs={12} sm={4} md={3} key={table._id}>
                    <CCard
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCardClick(table._id)}
                      className={table.unpaidOrders ? 'bg-danger text-white' : ''}
                    >
                      <CCardImage height="150" orientation="top" src={tableImage} />

                      <CCardBody>
                        <CCardTitle>Table {table.number}</CCardTitle>
                        {table.unpaidOrders && (
                          <CBadge
                            color="warning"
                            className="ms-2"
                            style={{ position: 'absolute', top: 10, right: 10 }}
                          >
                            Unpaid Orders
                          </CBadge>
                        )}
                      </CCardBody>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal for Product Selection */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Select Products</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {filteredProducts.map((product) => (
            <div key={product._id} className="d-flex justify-content-between align-items-center">
              <CFormCheck
                checked={!!selectedProducts.find((p) => p.productId === product._id)}
                onChange={() => handleProductSelect(product._id)}
              />
              <span>{product.name}</span>
              <CFormInput
                type="number"
                min="1"
                value={selectedProducts.find((p) => p.productId === product._id)?.quantity || 1}
                onChange={(e) => handleProductChange(product._id, e.target.value)}
                style={{ maxWidth: '60px' }}
              />
            </div>
          ))}
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handlePlaceOrder}>
            Place Order
          </CButton>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default TablesDashboard
