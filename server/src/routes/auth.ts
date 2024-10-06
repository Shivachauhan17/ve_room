import { Router } from "express";
import controller from "../controllers/auth";

const router=Router()

router.post('/register',controller.register)
router.post('/login',controller.login)
router.post('/uploadImagesTo',controller.uploadImagesTo)


export default router