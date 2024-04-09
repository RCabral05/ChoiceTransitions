import mongoose from "mongoose";
const { Schema, model } = mongoose;

const RecordSchema = new Schema({
  companyCity: {
    type: String,
  },
  companyPostCode: {
    type: String,
  },
  companyStateAbbr: {
    type: String,
  },
  companyStreet1: {
    type: String,
  },
  contactFullName: {
    type: String,
  },
  countyName: {
    type: String,
  },
  dateSynced: { // Tracks when the record was added to the database
    type: Date,
    default: Date.now
  }
});


const Record = model("Record", RecordSchema);

export default Record;
