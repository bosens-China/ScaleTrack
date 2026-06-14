import dayjs from 'dayjs'
import zhCN from 'dayjs/locale/zh-cn'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'virtual:uno.css'
import App from './App.tsx'
import PwaProvider from './components/PwaProvider.tsx'
import './index.css'

dayjs.locale(zhCN)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PwaProvider>
      <App />
    </PwaProvider>
  </StrictMode>,
)
