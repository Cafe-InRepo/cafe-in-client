import React from 'react'
import { useSelector } from 'react-redux'
import CIcon from '@coreui/icons-react'
import {
  cilNotes,
  cilSpeedometer,
  cilWallet,
  cilUser,
  cilListNumbered,
  cilBraille,
  cilBell,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'
import { jwtDecode } from 'jwt-decode'
import translations from './app/Language'

const NavItems = () => {
  // Get the current language and translations from Redux
  const t = useSelector((state) => state.language)
  const Language = translations[t]

  // Decode the role from token
  const token = localStorage.getItem('token')
  let role = null
  if (token) {
    const decodedToken = jwtDecode(token)
    role = decodedToken.role
  }

  // Define the navigation items
  const _nav = [
    {
      component: CNavItem,
      name: Language.dashboard || 'Dashboard',
      to: '/dashboard',
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      badge: {
        color: 'info',
        text: 'NEW',
      },
    },
    {
      component: CNavItem,
      name: Language?.menu || 'Menu',
      to: '/menu/sections',
      icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: Language?.payment || 'Payment',
      to: '/tables/tablesList',
      icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
    },
    {
      component: CNavGroup,
      name: Language?.users || 'Users',
      to: '/users',
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: Language?.usersList || 'Users List',
          to: '/users/usersList',
        },
        {
          component: CNavItem,
          name: Language?.createUser || 'Create User',
          to: '/users/createUser',
        },
      ],
    },
    {
      component: CNavItem,
      name: Language?.orders || 'Orders',
      to: '/orders/ordersList',
      icon: <CIcon icon={cilListNumbered} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: Language?.manuallyPlaceOrder || 'Place an Order manually',
      to: '/Manuel-orders',
      icon: <CIcon icon={cilBraille} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: Language?.productAvailability || "Product's availability",
      to: '/product/availability',
      icon: <CIcon icon={cilBraille} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: Language?.support || 'Support',
      to: '/support',
      icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: Language?.dailyReceipt || 'Daily Receipt',
      to: '/daily-receipt',
      icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
    },
  ]

  // Filter navigation items based on role
  const filterNavItemsByRole = (navItems, role) => {
    if (role === 'superClient') {
      return navItems
    } else if (role === 'client') {
      return navItems.filter((item) => {
        if (
          item.name === Language?.users ||
          item.name === Language?.menu ||
          item.name === Language?.dashboard
        ) {
          return false
        }
        return true
      })
    }
    return navItems
  }

  const filteredNavItems = filterNavItemsByRole(_nav, role)

  return filteredNavItems
}

export default NavItems
