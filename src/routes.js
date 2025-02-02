import React from 'react'
import { jwtDecode } from 'jwt-decode' // Use named import for jwtDecode

const Dashboard = React.lazy(() => import('./views/dashboard/Categories'))
//const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Sales = React.lazy(() => import('./views/dashboard/sales/index'))
const OrderManagment = React.lazy(() => import('./views/dashboard/orderManagment/index'))

const productPerformance = React.lazy(() => import('./views/dashboard/productPerformance/index'))
const employeePerformance = React.lazy(() => import('./views/dashboard/employeePerformance/index'))

const DailyRevenue = React.lazy(() => import('./views/dashboard/sales/DailyReveue'))
const Bill = React.lazy(() => import('./views/dashboard/bill/index'))
// users
const UsersList = React.lazy(() => import('./views/users/usersTable'))
const CreateUser = React.lazy(() => import('./views/users/createUser'))

//menu
const DisplaySections = React.lazy(() => import('./views/menu/section/DisplaySections'))
const DisplayCategories = React.lazy(() => import('./views/menu/categories/DisplayCategories'))

const CategoriDetails = React.lazy(() => import('./views/menu/CategoryDetails'))

//tables
const TablesList = React.lazy(() => import('./views/Tables/TablesList'))
const TableDetails = React.lazy(() => import('./views/Tables/TableDetails'))
// const TablesReservation = React.lazy(() => import('./views/Tables/ReservationsDashboard'))
// const News = React.lazy(() => import('./views/News/News'))

//orders
const OrdersList = React.lazy(() => import('./views/orders/OrdersList'))

//products
const ProductsList = React.lazy(() => import('./views/products/ProductsList'))

//support
const Support = React.lazy(() => import('./views/SupportRequests/NotifSupport'))

//daily receipt
const Daily = React.lazy(() => import('./views/dashboard/DailyReceipt'))

//profile
const Profile = React.lazy(() => import('./views/pages/profile/profile'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const getRoutesByRole = (role) => {
  const commonRoutes = [
    { path: '/', exact: true, name: 'Home' },

    //tables
    { path: '/tables/tablesList', name: 'Tables', element: TablesList },
    { path: '/tables/:tableId', name: 'Tables', element: TableDetails },
    // { path: '/tables/reservation', name: 'Tables', element: TablesReservation },

    //news
    // { path: '/news', name: 'News', element: News },

    //orders
    { path: '/orders/ordersList', name: 'orders', element: OrdersList },

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
    { path: '/order-management', name: 'Order Managment', element: OrderManagment },
    { path: '/product-performance', name: 'product performance', element: productPerformance },
    { path: '/bill', name: 'Bill', element: Bill },
    { path: '/employee-performance', name: 'employee performance', element: employeePerformance },

    //users
    { path: '/users/usersList', name: 'Users', element: UsersList },
    { path: '/users/createUser', name: 'Users', element: CreateUser },
    //menu
    // { path: '/menu', name: 'Menu', element: DisplayMenu },
    { path: '/menu/sections', name: 'Sections', element: DisplaySections },
    { path: '/menu/sections/:sectionId', name: 'Categories', element: DisplayCategories },

    { path: '/menu/categories/:id', name: 'Menu', element: CategoriDetails },

    //profile
    { path: '/profile', name: 'Profile', element: Profile },
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
