import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardImage,
  CCardText,
  CCardTitle,
  CButton,
  CRow,
  CCol,
  CForm,
  CFormInput,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CSpinner,
  CFormLabel,
  CImage,
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilUser, cilPencil, cilSettings, cilEnvelopeOpen, cilLockLocked } from '@coreui/icons'
import { GetToken } from '../../../helpers/GetToken'
import { BaseUrl } from '../../../helpers/BaseUrl'

import axios from 'axios'

const Profile = () => {
  const [visible, setVisible] = useState(false)
  const [DetailsVisible, setDetailsVisible] = useState(false)

  const [emailSent, setEmailSent] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState('')
  const [profileData, setProfileData] = useState({
    placeName: '',
    phoneNumber: '',
    logo: null,
    location: { lat: 36.8998794, long: 10.1829002 },
    distanceRadius: 5, // Default distance radius in km
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [data, setUserDate] = useState()
  const token = GetToken()
  const [tempSrcProfile, setTempSrcProfile] = useState('')
  const [tempSrcLogo, setTempSrcLogo] = useState('')
  const [tempSrcPlacePic, setTempSrcPlacePic] = useState('')

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BaseUrl}/auth/get-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const userData = response.data
      console.log(response.data)
      setUserDate(userData)
      setEmail(response.data.email)
      setPersonalPhoneNumber(response.data.personalPhoneNumber)

      setProfileData((prevState) => ({
        ...prevState,
        placeName: userData.placeName || '',
        phoneNumber: userData.phoneNumber || '',
        location: userData.placeLocation || prevState.location,
        distanceRadius: userData.distanceRadius || 5,
        logo: null,
        id: userData._id,
      }))
    } catch (error) {
      console.error('Error fetching user data:', error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }
  //send verification code to change pwd
  const [oldPassword, setOldPassword] = useState()
  const [massage, setMessage] = useState('')
  const sendPwdVerificationCode = async (oldPassword) => {
    setLoading(true)

    try {
      const response = await axios.post(
        `${BaseUrl}/auth/client/pwd-verification-code`,
        { oldPassword }, // Only send oldPassword for this step
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Handle successful response
      console.log('Verification email sent:', response.data.message)
      setMessage(response.data.message) // Show success message in UI
      setEmailSent(true)
    } catch (error) {
      console.error('Error sending verification code:', error.response?.data || error.message)

      // Display error message in UI
      setError(error.response?.data?.error || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }
  //change pwd after sending verification code
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const changePassword = async (verificationCode, newPassword, confirmPassword) => {
    setLoading(true)

    try {
      const response = await axios.post(
        `${BaseUrl}/auth/client/change-password`,
        { verificationCode, newPassword, confirmPassword }, // Send the verification code and new passwords
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Handle successful response
      console.log('Password changed successfully:', response.data.message)
      setMessage(response.data.message) // Show success message in UI
      setEmailSent(false)
      setNewPassword('')
      setOldPassword('')
      setConfirmPassword('')
      setConfirmationCode('')
    } catch (error) {
      console.error('Error changing password:', error.response?.data || error.message)

      // Display error message in UI
      setError(error.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const changeProfilePic = (e, picType) => {
    const file = e.target.files[0]
    previewFile(file, picType)
  }

  // Preview uploaded image
  const previewFile = (file, picType) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      if (picType === 'profile') {
        setTempSrcProfile(reader.result)
      }
      if (picType === 'logo') {
        setTempSrcLogo(reader.result)
      }
      if (picType === 'place') {
        setTempSrcPlacePic(reader.result)
      }
    }
  }

  //personal details modal
  const [visiblePDModal, setVisiblePDModal] = useState(false)
  const [email, setEmail] = useState(data?.email)
  const [personalPhoneNumber, setPersonalPhoneNumber] = useState(data?.personalPhoneNumber)
  const [pDVerifModal, setPDVerifModal] = useState(false)
  const [PDVerifCode, setPDVerifCode] = useState('')
  const sendEmailPDVerif = async () => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${BaseUrl}/auth/client/personal-details-change`,
        { newemail: email, newpersonalPhoneNumber: personalPhoneNumber }, // Empty request body (if needed)
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Handle successful response
      console.log('Verification email sent:', response.data.message)
      setVisiblePDModal(false)
      setPDVerifModal(true)
      setMessage(response.data.message) // Show success message in UI
    } catch (error) {
      console.error('Error sending verification code:', error.response?.data || error.message)

      // Display error message in UI
      setError(error.response?.data?.error || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }
  const confirmChangePDCode = async () => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${BaseUrl}/auth/client/verify-pd-change-code`,
        { PDVerifCode }, // Empty request body (if needed)
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Handle successful response
      console.log('personal details changed successfully:', response.data.message)
      setPDVerifModal(false)
      setPDVerifCode('')
      fetchUserData()
      setMessage(response.data.message) // Show success message in UI
    } catch (error) {
      console.error('Error sending verification code:', error.response?.data || error.message)

      // Display error message in UI
      setError(error.response?.data?.error || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const closePDModal = () => {
    setVisiblePDModal(false)
    setEmail(data?.email)
    setPersonalPhoneNumber(data?.personalPhoneNumber)
  }
  const closePDVerifModal = () => {
    setPDVerifCode(false)
  }
  useEffect(() => {
    fetchUserData()
  }, [])

  if (loading) {
    return <CSpinner />
  }

  return (
    <CRow className="justify-content-center mt-5">
      <CCol xs={12} md={6} lg={4}>
        <CCard className="shadow-lg p-4 bg-white rounded-4 border-0">
          {/* Card Header */}
          <CCardHeader className="text-center bg-gradient bg-primary text-white rounded-top-4 py-3">
            <CIcon icon={cilUser} size="xl" className="me-2" />
            <span className="fw-bold fs-5">Profile</span>
          </CCardHeader>

          {/* Card Body */}
          <CCardBody className="text-center">
            {/* Profile Image */}
            <div className="position-relative d-flex justify-content-center mb-3">
              <CCardImage
                src={data?.profilePicture}
                alt="Profile Picture"
                className="border border-primary shadow-sm"
                style={{ objectFit: 'cover', maxHeight: '300px' }}
              />
            </div>

            {/* User Information */}
            <CCardTitle className="fw-bold fs-4 text-dark">{data?.fullName}</CCardTitle>
            <CCardText className="text-muted fs-6 mb-2 text-break">{data?.placeName}</CCardText>
            <CCardText className="text-dark fw-semibold text-break">
              📧 Email: <span className="text-primary">{data?.email}</span>
            </CCardText>
            <CCardText className="text-dark fw-semibold text-break">
              📍 Location: <span className="text-success">{data?.PlaceAddress}</span>
            </CCardText>

            {/* Action Buttons */}
            <div className="d-flex flex-column flex-md-column justify-content-center gap-3 mt-3">
              <CButton
                color="primary"
                variant="outline"
                className="rounded-pill px-4 py-2"
                onClick={() => setVisible(true)}
              >
                <CIcon icon={cilSettings} className="me-1" /> Change Password
              </CButton>
              <CButton
                color="primary"
                variant="outline"
                className="rounded-pill px-4 py-2"
                onClick={() => setDetailsVisible(true)}
              >
                <CIcon icon={cilSettings} className="me-1" /> Change Place Details
              </CButton>
              <CButton
                color="primary"
                variant="outline"
                className="rounded-pill px-4 py-2"
                onClick={() => setVisiblePDModal(true)}
              >
                <CIcon icon={cilSettings} className="me-1" /> Change Personal Details
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>Settings</CModalHeader>
        <CModalBody>
          <h5>Change Password</h5>

          {!emailSent ? (
            <>
              <CForm>
                <CFormInput
                  onChange={(e) => setOldPassword(e.target.value)}
                  type="password"
                  placeholder="old password"
                  className="mt-2 mb-2"
                />
              </CForm>
              <CButton color="warning" onClick={() => sendPwdVerificationCode(oldPassword)}>
                <CIcon icon={cilEnvelopeOpen} className="me-1" /> Send Confirmation Email
              </CButton>
            </>
          ) : (
            <CForm>
              <CFormInput
                type="text"
                placeholder="Enter confirmation code"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
              <CFormInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder="new password"
                className="mt-2"
              />
              <CFormInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                placeholder="confirm password"
                className="mt-2 mb-2"
              />
              <CButton
                color="success"
                className="mt-2 me-3"
                onClick={() => changePassword(confirmationCode, newPassword, confirmPassword)}
              >
                <CIcon icon={cilLockLocked} className="me-1" /> Confirm
              </CButton>
              <CButton color="warning" className="mt-2" onClick={() => setEmailSent(false)}>
                Cancel
              </CButton>
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={DetailsVisible} onClose={() => setDetailsVisible(false)}>
        <CModalHeader>Place Details</CModalHeader>
        <CModalBody>
          <CForm>
            <CFormLabel>Place name</CFormLabel>
            <CFormInput
              type="text"
              placeholder="Place Name"
              value={data?.placeName}
              className="mb-2"
            />
            <CFormLabel>Place address</CFormLabel>

            <CFormInput
              type="text"
              className="mb-2"
              placeholder="Place address"
              value={data?.PlaceAddress}
            />
            <CFormLabel>Phone number</CFormLabel>

            <CFormInput
              type="text"
              className="mb-2"
              placeholder="Phone Number"
              value={data?.phoneNumber}
            />
            <CFormLabel>Place logo</CFormLabel>
            <CFormInput type="file" className="mb-2" placeholder="Place Logo" />
            <CFormLabel>Place picture</CFormLabel>
            <CFormInput type="file" className="mb-2" placeholder="Place Profile Picture" />
            <CFormLabel>Distance</CFormLabel>

            <CFormInput type="number" placeholder="Distance" className="mt-2" />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDetailsVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={visiblePDModal} onClose={closePDModal}>
        <CModalHeader> Personal Details</CModalHeader>
        <CModalBody>
          <CForm>
            <CFormLabel>Email</CFormLabel>
            <CFormInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="text"
              placeholder="email"
              className="mb-2"
            />
            <CFormLabel>Phone Number</CFormLabel>
            <CFormInput
              value={personalPhoneNumber}
              onChange={(e) => setPersonalPhoneNumber(e.target.value)}
              type="tel"
              placeholder="Personal Phone Number"
              className="mb-2"
            />
            <CButton color="info" className="mt-2" onClick={() => sendEmailPDVerif()}>
              <CIcon icon={cilEnvelopeOpen} className="me-1" /> change Credentials
            </CButton>
            <br />
            <CFormLabel>Profile picture</CFormLabel>
            <CFormInput
              onChange={(e) => changeProfilePic(e, 'profile')}
              type="file"
              placeholder="Profile Picture"
              className="mb-2"
            />
            <CImage
              src={tempSrcProfile !== '' ? tempSrcProfile : data?.profilePicture}
              alt="pic"
              height={100}
              width={100}
            ></CImage>
          </CForm>
        </CModalBody>
      </CModal>
      <CModal visible={pDVerifModal} onClose={closePDVerifModal}>
        <CModalHeader> Verification Code</CModalHeader>
        <CModalBody>
          <CForm>
            <CFormLabel>enter code recieved by email</CFormLabel>
            <CFormInput
              value={PDVerifCode}
              onChange={(e) => setPDVerifCode(e.target.value)}
              type="text"
              placeholder="email"
              className="mb-2"
            />
            <CButton color="success" className="mt-2 me-3" onClick={() => confirmChangePDCode()}>
              Confirm
            </CButton>
            <CButton color="warning" className="mt-2">
              Cancel
            </CButton>
          </CForm>
        </CModalBody>
      </CModal>
    </CRow>
  )
}

export default Profile
