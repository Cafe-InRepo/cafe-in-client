import React, { useEffect, useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormCheck,
  CRow,
  CCol,
} from '@coreui/react'
import { GetToken } from '../../helpers/GetToken'
import { BaseUrl } from '../../helpers/BaseUrl'
import axios from 'axios'
import './ProductSelectionModal.css'
const ProductSelectionModal = ({ visible, onClose, products, orderId, refetchData }) => {
  const [selectedProducts, setSelectedProducts] = useState([]) // Track selected instances
  const [loading, setLoading] = useState(false)
  const token = GetToken()

  const handleConfirmPayment = async (orderId, productIds) => {
    setLoading(true)
    try {
      await axios.put(
        `${BaseUrl}/order/confirm/confirm-products-payment`,
        { orderId, productIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      console.log('Payment for selected products confirmed successfully')
      // After confirming payment, reset the selected products and refetch the data
      setSelectedProducts([]) // Reset selection
      refetchData() // Refetch the data (make sure this function is passed as a prop)
    } catch (err) {
      console.log('Error confirming payment for selected products')
      console.error(err)
    }
    setLoading(false)
  }

  // Expand products based on their quantity, assigning each instance a unique instanceId
  const expandedProducts = products.flatMap((product, productIndex) =>
    Array.from({ length: product.quantity }, (_, instanceIndex) => ({
      ...product,
      instanceId: `${product.product._id}-${instanceIndex}`,
      isPaid: instanceIndex < product.payedQuantity, // Flag instances as paid based on payedQuantity
    })),
  )

  const handleProductSelection = (instanceId) => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.includes(instanceId)) {
        return prevSelected.filter((p) => p !== instanceId)
      } else {
        return [...prevSelected, instanceId] // Store only the instanceId for confirmation
      }
    })
  }

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allProducts = expandedProducts
        .filter((product) => !product.isPaid) // Only select unpaid products
        .map((product) => product.instanceId) // Collect only instanceIds
      setSelectedProducts(allProducts)
    } else {
      setSelectedProducts([]) // Deselect all
    }
  }

  const calculateSelectedTotal = () => {
    return selectedProducts
      .reduce((acc, instanceId) => {
        const product = expandedProducts.find((p) => p.instanceId === instanceId)
        const discount =
          product.product.discountPercentage > 0
            ? (product.product.discountPercentage / 100) * product.product.price
            : 0
        const discountedPrice = product.product.price - discount
        return acc + discountedPrice
      }, 0)
      .toFixed(2)
  }

  useEffect(() => {
    if (!visible) {
      setSelectedProducts([]) // Reset selection when modal is closed
    }
  }, [visible])

  return (
    <CModal visible={visible} onClose={onClose} className="select-products-modal">
      <CModalHeader className="bg-primary text-white">
        <CModalTitle>Select Products</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {/* Select All Checkbox */}
        <div className="d-flex align-items-center mb-3">
          <CFormCheck
            id="selectAll"
            label="Select All"
            className="me-3"
            checked={selectedProducts.length === expandedProducts.filter((p) => !p.isPaid).length}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
          <span className="small text-muted">Select all unpaid items</span>
        </div>

        {/* Product List with Scrollable Area */}
        <div
          className="product-list"
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            background: '#f8f9fa',
          }}
        >
          {expandedProducts.map((product) => (
            <CRow
              key={product.instanceId}
              className={`align-items-center my-2 p-2 rounded product-item ${product.isPaid ? 'paid-product-item' : ''}`}
            >
              <CCol xs={9}>
                <div className="product-details">
                  <strong style={{ color: 'black' }}>{product.product.name}</strong>
                  <div className="small" style={{ color: 'black' }}>
                    {product.product.discountPercentage > 0
                      ? product.product.price -
                        (product.product.discountPercentage / 100) * product.product.price
                      : product.product.price}{' '}
                    TND
                  </div>
                  {product.isPaid && <span className="paid-badge">Paid</span>}
                </div>
              </CCol>
              <CCol xs={3} className="text-end">
                <CFormCheck
                  checked={selectedProducts.includes(product.instanceId)}
                  onChange={() => handleProductSelection(product.instanceId)}
                  disabled={product.isPaid} // Disable instances where payedQuantity is reached
                  className="custom-checkbox"
                />
              </CCol>
            </CRow>
          ))}
        </div>

        {/* Total Selected Price */}
        <div className="mt-4 text-center total-selected">
          <strong>Total Selected: {calculateSelectedTotal()} TND</strong>
        </div>
      </CModalBody>

      {/* Modal Footer with Buttons */}
      <CModalFooter className="d-flex justify-content-between">
        <CButton
          color="secondary"
          className="cancel-button"
          onClick={() => {
            setSelectedProducts([]) // Reset selection on close
            onClose()
          }}
        >
          Close
        </CButton>
        <CButton
          color="primary"
          className="confirm-button"
          onClick={() => {
            handleConfirmPayment(orderId, selectedProducts) // Send selected instanceIds
            onClose()
          }}
          disabled={selectedProducts.length === 0}
        >
          Confirm Selection
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ProductSelectionModal
