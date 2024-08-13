import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCardText,
  CRow,
  CCol,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CBadge,
  CFormCheck,
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'

const TableDetails = () => {
  const { tableId } = useParams()
  const [table, setTable] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalError, setModalError] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState([])
  const navigate = useNavigate()

  const fetchTableDetails = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${BaseUrl}/tables/${tableId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setTable(response.data)
      console.log(response.data)
    } catch (err) {
      setError('Error fetching table details')
      console.error(err)
    }
    setLoading(false)
  }
  useEffect(() => {
    fetchTableDetails()
  }, [tableId])

  const handleConfirmPayment = async (orderIds) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      console.log(orderIds)
      await axios.put(
        `${BaseUrl}/order/confirm/confirm-payment`,
        { orderIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', // Explicitly setting Content-Type
          },
        },
      )

      setModalMessage('Payment confirmed successfully')
      setModalError(false)
      setShowModal(true)
      fetchTableDetails()
      setSelectedOrders([])
    } catch (err) {
      setModalMessage('Error confirming payment')
      setModalError(true)
      setShowModal(true)
      console.error(err)
    }
    setLoading(false)
  }

  const handleSelectOrder = (orderId, orderPrice) => {
    setSelectedOrders((prevSelected) => {
      if (prevSelected.some((order) => order.orderId === orderId)) {
        return prevSelected.filter((order) => order.orderId !== orderId)
      } else {
        return [...prevSelected, { orderId, orderPrice }]
      }
    })
  }

  const handleConfirmAllPayments = () => {
    const allOrderIds = table.orders.map((order) => order._id)
    handleConfirmPayment(allOrderIds)
  }

  const handleConfirmSelectedPayments = () => {
    const selectedOrderIds = selectedOrders.map((order) => order.orderId)
    handleConfirmPayment(selectedOrderIds)
  }

  const calculateSelectedTotal = () => {
    return selectedOrders.reduce((acc, order) => acc + order.orderPrice, 0).toFixed(2)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <p className="text-danger">{error}</p>
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <CButton color="secondary" onClick={() => navigate(-1)}>
              Back
            </CButton>
            <strong className="ms-3">Table {table?.number} Details</strong>

            <div>
              <CButton
                color="success"
                className="me-2"
                onClick={handleConfirmAllPayments}
                disabled={!table?.orders.some((order) => !order.payed)}
              >
                Confirm All Payments
              </CButton>
              <CButton
                color="primary"
                onClick={handleConfirmSelectedPayments}
                disabled={selectedOrders.length === 0}
              >
                Confirm Selected Payments
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <CCardTitle>Total Orders: {table?.orders.length}</CCardTitle>
            <CRow>
              {table?.orders.map((order, index) => (
                <CCol xs={12} md={6} key={order._id}>
                  <CCard
                    className={`mb-4 ${
                      order.payed ? 'bg-success text-white' : 'bg-warning text-dark'
                    }`}
                  >
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <CCardTitle>Order number: {index + 1}</CCardTitle>
                          <div>
                            {order.products.map((product) => (
                              <div key={product._id}>
                                <strong>
                                  {product.quantity} x {product.product.name}
                                </strong>{' '}
                                - {product.product.price.toFixed(2)} TND
                              </div>
                            ))}
                            <div className="mt-2">
                              <strong>Total Price: {order.totalPrice.toFixed(2)} TND</strong>
                            </div>
                          </div>
                        </div>
                        {!order.payed && (
                          <div>
                            <CFormCheck
                              id={`order-${order._id}`}
                              onChange={() => handleSelectOrder(order._id, order.totalPrice)}
                              checked={selectedOrders.some(
                                (selected) => selected.orderId === order._id,
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              ))}
            </CRow>
            <div className="text-center mt-4">
              <strong>Total Selected Price: {calculateSelectedTotal()} TND</strong>
            </div>
            <div className="text-center mt-4">
              <strong>
                Total Table Price:{' '}
                {table?.orders
                  .filter((order) => !order.payed) // Filter unpaid orders
                  .reduce((acc, order) => acc + order.totalPrice, 0) // Sum the prices
                  .toFixed(2)}{' '}
                TND
              </strong>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

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
    </CRow>
  )
}

export default TableDetails
