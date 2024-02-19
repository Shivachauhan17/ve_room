import {Router,RequestHandler} from 'express'
import authController from '../controllers/auth'
const router=Router()

router.post('/signupThroughUtil',authController.signup as RequestHandler)
router.post('/loginThroughUtil',authController.login as RequestHandler)

export default router