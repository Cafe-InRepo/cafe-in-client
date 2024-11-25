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
import { cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { BaseUrl } from '../../../helpers/BaseUrl'

const Menu = () => {
  const [menu, setMenu] = useState(null)
  const [loadingMenu, setLoadingMenu] = useState(false)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [sectionToEdit, setSectionToEdit] = useState(null)
  const [newSectionName, setNewSectionName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddSectionModal, setShowAddSectionModal] = useState(false)
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

  const handleEditSection = (section) => {
    setSectionToEdit(section)
    setNewSectionName(section.name)
    setShowEditModal(true)
  }

  const handleSaveSection = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${BaseUrl}/sections/${sectionToEdit._id}`,
        { name: newSectionName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setShowEditModal(false)
      fetchMenu()
    } catch (err) {
      console.error('Error updating section', err)
    }
  }

  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section and products within it?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${BaseUrl}/sections/${sectionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        fetchMenu()
      } catch (err) {
        console.error('Error deleting section', err)
      }
    }
  }

  const handleAddSection = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${BaseUrl}/sections`,
        { name: newSectionName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setShowAddSectionModal(false)
      fetchMenu()
    } catch (err) {
      console.error('Error adding section', err)
    }
  }

  const filteredSections = menu?.sections?.filter((section) =>
    section.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // base hub for colors display
  const baseHues = [200, 15, 160, 330, 260, 210]
  if (loadingMenu) return <CSpinner color="primary" />

  if (error) return <div>{error}</div>

  return (
    <>
      {/* Search Bar and Add Section Button */}
      <div className="d-flex justify-content-between mb-4">
        <CFormInput
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Sections"
          style={{ width: '300px' }}
        />
        <CButton color="primary" onClick={() => setShowAddSectionModal(true)}>
          Add New Section
        </CButton>
      </div>

      {/* Sections display */}
      <CRow className="g-4">
        {filteredSections?.map((section, index) => (
          <CCol key={index} xs={12} sm={6} md={4} lg={3}>
            <CCard
              className="text-center shadow-sm"
              style={{
                backgroundColor: `hsl(${(baseHues[index % baseHues.length] + (Math.random() * 30 - 15)) % 360}, 70%, 65%)`, // Adjusted HSL for controlled randomness
                cursor: 'pointer',
                transform: 'scale(1.1)', // Larger cards
                textAlign: 'center', // Center text
              }}
              onClick={() => navigate(`/menu/sections/${section._id}`)}
            >
              <CCardBody>
                <h5 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                  {section.name}
                </h5>
              </CCardBody>
              <CCardFooter>
                <div className="d-flex justify-content-center">
                  <CIcon
                    icon={cilPencil}
                    size="lg"
                    style={{ cursor: 'pointer', marginRight: '15px' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditSection(section)
                    }}
                  />
                  <CIcon
                    icon={cilTrash}
                    size="lg"
                    style={{ cursor: 'pointer', color: 'red' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSection(section._id)
                    }}
                  />
                </div>
              </CCardFooter>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Edit Section Modal */}
      {showEditModal && (
        <CModal visible={showEditModal} onClose={() => setShowEditModal(false)}>
          <CModalHeader>
            <CModalTitle>Edit Section</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Enter new section name"
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleSaveSection}>
              Save Changes
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <CModal visible={showAddSectionModal} onClose={() => setShowAddSectionModal(false)}>
          <CModalHeader>
            <CModalTitle>Add New Section</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Enter new section name"
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowAddSectionModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleAddSection}>
              Add Section
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </>
  )
}

export default Menu
