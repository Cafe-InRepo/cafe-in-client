import React, { useEffect, useRef, useState } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import { GetToken } from '../../helpers/GetToken'
import { CSpinner } from '@coreui/react'

const RevenuePerProductPerDay = () => {
  const chartRef = useRef(null)
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)
  const [maxValue, setMaxValue] = useState()
  const token = GetToken()

  useEffect(() => {
    const getRevenueByProductForCurrentWeek = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${BaseUrl}/dashboard/revenue-by-product-by-day`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setRevenueData(response.data)

        // Calculate the maximum value for the y-axis
        const allValues = response.data.flatMap((dayData) =>
          Object.values(dayData.products).map((product) => product.totalRevenue),
        )
        setMaxValue(Math.max(...allValues, 60)) // Ensure at least 60 as default
      } catch (err) {
        console.error('Error fetching revenue by product by day:', err)
      }
      setLoading(false)
    }

    getRevenueByProductForCurrentWeek()
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
  }, [chartRef, maxValue])

  // Get current week's days
  const now = new Date()
  const currentDay = now.getDay() // Sunday - Saturday : 0 - 6
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - currentDay)

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    return day
  })

  const labels = daysOfWeek.map((date) =>
    date.toLocaleDateString('default', { weekday: 'short', day: 'numeric' }),
  )

  // Extract product names and generate unique colors
  const productNames = Object.values(
    revenueData.reduce((acc, dayData) => {
      Object.keys(dayData.products).forEach((productId) => {
        if (!acc[productId]) {
          acc[productId] = dayData.products[productId].productName
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
    borderDash: index % 2 === 0 ? [] : [5, 5], // Solid line for even indices, dashed line for odd indices
    data: daysOfWeek.map((day) => {
      const dayData = revenueData.find(
        (data) => new Date(data.date).toDateString() === day.toDateString(),
      )
      return (
        dayData?.products[
          Object.keys(dayData.products).find(
            (productId) => dayData.products[productId].productName === productName,
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

export default RevenuePerProductPerDay
