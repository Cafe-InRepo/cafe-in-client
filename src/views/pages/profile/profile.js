import React, { useEffect, useState } from 'react'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CAlert,
  CModalTitle,
} from '@coreui/react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { GetToken } from '../../../helpers/GetToken'
import { BaseUrl } from '../../../helpers/BaseUrl'
import axios from 'axios'

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ClientProfile = () => {
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
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const token = GetToken()

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/auth/get-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const userData = response.data

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

  useEffect(() => {
    fetchUserData()
  }, [])

  // Map Click Event Handler
  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        setProfileData((prevState) => ({
          ...prevState,
          location: {
            lat: e.latlng.lat,
            long: e.latlng.long,
          },
        }))
      },
    })
    return null
  }

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Handle Location Input
  const handleLocationChange = (e) => {
    const { name, value } = e.target
    setProfileData((prevState) => ({
      ...prevState,
      location: {
        ...prevState.location,
        [name]: parseFloat(value),
      },
    }))
  }

  // Handle Distance Radius Change
  const handleDistanceChange = (e) => {
    setProfileData((prevState) => ({
      ...prevState,
      distanceRadius: parseInt(e.target.value, 10),
    }))
  }

  // Handle Password Change Flow
  const handlePasswordChange = async () => {
    if (profileData.password !== profileData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      // Send verification code to email
      await axios.post(`${BaseUrl}/auth/send-verification-code`, {
        email: 'user@example.com', // Replace with the user's email
      })
      setEmailSent(true)
      setShowPasswordModal(true)
    } catch (error) {
      setError('Failed to send verification code. Please try again.')
    }
  }

  // Verify Code and Update Password
  const verifyCodeAndUpdatePassword = async () => {
    try {
      await axios.post(`${BaseUrl}/auth/verify-code-and-update-password`, {
        code: verificationCode,
        newPassword: profileData.password,
      })
      setShowPasswordModal(false)
      alert('Password updated successfully!')
    } catch (error) {
      setError('Invalid verification code. Please try again.')
    }
  }

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('placeName', profileData.placeName)
      formData.append('phoneNumber', profileData.phoneNumber)
      formData.append('latitude', profileData.location.lat)
      formData.append('longitude', profileData.location.long)
      formData.append('distanceRadius', profileData.distanceRadius)
      if (profileData.logo) {
        formData.append('logo', profileData.logo)
      }

      await axios.put(`${BaseUrl}/auth/superClient/${profileData?.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message)
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <CContainer className="mt-5">
      <CRow className="justify-content-center">
        <CCol lg={8}>
          <CCard>
            <CCardHeader>
              <h3>Profile Settings</h3>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <CFormLabel htmlFor="placeName">Place Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="placeName"
                  name="placeName"
                  value={profileData.placeName}
                  onChange={handleInputChange}
                  required
                />

                <CFormLabel htmlFor="phoneNumber" className="mt-3">
                  Phone Number
                </CFormLabel>
                <CFormInput
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />

                <CFormLabel htmlFor="logo" className="mt-3">
                  Upload Logo
                </CFormLabel>
                <CFormInput
                  type="file"
                  id="logo"
                  name="logo"
                  onChange={(e) => setProfileData({ ...profileData, logo: e.target.files[0] })}
                />

                <CFormLabel className="mt-4">Select Place Location</CFormLabel>
                <div style={{ height: '400px', width: '100%', border: '1px solid #ced4da' }}>
                  <MapContainer
                    center={[profileData?.location.lat, profileData?.location.long]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[profileData?.location.lat, profileData?.location.long]} />
                    <LocationSelector />
                  </MapContainer>
                </div>
                <p className="text-muted mt-2">
                  Coordinates: {profileData?.location?.lat}, {profileData?.location?.long}
                </p>

                <CRow>
                  <CCol md={6}>
                    <CFormLabel htmlFor="lat" className="mt-3">
                      Latitude
                    </CFormLabel>
                    <CFormInput
                      type="number"
                      id="lat"
                      name="lat"
                      value={profileData.location.lat}
                      onChange={handleLocationChange}
                      step="0.0001"
                      required
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="long" className="mt-3">
                      Longitude
                    </CFormLabel>
                    <CFormInput
                      type="number"
                      id="long"
                      name="long"
                      value={profileData.location.long}
                      onChange={handleLocationChange}
                      step="0.0001"
                      required
                    />
                  </CCol>
                </CRow>

                <CFormLabel htmlFor="distanceRadius" className="mt-3">
                  Distance Radius (km)
                </CFormLabel>
                <CFormInput
                  type="number"
                  id="distanceRadius"
                  name="distanceRadius"
                  value={profileData.distanceRadius}
                  onChange={handleDistanceChange}
                  min="1"
                  required
                />

                <CFormLabel htmlFor="password" className="mt-3">
                  New Password
                </CFormLabel>
                <CFormInput
                  type="password"
                  id="password"
                  name="password"
                  value={profileData.password}
                  onChange={handleInputChange}
                />

                <CFormLabel htmlFor="confirmPassword" className="mt-3">
                  Confirm Password
                </CFormLabel>
                <CFormInput
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={profileData.confirmPassword}
                  onChange={handleInputChange}
                />

                {error && <CAlert color="danger">{error}</CAlert>}

                <CButton color="primary" type="submit" className="mt-4 w-100">
                  Save Changes
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Password Verification Modal */}
      <CModal visible={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
        <CModalHeader>
          <CModalTitle>Verify Your Email</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>We've sent a verification code to your email. Please enter it below.</p>
          <CFormInput
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          {error && <CAlert color="danger">{error}</CAlert>}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowPasswordModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={verifyCodeAndUpdatePassword}>
            Verify
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default ClientProfile
