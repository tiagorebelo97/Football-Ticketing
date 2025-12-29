
import express from 'express';
import {
    getClubUsers,
    getClubRoles,
    createClubUser,
    updateClubUser,
    deleteClubUser
} from '../controllers/users';

const router = express.Router();

// Get all users for a club
router.get('/:clubId/users', getClubUsers);

// Get available roles for a club
router.get('/:clubId/roles', getClubRoles);

// Create a new user
router.post('/:clubId/users', createClubUser);

// Update a user
router.put('/:clubId/users/:userId', updateClubUser);

// Delete a user
router.delete('/:clubId/users/:userId', deleteClubUser);

export default router;
