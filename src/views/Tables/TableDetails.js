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
  CFormInput,
  CPagination,
  CFormCheck,
  CPaginationItem,
  CSpinner,
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'
import './TableDetails.css' // Import the CSS file
import { GetToken } from '../../helpers/GetToken'
import ProductSelectionModal from './ProductSelectionModal'
import { useSelector } from 'react-redux'
import translations from '../../app/Language'
import jsPDF from 'jspdf'

const TableDetails = () => {
  const { tableId } = useParams()
  const [table, setTable] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showMaualModal, setShowManualModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalError, setModalError] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [selectedOrderIndex, setSelectedOrderIndex] = useState()
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [successMessage, setSuccessMessage] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5) // Number of items per page for pagination

  const navigate = useNavigate()
  const token = GetToken()
  //language
  const t = useSelector((state) => state.language)
  const Language = translations[t]
  //deal with placing nmanually
  const [modalProducts, setModalProducts] = useState([])

  const filteredProducts = modalProducts.filter((product) =>
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase()),
  )

  const indexOfLastProduct = currentPage * itemsPerPage
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  //fetch all current user products
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setModalProducts(response.data)
      //setShowModal(true)
    } catch (err) {
      setError('Error fetching products')
      console.error('Error fetching products', err)
    }
  }

  //handling product changing
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
  // handling product selection
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
    setLoading(true)
    try {
      const products = selectedProducts.map((product) => ({
        product: product.productId,
        quantity: product.quantity,
      }))

      await axios.post(
        `${BaseUrl}/order/manual`,
        { products, tableId: table._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setShowManualModal(false)
      setSelectedProducts([])
      setModalMessage('Order placed successfully')
      setModalError(false)
      setShowModal(true)
      setLoading(false)
    } catch (err) {
      setShowManualModal(false)
      //setError('Error placing order')
      console.error('Error placing order', err.response.data.error)
      setModalMessage(err.response.data.error)
      setModalError(true)
      setShowModal(true)
      setLoading(false)
    }
  }
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
  const [placeDetails, setPlaceDetails] = useState()
  const fetchPlaceDetails = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BaseUrl}/auth/place-details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setPlaceDetails(response.data)
      console.log(response.data)
    } catch (err) {
      setError('Error fetching place details')
      console.error(err)
    }
    setLoading(false)
  }
  useEffect(() => {
    fetchTableDetails()
    fetchProducts()
    fetchPlaceDetails()
  }, [tableId])

  const handleConfirmPayment = async (orderIds) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      console.log(orderIds)
      const response = await axios.put(
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
          const discount =
            product.product.discountPercentage > 0
              ? (product.product.discountPercentage / 100) * product.product.price
              : 0
          const discountedPrice = product.product.price - discount
          return acc + unpaidQuantity * discountedPrice
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
    const doc = new jsPDF()

    // Set up margins and initial position
    const marginLeft = 10
    const marginTop = 20
    let yPos = marginTop

    // Add restaurant logo (placeholder)
    const logoUrl = 'https://th.bing.com/th/id/OIP.REqzysVeL8E29CU3Is72ywHaE7?rs=1&pid=ImgDetMain' // Replace with your logo URL
    const logoWidth = 50
    const logoHeight = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const logoX = (pageWidth - logoWidth) / 2 // Center the logo horizontally
    doc.addImage(logoUrl, 'PNG', logoX, yPos, logoWidth, logoHeight)
    yPos += 25 // Move down after the logo

    // Add restaurant name and location
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    const restaurantName = placeDetails.placeName
    const restaurantNameWidth = doc.getTextWidth(restaurantName)
    const restaurantNameX = (pageWidth - restaurantNameWidth) / 2 // Center the restaurant name
    doc.text(restaurantName, restaurantNameX, yPos)
    yPos += 10

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const restaurantLocation = 'location'
    const restaurantLocationWidth = doc.getTextWidth(restaurantLocation)
    const restaurantLocationX = (pageWidth - restaurantLocationWidth) / 2 // Center the location
    doc.text(restaurantLocation, restaurantLocationX, yPos)
    yPos += 10

    // Add table number, waiter's name, and dates
    const tableNumberText = `Table Number: ${table?.number}`
    const tableNumberX = (pageWidth - doc.getTextWidth(tableNumberText)) / 2
    doc.text(tableNumberText, tableNumberX, yPos)
    yPos += 7

    const waiterNameText = `Waiter's Name: John Doe`
    const waiterNameX = (pageWidth - doc.getTextWidth(waiterNameText)) / 2
    doc.text(waiterNameText, waiterNameX, yPos)
    yPos += 7

    const orderDateText = `Order Date: ${new Date().toLocaleDateString()}`
    const orderDateX = (pageWidth - doc.getTextWidth(orderDateText)) / 2
    doc.text(orderDateText, orderDateX, yPos)
    yPos += 7

    const printDateText = `Print Date: ${new Date().toLocaleDateString()}`
    const printDateX = (pageWidth - doc.getTextWidth(printDateText)) / 2
    doc.text(printDateText, printDateX, yPos)
    yPos += 7

    const wifiPasswordText = `WiFi Password: guest123`
    const wifiPasswordX = (pageWidth - doc.getTextWidth(wifiPasswordText)) / 2
    doc.text(wifiPasswordText, wifiPasswordX, yPos)
    yPos += 15

    // Add a line separator
    doc.setLineWidth(0.5)
    doc.line(marginLeft, yPos, pageWidth - marginLeft, yPos)
    yPos += 10

    // Add orders
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    const orderDetailsText = 'Order Details'
    const orderDetailsX = (pageWidth - doc.getTextWidth(orderDetailsText)) / 2
    doc.text(orderDetailsText, orderDetailsX, yPos)
    yPos += 10

    table?.orders.forEach((order, index) => {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      const orderText = `Order ${index + 1}`
      const orderX = (pageWidth - doc.getTextWidth(orderText)) / 2
      doc.text(orderText, orderX, yPos)
      yPos += 7

      // Add products in the order
      order.products.forEach((product) => {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        const discount =
          product.product.discountPercentage > 0
            ? (product.product.discountPercentage / 100) * product.product.price
            : 0
        const discountedPrice = product.product.price - discount
        const productText = `${product.quantity} x ${product.product.name} - ${discountedPrice.toFixed(2)} TND`
        const productX = (pageWidth - doc.getTextWidth(productText)) / 2
        doc.text(productText, productX, yPos)
        yPos += 7
      })

      // Add total for the order
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      const orderTotalText = `Total: ${order.totalPrice.toFixed(2)} TND`
      const orderTotalX = (pageWidth - doc.getTextWidth(orderTotalText)) / 2
      doc.text(orderTotalText, orderTotalX, yPos)
      yPos += 7

      // Add tips if any
      if (order.tips) {
        const tipsText = `Tips: ${order.tips.toFixed(2)} TND`
        const tipsX = (pageWidth - doc.getTextWidth(tipsText)) / 2
        doc.text(tipsText, tipsX, yPos)
        yPos += 7
      }

      // Add a line separator between orders
      doc.setLineWidth(0.2)
      doc.line(marginLeft, yPos, pageWidth - marginLeft, yPos)
      yPos += 10
    })

    // Add total amount and total tips for the entire table
    const totalAmount = table?.orders
      .reduce((total, order) => total + order.totalPrice, 0)
      .toFixed(2)
    const totalTips = table?.orders
      .reduce((total, order) => total + (order.tips || 0), 0)
      .toFixed(2)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    const totalAmountText = `Total Amount: ${totalAmount} TND`
    const totalAmountX = (pageWidth - doc.getTextWidth(totalAmountText)) / 2
    doc.text(totalAmountText, totalAmountX, yPos)
    yPos += 7

    const totalTipsText = `Total Tips: ${totalTips} TND`
    const totalTipsX = (pageWidth - doc.getTextWidth(totalTipsText)) / 2
    doc.text(totalTipsText, totalTipsX, yPos)
    yPos += 7

    // Add a thank you message
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    const thankYouText = 'Thank you for dining with us!'
    const thankYouX = (pageWidth - doc.getTextWidth(thankYouText)) / 2
    doc.text(thankYouText, thankYouX, yPos)

    // Save the PDF
    doc.save(`table_${table?.number}_receipt.pdf`)
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
            <div className="d-flex align-items-center">
              {/* Back Button */}
              <CButton className="ms-2 btn-sm" color="secondary" onClick={() => navigate(-1)}>
                Back
              </CButton>

              {/* Place Order Button */}
            </div>

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

              <CButton color="info" className="ms-md-2 btn-sm" onClick={handlePrintReceipt}>
                Print Receipt
              </CButton>
            </div>
          </CCardHeader>

          <CCardBody>
            <CButton
              color="warning"
              className="ms-2 btn-sm mb-4"
              onClick={() => setShowManualModal(true)} // Add your function for placing an order here
            >
              Place Order
            </CButton>
            <CCardTitle>Total Orders: {table?.orders.length}</CCardTitle>
            <CRow>
              {table?.orders.map((order, index) => {
                // Calculate total unpaid price for each order
                const totalUnpaidPrice = order.products.reduce((acc, product) => {
                  const unpaidQuantity = product?.quantity - (product?.payedQuantity || 0)
                  const discount =
                    product.product.discountPercentage > 0
                      ? (product.product.discountPercentage / 100) * product.product.price
                      : 0
                  const discountedPrice = product.product.price - discount
                  return acc + unpaidQuantity * discountedPrice
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
                                  {product.product.discountPercentage > 0
                                    ? product.product.price -
                                      (product.product.discountPercentage / 100) *
                                        product.product.price
                                    : product.product.price.toFixed(2)}{' '}
                                  TND
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
                                  {(product.product.discountPercentage > 0
                                    ? product.product.price -
                                      (product.product.discountPercentage / 100) *
                                        product.product.price
                                    : product.product.price * product?.quantity
                                  ).toFixed(2)}{' '}
                                  TND
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

            {table?.orders.length > 0 && (
              <>
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
                                  const unpaidQuantity =
                                    product.quantity - (product.payedQuantity || 0)
                                  const discount =
                                    product.product.discountPercentage > 0
                                      ? (product.product.discountPercentage / 100) *
                                        product.product.price
                                      : 0
                                  const discountedPrice = product.product.price - discount
                                  return acc + unpaidQuantity * discountedPrice
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
                                  const unpaidQuantity =
                                    product.quantity - (product.payedQuantity || 0)
                                  const discount =
                                    product.product.discountPercentage > 0
                                      ? (product.product.discountPercentage / 100) *
                                        product.product.price
                                      : 0
                                  const discountedPrice = product.product.price - discount
                                  return acc + unpaidQuantity * discountedPrice
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
                              .reduce(
                                (total, order) => total + (order.payed ? order.tips || 0 : 0),
                                0,
                              )
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
                                  const unpaidQuantity =
                                    product.quantity - (product.payedQuantity || 0)
                                  const discount =
                                    product.product.discountPercentage > 0
                                      ? (product.product.discountPercentage / 100) *
                                        product.product.price
                                      : 0
                                  const discountedPrice = product.product.price - discount
                                  return acc + unpaidQuantity * discountedPrice
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
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <CModal
        visible={showModal}
        onClose={handleCloseModal}
        className={modalError ? 'modal-error' : 'modal-success'}
      >
        <CModalHeader className={modalError ? 'header-error' : 'header-success'}>
          <CModalTitle>{modalError ? 'Error' : 'Success'}</CModalTitle>
        </CModalHeader>
        <CModalBody className={modalError ? 'body-error' : 'body-success'}>
          {modalMessage}
        </CModalBody>
        <CModalFooter className={modalError ? 'footer-error' : 'footer-success'}>
          <CButton color={modalError ? 'danger' : 'success'} onClick={handleCloseModal}>
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

      {
        //place order manually modal
      }
      <CModal visible={showMaualModal} onClose={() => setShowManualModal(false)} size="lg">
        <CModalHeader className="bg-light">
          <CModalTitle className="text-primary">{Language.selectProducts}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            placeholder={`${Language.search} ${Language.products}`}
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
            className="mb-4"
            aria-label="Search Products"
          />

          <div className="product-list">
            {currentProducts.length ? (
              currentProducts.map((product) => (
                <div
                  key={product._id}
                  className="d-flex justify-content-between align-items-center p-2 border-bottom"
                >
                  <div className="d-flex align-items-center gap-3">
                    <CFormCheck
                      checked={!!selectedProducts.find((p) => p.productId === product._id)}
                      onChange={() => handleProductSelect(product._id)}
                      aria-label={`Select ${product.name}`}
                    />
                    <span className="product-name">
                      {product.name} ({product.description})
                    </span>
                  </div>
                  <CFormInput
                    type="number"
                    min="1"
                    value={
                      selectedProducts.find((p) => p.productId === product._id)?.quantity || ''
                    }
                    onChange={(e) => handleProductChange(product._id, e.target.value)}
                    style={{ maxWidth: '80px' }}
                    aria-label={`Quantity for ${product.name}`}
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-muted">{Language.noProductsFound}</p>
            )}
          </div>

          <div className="d-flex justify-content-center mt-3">
            <CPagination aria-label="Product Pagination">
              {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }).map(
                (_, index) => (
                  <CPaginationItem
                    key={index}
                    active={index + 1 === currentPage}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </CPaginationItem>
                ),
              )}
            </CPagination>
          </div>
        </CModalBody>
        <CModalFooter className="bg-light d-flex justify-content-between">
          <CButton
            disabled={loading}
            color="primary"
            onClick={handlePlaceOrder}
            className="d-flex align-items-center gap-2"
          >
            {loading ? (
              <>
                <CSpinner size="sm" />
                {Language.loading}
              </>
            ) : (
              `${Language.place} ${Language.order}`
            )}
          </CButton>
          <CButton color="secondary" onClick={() => setShowManualModal(false)}>
            {Language.close}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default TableDetails
