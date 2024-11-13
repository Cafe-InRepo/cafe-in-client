import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CSpinner,
  CCardFooter,
  CAlert,
} from '@coreui/react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import { cilPencil, cilTrash, cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const CategoryDetails = () => {
  const { id } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [productToEdit, setProductToEdit] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newProductData, setNewProductData] = useState({
    name: '',
    description: '',
    price: '',
    img: '',
  })
  const [tempSrc, setTempSrc] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const fetchCategoryDetails = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${BaseUrl}/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setCategory(response.data.category)
      setProducts(response.data.products)
      setFilteredProducts(response.data.products)
    } catch (err) {
      console.error('Error fetching category details', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCategoryDetails()
  }, [id])

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }, [searchQuery, products])
  const handleErrorDisplay = (er) => {
    setErrorMsg(er)

    // Set a timeout to clear the error message after 5 seconds
    setTimeout(() => {
      setErrorMsg(null)
    }, 3000) // 5000 milliseconds = 5 seconds
  }

  const handleAddProduct = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${BaseUrl}/products`,
        {
          ...newProductData,
          categoryId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setLoading(false)
      setNewProductData({
        name: '',
        description: '',
        price: '',
        img: '',
      })
      setTempSrc(null)
      setShowAddModal(false)
      fetchCategoryDetails()
    } catch (err) {
      setLoading(false)
      handleErrorDisplay(err.response.data.error)
      console.error('Error adding product', err.response.data.error)
    }
  }

  const handleEditProduct = (product) => {
    setTempSrc(product.img)
    setProductToEdit(product)
    setNewProductData({ ...product })
    setShowEditModal(true)
  }

  const handleSaveEditedProduct = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${BaseUrl}/products/${productToEdit._id}`,
        { ...newProductData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setLoading(false)
      setNewProductData({
        name: '',
        description: '',
        price: '',
        img: '',
      })
      setTempSrc(null)
      setShowEditModal(false)
      fetchCategoryDetails()
    } catch (err) {
      setLoading(false)
      handleErrorDisplay(err.response.data.error)
      console.error('Error editing product', err)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${BaseUrl}/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        fetchCategoryDetails()
      } catch (err) {
        console.error('Error deleting product', err)
      }
    }
  }
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    previewFile(file)
  }
  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setTempSrc(reader.result)
      setNewProductData((prevData) => ({
        ...prevData,
        img: reader.result,
      }))
    }
  }

  if (loading) return <CSpinner color="primary" />

  return (
    <div>
      <h1 className="mb-4">{category?.name}</h1>
      <CInputGroup className="mb-3">
        <CInputGroupText>
          <CIcon icon={cilSearch} />
        </CInputGroupText>
        <CFormInput
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </CInputGroup>
      <div className="d-flex justify-content-end mt-4 mb-4">
        <CButton color="success" onClick={() => setShowAddModal(true)}>
          Add New Product
        </CButton>
      </div>

      <CRow className="g-4">
        {filteredProducts.length === 0 ? (
          <div>
            <h3>there are no products!</h3>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <CCol key={product._id} xs={12} sm={6} md={4}>
              <CCard className="shadow-sm h-100">
                <CCardBody>
                  {/* Display product image */}
                  {product.img && (
                    <div className="mb-3">
                      <img
                        src={product.img}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '5px',
                        }}
                      />
                    </div>
                  )}
                  <h5 className="card-title">{product.name}</h5>
                  <p className="card-text">{product.description}</p>
                  <p className="text-muted">Price: {product.price} TND</p>
                </CCardBody>
                <CCardFooter>
                  <div className="d-flex justify-content-end">
                    <CIcon
                      icon={cilPencil}
                      size="lg"
                      style={{ cursor: 'pointer', marginRight: '15px' }}
                      onClick={() => handleEditProduct(product)}
                    />
                    <CIcon
                      icon={cilTrash}
                      size="lg"
                      style={{ cursor: 'pointer', color: 'red' }}
                      onClick={() => handleDeleteProduct(product._id)}
                    />
                  </div>
                </CCardFooter>
              </CCard>
            </CCol>
          ))
        )}
      </CRow>

      {/* Add Product Modal */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <CModalHeader>
          <CModalTitle>Add Product</CModalTitle>
        </CModalHeader>
        {errorMsg && <CAlert color="danger">{errorMsg}</CAlert>}
        <CModalBody>
          <CForm>
            <CFormInput
              required
              label="Name"
              value={newProductData.name}
              onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
            />
            <CFormInput
              label="Description"
              value={newProductData.description}
              onChange={(e) =>
                setNewProductData({ ...newProductData, description: e.target.value })
              }
            />
            <CFormInput
              required
              label="Price"
              type="number"
              value={newProductData.price}
              onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
            />
            <CFormInput label="Image" type="file" name="img" onChange={handleFileChange} />
            {tempSrc && (
              <div>
                <img
                  src={tempSrc}
                  alt="Product Preview"
                  style={{ width: '50%', height: '10%', marginTop: '10px' }}
                />
                <br></br>
              </div>
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleAddProduct}>
            Add Product
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Product Modal */}
      <CModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setNewProductData({
            name: '',
            description: '',
            price: '',
            img: '',
          })
          setTempSrc(null)
        }}
      >
        <CModalHeader>
          <CModalTitle>Edit Product</CModalTitle>
        </CModalHeader>
        {errorMsg && <CAlert color="danger">{errorMsg}</CAlert>}
        <CModalBody>
          <CForm>
            <CFormInput
              label="Name"
              value={newProductData.name}
              onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
            />
            <CFormInput
              label="Description"
              value={newProductData.description}
              onChange={(e) =>
                setNewProductData({ ...newProductData, description: e.target.value })
              }
            />
            <CFormInput
              label="Price"
              type="number"
              value={newProductData.price}
              onChange={(e) => setNewProductData({ ...newProductData, price: e.target.value })}
            />
            <CFormInput type="file" label="Image" onChange={handleFileChange} />
            {tempSrc && (
              <div>
                <img
                  src={tempSrc}
                  alt="Product Preview"
                  style={{ width: '50%', height: '10%', marginTop: '10px' }}
                />
                <br></br>
              </div>
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              setShowEditModal(false)
              setNewProductData({
                name: '',
                description: '',
                price: '',
                img: '',
              })
              setTempSrc(null)
            }}
          >
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSaveEditedProduct}>
            Save Changes
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default CategoryDetails
