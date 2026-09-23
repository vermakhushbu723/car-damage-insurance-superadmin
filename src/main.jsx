import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App as AntApp } from 'antd'
import './index.css'
import App from './App.jsx'
import { antdTheme } from './constants/theme'
import { DataProvider } from './store/DataStore'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// Needed for dayjs('09:00 AM', 'hh:mm A') style parsing (Service Model working hours).
dayjs.extend(customParseFormat)

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ConfigProvider theme={antdTheme}>
            {/* antd's App wrapper -- required so App.useApp()'s message/modal
                pick up the ConfigProvider theme. */}
            <AntApp>
                <DataProvider>
                    <App />
                </DataProvider>
            </AntApp>
        </ConfigProvider>
    </StrictMode>,
)
