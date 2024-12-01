process.env.NODE_ENV = 'test';

import mongoose from "mongoose";
import User from "../models/user.models.js" 
import Login from "../models/login.models.js" 

// Clear the database before running the tests
before(async () => {
    try {

        // Clean up any existing users and sessions in the database
        // await User.deleteMany({});
        // await Login.deleteMany({});

        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
        
        console.log('\n');
        console.log('All collections cleared before tests.');
        
    } catch (err) {
        console.error('Error clearing database before tests:', err);
        throw err;
    }
})

// Clear the database after running the tests
after(async () => {
    try {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
        
        console.log('\n');
        console.log('All collections cleared after tests.');
        
    } catch (error) {
        console.error('Error clearing database after tests:', err);
        throw err;
    }
})