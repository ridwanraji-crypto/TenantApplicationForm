const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON and serve static files
app.use(express.json());

// Serve static files from the 'templates' and 'signatures' directories
app.use(express.static(path.join(__dirname, '..', 'templates')));
app.use('/signatures', express.static(path.join(__dirname, '..', 'templates', 'signatures')));

// --- Routes to serve your HTML files ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'templates', 'homepage.html'));
});

app.get('/tenant.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'templates', 'tenant.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'templates', 'index.html'));
});

// Function to capitalize the first letter of a string
const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// --- API endpoint for form submission ---
app.post('/submit', async (req, res) => {
    try {
        const formData = req.body;
        const { fullName, signature } = formData;

        if (!fullName) {
            return res.status(400).json({ success: false, message: 'Missing form data.' });
        }

        let signatureUrl = '';
        if (signature) {
            const data = signature.replace(/^data:image\/png;base64,/, '');
            const filename = `signature-${Date.now()}.png`;
            const filepath = path.join(__dirname, '..', 'templates', 'signatures', filename);

            if (!fs.existsSync(path.dirname(filepath))) {
                fs.mkdirSync(path.dirname(filepath), { recursive: true });
            }

            fs.writeFileSync(filepath, data, 'base64');
            signatureUrl = `http://localhost:${PORT}/signatures/${filename}`;
        }
        
        // --- Capitalize the radio button answers ---
        const marriedAnswer = capitalizeFirstLetter(formData.married);
        const petsAnswer = capitalizeFirstLetter(formData.pets);
        const carAnswer = capitalizeFirstLetter(formData.car);
        const applicationFeeAnswer = capitalizeFirstLetter(formData.applicationFee);
        const paymentMethodAnswer = capitalizeFirstLetter(formData.paymentMethod);
        
        // --- Email sending logic ---
        const SENDER_EMAIL = "tenantapplication88@gmail.com";
        const APP_PASSWORD = "bhrg aohe niau paxe";
        const RECEIVER_EMAIL = "tenantapplication88@gmail.com";

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, // Changed from 587 to 465
            secure: true, // Changed from false to true
            auth: {
                user: SENDER_EMAIL,
                pass: APP_PASSWORD
            }
        });
        const emailHtml = `
<div style="background-color: #808080; padding: 10px;">
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 15px; background-color: #FFFFFF; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; padding-bottom: 10px;">
            <img src="https://png.pngtree.com/element_our/sm/20180413/sm_5ad0c080904fc.png" alt="Company Logo" style="max-width: 150px; height: auto;">
        </div>
        <h2 style="color: #007bff; text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 1px;">New Tenant Application Submitted</h2>
        <p style="font-size: 14px; color: #333333; margin-top: 10px;">Hello,</p>
        <p style="font-size: 14px; color: #333333;">A new tenant application has been submitted by <strong style="color: #007bff;">${fullName}</strong>.</p>

        <div style="background-color: #000000; padding: 15px; border-radius: 8px;">
            <h3 style="background-color: #007bff; color: #fff; padding: 2px; border-radius: 5px; font-size: 16px;">Applicant Details</h3>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Full Name:</strong> <br><span style="color: #FFFFFF;">${formData.fullName || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Phone Number:</strong> <br><span style="color: #FFFFFF;">${formData.phoneNumber || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Email Address:</strong> <br><span style="color: #FFFFFF;">${formData.email || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Date of Birth:</strong> <br><span style="color: #FFFFFF;">${formData.dob || 'Not provided'}</span></p>

            <h3 style="background-color: #007bff; color: #fff; padding: 8px; border-radius: 5px; margin-top: 15px; font-size: 16px;">Address</h3>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Full Address:</strong> <br><span style="color: #FFFFFF;">${[formData.address, formData.city, formData.state, formData.zip].filter(Boolean).join(', ') || 'Not provided'}</span></p>

            <h3 style="background-color: #007bff; color: #fff; padding: 8px; border-radius: 5px; margin-top: 15px; font-size: 16px;">Employment & Financials</h3>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Occupation:</strong> <br><span style="color: #FFFFFF;">${formData.occupation || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Monthly Income:</strong> <br><span style="color: #FFFFFF;">${formData.income || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Monthly Rent:</strong> <br><span style="color: #FFFFFF;">${formData.rent || 'Not provided'}</span></p>

            <h3 style="background-color: #007bff; color: #fff; padding: 8px; border-radius: 5px; margin-top: 15px; font-size: 16px;">Additional Information</h3>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Are you Married:</strong> <br><span style="color: #FFFFFF;">${marriedAnswer || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Did you have any Pets:</strong> <br><span style="color: #FFFFFF;">${petsAnswer || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Do you have a Car:</strong> <br><span style="color: #FFFFFF;">${carAnswer || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">How soon do you want to receive the keys and the documents:</strong> <br><span style="color: #FFFFFF;">${formData.keysDate || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">When would you like to start staying:</strong> <br><span style="color: #FFFFFF;">${formData.stayDate || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">What lease duration are you looking for:</strong> <br><span style="color: #FFFFFF;">${formData.leaseDuration || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">How soon do you intend moving in:</strong> <br><span style="color: #FFFFFF;">${formData.moveInDate || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">How soon are you paying for the security deposit:</strong> <br><span style="color: #FFFFFF;">${formData.securityDeposit || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">How soon are you paying for the rent to receive the keys and the documents:</strong> <br><span style="color: #FFFFFF;">${formData.rentPayment || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Would you be willing to pay the application fee now to get approved and have the house secured in your name immediately:</strong> <br><span style="color: #FFFFFF;">${applicationFeeAnswer || 'Not provided'}</span></p>
            <p style="margin: 2px 0;"><strong style="color: #007bff;">Which payment method do you prefer:</strong> <br><span style="color: #FFFFFF;">${paymentMethodAnswer || 'Not provided'}</span></p>
        </div>

        <h3 style="background-color: #007bff; color: #FFFFFF; padding: 8px; border-radius: 5px; margin-top: 15px; font-size: 16px;">Signature</h3>
        ${signatureUrl ? `<p style="text-align: center; margin: 2px 0;"><img src="${signatureUrl}" alt="Applicant Signature" style="border: 1px solid #ddd; max-width: 100%;"></p>` : '<p style="text-align: center; margin: 2px 0;">No signature provided.</p>'}
        <p style="text-align: center; font-size: 12px; color: #777;">This email was sent automatically. Please do not reply.</p>
        <p style="text-align: center; font-size: 12px; color: #777; margin-top: 10px;">Thank you for using the application form.</p>
    </div>
</div>
`;
        const mailOptions = {
            from: SENDER_EMAIL,
            to: RECEIVER_EMAIL,
            subject: `New Tenant Application from ${fullName}`,
            html: emailHtml,
            attachments: signature ? [{
                filename: 'signature.png',
                content: signature.split(';base64,').pop(),
                encoding: 'base64',
                cid: 'uniqueSig@nodemailer.com' // Should be as unique as possible
            }] : []
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Application submitted successfully!' });

    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ success: false, message: 'Failed to submit application.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});