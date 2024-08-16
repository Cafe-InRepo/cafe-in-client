import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilNotes,
  cilSpeedometer,
  cilWallet,
  cilUser,
  cilListNumbered,
  cilBraille,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { jwtDecode } from 'jwt-decode' // Use named import for jwtDecode

const token = localStorage.getItem('token')
let role = null

if (token) {
  const decodedToken = jwtDecode(token)
  role = decodedToken.role
}

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },

  //menu
  {
    component: CNavItem,
    name: 'Menu',
    to: '/menu',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  //tables
  {
    component: CNavItem,
    name: 'Tables',
    to: '/tables/tablesList',
    icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
    // items: [
    //   {
    //     component: CNavItem,
    //     name: 'Tables List',
    //     to: '/tables/tablesList',
    //   },
    // ],
  },
  //users
  {
    component: CNavGroup,
    name: 'Users',
    to: '/users',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Users List',
        to: '/users/usersList',
      },
      {
        component: CNavItem,
        name: 'Create User',
        to: '/users/createUser',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Orserds',
    to: '/orders/ordersList',
    icon: <CIcon icon={cilListNumbered} customClassName="nav-icon" />,
    // items: [
    //   {
    //     component: CNavItem,
    //     name: 'Orders List',
    //     to: '/orders/ordersList',
    //   },
    // ],
  },
  {
    component: CNavItem,
    name: 'Place an Order manually',
    to: '/Manuel-orders',
    icon: <CIcon icon={cilBraille} customClassName="nav-icon" />,
  },
]

const filterNavItemsByRole = (navItems, role) => {
  if (role === 'superClient') {
    return navItems
  } else if (role === 'client') {
    // Filter out admin-specific items for clients
    return navItems.filter((item) => {
      if (item.name === 'Users' || item.name === 'Menu') return false
      return true
    })
  }
  return navItems
}

const filteredNavItems = filterNavItemsByRole(_nav, role)

export default filteredNavItems
