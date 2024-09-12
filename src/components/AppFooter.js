import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="#" target="_blank" rel="noopener noreferrer">
          Cafe'In
        </a>
        <span className="ms-1">&copy; 2024 Cafe'In.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered with&#x1F9E1;By</span>
        <a href="#" target="_blank" rel="noopener noreferrer">
           Cafe'In
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
