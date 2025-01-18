import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CRow,
  CCol,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CInputGroup,
  CFormInput,
  CForm,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CCardImage,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'
import tableImageDark from 'src/assets/images/table.jpg'
import { io } from 'socket.io-client'
import { GetToken } from '../../helpers/GetToken'
import { saveAs } from 'file-saver'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilQrCode, cilTrash } from '@coreui/icons'
import { useSelector } from 'react-redux'
import translations from '../../app/Language'

const TablesDashboard = () => {
  const [tables, setTables] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalError, setModalError] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMoveOrdersModal, setShowMoveOrdersModal] = useState(false)
  const [tableNumber, setTableNumber] = useState('')
  const [selectedTable, setSelectedTable] = useState(null)
  const [targetTable, setTargetTable] = useState('')
  const [targetTableNumber, setTargetTableNumber] = useState('')
  const token = GetToken()
  //language
  const t = useSelector((state) => state.language)
  const Language = translations[t]
  const navigate = useNavigate()

  const fetchTables = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${BaseUrl}/tables`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const tablesWithTotalPrice = response.data.map((table) => {
        const totalPrice = table.orders.reduce((acc, order) => acc + order.totalPrice, 0)
        return { ...table, totalPrice }
      })

      setTables(tablesWithTotalPrice)
    } catch (err) {
      setError('Error fetching tables')
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTables()
    const socket = io(BaseUrl, { auth: { token } })

    socket.on('newOrder', () => {
      fetchTables()
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const handleCardClick = (tableId) => {
    navigate(`/tables/${tableId}`)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleCreateTable = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${BaseUrl}/tables`,
        { number: tableNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      console.log(response)
      setModalMessage('Table created successfully')
      setModalError(false)
      setShowCreateModal(false)
      setTableNumber('') // Reset the table number input
      fetchTables() // Refresh the tables list
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setModalMessage(err.response.data.error)
      } else {
        setModalMessage('Error creating table')
      }
      setModalError(true)
      console.error(err)
    }
    setLoading(false)
    setShowModal(true)
  }

  const downloadQRCode = (tableNumber, qrCodeURL) => {
    // Fetch the image from the URL and download it using FileSaver
    saveAs(qrCodeURL, `Table-${tableNumber}-QRCode.png`)
  }

  const handleDeleteTable = async (tableId, unpaidOrders) => {
    if (unpaidOrders) {
      setModalMessage('Cannot delete a table with unpaid orders.')
      setModalError(true)
      setShowModal(true)
      return
    }

    if (
      window.confirm(
        'By deleting the table you are going to delete also any orders assigned to it?',
      )
    ) {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${BaseUrl}/tables/${tableId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setModalMessage('Table deleted successfully')
        setModalError(false)
        fetchTables() // Refresh the tables list after deletion
      } catch (err) {
        setModalMessage('Error deleting table')
        setModalError(true)
        console.error(err)
      }
      setLoading(false)
      setShowModal(true)
    }
  }

  const handleMoveOrders = async () => {
    if (!targetTable) {
      setModalMessage('Please select a target table.')
      setModalError(true)
      setShowModal(true)
      return
    }
    setLoading(true)
    try {
      await axios.post(
        `${BaseUrl}/tables/move-orders`,
        { sourceTableId: selectedTable._id, targetTableId: targetTable },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setModalMessage('Orders moved successfully')
      setModalError(false)
      setShowMoveOrdersModal(false)
      fetchTables() // Refresh the tables list after moving orders
    } catch (err) {
      setModalMessage('Error moving orders')
      setModalError(true)
      console.error(err)
    }
    setLoading(false)
    setShowModal(true)
  }

  const filteredTables = tables.filter((table) => table.number.toString().includes(searchTerm))
  const hundleTargetTableChange = (e) => {
    setTargetTable(e.target.value)
    setTargetTableNumber(e.target.value)
  }
  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{Language.tables}</strong>
              </div>
              <CButton color="primary" onClick={() => setShowCreateModal(true)}>
                {Language.create + ' ' + Language.table}
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CInputGroup className="mb-3">
                <CFormInput
                  type="text"
                  placeholder={Language.searchByTableNumber}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CInputGroup>
              {loading && <Loading />}
              {error && <p className="text-danger">{error}</p>}
              <CRow>
                {filteredTables.map((table) => (
                  <CCol xs={6} sm={3} md={2} key={table._id}>
                    <CCard style={{ cursor: 'pointer', marginBottom: 10, position: 'relative' }}>
                      <CCardHeader>
                        <CDropdown
                          style={{ display: 'flex', flexDirection: 'row', alignSelf: 'end' }}
                        >
                          <CDropdownToggle color="secondary" size="sm">
                            {Language.actions}
                          </CDropdownToggle>
                          <CDropdownMenu>
                            <CDropdownItem
                              onClick={() => downloadQRCode(table.number, table.qrCode)}
                            >
                              <CIcon icon={cilCloudDownload} className="me-2" />
                              {Language.downloadQR}
                            </CDropdownItem>
                            <CDropdownItem
                              onClick={() => handleDeleteTable(table._id, table.unpaidOrders)}
                            >
                              <CIcon icon={cilTrash} className="me-2" />
                              {Language.deleteTable}
                            </CDropdownItem>
                            <CDropdownItem
                              onClick={() => {
                                setSelectedTable(table)
                                setShowMoveOrdersModal(true)
                              }}
                            >
                              <CIcon icon={cilQrCode} className="me-2" />
                              move orders to other table
                            </CDropdownItem>
                          </CDropdownMenu>
                        </CDropdown>
                      </CCardHeader>
                      <CCardBody
                        onClick={() => handleCardClick(table._id)}
                        className={table.unpaidOrders ? ' text-white' : ''}
                        style={{ background: table.unpaidOrders ? '#F39C12' : '' }}
                      >
                        <CCardImage height="150" orientation="top" src={tableImageDark} />
                        <CCardTitle>
                          {Language.table} {table.number}
                        </CCardTitle>
                      </CCardBody>
                    </CCard>
                  </CCol>
                ))}
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Move Orders Modal */}
      <CModal visible={showMoveOrdersModal} onClose={() => setShowMoveOrdersModal(false)}>
        <CModalHeader>
          <CModalTitle>Move Orders to Another Table</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CInputGroup className="mb-3">
            <CFormInput
              type="text"
              placeholder="Search table by number"
              value={targetTableNumber}
              onChange={(e) => hundleTargetTableChange(e)}
            />
          </CInputGroup>
          <CRow>
            {tables
              .filter(
                (table) =>
                  table.number.toString().includes(targetTable) && table._id !== selectedTable?._id,
              )
              .map((table) => (
                <CCol xs={12} key={table._id}>
                  <CCard
                    onClick={() => {
                      setTargetTable(table._id)
                      setTargetTableNumber(table.number)
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <CCardBody>
                      <CCardTitle>
                        {Language.table} {table.number}
                      </CCardTitle>
                    </CCardBody>
                  </CCard>
                </CCol>
              ))}
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowMoveOrdersModal(false)}>
            {Language.cancel}
          </CButton>
          <CButton color="primary" onClick={handleMoveOrders}>
            Move Orders
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Create Table Modal */}
      <CModal visible={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <CModalHeader>
          <CModalTitle>{Language.create + ' ' + Language.new + ' ' + Language.table}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleCreateTable}>
            <CFormInput
              type="number"
              placeholder={Language.enterTableNumber}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
            />
            <CButton type="submit" color="primary" style={{ marginTop: '10px' }}>
              {Language.create + ' ' + Language.table}
            </CButton>
          </CForm>
        </CModalBody>
      </CModal>

      {/* Success/Error Modal */}
      <CModal visible={showModal} onClose={handleCloseModal}>
        <CModalHeader>
          <CModalTitle>{modalError ? 'Error' : 'Success'}</CModalTitle>
        </CModalHeader>
        <CModalBody>{modalMessage}</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCloseModal}>
            {Language.close}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default TablesDashboard
