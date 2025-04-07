import express from 'express'
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user-controller'
import { isAdminOrSelf } from '../middleware/auth/auth'

const router = express.Router()

router.get('/', getAllUsers)
router.get('/:id', getUser)
router.post('/', createUser)
router.put('/:id', isAdminOrSelf, updateUser)
router.delete('/:id', isAdminOrSelf, deleteUser)

export default router