import { CCardFooter, CCol, CProgress, CRow, CSpinner } from '@coreui/react'
import axios from 'axios'
import { BaseUrl } from '../../../helpers/BaseUrl'
import { GetToken } from '../../../helpers/GetToken'
import { useEffect, useState } from 'react'
import classNames from 'classnames'

const MostSoldProducts = () => {
  const [loading, setLoading] = useState(false)
  const [mostSold, setMostSold] = useState([])
  const token = GetToken()
  const getMostSoldProducts = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BaseUrl}/dashboard/most-sold-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setMostSold(response.data)
      console.log(response.data)
    } catch (err) {
      console.log('Error fetching daily')
      console.error(err)
    }
    setLoading(false)
  }
  useEffect(() => {
    getMostSoldProducts()
  }, [])
  if (loading) {
    return <CSpinner />
  }
  return (
    <CCardFooter>
      <CRow
        xs={{ cols: 1, gutter: 4 }}
        sm={{ cols: 2 }}
        lg={{ cols: 4 }}
        xl={{ cols: 5 }}
        className="mb-2 text-center"
      >
        {mostSold?.map((product, index, items) => (
          <CCol
            className={classNames({
              'd-none d-xl-block': index + 1 === items.length,
            })}
            key={product._id}
          >
            <div className="text-body-secondary">{product.productName}</div>
            <div className="fw-semibold text-truncate">{product.totalSold} Sold</div>
            <CProgress
              thin
              className="mt-2"
              color="success" // Customize the progress color if necessary
              value={(product?.totalSold / mostSold[0]?.totalSold) * 100} // Use percentage based on the highest product sold
            />
          </CCol>
        ))}
      </CRow>
    </CCardFooter>
  )
}
export default MostSoldProducts
