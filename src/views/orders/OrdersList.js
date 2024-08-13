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
} from '@coreui/react'
import { BaseUrl } from '../../helpers/BaseUrl'
import axios from 'axios'

const OrdersTable = () => {
  const [orders, setOrders] = useState([])
  const [activeKey, setActiveKey] = useState(1)
  const fetchOrders = async () => {
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
    }
  }
  useEffect(() => {
    fetchOrders()
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
              <CTabPane visible={activeKey === 1}>{renderOrderTable('pending')}</CTabPane>
              <CTabPane visible={activeKey === 2}>{renderOrderTable('preparing')}</CTabPane>
              <CTabPane visible={activeKey === 3}>{renderOrderTable('completed')}</CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default OrdersTable
