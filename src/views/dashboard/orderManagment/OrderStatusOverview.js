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
import axios from 'axios'
import { io } from 'socket.io-client'
import { BaseUrl } from '../../../helpers/BaseUrl'
import { GetToken } from '../../../helpers/GetToken'

const OrderStatusOverview = () => {
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
      console.log(response.data)
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
  function convertMinutesToDHM(minutes) {
    const days = Math.floor(minutes / (24 * 60))
    const hours = Math.floor((minutes % (24 * 60)) / 60)
    const mins = minutes % 60

    let result = []
    if (days > 0) result.push(`${days} days`)
    if (hours > 0) result.push(`${hours} hours`)
    if (mins > 0 || (days === 0 && hours === 0)) result.push(`${mins} minutes`)

    return result.join(', ')
  }

  const renderOrderCard = (order) => {
    return (
      <CCard key={order._id} className="mb-3 shadow-sm">
        <CCardBody>
          <div className="d-flex justify-content-between align-items-center">
            <h5>Table {order.table.number}</h5>
          </div>
          <CAccordion flush>
            <CAccordionItem itemKey="1">
              <CAccordionHeader>Products</CAccordionHeader>
              <CAccordionBody>
                {order?.products.map((product, index) => (
                  <div key={index} className="my-2">
                    <div className="d-flex justify-content-between">
                      <span>
                        {product?.product?.name} x {product.quantity}
                      </span>
                      <span>{(product?.product?.price * product?.quantity).toFixed(2)} TND</span>
                    </div>
                  </div>
                ))}
              </CAccordionBody>
            </CAccordionItem>
          </CAccordion>
          <div className="mt-3">
            <h6>Time Spent on:</h6>
            {Object.entries(order.statusDurations).map((duration, index) => {
              const durationInMinutes = (
                parseInt(duration[1].toString().replace(/[^\d]/g, ''), 10) / 60000
              ).toFixed(0)
              const formattedDuration = convertMinutesToDHM(durationInMinutes)

              return (
                <div key={index} className="d-flex justify-content-between">
                  <span>{duration[0]}</span>
                  <span>{formattedDuration}</span>
                </div>
              )
            })}
          </div>
        </CCardBody>
      </CCard>
    )
  }

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
              {loading ? (
                <CSpinner />
              ) : (
                <>
                  <CTabPane visible={activeKey === 1}>
                    {orders.filter((order) => order.status === 'pending').length > 0 ? (
                      orders.filter((order) => order.status === 'pending').map(renderOrderCard)
                    ) : (
                      <p className="mt-4">No pending orders.</p>
                    )}
                  </CTabPane>
                  <CTabPane visible={activeKey === 2}>
                    {orders.filter((order) => order.status === 'preparing').length > 0 ? (
                      orders.filter((order) => order.status === 'preparing').map(renderOrderCard)
                    ) : (
                      <p className="mt-4">No preparing orders.</p>
                    )}
                  </CTabPane>
                  <CTabPane visible={activeKey === 3}>
                    {orders.filter((order) => order.status === 'completed').length > 0 ? (
                      orders.filter((order) => order.status === 'completed').map(renderOrderCard)
                    ) : (
                      <p className="mt-4">Completed orders are archived.</p>
                    )}
                  </CTabPane>
                </>
              )}
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default OrderStatusOverview
