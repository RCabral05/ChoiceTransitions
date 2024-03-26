import { connect, set } from "mongoose";
import mongoose from 'mongoose';

export function connectToServer() {
  set("strictQuery", false);
  connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(async function () {
      console.log("mongodb connected");
    })
    .catch(function (err) {
      console.log(err);
    });
}