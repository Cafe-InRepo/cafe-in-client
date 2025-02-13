//Total sales and revenue generated today

import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import {
  CRow,
  CCol,
  CWidgetStatsA,
  CSpinner,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import axios from 'axios'

import { BaseUrl } from '../../../helpers/BaseUrl'
import { GetToken } from '../../../helpers/GetToken'
import { useSelector } from 'react-redux'
import translations from '../../../app/Language'

const DailyRevenue = (props) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const token = GetToken()
  const [loading, setLoading] = useState(false)

  const t = useSelector((state) => state.language)
  const Language = translations[t]
  //daily revenue

  const [dailyRevenue, setDailyRevenue] = useState()

  const getDailyRevenue = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BaseUrl}/dashboard/daily-revenue`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setDailyRevenue(response.data.totalRevenue)
    } catch (err) {
      console.log('Error fetching daily')
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
    getDailyRevenue()
  }, [widgetChartRef1, widgetChartRef2])
  


  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol >
        {!loading ? (
          <CWidgetStatsA
            color="primary"
            value={dailyRevenue?.toFixed(2) + ' TND '}
            title={Language.TodaysRevenue}
          />
        ) : (
          <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
        )}
      </CCol>
    </CRow>
  )
}

DailyRevenue.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default DailyRevenue
