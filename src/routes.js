import React from 'react'
import { jwtDecode } from 'jwt-decode' // Use named import for jwtDecode

const Dashboard = React.lazy(() => import('./views/dashboard/Categories'))
//const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Sales = React.lazy(() => import('./views/dashboard/sales/index'))
const productPerformance = React.lazy(() => import('./views/dashboard/productPerformance/index'))

const DailyRevenue = React.lazy(() => import('./views/dashboard/sales/DailyReveue'))

// users
const UsersList = React.lazy(() => import('./views/users/usersTable'))
const CreateUser = React.lazy(() => import('./views/users/createUser'))

//menu
const DisplayMenu = React.lazy(() => import('./views/menu/DisplayMenu'))
const MenuCategories = React.lazy(() => import('./views/menu/categoryAccordion'))
const CategoriDetails = React.lazy(() => import('./views/menu/CategoryDetails'))

//tables
const TablesList = React.lazy(() => import('./views/Tables/TablesList'))
const TableDetails = React.lazy(() => import('./views/Tables/TableDetails'))

//orders
const OrdersList = React.lazy(() => import('./views/orders/OrdersList'))

//manual orders
const ManualOrders = React.lazy(() => import('./views/manualOrders/manualOrders'))
//products
const ProductsList = React.lazy(() => import('./views/products/ProductsList'))

//support
const Support = React.lazy(() => import('./views/SupportRequests/NotifSupport'))

//daily receipt
const Daily = React.lazy(() => import('./views/dashboard/DailyReceipt'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const getRoutesByRole = (role) => {
  const commonRoutes = [
    { path: '/', exact: true, name: 'Home' },

    //tables
    { path: '/tables/tablesList', name: 'Tables', element: TablesList },
    { path: '/tables/:tableId', name: 'Tables', element: TableDetails },

    //orders
    { path: '/orders/ordersList', name: 'orders', element: OrdersList },

    //manual Orders
    { path: '/Manuel-orders', name: 'Tables', element: ManualOrders },
    //products
    { path: '/product/availability', name: 'Products', element: ProductsList },

    //spport
    { path: '/support', name: 'Support', element: Support },
    //daily
    { path: '/daily-receipt', name: 'Support', element: Daily },
    { path: '/widgets', name: 'Widgets', element: Widgets },
  ]

  const adminRoutes = [
    ...commonRoutes,
    //dashboard
    { path: '/dashboard', name: 'Dashboard', element: Dashboard },
    { path: '/Sales', name: 'sales', element: Sales },
    { path: '/product-performance', name: 'product performance', element: productPerformance },
    //users
    { path: '/users/usersList', name: 'Users', element: UsersList },
    { path: '/users/createUser', name: 'Users', element: CreateUser },
    //menu
    { path: '/menu', name: 'Menu', element: DisplayMenu },
    { path: '/menu/categories', name: 'categories', element: MenuCategories },
    { path: '/menu/categories/:id', name: 'Menu', element: CategoriDetails },

    // ...other admin-specific routes
  ]

  const clientRoutes = [
    ...commonRoutes,
    // ...client-specific routes
  ]

  switch (role) {
    case 'superClient':
      return adminRoutes
    case 'client':
      return clientRoutes
    default:
      return commonRoutes
  }
}

const getRoutes = () => {
  const token = localStorage.getItem('token')
  if (token) {
    const decodedToken = jwtDecode(token)
    const role = decodedToken.role
    return getRoutesByRole(role)
  }
  return getRoutesByRole() // Return common routes if no token is found
}

const routes = getRoutes()

export default routes
