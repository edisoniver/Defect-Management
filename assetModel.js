    const mongoose = require('mongoose');

    const assetSchema = new mongoose.Schema({
        name: String
    });

    const Asset = mongoose.model('Asset', assetSchema);

    module.exports = Asset;
