import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CFormInput,
  CRow,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'

const CategoryDetails = () => {
  const { categoryId } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [modalContent, setModalContent] = useState('')
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productImg, setProductImg] = useState('')
  const [productAvailable, setProductAvailable] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${BaseUrl}/categories/${categoryId}`)
        setCategory(response.data)
        setProducts(response.data.products)
      } catch (err) {
        setError('Error fetching category details')
      }
      setLoading(false)
    }

    fetchCategoryDetails()
  }, [categoryId])

  const handleCreateProduct = async () => {
    try {
      const response = await axios.post(`${BaseUrl}/products`, {
        name: productName,
        description: productDescription,
        price: productPrice,
        img: productImg,
        available: productAvailable,
        categoryId: categoryId,
      })
      setProducts([...products, response.data.product])
      setProductName('')
      setProductDescription('')
      setProductPrice('')
      setProductImg('')
      setProductAvailable(true)
      setShowProductModal(false)
      setModalContent('Product created successfully')
    } catch (err) {
      setModalContent('Error creating product')
    }
    setShowModal(true)
  }

  const handleEditProduct = (productId) => {
    navigate(`/products/edit/${productId}`)
  }

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`${BaseUrl}/products/${productId}`)
      setProducts(products.filter((product) => product._id !== productId))
      setModalContent('Product deleted successfully')
    } catch (err) {
      setModalContent('Error deleting product')
    }
    setShowModal(true)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <CRow>
              <CCol>
                <CCardTitle>{category?.name}</CCardTitle>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
            {loading && <Loading />}
            {error && <p className="text-danger">{error}</p>}

            <CCol xs="auto">
              <CButton color="primary" className="mb-3" onClick={() => setShowProductModal(true)}>
                New Product
              </CButton>
            </CCol>
            <CRow>
              {products.map((product) => (
                <CCol xs={12} md={6} lg={4} key={product._id}>
                  <CCard className="mb-3">
                    <img src={product.img} alt={product.name} className="card-img-top" />
                    <CCardBody>
                      <h5>{product.name}</h5>
                      <p>{product.description}</p>
                      <p>Price: ${product.price}</p>

                      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <CButton
                          color="warning"
                          className="me-2 mb-2"
                          onClick={() => handleEditProduct(product._id)}
                        >
                          Edit
                        </CButton>
                        <CButton
                          color="danger"
                          className="mb-2"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </CButton>
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              ))}
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={showProductModal} onClose={() => setShowProductModal(false)}>
        <CModalHeader>
          <CModalTitle>New Product</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm
            onSubmit={(e) => {
              e.preventDefault()
              handleCreateProduct()
            }}
          >
            <CRow>
              <CCol md={12} className="mb-3">
                <CFormInput
                  type="text"
                  placeholder="Product name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormInput
                  type="text"
                  placeholder="Product description"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormInput
                  type="number"
                  placeholder="Price"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </CCol>
              <CCol md={12} className="mb-3">
                <CFormInput
                  type="text"
                  placeholder="Image URL"
                  value={productImg}
                  onChange={(e) => setProductImg(e.target.value)}
                />
              </CCol>
            </CRow>
            <CButton type="submit" color="primary">
              Add Product
            </CButton>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowProductModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>{modalContent.includes('Error') ? 'Error' : 'Success'}</CModalTitle>
        </CModalHeader>
        <CModalBody>{modalContent}</CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={() => setShowModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default CategoryDetails
