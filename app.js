const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const Defect = require('./defectModel');
const path = require('path');
const Asset = require('./assetModel');
// Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).fields([
    { name: 'overviewPhoto', maxCount: 1 },
    { name: 'closeupPhoto', maxCount: 1 }
  ]);
  

// Connect to MongoDB
mongoose.connect('mongodb://194.195.123.20/defectsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('Failed to connect to MongoDB', err));

const app = express();

// Set up body-parser and static files
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Set up Foundation
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));


// Set up views and template engine
app.set('views', './views');
app.set('view engine', 'pug');
// Routes

app.get('/', async (req, res) => {
    const assets = await Asset.find();
    res.render('index', { assets });
});

app.get('/annotate', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'annotate.html'));
});


app.post('/upload/:assetId', upload, async (req, res) => {
    const { description, user } = req.body;
    const overviewPhoto = {
      url: req.files.overviewPhoto[0].filename,
      figureNumber: -1
    };
    const closeupPhoto = {
      url: req.files.closeupPhoto[0].filename,
      figureNumber: -1
    };
    const assetId = req.params.assetId;
  
    // Unique ID generation
    const uniqueID = Math.random().toString(36).substr(2, 6).toUpperCase();
  
    // Get the latest defect number
    const latestDefect = await Defect.findOne().sort({ date: -1 });
    const defectNumber = latestDefect ? parseInt(latestDefect.defectNumber.slice(1)) + 1 : 1;
  
    const newDefect = new Defect({
      uniqueID,
      defectNumber: 'D' + defectNumber,
      overviewPhoto,
      closeupPhoto,
      description,
      user,
      date: new Date(),
      asset: assetId
    });
  
    await newDefect.save();
    res.redirect('/defects/' + assetId);
  });
  

  app.get('/defects/:assetId', async (req, res) => {
    try {
      const assetId = req.params.assetId;
      const defects = await Defect.find({ asset: assetId }).populate('asset').sort({ date: -1 });
      const defectsWithImageUrls = defects.map(defect => {
        return {
          ...defect._doc,
          overviewPhotoSrc: '/uploads/' + defect._doc.overviewPhoto.url,
          closeupPhotoSrc: '/uploads/' + defect._doc.closeupPhoto.url,
        };
      });
      
      
      res.render('defects', { defects: defectsWithImageUrls });
    } catch (error) {
      console.error('Error retrieving defects:', error);
    }
  });
  


app.get('/assets', async (req, res) => {
    const assets = await Asset.find();
    res.render('assets', { assets });
});

app.get('/assets/create', (req, res) => {
    res.render('createAsset');
});


app.post('/assets/create', async (req, res) => {
    const { name } = req.body;
    const newAsset = new Asset({ name });
    await newAsset.save();
    res.redirect('/assets');
});

// Add this route handler after the existing routes
app.get('/defects/report/:defectId', async (req, res) => {
    try {
      const defectId = req.params.defectId;
      const defect = await Defect.findById(defectId).populate('asset');
      if (!defect) {
        res.status(404).send('Defect not found');
        return;
      }
  
      res.render('defectReport', {
        uniqueID: defect.uniqueID,
        defectNumber: defect.defectNumber,
        overviewPhotoSrc: '/uploads/' + defect.overviewPhoto.url,
        closeupPhotoSrc: '/uploads/' + defect.closeupPhoto.url,
        overviewFigure: defect.overviewPhoto.figureNumber,
        closeupFigure: defect.closeupPhoto.figureNumber,
        description: defect.description,
        user: defect.user,
        date: defect.date.toISOString().slice(0, 10),
        assetName: defect.asset.name,
      });
    } catch (error) {
      console.error('Error generating defect report:', error);
      res.status(500).send('Error generating defect report');
    }
  });
  


  app.get('/assets/:assetId/defects/report', async (req, res) => {
    try {
      const assetId = req.params.assetId;
      const asset = await Asset.findById(assetId);
      if (!asset) {
        res.status(404).send('Asset not found');
        return;
      }
  
      const defects = await Defect.find({ asset: assetId }).populate('asset');
      
      res.render('assetDefectReport', {
        assetName: asset.name,
        defects: defects,
      });
    } catch (error) {
      console.error('Error generating asset defect report:', error);
      res.status(500).send('Error generating asset defect report');
    }
  });
  

  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
