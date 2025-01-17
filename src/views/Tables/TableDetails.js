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
  CTooltip,
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'
import './TableDetails.css' // Import the CSS file
import { GetToken } from '../../helpers/GetToken'
import ProductSelectionModal from './ProductSelectionModal'
import { useSelector } from 'react-redux'

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
    return selectedOrders
      .reduce((total, selectedOrder) => {
        const fullOrder = table?.orders.find((order) => order._id === selectedOrder.orderId)
        if (!fullOrder) return total

        // Sum up the unpaid amount for each product in the selected order
        const unpaidTotal = fullOrder.products.reduce((acc, product) => {
          const unpaidQuantity = product.quantity - (product.payedQuantity || 0)
          return acc + unpaidQuantity * product.product.price
        }, 0)

        return total + unpaidTotal
      }, 0)
      .toFixed(2)
  }

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false)
  }
  const handleCloseModal = () => {
    setShowModal(false)
  }
  const handleDetailsClick = (index) => {
    setSelectedOrderIndex(index)
    setShowDetailsModal(true)
  }
  const handleRefetchData = () => {
    fetchTableDetails() // Refetch products when payment is confirmed or modal is closed
  }
  // Calculate total unpaid price for the order

  const handlePrintReceipt = () => {
    // Show the receipt
    const receiptElement = document.getElementById('receipt')
    receiptElement.style.display = 'block'

    // Trigger the print dialog
    window.print()

    // Hide the receipt after printing
    receiptElement.style.display = 'none'
  }

  //theme for colors change
  const storedTheme = useSelector((state) => state.theme)

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
          <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap">
            <CButton color="secondary" onClick={() => navigate(-1)}>
              Back
            </CButton>

            {/* Button Group */}
            <div className="d-flex flex-column flex-md-row align-items-center mt-2 mt-md-0">
              <CButton
                color="success"
                className="me-md-2 mb-2 mb-md-0 btn-sm"
                onClick={handleConfirmAllPayments}
                disabled={!table?.orders.some((order) => !order.payed)}
              >
                Confirm All
              </CButton>

              <CButton
                color="primary"
                className="mb-2 mb-md-0 btn-sm"
                onClick={handleConfirmSelectedPayments}
                disabled={selectedOrders.length === 0}
              >
                Confirm Selected
              </CButton>

              {selectedOrders.length > 0 && (
                <CButton color="info" className="ms-md-2 btn-sm" onClick={handlePrintReceipt}>
                  Print Receipt
                </CButton>
              )}
            </div>
          </CCardHeader>

          <CCardBody>
            <CCardTitle>Total Orders: {table?.orders.length}</CCardTitle>
            <CRow>
              {table?.orders.map((order, index) => {
                // Calculate total unpaid price for each order
                const totalUnpaidPrice = order.products.reduce((acc, product) => {
                  const unpaidQuantity = product?.quantity - (product?.payedQuantity || 0)
                  return acc + unpaidQuantity * product?.product?.price
                }, 0)

                return (
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
                        <CRow className="align-items-start">
                          <CCol>
                            <CButton color="light" size="sm" className="mb-2">
                              {index + 1}
                            </CButton>
                          </CCol>
                        </CRow>

                        {/* Products in the Middle */}
                        <CRow
                          className="product-list"
                          style={{
                            margin: '20px 0',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            padding: '10px',
                          }}
                        >
                          {order.products.map((product) => (
                            <CRow
                              key={product._id}
                              className={`align-items-center my-2 product-item ${product.payedQuantity === product.quantity ? 'bg-light' : ''}`}
                            >
                              <CCol xs={6}>
                                <strong style={{ color: 'black' }}>{product?.product?.name}</strong>
                                <div style={{ color: 'black' }} className="small">
                                  {product?.product?.price.toFixed(2)} TND
                                </div>
                              </CCol>
                              <CCol xs={6} className="text-end">
                                <span
                                  className="quantity"
                                  style={{ fontWeight: 'bold', color: 'black' }}
                                >
                                  x {product.quantity}
                                </span>
                                <div className="small" style={{ color: 'black' }}>
                                  {(product?.product?.price * product?.quantity).toFixed(2)} TND
                                </div>
                              </CCol>
                            </CRow>
                          ))}
                        </CRow>

                        {/* Details Button and Total Price */}
                        <CRow className="mt-3">
                          <CCol xs={6}>
                            <CButton
                              color="primary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDetailsClick(index)
                              }}
                              disabled={order.payed}
                            >
                              Details
                            </CButton>
                          </CCol>
                          <CCol xs={6} className="text-end">
                            <strong>Unpaid: {totalUnpaidPrice.toFixed(2)} TND</strong>
                          </CCol>
                          {order.tips && (
                            <CTooltip content={`Tip: ${order?.tips?.toFixed(2)} TND`}>
                              <span
                                style={{
                                  backgroundColor: '#ffc107',
                                  color: '#fff',
                                  padding: '1px 4px', // Smaller padding for a smaller badge
                                  borderRadius: '3px', // Slightly smaller border radius
                                  margin: '15px auto', // Margin from all directions and centered horizontally
                                  fontSize: '0.7rem', // Smaller font size
                                  display: 'inline-block', // To respect margin auto for centering
                                  cursor: 'pointer',
                                }}
                              >
                                Tip : {order.tips} TND
                              </span>
                            </CTooltip>
                          )}
                        </CRow>
                      </CCardBody>
                    </CCard>
                  </CCol>
                )
              })}
            </CRow>

            <CCardBody>
              <CRow className="mt-4">
                <CCol xs={12} md={6}>
                  <CCard className="unpaid-card bg-danger text-center text-white">
                    <CCardBody>
                      <h5>Unpaid Amount (Selected Orders)</h5>
                      <p className="display-6">{calculateSelectedTotal()} TND</p>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol xs={12} md={6}>
                  <CCard className="unpaid-card bg-primary text-center text-white">
                    <CCardBody>
                      <h5>Total Unpaid (Table)</h5>
                      <p className="display-6">
                        {table?.orders
                          .reduce((total, order) => {
                            const unpaidTotal = order.products.reduce((acc, product) => {
                              const unpaidQuantity = product.quantity - (product.payedQuantity || 0)
                              return acc + unpaidQuantity * product.product.price
                            }, 0)
                            return total + unpaidTotal
                          }, 0)
                          .toFixed(2)}{' '}
                        TND
                      </p>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CCardBody>

            <CCardBody>
              <CRow className="mt-4">
                <CCol xs={12} md={4}>
                  <CCard className="total-card bg-light text-center">
                    <CCardBody>
                      <h5>Total Unpaid (Without Tips)</h5>
                      <p className="display-6 text-danger">
                        {table?.orders
                          .reduce((total, order) => {
                            const unpaidTotal = order.products.reduce((acc, product) => {
                              const unpaidQuantity = product.quantity - (product.payedQuantity || 0)
                              return acc + unpaidQuantity * product.product.price
                            }, 0)
                            return total + unpaidTotal
                          }, 0)
                          .toFixed(2)}{' '}
                        TND
                      </p>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol xs={12} md={4}>
                  <CCard className="total-card bg-warning text-center">
                    <CCardBody>
                      <h5>Total Tips</h5>
                      <p className="display-6">
                        {table?.orders
                          .reduce((total, order) => total + (order.tips || 0), 0)
                          .toFixed(2)}{' '}
                        TND (paid:{' '}
                        {table?.orders
                          .reduce((total, order) => total + (order.payed ? order.tips || 0 : 0), 0)
                          .toFixed(2)}{' '}
                        TND)
                      </p>
                    </CCardBody>
                  </CCard>
                </CCol>

                <CCol xs={12} md={4}>
                  <CCard className="total-card bg-success text-center">
                    <CCardBody>
                      <h5>Total (With Tips)</h5>
                      <p className="display-6">
                        {table?.orders
                          .reduce((total, order) => {
                            const unpaidTotal = order.products.reduce((acc, product) => {
                              const unpaidQuantity = product.quantity - (product.payedQuantity || 0)
                              return acc + unpaidQuantity * product.product.price
                            }, 0)
                            return total + unpaidTotal + (order.tips || 0)
                          }, 0)
                          .toFixed(2)}{' '}
                        TND
                      </p>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CCardBody>
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
