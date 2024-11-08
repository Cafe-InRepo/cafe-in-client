import React, { useEffect, useRef, useState } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import { GetToken } from '../../helpers/GetToken'
import { CSpinner } from '@coreui/react'

const MainChart = () => {
  const chartRef = useRef(null)
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)
  const [maxValue, setMaxValue] = useState()
  const token = GetToken() // Replace with your actual token

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

        // Calculate the maximum value for the y-axis
        const allValues = response.data.flatMap((monthData) =>
          Object.values(monthData.products).map((product) => product.totalRevenue),
        )
        setMaxValue(Math.max(...allValues, 60)) // Ensure at least 60 as default
      } catch (err) {
        console.error('Error fetching revenue by product by month:', err)
      }
      setLoading(false)
    }

    getRevenueByProductByMonth()
  }, [token])

  useEffect(() => {
    if (chartRef.current) {
      setTimeout(() => {
        chartRef.current.options.scales.x.grid.borderColor = getStyle(
          '--cui-border-color-translucent',
        )
        chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
        chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
        chartRef.current.options.scales.y.grid.borderColor = getStyle(
          '--cui-border-color-translucent',
        )
        chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
        chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
        chartRef.current.update()
      })
    }
  }, [chartRef, maxValue]) // Add maxValue to the dependency array

  // Get current year and month
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // JavaScript months are 0-based

  // Filter months and transform data for the chart
  const months = Array.from({ length: 12 }, (_, i) => i + 1).filter(
    (month) => month <= currentMonth,
  )
  const labels = months.map((month) =>
    new Date(currentYear, month - 1).toLocaleString('default', { month: 'long' }),
  )

  // Extract product names and generate unique colors
  const productNames = Object.values(
    revenueData.reduce((acc, monthData) => {
      Object.keys(monthData.products).forEach((productId) => {
        if (!acc[productId]) {
          acc[productId] = monthData.products[productId].productName
        }
      })
      return acc
    }, {}),
  )

  const colors = productNames.map(
    (_, index) => `hsl(${(index * 360) / productNames.length}, 70%, 50%)`,
  )

  const datasets = productNames.map((productName, index) => ({
    label: productName,
    backgroundColor: 'transparent',
    borderColor: colors[index],
    pointHoverBackgroundColor: colors[index],
    borderWidth: 2,
    borderDash: index % 2 === 0 ? [] : [5, 5], // Example: solid line for even indices, dashed line for odd indices
    data: months.map((month) => {
      const monthData = revenueData.find((data) => data.month === month)
      return (
        monthData?.products[
          Object.keys(monthData.products).find(
            (productId) => monthData.products[productId].productName === productName,
          )
        ]?.totalRevenue || 0
      )
    }),
  }))
  if (loading) {
    return <CSpinner />
  }
  return (
    <>
      <CChartLine
        ref={chartRef}
        style={{ height: '300px', marginTop: '40px' }}
        data={{
          labels,
          datasets,
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
            },
          },
          scales: {
            x: {
              grid: {
                color: getStyle('--cui-border-color-translucent'),
                drawOnChartArea: false,
              },
              ticks: {
                color: getStyle('--cui-body-color'),
              },
            },
            y: {
              beginAtZero: true,
              border: {
                color: getStyle('--cui-border-color-translucent'),
              },
              grid: {
                color: getStyle('--cui-border-color-translucent'),
              },
              max: maxValue, // Set the max value dynamically
              ticks: {
                color: getStyle('--cui-body-color'),
                maxTicksLimit: 5,
                stepSize: Math.ceil(maxValue / 5),
              },
            },
          },
          elements: {
            line: {
              tension: 0.4,
            },
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4,
              hoverBorderWidth: 3,
            },
          },
        }}
      />
    </>
  )
}

export default MainChart
