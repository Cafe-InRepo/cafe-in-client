import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CSpinner,
  CCardFooter,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CForm,
  CFormInput,
  useColorModes,
} from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { BaseUrl } from '../../../helpers/BaseUrl'

const SectionDetails = () => {
  const { sectionId } = useParams() // Get sectionId from URL params
  const [categories, setCategories] = useState(null)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const navigate = useNavigate()

 
  // Fetch categories for the section
  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${BaseUrl}/sections/${sectionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setCategories(response.data.categories) // Store the categories of the section
    } catch (err) {
      setError('Error fetching categories')
      console.error(err)
    }
    setLoadingCategories(false)
  }

  useEffect(() => {
    if (sectionId) {
      fetchCategories() // Fetch categories when sectionId is available
    }
  }, [sectionId])

  const handleEditCategory = (category) => {
    setCategoryToEdit(category)
    setNewCategoryName(category.name)
    setShowEditModal(true)
  }

  const handleSaveCategory = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${BaseUrl}/categories/${categoryToEdit._id}`,
        { name: newCategoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setShowEditModal(false)
      fetchCategories() // Refresh categories after update
    } catch (err) {
      console.error('Error updating category', err)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category and products within it?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${BaseUrl}/categories/${categoryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        fetchCategories() // Refresh categories after deletion
      } catch (err) {
        console.error('Error deleting category', err)
      }
    }
  }

  const handleAddCategory = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${BaseUrl}/categories`,
        { name: newCategoryName, sectionId }, // Send sectionId when adding new category
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setShowAddCategoryModal(false)
      fetchCategories() // Refresh categories after adding new category
    } catch (err) {
      console.error('Error adding category', err)
    }
  }

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // BaseHub for colors display
  if (loadingCategories) return <CSpinner color="primary" />

  if (error) return <div>{error}</div>

  return (
    <>
      {/* Search Bar and Add Category Button */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-2">
        {/* Search Bar */}
        <CFormInput
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Categories"
          className="mb-2 mb-md-0"
          style={{ width: '100%', maxWidth: '300px' }}
        />

        {/* Add Category Button */}
        <CButton
          color="primary"
          className="btn-sm"
          style={{ width: 'auto' }}
          onClick={() => setShowAddCategoryModal(true)}
        >
          Add New Category
        </CButton>
      </div>

      <CRow className="g-4">
        {filteredCategories?.map((category, index) => (
          <CCol key={index} xs={12} sm={6} md={4} lg={3}>
            <CCard
              className="text-center shadow-sm"
              style={{
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/menu/categories/${category._id}`)}
            >
              <CCardBody>
                <h5
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    margin: 0,
                    fontFamily: '-moz-initial',
                  }}
                >
                  {category.name}
                </h5>
              </CCardBody>
              <CCardFooter>
                <div className="d-flex justify-content-end">
                  <CIcon
                    icon={cilPencil}
                    size="lg"
                    style={{ cursor: 'pointer', marginRight: '15px' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditCategory(category)
                    }}
                  />
                  <CIcon
                    icon={cilTrash}
                    size="lg"
                    style={{ cursor: 'pointer', color: 'red' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCategory(category._id)
                    }}
                  />
                </div>
              </CCardFooter>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Edit Category Modal */}
      {showEditModal && (
        <CModal visible={showEditModal} onClose={() => setShowEditModal(false)}>
          <CModalHeader>
            <CModalTitle>Edit Category</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter new category name"
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleSaveCategory}>
              Save Changes
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <CModal visible={showAddCategoryModal} onClose={() => setShowAddCategoryModal(false)}>
          <CModalHeader>
            <CModalTitle>Add New Category</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter new category name"
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowAddCategoryModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleAddCategory}>
              Add Category
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </>
  )
}

export default SectionDetails
