import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.send('Enayah Backend API')
})

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Enayah backend running',
  })
})

export default router
