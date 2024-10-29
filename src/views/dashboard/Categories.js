import React from 'react'
import { useNavigate } from 'react-router-dom'
import './CSS/Dashboard.css' // Import the CSS file for styling

const Dashboard = () => {
  const navigate = useNavigate()

  const categories = [
    { name: 'Sales Statistics', color: '#FF5733', path: '/sales-statistics' },
    { name: 'Product Performance', color: '#33B5FF', path: '/product-performance' },
    { name: 'Order Management', color: '#33FF57', path: '/order-management' },
    { name: 'Customer Insights', color: '#FF33A1', path: '/customer-insights' },
    { name: 'Revenue Analysis', color: '#FFA833', path: '/revenue-analysis' },
    { name: 'Inventory Overview', color: '#8333FF', path: '/inventory-overview' },
  ]

  return (
    <div className="dashboard-grid">
      {categories.map((category, index) => (
        <div
          key={index}
          className="dashboard-item"
          style={{ backgroundColor: category.color }}
          onClick={() => navigate(category.path)}
        >
          <div className="dashboard-item-content">
            <h3>{category.name}</h3>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Dashboard
