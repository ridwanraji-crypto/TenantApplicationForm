const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

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
        
        // --- Email sending logic ---
        const SENDER_EMAIL = "tenantapplication88@gmail.com";
        const APP_PASSWORD = "bhrg aohe niau paxe";
        const RECEIVER_EMAIL = "tenantapplication88@gmail.com";

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: SENDER_EMAIL,
                pass: APP_PASSWORD
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });

        const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #00a8ff; text-align: center;">New Tenant Application Submitted</h2>
        <p>Hello,</p>
        <p>A new tenant application has been submitted by <strong>${fullName}</strong>.</p>
        
        <h3 style="border-bottom: 2px solid #00a8ff; padding-bottom: 5px; margin-top: 20px;">Applicant Details</h3>
        <p><strong>Full Name:</strong></p>
        <p>${formData.fullName || 'Not provided'}</p>
        
        <p><strong>Phone Number:</strong></p>
        <p>${formData.phoneNumber || 'Not provided'}</p>
        
        <p><strong>Email Address:</strong></p>
        <p>${formData.email || 'Not provided'}</p>
        
        <p><strong>Date of Birth:</strong></p>
        <p>${formData.dob || 'Not provided'}</p>
        
        <h3 style="border-bottom: 2px solid #00a8ff; padding-bottom: 5px; margin-top: 20px;">Address</h3>
        <p><strong>Current Address:</strong></p>
        <p>${formData.address || 'Not provided'}</p>
        
        <p><strong>City:</strong></p>
        <p>${formData.city || 'Not provided'}</p>
        
        <p><strong>State/Province:</strong></p>
        <p>${formData.state || 'Not provided'}</p>
        
        <p><strong>Postal/Zip Code:</strong></p>
        <p>${formData.zip || 'Not provided'}</p>
        
        <h3 style="border-bottom: 2px solid #00a8ff; padding-bottom: 5px; margin-top: 20px;">Employment & Financials</h3>
        <p><strong>Occupation:</strong></p>
        <p>${formData.occupation || 'Not provided'}</p>
        
        <p><strong>Monthly Income:</strong></p>
        <p>${formData.income || 'Not provided'}</p>
        
        <p><strong>Monthly Rent:</strong></p>
        <p>${formData.rent || 'Not provided'}</p>
        
        <h3 style="border-bottom: 2px solid #00a8ff; padding-bottom: 5px; margin-top: 20px;">Additional Information</h3>
        <p><strong>Are you Married:</strong></p>
        <p>${formData.married || 'Not provided'}</p>
        
        <p><strong>Did you have any Pets:</strong></p>
        <p>${formData.pets || 'Not provided'}</p>
        
        <p><strong>Do you have a Car:</strong></p>
        <p>${formData.car || 'Not provided'}</p>
        
        <p><strong>How soon do you want the keys and the documents:</strong></p>
        <p>${formData.keysDate || 'Not provided'}</p>
        
        <p><strong>When you like to start staying:</strong></p>
        <p>${formData.stayDate || 'Not provided'}</p>
        
        <p><strong>How long lease are you looking for:</strong></p>
        <p>${formData.leaseDuration || 'Not provided'}</p>
        
        <p><strong>How soon do you intend moving in:</strong></p>
        <p>${formData.moveInDate || 'Not provided'}</p>
        
        <p><strong>Are you willing to pay the application fee now to secure the house:</strong></p>
        <p>${formData.applicationFee || 'Not provided'}</p>
        
        <p><strong>Which payment method do you prefer:</strong></p>
        <p>${formData.paymentMethod || 'Not provided'}</p>
        
        <h3 style="border-bottom: 2px solid #00a8ff; padding-bottom: 5px; margin-top: 20px;">Signature</h3>
        ${signatureUrl ? `<p><img src="${signatureUrl}" alt="Applicant Signature" style="border: 1px solid #ddd; max-width: 100%;"></p>` : '<p>No signature provided.</p>'}
        
        <br>
        <p>Thank you for using the application form.</p>
    </div>
`;

        const mailOptions = {
            from: SENDER_EMAIL,
            to: RECEIVER_EMAIL,
            subject: `New Tenant Application from ${fullName}`,
            html: emailHtml
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