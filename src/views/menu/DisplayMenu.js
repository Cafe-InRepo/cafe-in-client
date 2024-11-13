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
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import { cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const Menu = () => {
  const [menu, setMenu] = useState(null)
  const [loadingMenu, setLoadingMenu] = useState(false)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const navigate = useNavigate()

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
      fetchMenu()
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
        fetchMenu()
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
        { name: newCategoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setShowAddCategoryModal(false)
      fetchMenu()
    } catch (err) {
      console.error('Error adding category', err)
    }
  }

  const filteredCategories = menu?.categories?.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  //basehub for colors display 
  const baseHues = [200, 15, 160, 330, 260, 210]
  if (loadingMenu) return <CSpinner color="primary" />

  if (error) return <div>{error}</div>

  return (
    <>
      {/* Search Bar and Add Category Button */}
      <div className="d-flex justify-content-between mb-4">
        <CFormInput
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Categories"
          style={{ width: '300px' }}
        />
        <CButton color="primary" onClick={() => setShowAddCategoryModal(true)}>
          Add New Category
        </CButton>
      </div>

      <CRow className="g-4">
        {filteredCategories?.map((category, index) => (
          <CCol key={index} xs={12} sm={6} md={4} lg={3}>
            <CCard
              className="text-center shadow-sm"
              style={{
                backgroundColor: `hsl(${(baseHues[index % baseHues.length] + (Math.random() * 30 - 15)) % 360}, 70%, 65%)`, // Adjusted HSL for controlled randomness
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/menu/categories/${category._id}`)}
            >
              <CCardBody>
                <h5 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
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

export default Menu
