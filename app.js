const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require("cors");

const app = express();

const port = 4000;

// Allow Cross-Origin requests
app.use(cors());

// Connect to MongoDB
mongoose.connect(
    "mongodb+srv://lironamy:Ladygaga2@cluster0.sn5e7l9.mongodb.net/stepgeneretor?retryWrites=true&w=majority"
);

// On Connection
mongoose.connection.on("connected", () => {
    console.log("Connected to database");
});

mongoose.connection.on("error", (err) => {
    console.error("Database connection error:", err);
});

// Define a schema for storing answers
const answerSchema = new mongoose.Schema({
    question: { type: String, required: true },
    id: { type: Number, required: true },
    type: { type: String, required: true },
    answers: { type: Array, required: true },  // For multiple-choice answers
    answer_id: mongoose.Schema.Types.Mixed,  // Can be a Number or Array
    mac_address: { type: String, required: true }  // Add mac_address field
});


// Create a model based on the schema
const Answer = mongoose.model('Answer', answerSchema);

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

// Define the setanswers POST route to store answers in MongoDB
app.post('/setanswers', async (req, res) => {
    const { mac_address, answers } = req.body; // Extract mac_address and answers

    if (!mac_address || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'Invalid input format. "mac_address" and "answers" are required.' });
    }

    try {
        for (const answer of answers) {
            // Hrausel preference validation
            if (answer.question.includes("What are your hrausel preferences?")) {
                const validHrauselOptions = [
                    JSON.stringify([1, 1]),
                    JSON.stringify([1, 0]),
                    JSON.stringify([0, 1])
                ];

                // Convert answer_id to JSON string for comparison
                if (!validHrauselOptions.includes(JSON.stringify(answer.answer_id))) {
                    return res.status(400).json({ message: 'Invalid hrausel preference selected' });
                }
            }

            // Create a new answer document with the mac_address as an additional field
            const newAnswer = new Answer({
                ...answer,  // Spread the answer object to include its fields
                mac_address // Add mac_address field
            });
            
            await newAnswer.save();
        }

        res.status(200).json({ message: 'Answers received and saved successfully', mac_address, data: answers });
    } catch (error) {
        console.error('Error saving answers:', error);
        res.status(500).json({ message: 'Error saving answers', error });
    }
});




// Define the setanswers GET route to retrieve stored answers from MongoDB
app.get('/setanswers', async (req, res) => {
    try {
        // Retrieve all stored answers from MongoDB
        const storedAnswers = await Answer.find();
        res.status(200).json({ message: 'Answers retrieved successfully', data: storedAnswers });
    } catch (error) {
        console.error('Error retrieving answers:', error);
        res.status(500).json({ message: 'Error retrieving answers', error });
    }
});

// Start the server
app.listen(port, '52.23.246.251', () => {
    console.log('Server running on http://52.23.246.251:4000');
});

