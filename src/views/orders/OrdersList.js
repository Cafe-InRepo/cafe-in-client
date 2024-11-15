import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CSpinner,
  CBadge,
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
} from '@coreui/react'
import { BaseUrl } from '../../helpers/BaseUrl'
import axios from 'axios'
import { io } from 'socket.io-client'
import { GetToken } from '../../helpers/GetToken'

const OrdersTable = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeKey, setActiveKey] = useState(1)
  const token = GetToken()

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BaseUrl}/order/orders/ordersfifo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
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
    setLoading(true)
    try {
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
    } finally {
      setLoading(false)
    }
  }

  const renderOrderCard = (order) => (
    <CCard key={order._id} className="mb-3 shadow-sm">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center">
          <h5>Table {order.table.number}</h5>
          <CBadge
            color={
              order.status === 'pending'
                ? 'warning'
                : order.status === 'preparing'
                  ? 'info'
                  : 'success'
            }
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </CBadge>
        </div>
        <CAccordion flush>
          <CAccordionItem itemKey="1">
            <CAccordionHeader>Products</CAccordionHeader>
            <CAccordionBody>
              {order.products.map((product, index) => (
                <div key={index} className="d-flex justify-content-between my-2">
                  <span>
                    {product?.product?.name} x {product?.quantity}
                  </span>
                  <span>{(product?.product?.price * product?.quantity).toFixed(2)} TND</span>
                </div>
              ))}
            </CAccordionBody>
          </CAccordionItem>
        </CAccordion>
        {order.status !== 'completed' && (
          <div className="d-flex justify-content-end mt-3">
            <CButton
              color={order.status === 'pending' ? 'info' : 'success'}
              onClick={() =>
                updateOrderStatus(order._id, order.status === 'pending' ? 'preparing' : 'completed')
              }
              disabled={loading}
            >
              {loading ? (
                <CSpinner size="sm" />
              ) : order.status === 'pending' ? (
                'Move to Preparing'
              ) : (
                'Move to Completed'
              )}
            </CButton>
          </div>
        )}
      </CCardBody>
    </CCard>
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
                {loading ? (
                  <CSpinner />
                ) : (
                  orders.filter((order) => order.status === 'pending').map(renderOrderCard)
                )}
              </CTabPane>
              <CTabPane visible={activeKey === 2}>
                {loading ? (
                  <CSpinner />
                ) : (
                  orders.filter((order) => order.status === 'preparing').map(renderOrderCard)
                )}
              </CTabPane>
              <CTabPane visible={activeKey === 3}>
                {loading ? (
                  <CSpinner />
                ) : (
                  orders.filter((order) => order.status === 'completed').map(renderOrderCard)
                )}
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default OrdersTable
