import React, { useEffect, useRef, useState } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import axios from 'axios'
import { BaseUrl } from '../../helpers/BaseUrl'
import { GetToken } from '../../helpers/GetToken'
import { CSpinner } from '@coreui/react'

const RevenuePerProductPerDay = ({ onDataUpdate }) => {
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
        onDataUpdate(response.data)

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
  const productNames = []
  const datasets = []

  revenueData.forEach((dayData) => {
    dayData.products.forEach((product) => {
      if (!productNames.includes(product.productName)) {
        productNames.push(product.productName)
      }
    })
  })

  productNames.forEach((productName, index) => {
    const dataPoints = daysOfWeek.map((date) => {
      const dayData = revenueData.find(
        (day) => new Date(day.date).toDateString() === date.toDateString(),
      )
      return dayData
        ? (dayData.products.find((p) => p.productName === productName) || {}).totalRevenue || 0
        : 0
    })

    datasets.push({
      label: productName,
      data: dataPoints,
      borderColor: `hsl(${(index * 360) / productNames.length}, 70%, 50%)`,
      backgroundColor: `hsla(${(index * 360) / productNames.length}, 70%, 50%, 0.2)`,
      tension: 0.4,
    })
  })

  return loading ? (
    <CSpinner color="primary" />
  ) : (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <CChartLine
        ref={chartRef}
        data={{
          labels,
          datasets,
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              suggestedMax: maxValue,
              ticks: {
                stepSize: maxValue / 5,
              },
            },
          },
        }}
      />
    </div>
  )
}

export default RevenuePerProductPerDay
