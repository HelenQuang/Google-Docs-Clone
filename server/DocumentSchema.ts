import { Schema, model } from 'mongoose';

const DocumentSchema = new Schema({
  _id: String,
  data: Object,
});

// module.exports = model('Document', DocumentSchema);
const Document = model('Document', DocumentSchema);
export default Document;
