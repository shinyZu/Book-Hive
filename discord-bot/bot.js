import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import axios from 'axios';
import jwt from "jsonwebtoken";

dotenv.config();

// Fetch setup
global.fetch = fetch;

console.log('-----------Loaded-------------');

// Discord bot token
const botToken = process.env.BOT_TOKEN;

// API base URL for the Book Recommendation System
const apiBaseUrl = process.env.BASE_URL;

// CLient ID
const clientId = process.env.CLIENT_ID;

// JWT AUTH TOKEN - TODO
const jwtToken = process.env.JWT_TOKEN; // of user_id = 2 | David

// JWT secret key
const jwtSecret = process.env.JWT_SECRET_KEY;

// Create the Discord client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Commands registration
const commands = [
    {
        name: 'linkaccount',
        description: 'Link the Discord account to the Book Recommendation System.',
    },
    {
        name: 'recommendbooks',
        description: 'Recommends the books based on your reading history',
    },
    {
      name: 'addbook',
      description: 'Add a new book to users library',
      options: [
        {
          name: 'title',
          description: 'The title of the book',
          type: 3, // String
          required: true,
        },
        {
          name: 'author',
          description: 'The author of the book',
          type: 3, // String
          required: true,
        },
        {
          name: 'genre',
          description: 'The genre of the book',
          type: 3, // String
          required: true,
        },
        {
          name: 'status',
          description: 'The reading status of the book that the user is willing to add to his library',
          type: 3, // String
          required: true,
        },
      ],
    },
    {
      name: 'listbooks',
      description: 'List all books in the database',
    },
    {
      name: 'listlibrary',
      description: 'List all books in the library',
    },
    {
        name: 'editbook', 
        description: 'Update the reading status of a book in the library',
        options: [
          {
            name: 'book_id',
            description: 'The id of the book in the library of which reading status should be updated',
            type: 3, // String
            required: true,
          },
          {
            name: 'status',
            description: 'The new reading status of the book',
            type: 3, // String
            required: true,
          },
        ],
    },
    {
      name: 'deletebook',
      description: 'Delete a book from the library',
      options: [
        {
            name: 'book_id',
            description: 'The ID of the book to delete',
            type: 3, // String
            required: true,
        },
      ],
    },
    {
      name: 'addreview',
      description: 'Add a review for a book',
      options: [
        {
          name: 'book_id',
          description: 'The ID of the book to review',
          type: 3, // Integer
          required: true,
        },
        {
          name: 'review_text',
          description: 'Your review',
          type: 3, // String
          required: true,
        },
        {
          name: 'rating',
          description: 'The rating provided by the user',
          type: 4, // Integer
          required: true,
        },
      ],
    },
    {
      name: 'listreviews',
      description: 'List all reviews for a book',
      options: [
        {
          name: 'book_id',
          description: 'The ID of the book to fetch reviews for',
          type: 3, // String,
          required: true,
        },
      ],
    },
    {
      name: 'deletereview',
      description: 'Delete a review',
      options: [
        {
          name: 'review_id',
          description: 'The ID of the review to delete',
          type: 3, // String,
          required: true,
        },
      ],
    },
    {
      name: 'searchbooks',
      description: 'Search for books by title, author, or genre',
      options: [
        {
            name: 'title',
            description: 'The title of the book',
            type: 3, // String
            required: true,
          },
          {
            name: 'author',
            description: 'The author of the book',
            type: 3, // String
            required: true,
          },
          {
            name: 'genre',
            description: 'The genre of the book',
            type: 3, // String
            required: false,
          },
          {
            name: 'published_year',
            description: 'The published year of the book',
            type: 3, // String
            required: false,
          },
      ],
    },
];

// Register the commands with Discord's API
const rest = new REST({ version: '10' }).setToken(botToken);
(async () => {
  try {
    console.log('Refreshing slash commands...');
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('Slash commands registered!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

// Event: Bot is ready
client.once('ready', () => {
  console.log('BookHiveBot is online!');
  console.log(`Logged in as ${client.user.tag}!`);
});

console.log('-----------Before Interactions Start-------------');

// Event: Handle slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    // Check if the access token given from the Book Hive app is expired or not
    const isTokenExpired = checkIfJWTTokenIsExpired();

    console.log('\n');
    console.log("========isTokenExpired=======");
    console.log(isTokenExpired);

    // If expired alert the user to re-login from the Book Hive web app
    if (isTokenExpired) {
        await interaction.reply('Your access token has been expired. Please try to login again from  the Book Hive web app.');
        return;
    }

    const verifiedToken = jwt.verify(jwtToken, jwtSecret);
    console.log("verifiedToken---", verifiedToken)

    // Id of the user as in the system
    const system_user_id = verifiedToken.user_id;
    
    // Id of the user in discord
    const userDiscordId = interaction.user.id;
    console.log("interaction.user.id: "+ userDiscordId); // 756432766824087654
    
    // Save user's discord id to the database - linked_discord_id
    const updatedUser = await axios.patch(`${apiBaseUrl}/users/${system_user_id}`, {
        linked_discord_id: userDiscordId,
    },{
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        },
    });

    console.log("\n");
    console.log("===========updatedUser========");
    console.log(updatedUser);
  
    try {
        if (commandName === 'recommendbooks') {
            const response = await axios.get(`${apiBaseUrl}/recommendations`, { 
                headers: { 'Authorization': `Bearer ${jwtToken}` } 
            });
            const searchResult = response.data.data;

            console.log("\n");
            console.log("===========response========");
            console.log(response);
    
            if (response.data.status === 202) {
                await interaction.reply(`We're sorry, but we don't have any book recommendations for you yet because no books were found in your library. BookHiveBot learns about your personal tastes from the books in your library, then generates recommendations unique to you.`);
            } else {
                const recommendations = searchResult.map((book) => `**Book ID:** ${book.book_id}, **Title:** ${book.title}, **Author:** ${book.author}, **Genre:** ${book.genre}, **Pulished Year:** ${book.published_year}`).join('\n');
                await interaction.reply(`Search results:\n${recommendations}`);
            }
        }
        if (commandName === 'addbook') {
            const title = options.getString('title');
            const author = options.getString('author');
            const genre = options.getString('genre');
            const status = options.getString('status');
    
            // Check if the book exists in the Book collection
            const bookResponse = await axios.get(`${apiBaseUrl}/books`, {
                params: { title, author, genre },
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            console.log("\n");
            console.log("===========bookResponse========");
            console.log(bookResponse.data.data);

            // If the book does not exist, notify the user
            if (bookResponse.data.data.length === 0) {
                await interaction.reply(
                  `The book "**${title}**" of genre ${genre} authored by ${author} is **currently not available** in the database. Please contact an admin to add it.`
                );
                return;
            }

            // If book is in the database get the book_id to add to the user's library/reading-history
            const bookId = bookResponse.data.data[0].book_id;

            console.log("\n");
            console.log("Book ID: ", bookId);

            // Get all books in user's reading history/library
            const historyResponse = await axios.get(`${apiBaseUrl}/history/user/library`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,    
                },
            });

            console.log("\n");
            console.log("===========historyResponse========");
            console.log(historyResponse.data.data);

            // Check if the book exists in the user's reading history
            if (historyResponse.data.data.length > 0) {

                // Find the object from the existing library
                const historyExist = historyResponse.data.data.find(history => history.book_id === bookId);
                
                console.log("\n");
                console.log("===========historyExist========");
                console.log(historyExist);
                
                if (historyExist) {
                    // Book already exists in the user's reading history
                    console.log("This book is already in your reading history.");

                    // Update the Reading Status of the book in the library
                    const updateStatusResponse = await axios.patch(`${apiBaseUrl}/history/${historyExist.history_id}`, {
                        book_id: historyExist.book_id,
                        status: status,
                        user_id: system_user_id,
                    },{
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,
                        },
                    });
    
                    await interaction.reply(
                        `The status of book "${title}" was updated to "${status}" successfully!`
                    );
                    
                } else {
                    // Book is not in the reading history, proceed with adding it
                    try {
                        // Add the book to the ReadHistory collection
                        const addHistoryResponse = await axios.post(`${apiBaseUrl}/history`, {
                            book_id: bookId,
                            status: status,
                            user_id: system_user_id,
                        },{
                            headers: {
                                Authorization: `Bearer ${jwtToken}`,
                            },
                        });

                        console.log("\n");
                        console.log('Book added to reading history:', addHistoryResponse.data);
                        
                        // Respond to the user
                        await interaction.reply(
                            `The book "${title}" of genre ${genre} authored by ${author} has been added to your library!`
                        );
                    } catch (error) {
                        console.error('Error adding book to reading history:', error);
                    }
                }

            } 

        } else if (commandName === 'listbooks') {

            const response = await axios.get(`${apiBaseUrl}/books`, { 
                headers: { 'Authorization': `Bearer ${jwtToken}` } 
            });
            const searchResult = response.data.data;

            console.log("\n");
            console.log("===========searchResult========");
            console.log(searchResult);
    
            if (searchResult.length === 0) {
                await interaction.reply('No books found in your collection.');
            } else {
                const bookList = searchResult.map((book) => `**Book ID:** ${book.book_id}, **Title:** ${book.title}, **Author:** ${book.author}, **Genre:** ${book.genre}, **Pulished Year:** ${book.published_year}`).join('\n');
                await interaction.reply(`Search results:\n${bookList}`);
            }

        } else if (commandName === 'listlibrary') {
            // Get all books in user's reading history/library
            const historyResponse = await axios.get(`${apiBaseUrl}/history/user/library`, {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,    
                },
            });

            const searchResult = historyResponse.data.data;

            console.log("\n");
            console.log("===========searchResult========");
            console.log(searchResult);
    
            if (searchResult.length === 0) {
                await interaction.reply('No books found in your library.');
            } else {
                const libraryList = searchResult.map((history) => `**Book ID:** ${history.book_id}, **Title:** ${history.Book.title}, **Author:** ${history.Book.author}, **Genre:** ${history.Book.genre}, **Pulished Year:** ${history.Book.published_year}, **Reading Status:** ${history.status}`).join('\n');
                await interaction.reply(`Search results:\n${libraryList}`);
            }


        } else if (commandName === 'editbook') {
            const book_id = options.getString('book_id');
            const status = options.getString('status');

            // Check if the book exists in the user's library
            const historyExist = await axios.get(`${apiBaseUrl}/history`, {
                params: { book_id },
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            console.log('\n');
            console.log("======historyExist=======");
            console.log(historyExist);

            const historyData = historyExist.data.data;

            console.log('\n');
            console.log("======historyData=======");
            console.log(historyData);

            if (historyData.length > 0) {
        
                // Update reading status
                const response = await axios.patch(`${apiBaseUrl}/history/${historyData[0].history_id}`, { 
                        status: status,
                    },{
                        headers: {
                            Authorization: `Bearer ${jwtToken}`,    
                    },
                });
    
                if (response.status === 200 ) {
                    // Get book data from Book collection
                    const booksResponse = await axios.get(`${apiBaseUrl}/books/${book_id}`, { 
                        headers: { 'Authorization': `Bearer ${jwtToken}` } 
                    });
    
                    const searchResult = booksResponse.data.data;
                    
                    await interaction.reply(`Reading status of the book titled **${searchResult.title}** was updated successfully to "**${status}**".`);
    
                } else {
                    await interaction.reply(`Failed to update redaing status of book **${searchResult.title}**.`);
                }
            } else {
                await interaction.reply(`Book was not found in your library.`);
            }

        } else if (commandName === 'deletebook') {
            const book_id = options.getString('book_id');

            // Check if the book exists in the user's library
            const historyExist = await axios.get(`${apiBaseUrl}/history`, {
                params: { book_id },
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            console.log('\n');
            console.log("======historyExist=======");
            console.log(historyExist);

            const historyData = historyExist.data.data;

            console.log('\n');
            console.log("======historyData=======");
            console.log(historyData);

            // If the book is found in the user's library - delete
            if (historyData.length > 0) {
                const response = await axios.delete(`${apiBaseUrl}/history/${historyData[0].history_id}`, { 
                    headers: { 'Authorization': `Bearer ${jwtToken}` } 
                });

                await interaction.reply(`Book titled **${historyData[0].Book.title}** was deleted successfully from your library!`);
            } else {
                await interaction.reply(`Book was not found in your library.`);
            }
            

        } else if (commandName === 'addreview') {
            const book_id = options.getString('book_id');
            const review_text = options.getString('review_text');
            const rating = options.getInteger('rating');

            // Get book data from Book collection
            const booksResponse = await axios.get(`${apiBaseUrl}/books/${book_id}`, { 
                headers: { 'Authorization': `Bearer ${jwtToken}` } 
            });
            const searchResult = booksResponse.data.data;
    
            const savedReview = await axios.post(`${apiBaseUrl}/reviews`, { 
                book_id: book_id,
                review_text: review_text,
                rating: rating,
            },{
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });
            await interaction.reply(`Review added for the book titled "**${searchResult.title}**"!`); 

        } else if (commandName === 'listreviews') {
            const book_id = options.getString('book_id');

            // Get book data from Book collection
            const booksResponse = await axios.get(`${apiBaseUrl}/books/${book_id}`, { 
                headers: { 'Authorization': `Bearer ${jwtToken}` } 
            });
            const searchResult = booksResponse.data.data;

            console.log("\n");
            console.log("===========searchResult========");
            console.log(searchResult);

            const reviewsResponse = await axios.get(`${apiBaseUrl}/reviews/book/${book_id}`, { 
                headers: { 'Authorization': `Bearer ${jwtToken}` } 
            });
            const reviewList = reviewsResponse.data.data;

            console.log("\n");
            console.log("===========reviewList========");
            console.log(reviewList);
    
            if (reviewList.length > 0) {
                const reviews = reviewList.map((rev) => `**User:** ${rev.User.first_name} ${rev.User.last_name},\n**Rating:** ${rev.rating}/5,\n**Review:** ${rev.review_text},\n**ID:** ${rev.review_id}`).join('\n\n');
                await interaction.reply(`Reviews for the book titled "**${searchResult.title}**":\n\n${reviews}`);
            } else {
                await interaction.reply(`No reviews found for the book titled "**${searchResult.title}**".`);
            }
        
        } else if (commandName === 'deletereview') {
            const review_id = options.getString('review_id');

            const response = await axios.delete(`${apiBaseUrl}/reviews/${review_id}`, { 
                headers: { 'Authorization': `Bearer ${jwtToken}` } 
            });

            await interaction.reply(`Review ID ${review_id} deleted successfully!`);

        } else if (commandName === 'searchbooks') {
            const title = options.getString('title');
            const author = options.getString('author');
            const genre = options.getString('genre');
            const published_year = options.getString('published_year');

            const response = await axios.get(`${apiBaseUrl}/books`, { 
                params: { title, author, genre, published_year },
                headers: { 'Authorization': `Bearer ${jwtToken}` } 
            });
            const searchResult = response.data.data;

            console.log("\n");
            console.log("===========searchResult========");
            console.log(searchResult);
    
            // if response with books
            if (searchResult.length > 0 ) {
                const bookList = searchResult.map((book) => `**Book ID:** ${book.book_id}, **Title:** ${book.title}, **Author:** ${book.author}, **Genre:** ${book.genre}, **Pulished Year:** ${book.published_year}`).join('\n');
                await interaction.reply(`Search results:\n${bookList}`);
            } else {
                await interaction.reply('No books found.');
            }
        }
    } catch (error) {
        console.error(error);
        await interaction.reply('An error occurred while processing your request.');
    }
});

// Function to check if the JWT access token of the web app user is expired or not
const checkIfJWTTokenIsExpired = () => {
    try {
        // Verify the token
        jwt.verify(jwtToken, jwtSecret);

        console.log('-----------JWT token is valid.--------------');

        return false; // Not expired

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('----------JWT token is expired.-------------');
            return true; // Expired

        } else {
            console.error('Error verifying token:', error.message);
            return true; // Invalid or other issues
        }
    }
}

// Log the bot in
client.login(botToken);