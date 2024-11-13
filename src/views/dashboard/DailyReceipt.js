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
  CCardHeader,
  CCardBody,
  CSpinner,
} from '@coreui/react'
import axios from 'axios'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { GetToken } from '../../helpers/GetToken'
import { BaseUrl } from '../../helpers/BaseUrl'
import { cilFile, cilCash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const OrdersComponent = () => {
  const [orders, setOrders] = useState([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(false)
  const token = GetToken()

  const fetchOrders = async () => {
    if (!token) return

    try {
      setLoading(true)
      const response = await axios.get(`${BaseUrl}/dashboard/daily-receipt`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setOrders(response.data.orders)
      setTotalRevenue(response.data.totalRevenue)
    } catch (error) {
      console.error('Error fetching orders', error)
    } finally {
      setLoading(false)
    }
  }

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
        .flat(),
    })

    doc.text(`Total Revenue: ${totalRevenue}`, 10, 140)
    doc.save('receipt.pdf')
    fetchOrders()
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (orders.length === 0) {
    return (
      <CContainer>
        <h2 className="text-center">No orders for today</h2>
      </CContainer>
    )
  }

  return (
    <CContainer>
      <CCard className="mb-4">
        <CCardHeader className="bg-primary text-white">
          <h3 className="mb-0">Today's Orders</h3>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="d-flex justify-content-center">
              <CSpinner color="primary" />
            </div>
          ) : (
            <>
              <CTable hover striped responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Order #</CTableHeaderCell>
                    <CTableHeaderCell>Products</CTableHeaderCell>
                    <CTableHeaderCell>Total Price</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {orders.map((order, index) => (
                    <CTableRow key={order?.orderId}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>
                        {order.products.map((product, index) => (
                          <p key={index}>
                            {product?.productId?.name} - {product.quantity} x{' '}
                            {product?.productId?.price} TND
                          </p>
                        ))}
                      </CTableDataCell>
                      <CTableDataCell>{order.totalPrice.toFixed(2)} TND</CTableDataCell>
                      <CTableDataCell>{new Date(order.timestamp).toLocaleString()}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <div className="mt-4">
                <h4 className="d-flex justify-content-between">
                  <span>Total Revenue:</span>
                  <span>{totalRevenue.toFixed(2)} TND</span>
                </h4>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <CButton
                  color="success"
                  className="px-5"
                  onClick={handleCloseOrdersAndPrintReceipt}
                >
                  <CIcon icon={cilFile} className="mr-2" />
                  Generate Receipt
                </CButton>
                <CButton
                  color="danger"
                  className="ml-3 px-5"
                  onClick={handleCloseOrdersAndPrintReceipt}
                >
                  <CIcon icon={cilCash} className="mr-2" />
                  Close Orders
                </CButton>
              </div>
            </>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default OrdersComponent
