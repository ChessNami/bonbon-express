// routes/email.js
const express = require('express');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const router = express.Router();

// Supabase Admin Client (Service Role Key)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Nodemailer Transporter
const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false }
});

// BARANGAY ADMIN EMAIL
const ADMIN_EMAIL = 'barangaybonbon2024@gmail.com';

// Helper Function: Send Email
const sendEmail = async (to, subject, text, html = '') => {
    const mailOptions = {
        from: `"Barangay Bonbon" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>'),
    };
    return await transporter.sendMail(mailOptions);
};

// 1. NOTIFY ADMIN: New Profile Submitted (Status = 3)
router.post('/send-pending-admin', async (req, res) => {
    const { userId, residentName } = req.body;

    if (!userId || !residentName) {
        return res.status(400).json({ error: 'userId and residentName are required' });
    }

    try {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        const userEmail = user?.email || 'Not provided';

        const subject = `NEW PENDING PROFILE: ${residentName}`;
        const text = `
NEW RESIDENT PROFILE SUBMITTED

Name: ${residentName}
Email: ${userEmail}
Date: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}

Action Required: Review and approve/reject in Admin Panel.
        `;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background: #1d4ed8; color: white; padding: 20px; text-align: center;">
                    <h1>Barangay Bonbon</h1>
                    <p>New Resident Profile Submitted</p>
                </div>
                <div style="padding: 20px; background: #f9fafb;">
                    <h3 style="color: #1d4ed8;">Pending Review</h3>
                    <p>A new resident has submitted their profile:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                        <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td>${residentName}</td></tr>
                        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td>${userEmail}</td></tr>
                        <tr><td style="padding: 8px; font-weight: bold;">Submitted:</td><td>${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</td></tr>
                    </table>
                    <br>
                    <a href="https://barangay-bonbon.vercel.app/admin/resident-management"
                       style="background:#1d4ed8; color:white; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">
                       Review Profile Now
                    </a>
                </div>
                <div style="background:#e5e7eb; padding:15px; text-align:center; font-size:12px; color:#555;">
                    Barangay Bonbon Resident Management System © ${new Date().getFullYear()}
                </div>
            </div>
        `;

        await sendEmail(ADMIN_EMAIL, subject, text, html);
        console.log(`Admin notified: ${residentName} submitted profile`);
        res.json({ success: true, message: 'Admin notified successfully' });
    } catch (error) {
        console.error('Failed to send admin notification:', error);
        res.status(500).json({ error: 'Failed to notify admin' });
    }
});

// 2. NOTIFY USER: Your profile is pending
router.post('/send-pending', async (req, res) => {
    const { userId } = req.body;

    try {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        if (!user?.email) return res.status(400).json({ error: 'User has no email' });

        const subject = 'Your Profile is Under Review';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #1d4ed8;">Thank You!</h2>
                <p>Your resident profile has been successfully submitted.</p>
                <p>It is now <strong>pending review</strong> by the Barangay Bonbon team.</p>
                <p>You will receive another email once your profile is <strong>approved</strong>.</p>
                <br>
                <p>Thank you for registering!</p>
                <p><strong>Barangay Bonbon Team</strong></p>
            </div>
        `;

        await sendEmail(user.email, subject, 'Your profile is pending review.', html);
        res.json({ success: true });
    } catch (error) {
        console.error('User pending email failed:', error);
        res.status(500).json({ error: 'Failed to send user email' });
    }
});

// 3. Approval Email (User)
router.post('/send-approval', async (req, res) => {
    const { userId } = req.body;
    try {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        if (!user?.email) return res.status(400).json({ error: 'No email' });

        await sendEmail(
            user.email,
            'Your Profile Has Been Approved!',
            'Congratulations! Your resident profile has been approved.',
            `<h2>Congratulations!</h2><p>Your profile has been <strong>approved</strong>!</p><p>Welcome to Barangay Bonbon.</p><p><strong>Thank you!</strong></p>`
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Rejection Email (User)
router.post('/send-rejection', async (req, res) => {
    const { userId, rejectionReason } = req.body;
    try {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        if (!user?.email) return res.status(400).json({ error: 'No email' });

        await sendEmail(
            user.email,
            'Profile Update Needed',
            `Your profile was rejected. Reason: ${rejectionReason}`,
            `<p>Your profile was <strong>rejected</strong>.</p><p><strong>Reason:</strong> ${rejectionReason}</p><p>Please log in and fix the issues.</p>`
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Update Request (Admin asks user to update)
router.post('/send-update-request', async (req, res) => {
    const { userId, updateReason } = req.body;
    try {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        if (!user?.email) return res.status(400).json({ error: 'No email' });

        await sendEmail(
            user.email,
            'Profile Update Requested',
            `Please update your profile. Reason: ${updateReason}`,
            `<p>An update to your profile has been <strong>requested</strong>.</p><p><strong>Reason:</strong> ${updateReason}</p><p>Please log in and make the changes.</p>`
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Update Profiling Required
router.post('/send-update-profiling', async (req, res) => {
    const { userId, updateReason } = req.body;
    try {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        if (!user?.email) return res.status(400).json({ error: 'No email' });

        await sendEmail(
            user.email,
            'Profile Update Required',
            `Update needed. Reason: ${updateReason}`,
            `<p>Your profile requires <strong>updating</strong>.</p><p><strong>Reason:</strong> ${updateReason}</p><p>Please go to Resident Profiling and submit updates.</p>`
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Update Approved
router.post('/send-update-approval', async (req, res) => {
    const { userId } = req.body;
    try {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        if (!user?.email) return res.status(400).json({ error: 'No email' });

        await sendEmail(
            user.email,
            'Profile Update Approved',
            'Your recent update has been approved.',
            `<p>Your profile update has been <strong>approved</strong>!</p><p>Thank you for keeping your information current.</p>`
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Update Rejected
router.post('/send-update-rejection', async (req, res) => {
    const { userId, rejectionReason } = req.body;
    try {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        if (!user?.email) return res.status(400).json({ error: 'No email' });

        await sendEmail(
            user.email,
            'Profile Update Rejected',
            `Update rejected. Reason: ${rejectionReason}`,
            `<p>Your update was <strong>rejected</strong>.</p><p><strong>Reason:</strong> ${rejectionReason}</p><p>Please resubmit with corrections.</p>`
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;