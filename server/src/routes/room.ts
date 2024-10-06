import { Router } from "express";
import controller from "../controllers/room";

const router=Router()

router.get('/getRoom',controller.createRoom)
router.post('/checkRoom',controller.joinCall)

export default router;