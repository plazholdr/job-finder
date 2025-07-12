const express = require('express');
const UsersService = require('../services/users.service');
const logger = require('../logger');

const router = express.Router();

// Verify email endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Verification token is required'
      });
    }

    const usersService = new UsersService(req.app);
    const result = await usersService.verifyEmail(token);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    logger.error('Email verification endpoint error', { error: error.message });
    res.status(400).json({
      error: error.message
    });
  }
});

// Resend verification email endpoint
router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    const usersService = new UsersService(req.app);
    const result = await usersService.resendEmailVerification(email);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    logger.error('Resend verification endpoint error', { error: error.message });
    res.status(400).json({
      error: error.message
    });
  }
});

module.exports = router;
