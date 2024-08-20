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
  CForm,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'
import tableImage from 'src/assets/images/table.png' // Assuming you have an image named table.png in your assets folder
import { io } from 'socket.io-client'
import { GetToken } from '../../helpers/GetToken'

const TablesDashboard = () => {
  const [tables, setTables] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalError, setModalError] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false) // State for create table modal
  const [tableNumber, setTableNumber] = useState('') // State for table number input
  const token = GetToken()

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

      // Calculate total price for each table based on orders
      const tablesWithTotalPrice = response.data.map((table) => {
        const totalPrice = table.orders.reduce((acc, order) => acc + order.totalPrice, 0)
        return { ...table, totalPrice }
      })

      setTables(tablesWithTotalPrice)
    } catch (err) {
      setError('Error fetching tables')
      console.error(err)
    }
    setLoading(false)
  }
  useEffect(() => {
    fetchTables()
    const socket = io(BaseUrl, {
      auth: { token },
    })

    socket.on('newOrder', () => {
      fetchTables()
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const handleCardClick = (tableId) => {
    navigate(`/tables/${tableId}`)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleCreateTable = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${BaseUrl}/tables`,
        { number: tableNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setModalMessage('Table created successfully')
      setModalError(false)
      setShowCreateModal(false)
      setTableNumber('') // Reset the table number input
      fetchTables() // Refresh the tables list
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setModalMessage(err.response.data.error) // Display the error message from the server
      } else {
        setModalMessage('Error creating table')
      }
      setModalError(true)
      console.error(err)
    }
    setLoading(false)
    setShowModal(true)
  }

  const filteredTables = tables.filter((table) => table.number.toString().includes(searchTerm))

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Tables</strong> <small>with Unpaid Orders</small>
              </div>
              <CButton color="primary" onClick={() => setShowCreateModal(true)}>
                Create Table
              </CButton>
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
                  <CCol xs={6} sm={3} md={2} key={table._id}>
                    <CCard
                      style={{ cursor: 'pointer', marginBottom: 10 }}
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
                        {/* <CCardText>
                          Total Price: {table.totalPrice.toFixed(2)} TND
                          <br />
                          Orders: {table.orders.length}
                        </CCardText> */}
                      </CCardBody>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Create Table Modal */}
      <CModal visible={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <CModalHeader>
          <CModalTitle>Create New Table</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleCreateTable}>
            <CFormInput
              type="number"
              placeholder="Enter table number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
            />
            <CButton type="submit" color="primary" style={{ marginTop: '10px' }}>
              Create Table
            </CButton>
          </CForm>
        </CModalBody>
      </CModal>

      {/* Success/Error Modal */}
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
