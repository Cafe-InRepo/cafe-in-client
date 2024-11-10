import React, { useEffect, useState } from 'react'
import { CChartPie } from '@coreui/react-chartjs'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import { GetToken } from '../../helpers/GetToken'
import { CSpinner } from '@coreui/react'

const MainChart = ({ onDataUpdate }) => {
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)
  const token = GetToken()

  useEffect(() => {
    const getRevenueByProductByMonth = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${BaseUrl}/dashboard/revenue-by-product-by-month`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setRevenueData(response.data)
        onDataUpdate(response.data)
      } catch (err) {
        console.error('Error fetching revenue by product:', err)
      }
      setLoading(false)
    }

    getRevenueByProductByMonth()
  }, [token])

  // Prepare data for the pie chart
  const productNames = []
  const revenues = []

  revenueData.forEach((monthData) => {
    monthData.products.forEach((product) => {
      const index = productNames.indexOf(product.productName)
      if (index === -1) {
        productNames.push(product.productName)
        revenues.push(product.totalRevenue)
      } else {
        revenues[index] += product.totalRevenue
      }
    })
  })

  return loading ? (
    <CSpinner color="primary" />
  ) : (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <CChartPie
        style={{ maxHeight: '400px', height: '400px' }}
        data={{
          labels: productNames,
          datasets: [
            {
              data: revenues,
              backgroundColor: productNames.map(
                (_, index) => `hsl(${(index * 360) / productNames.length}, 70%, 50%)`,
              ),
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
    </div>
  )
}

export default MainChart
