import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCardText,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilOptions } from '@coreui/icons'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'

const Menu = () => {
  const [menu, setMenu] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMenu, setLoadingMenu] = useState(false)

  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalError, setModalError] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newProductData, setNewProductData] = useState({
    name: '',
    description: '',
    price: '',
    img: '',
    categoryId: '',
  })
  const [editProductData, setEditProductData] = useState({
    _id: '',
    name: '',
    description: '',
    price: '',
  })
  const [editCategoryName, setEditCategoryName] = useState('')
  const [tempSrc, setTempSrc] = useState('')

  const fetchMenu = async () => {
    setLoadingMenu(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${BaseUrl}/menu/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setMenu(response.data)
    } catch (err) {
      setError('Error fetching menu')
      console.error(err)
    }
    setLoadingMenu(false)
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  const handleAddCategory = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${BaseUrl}/categories`,
        { name: newCategoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setNewCategoryName('')
      setModalMessage('Category added successfully')
      setModalError(false)
      fetchMenu()
    } catch (err) {
      setModalMessage('Error adding category')
      setModalError(true)
      console.error(err)
    }
    setLoading(false)
    setShowModal(true)
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const { name, description, price, img, categoryId } = newProductData
      const response = await axios.post(
        `${BaseUrl}/products/`,
        { name, description, price, img, categoryId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      fetchMenu()
      setNewProductData({
        name: '',
        description: '',
        price: '',
        img: '',
        categoryId: '',
      })
      setTempSrc('') // Reset the image preview
      setModalMessage('Product added successfully')
      setModalError(false)
    } catch (err) {
      setModalError(true)
      setModalMessage(err.response.data.error)
      console.error(err)
    }
    setLoading(false)
    setShowModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
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

  const handleEditProductChange = (e) => {
    const { name, value } = e.target
    setEditProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleEditProduct = (product) => {
    setEditProductData(product)
    setTempSrc(product.img)
    setShowModal(true)
  }

  const handleUpdateProduct = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const { _id, name, description, price } = editProductData
      const response = await axios.put(
        `${BaseUrl}/products/${_id}`,
        { name, description, price, img: tempSrc },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      fetchMenu()
      setEditProductData({
        _id: '',
        name: '',
        description: '',
        price: '',
      })
      setTempSrc('') // Reset the image preview
      setModalMessage('Product updated successfully')
      setModalError(false)
    } catch (err) {
      setModalMessage('Error updating product')
      setModalError(true)
      console.error(err)
    }
    setLoading(false)
    setShowModal(true)
  }

  const handleDeleteProduct = async (productId, categoryId) => {
    const conf = confirm('are you sure you want to delete this product? ')
    setLoading(true)
    if (conf) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${BaseUrl}/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setMenu((prevMenu) => ({
          ...prevMenu,
          categories: prevMenu.categories?.map((cat) =>
            cat._id === categoryId
              ? {
                  ...cat,
                  products: cat.products.filter((prod) => prod._id !== productId),
                }
              : cat,
          ),
        }))
        setModalError(false)
        setModalMessage('Product deleted successfully')
      } catch (err) {
        setModalMessage('Error deleting product')
        setModalError(true)
        console.error(err)
      }
      setLoading(false)
      setShowModal(true)
    }
  }

  const handleEditCategory = (category) => {
    setEditCategoryName(category.name)
    setEditProductData({ _id: category._id, name: '' })
    setShowModal(true)
  }

  const handleUpdateCategory = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${BaseUrl}/categories/${editProductData._id}`,
        { name: editCategoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setMenu((prevMenu) => ({
        ...prevMenu,
        categories: prevMenu.categories?.map((cat) =>
          cat._id === editProductData._id ? response.data : cat,
        ),
      }))
      setEditCategoryName('')
      setEditProductData({
        _id: '',
        name: '',
        description: '',
        price: '',
      })
      setModalMessage('Category updated successfully')
      setModalError(false)
    } catch (err) {
      setModalMessage('Error updating category')
      setModalError(true)
      console.error(err)
    }
    setLoading(false)
    setShowModal(true)
  }

  const handleDeleteCategory = async (categoryId) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${BaseUrl}/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setMenu((prevMenu) => ({
        ...prevMenu,
        categories: prevMenu.categories.filter((cat) => cat._id !== categoryId),
      }))
      setModalMessage('Category deleted successfully')
      setModalError(false)
    } catch (err) {
      setModalMessage('Error deleting category')
      setModalError(true)
      console.error(err)
    }
    setLoading(false)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setTempSrc('') // Reset the image preview
    setEditProductData({
      _id: '',
      name: '',
      description: '',
      price: '',
    }) // Reset the edit product data
  }

  const handleCreateMenu = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${BaseUrl}/menu`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setMenu(response.data)
      setModalMessage('Menu created successfully')
      setModalError(false)
    } catch (err) {
      setModalMessage('Error creating menu')
      setModalError(true)
      console.error(err)
    }
    setLoading(false)
    setShowModal(true)
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Menu</strong>
            </CCardHeader>
            <CCardBody>
              {loadingMenu && <Loading />}
              {error && <p className="text-danger">{error}</p>}
              {!menu && (
                <CButton color="primary" onClick={handleCreateMenu}>
                  Create Menu
                </CButton>
              )}
              {menu && (
                <CAccordion activeItemKey="0">
                  <CAccordionItem itemKey="add-category">
                    <CAccordionHeader>+ Add Category</CAccordionHeader>
                    <CAccordionBody>
                      <CForm onSubmit={handleAddCategory}>
                        <CFormInput
                          type="text"
                          placeholder="Category Name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="mb-3"
                          required
                        />
                        <CButton disabled={loading} type="submit" color="primary">
                          {loading ? (
                            <>
                              {' '}
                              <CSpinner />
                              "Loading"
                            </>
                          ) : (
                            'Add Category'
                          )}
                        </CButton>
                      </CForm>
                    </CAccordionBody>
                  </CAccordionItem>
                  {menu.categories?.map((category, index) => (
                    <CAccordionItem key={category._id} itemKey={index.toString()}>
                      <CAccordionHeader>
                        {category.name}
                        <CDropdown variant="btn-group" className="ms-2">
                          <CDropdownMenu>
                            <CDropdownItem onClick={() => handleEditCategory(category)}>
                              Edit
                            </CDropdownItem>
                            <CDropdownItem onClick={() => handleDeleteCategory(category._id)}>
                              Delete
                            </CDropdownItem>
                          </CDropdownMenu>
                        </CDropdown>
                      </CAccordionHeader>
                      <CAccordionBody>
                        <CCardTitle className="mt-4">Add Product</CCardTitle>
                        <CForm onSubmit={handleAddProduct}>
                          <CFormInput
                            type="text"
                            name="name"
                            placeholder="Product Name"
                            value={newProductData.name}
                            onChange={handleInputChange}
                            className="mb-3"
                            required
                          />
                          <CFormInput
                            type="text"
                            name="description"
                            placeholder="Product Description"
                            value={newProductData.description}
                            onChange={handleInputChange}
                            className="mb-3"
                            required
                          />
                          <CFormInput
                            type="number"
                            name="price"
                            placeholder="Product Price"
                            value={newProductData.price}
                            onChange={handleInputChange}
                            className="mb-3"
                            required
                          />
                          <CFormInput type="file" name="img" onChange={handleFileChange} />
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
                          <input type="hidden" name="categoryId" value={category._id} />
                          <CButton
                            disabled={loading}
                            type="submit"
                            color="primary"
                            style={{ margin: '4%' }}
                            onClick={() =>
                              setNewProductData((prevData) => ({
                                ...prevData,
                                categoryId: category._id,
                              }))
                            }
                          >
                            {loading ? (
                              <>
                                {' '}
                                <CSpinner />
                                "Loading"
                              </>
                            ) : (
                              'Add Product'
                            )}
                          </CButton>
                        </CForm>
                        {category.products.map((product) => (
                          <CCard key={product._id} className="mb-3">
                            <CCardBody className="d-flex justify-content-between align-items-center">
                              <div>
                                <CCardTitle>{product.name}</CCardTitle>
                                <CCardText>{product.price} TND</CCardText>
                              </div>
                              <CDropdown variant="btn-group">
                                <CDropdownToggle color="secondary" size="sm">
                                  <CIcon icon={cilOptions} />
                                </CDropdownToggle>
                                <CDropdownMenu>
                                  <CDropdownItem onClick={() => handleEditProduct(product)}>
                                    Edit
                                  </CDropdownItem>
                                  <CDropdownItem
                                    onClick={() => handleDeleteProduct(product._id, category._id)}
                                  >
                                    {loading ? (
                                      <>
                                        {' '}
                                        <CSpinner />
                                        "Loading"
                                      </>
                                    ) : (
                                      'Delete'
                                    )}
                                  </CDropdownItem>
                                </CDropdownMenu>
                              </CDropdown>
                            </CCardBody>
                          </CCard>
                        ))}
                      </CAccordionBody>
                    </CAccordionItem>
                  ))}
                </CAccordion>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={showModal} onClose={handleCloseModal}>
        <CModalHeader>
          <CModalTitle>{modalError ? 'Error' : 'Success'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {modalMessage}
          {editProductData._id && !modalError && (
            <CForm
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateProduct()
              }}
            >
              <CFormInput
                type="text"
                name="name"
                placeholder="Product Name"
                value={editProductData.name}
                onChange={handleEditProductChange}
                className="mb-3"
                required
              />
              <CFormInput
                type="text"
                name="description"
                placeholder="Product Description"
                value={editProductData.description}
                onChange={handleEditProductChange}
                className="mb-3"
                required
              />
              <CFormInput
                type="number"
                name="price"
                placeholder="Product Price"
                value={editProductData.price}
                onChange={handleEditProductChange}
                className="mb-3"
                required
              />
              <CFormInput type="file" name="img" onChange={handleFileChange} />
              {tempSrc && (
                <div>
                  <img
                    src={tempSrc}
                    alt="Product Preview"
                    style={{ width: '50%', height: '10%', marginTop: '10px' }}
                  />
                  <br />
                </div>
              )}
              <CButton
                disabled={loading}
                style={{
                  marginTop: '4%',
                }}
                type="submit"
                color="primary"
                onClick={handleUpdateProduct}
              >
                {loading ? (
                  <>
                    {' '}
                    <CSpinner />
                    "Loading"
                  </>
                ) : (
                  'Update Product'
                )}
              </CButton>
            </CForm>
          )}
          {editProductData.name === '' && editCategoryName && !modalError && (
            <CForm onSubmit={handleUpdateCategory}>
              <CFormInput
                type="text"
                name="categoryName"
                placeholder="Category Name"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                className="mb-3"
                required
              />
              <CButton disabled={loading} type="submit" color="primary">
                Update Category
              </CButton>
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton disabled={loading} color="primary" onClick={handleCloseModal}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Menu
