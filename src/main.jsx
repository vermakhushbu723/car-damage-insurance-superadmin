import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, App as AntApp } from 'antd'
import './index.css'
import App from './App.jsx'
import { antdTheme } from './constants/theme'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ConfigProvider theme={antdTheme}>
            {/* antd's App wrapper -- required so the static message/notification/
                Modal APIs (see e.g. InsurerNewIdCreationPage's message.success)
                pick up the ConfigProvider theme instead of warning about it. */}
            <AntApp>
                <App />
            </AntApp>
        </ConfigProvider>
    </StrictMode>,
)
