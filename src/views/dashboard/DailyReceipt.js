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
} from '@coreui/react'
import axios from 'axios'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { GetToken } from '../../helpers/GetToken'
import { BaseUrl } from '../../helpers/BaseUrl'

const OrdersComponent = () => {
  const [orders, setOrders] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(false)
  const token = GetToken() // Retrieve token from localStorage

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

      // Extract the orders and total revenue from the response
      setOrders(response.data.orders)
      console.log(response.data.orders)
      setTotalRevenue(response.data.totalRevenue)
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
      // Send request to close orders and fetch today's receipt
      const response = await axios.post(`${BaseUrl}/dashboard/close-daily`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      // After receiving the confirmation, generate the PDF
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
    doc.autoTable({
      head: [['Product', 'Quantity', 'Price', 'Total']],
      body: orders
        ?.map((order) =>
          order.products?.map((product) => [
            product.product.name,
            product.quantity,
            product.product.price,
            product.product.price * product.quantity,
          ]),
        )
        .flat(), // Flatten the nested array
    })

    doc.text(`Total Revenue: ${totalRevenue}`, 10, 140)
    doc.save('receipt.pdf')
    fetchOrders()
  }

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders()
  }, [])

  if (orders.length === 0) {
    return (
      <>
        <h2>You didn't get any orders for today</h2>
      </>
    )
  }
  return (
    <CContainer>
      <h2>User Orders</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <>
          {/* Table to display orders */}
          <CTable hover striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell></CTableHeaderCell>
                <CTableHeaderCell>Products</CTableHeaderCell>
                <CTableHeaderCell>Total Price</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {orders?.map((order, index) => (
                <CTableRow key={order?.orderId}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>
                    {order.products.map((product, index) => (
                      <p key={index}>
                        {product?.productId?.name} - {product.quantity} x {product?.productId?.price} TND
                      </p>
                    ))}
                  </CTableDataCell>
                  <CTableDataCell>{order.totalPrice.toFixed(2)} TND</CTableDataCell>
                  <CTableDataCell>{new Date(order.timestamp).toLocaleString()}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          {/* Display total revenue */}
          <h4>Total Revenue: {totalRevenue.toFixed(2)} TND</h4>

          {/* Button to generate receipt and close orders */}
          <CButton color="primary" className="px-4" onClick={handleCloseOrdersAndPrintReceipt}>
            Get Today's Receipt and Close Orders
          </CButton>
        </>
      )}
    </CContainer>
  )
}

export default OrdersComponent
