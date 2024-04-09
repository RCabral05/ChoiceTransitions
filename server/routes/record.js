import express from "express";
import { model } from "mongoose";
import { body, validationResult } from 'express-validator';
import mongoose from "mongoose";

// Load the Record model
import "../models/Record.js";
const Record = model("Record");

const router = express.Router();

// POST route to receive and store data
router.post("/upload", async (req, res) => {
    console.log(req.body);  // Log to confirm the shape of incoming data

    // Check if the body is an array and handle accordingly
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, message: "Expected an array of records." });
    }

    const errors = []; // Store validation errors for all records
    const records = req.body.map(data => {
        const { companyCity, companyPostCode, companyStateAbbr, companyStreet1, contactFullName, countyName } = data;
        // Validate each record (simple example, expand according to your validation logic)
        return new Record({
            companyCity,
            companyPostCode,
            companyStateAbbr,
            companyStreet1,
            contactFullName,
            countyName,
        });
    }).filter(record => record !== null);  // Filter out null values resulting from failed validation

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    try {
        await Record.insertMany(records);  // Use insertMany for batch insertion
        res.status(201).json({
            success: true,
            message: `Records added successfully, count: ${records.length}`,
            recordIds: records.map(record => record._id)  // Assuming you want to return the IDs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add records: " + error.message
        });
    }
});


router.get("/records", async (req, res) => {
    const stateQuery = req.query.state;  // Get the state from the query parameter
    try {
        const query = stateQuery ? { companyStateAbbr: stateQuery } : {};  // If state is provided, use it to filter
        const records = await Record.find(query);
        res.status(200).json({
            success: true,
            count: records.length,
            data: records
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve records: " + error.message
        });
    }
});


export default router;
