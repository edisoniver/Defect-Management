const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const defectSchema = new Schema({
  uniqueID: String,
  defectNumber: String,
  overviewPhoto: {
    url: String,
    figureNumber: {
      type: Number,
      default: -1,
    },
  },
  closeupPhoto: {
    url: String,
    figureNumber: {
      type: Number,
      default: -1,
    },
  },
  description: String,
  user: String,
  date: Date,
  asset: {
    type: Schema.Types.ObjectId,
    ref: 'Asset'
  },
});

defectSchema.pre('save', async function (next) {
  if (this.overviewPhoto.figureNumber === -1 || this.closeupPhoto.figureNumber === -1) {
    const lastDefect = await this.constructor.findOne({}).sort({ _id: -1 }).select('overviewPhoto.figureNumber closeupPhoto.figureNumber').lean();
    const lastFigureNumber = Math.max(lastDefect?.overviewPhoto.figureNumber || 0, lastDefect?.closeupPhoto.figureNumber || 0);

    if (this.overviewPhoto.figureNumber === -1) {
      this.overviewPhoto.figureNumber = lastFigureNumber + 1;
    }
    if (this.closeupPhoto.figureNumber === -1) {
      this.closeupPhoto.figureNumber = lastFigureNumber + 2;
    }
  }
  next();
});

module.exports = mongoose.model('Defect', defectSchema);
