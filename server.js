import { loggerService } from './services/logger.service.js'

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { setupSocketAPI } from './services/socket.service.js'
import { createServer } from 'http'
import path from 'path'


const app = express()
const server = createServer(app)

const corsOptions = {
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
    credentials: true
}

// App configuration
app.use(cors(corsOptions))
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

setupSocketAPI(server)


// Routes
import { postRoutes } from './api/post/post.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { notificationRoutes } from './api/notification/notification.routes.js'
import { messageRoutes } from './api/message/message.routes.js'

app.use('/api/post', postRoutes)
app.use('/api/user', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/notification', notificationRoutes)
app.use('/api/message', messageRoutes)


//fallback route
app.get('/**', (req, res) => {
    console.log('fallback route')
    res.sendFile(path.resolve('public/index.html'))
})

const PORT = process.env.PORT || 3030

server.listen(PORT, () => {
    loggerService.info('Up and running on port ' + PORT)
})

   