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
        return acc + product.product.price
      }, 0)
      .toFixed(2)
  }

  useEffect(() => {
    if (!visible) {
      setSelectedProducts([]) // Reset selection when modal is closed
    }
  }, [visible])

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Select Products</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="mb-3">
          <CFormCheck
            id="selectAll"
            label="Select All"
            checked={selectedProducts.length === expandedProducts.filter((p) => !p.isPaid).length}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
        </div>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {expandedProducts.map((product) => (
            <CRow key={product.instanceId} className="align-items-center my-2">
              <CCol xs={9}>
                <div>
                  <strong>{product.product.name}</strong> - {product.product.price} TND
                </div>
              </CCol>
              <CCol xs={3} className="text-end">
                <CFormCheck
                  checked={selectedProducts.includes(product.instanceId)}
                  onChange={() => handleProductSelection(product.instanceId)}
                  disabled={product.isPaid} // Disable instances where payedQuantity is reached
                />
              </CCol>
            </CRow>
          ))}
        </div>
        <div className="mt-4 text-center">
          <strong>Total Selected: {calculateSelectedTotal()} TND</strong>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton
          color="secondary"
          onClick={() => {
            setSelectedProducts([]) // Reset selection on close
            onClose()
          }}
        >
          Close
        </CButton>
        <CButton
          color="primary"
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
