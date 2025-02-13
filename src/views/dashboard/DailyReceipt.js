import React, { useState, useEffect } from 'react'
import {
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CContainer,
  CCard,
  CCardBody,
  CCol,
  CRow,
} from '@coreui/react'
import axios from 'axios'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { GetToken } from '../../helpers/GetToken'
import { BaseUrl } from '../../helpers/BaseUrl'
import { useSelector } from 'react-redux'
import translations from '../../app/Language'

const OrdersComponent = () => {
  const [orders, setOrders] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalTips, setTotalTips] = useState(0) // State for total tips
  const [loading, setLoading] = useState(false)
  const token = GetToken() // Retrieve token from localStorage

  // Language
  const t = useSelector((state) => state.language)
  const Language = translations[t]

  // Function to fetch user orders
  const fetchOrders = async () => {
    if (!token) return // Ensure the token is present

    try {
      setLoading(true)
      const response = await axios.get(`${BaseUrl}/dashboard/daily-receipt`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      })

      // Extract the orders and total revenue and tips from the response
      setOrders(response.data.orders)
      console.log(response.data.orders)

      setTotalRevenue(response.data.totalRevenue)
      setTotalTips(response.data.orders.reduce((sum, order) => sum + (order.tips || 0), 0)) // Calculate total tips
    } catch (error) {
      console.error('Error fetching orders', error)
    } finally {
      setLoading(false)
    }
  }

  // Function to handle closing orders and generating receipt
  const handleCloseOrdersAndPrintReceipt = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await axios.post(`${BaseUrl}/dashboard/close-daily`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      generatePDFReceipt(response.data.closedOrders)
    } catch (error) {
      console.error('Error closing orders', error)
    } finally {
      setLoading(false)
    }
  }

  // Function to generate a PDF receipt
  const generatePDFReceipt = (orders) => {
    const doc = new jsPDF()

    doc.text('Receipt', 10, 10)

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.products.reduce((acc, p) => acc + p.total, 0),
      0,
    )

    const totalTips = orders.reduce((sum, order) => sum + (order.tips || 0), 0)

    const pageWidth = doc.internal.pageSize.width
    doc.text(`Total Revenue: ${totalRevenue.toFixed(2)} TND`, pageWidth - 60, 10)
    doc.text(`Total Tips: ${totalTips.toFixed(2)} TND`, pageWidth - 60, 20)

    doc.autoTable({
      head: [['Product', 'Quantity', 'Price', 'Total', 'Tips']],
      body: orders?.flatMap((order) =>
        order.products.map((product) => [
          product.name,
          product.quantity,
          product.price,
          product.total,
          order.tips || 0, // Include tips per order
        ]),
      ),
      startY: 30, // Start table below the title and total revenue
    })

    doc.save('receipt.pdf')
    fetchOrders()
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (!loading && orders.length === 0) {
    return (
      <CContainer className="text-center">
        <h2>{Language.noOrders}</h2>
      </CContainer>
    )
  }

  return (
    <CContainer>
      <CRow className="mb-4">
        <CCol sm={12} md={6}>
          <h2>
            {Language.user} {Language.orders}
          </h2>
        </CCol>
        <CCol sm={12} md={6} className="text-md-right">
          <h4>
            {Language.total} {Language.revenue}: {totalRevenue.toFixed(2)} TND
          </h4>
          <h4>
            {Language.total} {Language.tips || 'Tips'}: {totalTips.toFixed(2)} TND
          </h4>
        </CCol>
      </CRow>

      {loading ? (
        <p className="text-center">Loading orders...</p>
      ) : (
        <>
          <CTable hover striped responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>{Language.products}</CTableHeaderCell>
                <CTableHeaderCell>
                  {Language.total}
                  {Language.price}
                </CTableHeaderCell>
                <CTableHeaderCell>{Language.tips || 'Tips'}</CTableHeaderCell>
                <CTableHeaderCell>{Language.date}</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {orders?.map((order, index) => (
                <CTableRow key={order?.orderId}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>
                    {order.products.map((product, index) => (
                      <p key={index}>
                        {product?.productName} - {product.quantity} x {product?.productPrice} TND
                      </p>
                    ))}
                  </CTableDataCell>
                  <CTableDataCell>{order.totalPrice.toFixed(2)} TND</CTableDataCell>
                  <CTableDataCell>
                    {order?.tips ? order?.tips?.toFixed(2) + ' TND' : 0}{' '}
                  </CTableDataCell>
                  <CTableDataCell>{new Date(order.timestamp).toLocaleString()}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          <CCard className="mt-4">
            <CCardBody className="d-flex justify-content-center">
              <CButton
                color="primary"
                className="px-5 py-2"
                onClick={handleCloseOrdersAndPrintReceipt}
                disabled={loading}
              >
                {Language.dailyReceiptBtn}
              </CButton>
            </CCardBody>
          </CCard>
        </>
      )}
    </CContainer>
  )
}

export default OrdersComponent
