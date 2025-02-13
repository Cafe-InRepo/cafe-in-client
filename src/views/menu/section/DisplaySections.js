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
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { cilPencil, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { BaseUrl } from '../../../helpers/BaseUrl'
import { useSelector } from 'react-redux'
import translations from '../../../app/Language'

const Menu = () => {
  const [menu, setMenu] = useState(null)
  const [loadingMenu, setLoadingMenu] = useState(false)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [sectionToEdit, setSectionToEdit] = useState(null)
  const [newSectionName, setNewSectionName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddSectionModal, setShowAddSectionModal] = useState(false)
  //language
  const t = useSelector((state) => state.language)
  const Language = translations[t]
  //navigation
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

  if (loadingMenu) return <CSpinner color="primary" />

  if (error) return <div>{error}</div>

  return (
    <>
      {/* Search Bar and Add Section Button */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        {/* Search Bar */}
        <CFormInput
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={Language.search + ' ' + Language.sections}
          className="mb-2 mb-md-0 me-md-2"
          style={{ width: '100%', maxWidth: '300px' }}
        />

        {/* Add Section Button */}
        <CButton
          color="primary"
          className="btn-sm"
          style={{ width: 'auto' }}
          onClick={() => setShowAddSectionModal(true)}
        >
          {Language.newSection}
        </CButton>
      </div>

      {/* Sections display */}
      <CRow className="g-4">
        {filteredSections?.map((section, index) => (
          <CCol key={index} xs={12} sm={6} md={4} lg={3} style={{ margin: '10px' }}>
            <CCard
              className="text-center shadow-sm"
              style={{
                cursor: 'pointer',
                transform: 'scale(1.1)', // Larger cards
                textAlign: 'center', // Center text
              }}
              onClick={() => navigate(`/menu/sections/${section._id}`)}
            >
              <CCardBody>
                <h5
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    margin: 0,
                    fontFamily: '-moz-initial',
                  }}
                >
                  {section.name}
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
            <CModalTitle>{Language.edit + ' ' + Language.section}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder={Language.enterNewSectionName}
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowEditModal(false)}>
              {Language.cancel}
            </CButton>
            <CButton color="primary" onClick={handleSaveSection}>
              {Language.save}
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <CModal visible={showAddSectionModal} onClose={() => setShowAddSectionModal(false)}>
          <CModalHeader>
            <CModalTitle>{Language.AddNewSection}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <CFormInput
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder={Language.enterNewSectionName}
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowAddSectionModal(false)}>
              {Language.cancel}
            </CButton>
            <CButton color="primary" onClick={handleAddSection}>
              {Language.addSection}
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </>
  )
}

export default Menu
