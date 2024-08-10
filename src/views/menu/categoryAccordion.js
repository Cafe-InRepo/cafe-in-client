import React, { useState, useEffect } from 'react'
import {
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'

const CategoryAccordion = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${BaseUrl}/categories`)
        setCategories(response.data)
      } catch (err) {
        setError('Error fetching categories')
      }
      setLoading(false)
    }

    fetchCategories()
  }, [])

  const handleCreateCategory = async () => {
    try {
      const response = await axios.post(`${BaseUrl}/categories`, { name: categoryName })
      setCategories([...categories, response.data.category])
      setCategoryName('')
      setModalContent('Category created successfully')
    } catch (err) {
      setModalContent('Error creating category')
    }
    setShowModal(true)
  }

  const handleEditCategory = (categoryId) => {
    navigate(`/categories/edit/${categoryId}`)
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${BaseUrl}/categories/${categoryId}`)
      setCategories(categories.filter((category) => category._id !== categoryId))
      setModalContent('Category deleted successfully')
    } catch (err) {
      setModalContent('Error deleting category')
    }
    setShowModal(true)
  }

  const handleViewDetails = (categoryId) => {
    navigate(`/menu/categories/${categoryId}`)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
            <CForm
              onSubmit={(e) => {
                e.preventDefault()
                handleCreateCategory()
              }}
            >
              <CRow>
                <CCol md={10}>
                  <CFormInput
                    type="text"
                    placeholder="Enter category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </CCol>
                <CCol md={2}>
                  <CButton type="submit" color="primary">
                    Create Category
                  </CButton>
                </CCol>
              </CRow>
            </CForm>
            {loading && <Loading />}
            {error && <p className="text-danger">{error}</p>}
            <CAccordion>
              {categories.map((category) => (
                <CAccordionItem key={category._id} itemKey={category._id}>
                  <CAccordionHeader>{category.name}</CAccordionHeader>
                  <CAccordionBody>
                    <CButton color="info" onClick={() => handleViewDetails(category._id)}>
                      Details
                    </CButton>
                    <CButton color="warning" onClick={() => handleEditCategory(category._id)}>
                      Edit
                    </CButton>
                    <CButton color="danger" onClick={() => handleDeleteCategory(category._id)}>
                      Delete
                    </CButton>
                  </CAccordionBody>
                </CAccordionItem>
              ))}
            </CAccordion>
          </CCardBody>
        </CCard>
      </CCol>

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

export default CategoryAccordion
