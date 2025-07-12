import express, { RequestHandler } from 'express';

const router = express.Router();

let mockUser = {
  id: 'guest',
  name: 'Guest',
  avatarIndex: 0,
  xp: 0,
  level: 1,
  hydrationProgress: 0,
  medicationProgress: 0,
  achievements: [],
  cards: [],
};

const getProfile: RequestHandler = (req, res) => {
  res.json(mockUser);
};

const updateAvatar: RequestHandler = (req, res) => {
  const { avatarIndex } = req.body;
  if (typeof avatarIndex !== 'number') {
    res.status(400).json({ error: 'Invalid avatarIndex' });
    return;
  }
  mockUser.avatarIndex = avatarIndex;
  console.log('🧑 Avatar index updated to:', avatarIndex);
  res.status(200).json({ success: true });
};

router.get('/profile', getProfile);
router.post('/profile/avatar', updateAvatar);

export default router;