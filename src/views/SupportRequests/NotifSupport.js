import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CListGroup,
  CListGroupItem,
  CContainer,
  CRow,
  CCol,
} from '@coreui/react'
import { GetToken } from '../../helpers/GetToken'
import { BaseUrl } from '../../helpers/BaseUrl'

const NotifSupport = () => {
  const token = GetToken()
  const [supportRequests, setSupportRequests] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTable, setActiveTable] = useState(null)
  const [ringtone, setRingtone] = useState(null)

  useEffect(() => {
    const socket = io(BaseUrl, { auth: { token } })

    socket.on('supportNotification', (data) => {
      setSupportRequests((prevRequests) => [...prevRequests, data.tableNumber])
      setActiveTable(data.tableNumber)
      setIsModalOpen(true)
      playRingtone()
    })

    return () => {
      socket.disconnect()
    }
  }, [token])

  const playRingtone = () => {
    const audio = new Audio('/ringtone.mp3')
    audio.loop = true
    audio.play()
    setRingtone(audio)
  }

  const stopRingtone = () => {
    if (ringtone) {
      ringtone.pause()
      ringtone.currentTime = 0
    }
  }

  const handleAnswerCall = () => {
    stopRingtone()
    setIsModalOpen(false)
    alert(`Answered call from table ${activeTable}`)
  }

  const handleDismissCall = () => {
    stopRingtone()
    setIsModalOpen(false)
    alert(`Dismissed call from table ${activeTable}`)
  }

  return (
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md="8">
          <CCard>
            <CCardHeader>
              <h1>Support Requests</h1>
            </CCardHeader>
            <CCardBody>
              {supportRequests.length > 0 ? (
                <CListGroup>
                  {supportRequests.map((tableNumber, index) => (
                    <CListGroupItem key={index}>
                      Table {tableNumber} called for support
                    </CListGroupItem>
                  ))}
                </CListGroup>
              ) : (
                <p>No support requests at the moment.</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal for incoming support call */}
      <CModal visible={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CModalHeader>Incoming Call from Table {activeTable}</CModalHeader>
        <CModalBody>
          Table {activeTable} is calling for support. What would you like to do?
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleAnswerCall}>
            Answer
          </CButton>
          <CButton color="danger" onClick={handleDismissCall}>
            Dismiss
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default NotifSupport
