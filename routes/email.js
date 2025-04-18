const express = require('express');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const router = express.Router();

// Initialize Supabase client with service role key
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Use TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Send Approval Email
router.post('/send-approval', async (req, res) => {
    const { userId } = req.body;

    try {
        // Fetch user email from Supabase auth
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (userError || !user.user.email) {
            return res.status(400).json({ error: 'User not found or email not available' });
        }

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: user.user.email,
            subject: 'Resident Profile Approval',
            text: 'Dear Resident,\n\nYour resident profile has been approved.\n\nThank you,\nResident Management Team',
            html: '<p>Dear Resident,</p><p>Your resident profile has been <strong>approved</strong>.</p><p>Thank you,<br>Resident Management Team</p>',
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Approval email sent successfully' });
    } catch (error) {
        console.error('Error sending approval email:', error);
        res.status(500).json({ error: 'Failed to send approval email' });
    }
});

// Send Rejection Email
router.post('/send-rejection', async (req, res) => {
    const { userId, rejectionReason } = req.body;

    try {
        // Fetch user email from Supabase auth
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (userError || !user.user.email) {
            return res.status(400).json({ error: 'User not found or email not available' });
        }

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: user.user.email,
            subject: 'Resident Profile Rejection',
            text: `Dear Resident,\n\nYour resident profile has been rejected.\nReason: ${rejectionReason}\n\nPlease address the issue and resubmit.\n\nThank you,\nResident Management Team`,
            html: `<p>Dear Resident,</p><p>Your resident profile has been <strong>rejected</strong>.</p><p><strong>Reason:</strong> ${rejectionReason}</p><p>Please address the issue and resubmit.</p><p>Thank you,<br>Resident Management Team</p>`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Rejection email sent successfully' });
    } catch (error) {
        console.error('Error sending rejection email:', error);
        res.status(500).json({ error: 'Failed to send rejection email' });
    }
});

// Send Pending Email
router.post('/send-pending', async (req, res) => {
    const { userId } = req.body;

    try {
        // Fetch user email from Supabase auth
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
        if (userError || !user.user.email) {
            return res.status(400).json({ error: 'User not found or email not available' });
        }

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: user.user.email,
            subject: 'Resident Profile Submission',
            text: 'Dear Resident,\n\nYour resident profile has been submitted and is pending review.\n\nThank you,\nResident Management Team',
            html: '<p>Dear Resident,</p><p>Your resident profile has been submitted and is <strong>pending review</strong>.</p><p>Thank you,<br>Resident Management Team</p>',
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Pending email sent successfully' });
    } catch (error) {
        console.error('Error sending pending email:', error);
        res.status(500).json({ error: 'Failed to send pending email' });
    }
});

module.exports = router;