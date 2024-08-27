import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CSpinner, // Import the CSpinner component for loading
} from '@coreui/react'
import { BaseUrl } from '../../helpers/BaseUrl'
import axios from 'axios'
import { io } from 'socket.io-client' // Import the Socket.IO client
import { GetToken } from '../../helpers/GetToken'
import Loading from '../../helpers/Loading'

const OrdersTable = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true) // Add loading state
  const [activeKey, setActiveKey] = useState(1)
  const token = GetToken()

  const fetchOrders = async () => {
    setLoading(true) // Set loading to true when fetching data
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${BaseUrl}/order/orders/ordersfifo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false) // Set loading to false after data is fetched
    }
  }

  useEffect(() => {
    fetchOrders()
    const socket = io(BaseUrl, {
      auth: { token },
    })

    socket.on('newOrder', () => {
      fetchOrders()
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${BaseUrl}/order/update-status/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.status === 200) {
        setOrders(
          orders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)),
        )
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
    }
  }

  const renderOrderTable = (status) => (
    <CTable striped responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell>#</CTableHeaderCell>
          <CTableHeaderCell>Table</CTableHeaderCell>
          <CTableHeaderCell>Products</CTableHeaderCell>
          <CTableHeaderCell>Status</CTableHeaderCell>
          <CTableHeaderCell>Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {orders
          .filter((order) => order.status === status)
          .map((order, index) => (
            <CTableRow key={order._id}>
              <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
              <CTableDataCell>{order.table.number}</CTableDataCell>
              <CTableDataCell>
                {order.products.map((product) => (
                  <div key={product.product._id}>
                    {product.product.name} x {product.quantity}
                  </div>
                ))}
              </CTableDataCell>
              <CTableDataCell>{order.status}</CTableDataCell>
              <CTableDataCell>
                {order.status !== 'completed' && (
                  <CButton
                    color="primary"
                    onClick={() =>
                      updateOrderStatus(
                        order._id,
                        order.status === 'pending' ? 'preparing' : 'completed',
                      )
                    }
                  >
                    {order.status === 'pending' ? 'Move to Preparing' : 'Move to Completed'}
                  </CButton>
                )}
              </CTableDataCell>
            </CTableRow>
          ))}
      </CTableBody>
    </CTable>
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Orders</strong>
          </CCardHeader>
          <CCardBody>
            <CNav variant="tabs" role="tablist">
              <CNavItem>
                <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>
                  Pending
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>
                  Preparing
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>
                  Completed
                </CNavLink>
              </CNavItem>
            </CNav>
            <CTabContent>
              <CTabPane visible={activeKey === 1}>
                {loading ? <Loading /> : renderOrderTable('pending')}
              </CTabPane>
              <CTabPane visible={activeKey === 2}>
                {loading ? <Loading /> : renderOrderTable('preparing')}
              </CTabPane>
              <CTabPane visible={activeKey === 3}>
                {loading ? <Loading /> : renderOrderTable('completed')}
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default OrdersTable
