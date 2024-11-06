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
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'
import './TableDetails.css' // Import the CSS file
import { GetToken } from '../../helpers/GetToken'
import ProductSelectionModal from './ProductSelectionModal'

const TableDetails = () => {
  const { tableId } = useParams()
  const [table, setTable] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalError, setModalError] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [selectedOrderIndex, setSelectedOrderIndex] = useState()
  const navigate = useNavigate()
  const token = GetToken()
  const fetchTableDetails = async () => {
    setLoading(true)
    try {
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
            'Content-Type': 'application/json',
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

  const handleSelectOrder = (orderId, orderPrice, isPayed) => {
    if (isPayed) return // Prevent selection if the order is already paid
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

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false)
  }
  const handleCloseModal = () => {
    setShowModal(false)
  }
  const handleDetailsClick = (index) => {
    setSelectedOrderIndex(index)
    console.log(index)
    setShowDetailsModal(true)
  }
  const handleRefetchData = () => {
    fetchTableDetails() // Refetch products when payment is confirmed or modal is closed
  }
  const handlePrintReceipt = () => {
    // Show the receipt
    const receiptElement = document.getElementById('receipt')
    receiptElement.style.display = 'block'

    // Trigger the print dialog
    window.print()

    // Hide the receipt after printing
    receiptElement.style.display = 'none'
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <p className="text-danger">{error}</p>
  }

  return (
    <CRow>
      <p className="ms-3 text-center">Table {table?.number}</p>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <CButton color="secondary" onClick={() => navigate(-1)}>
              Back
            </CButton>

            <div className="d-flex justify-content-between align-items-center">
              <CButton
                color="success"
                className="me-2 btn-sm"
                onClick={handleConfirmAllPayments}
                disabled={!table?.orders.some((order) => !order.payed)}
              >
                Confirm All
              </CButton>
              <CButton
                color="primary"
                className="btn-sm"
                onClick={handleConfirmSelectedPayments}
                disabled={selectedOrders.length === 0}
              >
                Confirm Selected
              </CButton>
              {selectedOrders.length > 0 && (
                <CButton color="info" className="btn-sm ms-2" onClick={handlePrintReceipt}>
                  Print Receipt
                </CButton>
              )}
            </div>
          </CCardHeader>
          <CCardBody>
            <CCardTitle>Total Orders: {table?.orders.length}</CCardTitle>
            <CRow>
              {table?.orders.map((order, index) => (
                <CCol xs={12} md={4} sm={6} key={order._id}>
                  <CCard
                    className={`card-container mb-4 ${
                      order.payed ? 'payed-border' : 'not-payed-border'
                    } ${
                      selectedOrders.some((selected) => selected.orderId === order._id)
                        ? 'selected-card'
                        : ''
                    }`}
                    onClick={() => handleSelectOrder(order._id, order.totalPrice, order.payed)}
                    style={{
                      cursor: order.payed ? 'not-allowed' : 'pointer',
                      opacity: order.payed ? 0.6 : 1,
                    }}
                  >
                    <CCardBody className="position-relative">
                      {/* Order Number on Top Left */}
                      <div className="position-absolute top-0 start-0 p-2 card-header">
                        <strong>{index + 1}</strong>
                      </div>

                      {/* Products in the Middle */}
                      <div className="text-center card-text">
                        {order.products.map((product) => (
                          <div key={product._id} className="my-2">
                            <strong>
                              {product.quantity} x {product.product.name}
                            </strong>{' '}
                            - {product?.product?.price?.toFixed(2)} TND
                          </div>
                        ))}
                      </div>

                      {/* Total Price on Bottom Right */}
                      <CButton
                        className="position-absolute bottom-0 start-0 p-2 m-2"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation() // Stop the event from propagating
                          handleDetailsClick(index)
                        }}
                      >
                        Details
                      </CButton>

                      <div className="position-absolute bottom-0 end-0 p-2 card-price">
                        <strong>Total: {order.totalPrice.toFixed(2)} TND</strong>
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
                  .filter((order) => !order.payed)
                  .reduce((acc, order) => acc + order.totalPrice, 0)
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
      <ProductSelectionModal
        visible={showDetailsModal}
        onClose={handleCloseDetailsModal}
        products={table?.orders[selectedOrderIndex]?.products || []} // Pass in the products of the selected order
        orderId={table?.orders[selectedOrderIndex]?._id}
        refetchData={handleRefetchData}
      />

      <div id="receipt" style={{ display: 'none' }}>
        <h2>Payment Receipt</h2>
        <p>Table: {table?.number}</p>
        <p>Date: {new Date().toLocaleDateString()}</p>
        <hr />
        {selectedOrders.map((order) => {
          const fullOrder = table?.orders.find((o) => o._id === order.orderId)
          return (
            <div key={order.orderId}>
              <p>Order ID: {order.orderId}</p>
              {fullOrder?.products.map((product) => (
                <p key={product._id}>
                  {product.quantity} x {product.product.name} - {product.product.price.toFixed(2)}{' '}
                  TND
                </p>
              ))}
              <p>
                <strong>Total: {order.orderPrice.toFixed(2)} TND</strong>
              </p>
              <hr />
            </div>
          )
        })}
        <p>
          <strong>Total Selected: {calculateSelectedTotal()} TND</strong>
        </p>
        <p>Thank you for your payment!</p>
      </div>
    </CRow>
  )
}

export default TableDetails
