import React, { useEffect, useState } from 'react'
import {
  CFormSwitch,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CInputGroup,
  CFormInput,
  CAlert,
  CSpinner,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import axios from 'axios'
import { GetToken } from '../../helpers/GetToken'
import { BaseUrl } from '../../helpers/BaseUrl'
import Loading from '../../helpers/Loading'
import { useSelector } from 'react-redux'
import translations from '../../app/Language'

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // Set items per page
  const token = GetToken()
  //language
  const t = useSelector((state) => state.language)
  const Language = translations[t]

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError('')
      setMessage('')

      try {
        const response = await axios.get(`${BaseUrl}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setProducts(response.data)
        setFilteredProducts(response.data)
      } catch (err) {
        setError('Failed to fetch products')
      } finally {
        setLoading(false)
        setTimeout(() => {
          setError('')
          setMessage('')
        }, 3000) // Remove error and message after 3 seconds
      }
    }

    fetchProducts()
  }, [token])

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())),
    )
    setCurrentPage(1) // Reset to first page after search
  }, [search, products])

  const toggleAvailability = async (productId, currentAvailability) => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await axios.put(
        `${BaseUrl}/products/${productId}/availability`,
        { available: !currentAvailability },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId ? { ...product, available: !currentAvailability } : product,
        ),
      )
      setMessage('Product availability updated successfully')
    } catch (err) {
      setError('Failed to update product availability')
    } finally {
      setLoading(false)
      setTimeout(() => {
        setError('')
        setMessage('')
      }, 3000) // Remove error and message after 3 seconds
    }
  }

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  return (
    <div>
      {loading && <Loading />}
      {error && (
        <CAlert color="danger" onClose={() => setError('')} dismissible>
          {error}
        </CAlert>
      )}
      {message && (
        <CAlert color="success" onClose={() => setMessage('')} dismissible>
          {message}
        </CAlert>
      )}

      <CInputGroup className="mb-3">
        <CFormInput
          placeholder={Language.search + ' ' + Language.products}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </CInputGroup>

      <CTable align="middle" className="mb-0 border" hover responsive>
        <CTableHead className="text-nowrap">
          <CTableRow>
            <CTableHeaderCell className="bg-body-tertiary ">{Language.products}</CTableHeaderCell>
            <CTableHeaderCell className="bg-body-tertiary ">{Language.available}</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentItems.map((product) => (
            <CTableRow key={product._id}>
              <CTableDataCell>{product.name}</CTableDataCell>
              <CTableDataCell className="text-center">
                <CFormSwitch
                  color="primary"
                  checked={product.available}
                  onChange={() => toggleAvailability(product._id, product.available)}
                />
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CPagination align="center" className="mt-3">
        <CPaginationItem
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prevPage) => prevPage - 1)}
        >
          {Language.previous}
        </CPaginationItem>
        {[...Array(totalPages).keys()].map((page) => (
          <CPaginationItem
            key={page + 1}
            active={page + 1 === currentPage}
            onClick={() => setCurrentPage(page + 1)}
          >
            {page + 1}
          </CPaginationItem>
        ))}
        <CPaginationItem
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
        >
          {Language.next}
        </CPaginationItem>
      </CPagination>
    </div>
  )
}

export default ProductList
