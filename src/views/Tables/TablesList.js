import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCardText,
  CCardImage,
  CRow,
  CCol,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CBadge,
  CInputGroup,
  CFormInput,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'
import tableImage from 'src/assets/images/table.png' // Assuming you have an image named table.png in your assets folder

const TablesDashboard = () => {
  const [tables, setTables] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalError, setModalError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${BaseUrl}/tables`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Calculate total price for each table based on orders
        const tablesWithTotalPrice = response.data.map((table) => {
          const totalPrice = table.orders.reduce((acc, order) => acc + order.totalPrice, 0)
          return { ...table, totalPrice }
        })

        setTables(tablesWithTotalPrice)
        console.log(tablesWithTotalPrice)
      } catch (err) {
        setError('Error fetching tables')
        console.error(err)
      }
      setLoading(false)
    }
    fetchTables()
  }, [])

  const handleCardClick = (tableId) => {
    navigate(`/tables/${tableId}`)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const filteredTables = tables.filter((table) => table.number.toString().includes(searchTerm))

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Tables</strong> <small>with Unpaid Orders</small>
            </CCardHeader>
            <CCardBody>
              <CInputGroup className="mb-3">
                <CFormInput
                  type="text"
                  placeholder="Search by table number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CInputGroup>
              {loading && <Loading />}
              {error && <p className="text-danger">{error}</p>}
              <CRow>
                {filteredTables.map((table) => (
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
                          <CBadge color="warning" className="ms-2">
                            Unpaid Orders
                          </CBadge>
                        )}
                        <CCardText>
                          Total Price: {table.totalPrice.toFixed(2)} TND
                          <br />
                          Number of Orders: {table.orders.length}
                        </CCardText>
                        <CCardText>Click to view details</CCardText>
                      </CCardBody>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={showModal} onClose={handleCloseModal}>
        <CModalHeader>
          <CModalTitle>{modalError ? 'Error' : 'Success'}</CModalTitle>
        </CModalHeader>
        <CModalBody>{modalMessage}</CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleCloseModal}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default TablesDashboard
