import express from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { getCurrentUser } from '../lib/auth.js';

// Upload routes for competition proof files - deployed on 2025-11-13

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// Upload endpoint for competition proof files
router.post('/competition-proof', upload.array('files', 10), async (req, res) => {
  try {
    console.log('Upload request received');

    // Get current user
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const uploadedUrls = [];

    // Upload each file to Supabase storage
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fileName = `${user.id}/${Date.now()}_${i}.${file.originalname.split('.').pop()}`;

      console.log(`Uploading file ${i + 1}/${req.files.length}: ${fileName}`);

      const { data, error } = await supabase.storage
        .from('competition-proof')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
          success: false,
          error: `Failed to upload file ${file.originalname}: ${error.message}`
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('competition-proof')
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    console.log('All files uploaded successfully');
    res.json({
      success: true,
      urls: uploadedUrls
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
});

export default router;
