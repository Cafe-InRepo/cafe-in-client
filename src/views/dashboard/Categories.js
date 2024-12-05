import React from 'react'
import { useNavigate } from 'react-router-dom'
import './CSS/Dashboard.css' // Import the CSS file for styling
import salesImage from '../../assets/images/categories/sales-.png'
import products from '../../assets/images/categories/products-.png'
import OrderManagement from '../../assets/images/categories/OrderManagement-.png'
import CustomerInsights from '../../assets/images/categories/CustomerInsights-.png'
import RevenueAnalysis from '../../assets/images/categories/RevenueAnalysis-.png'
import InventoryOverview from '../../assets/images/categories/InventoryOverview-.png'
import Bill from '../../assets/images/categories/bill.png'

const Dashboard = () => {
  const navigate = useNavigate()

  const categories = [
    {
      name: 'Sales Statistics',
      color: '#4A7CA2',
      path: '/sales',
      image: salesImage, // Replace with your image path
    },
    {
      name: 'Product Performance',
      color: '#8A77A3',
      path: '/product-performance',
      image: products, // Replace with your image path
    },
    {
      name: 'Order Management',
      color: '#D88299',
      path: '/order-management',
      image: OrderManagement, // Replace with your image path
    },
    {
      name: 'Customer Insights',
      color: '#3BBFA5',
      path: '/customer-insights',
      image: CustomerInsights, // Replace with your image path
    },
    {
      name: 'Revenue Analysis',
      color: '#F08866',
      path: '/revenue-analysis',
      image: RevenueAnalysis, // Replace with your image path
    },
    {
      name: 'Inventory Overview',
      color: '#336D86',
      path: '/inventory-overview',
      image: InventoryOverview, // Replace with your image path
    },
    {
      name: 'Bills',
      color: '#336D56',
      path: '/bill',
      image: Bill, // Replace with your image path
    },
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
            <img
              src={category.image}
              alt={`${category.name} icon`}
              className="dashboard-item-image"
            />
            <h3>{category.name}</h3>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Dashboard
