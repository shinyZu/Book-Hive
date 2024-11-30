import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import axios from 'axios';

dotenv.config();

// Fetch setup
global.fetch = fetch;

// Discord bot token
const token = process.env.BOT_TOKEN;

// API base URL for the Book Recommendation System
const apiBaseUrl = process.env.BASE_URL;

// CLient ID
const clientId = process.env.CLIENT_ID;

// JWT AUTH TOKEN - TODO
const jwtToken = process.env.JWT_TOKEN; // of user_id = 2 | David

// Id of the user as in the system
const system_user_id = process.env.SYSTEM_USER_ID;


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
      description: 'List all books in the library',
    },
    {
      name: 'editbook', // should only allow for admins
      description: 'Edit an existing book in the library',
      options: [
        // {
        //   name: 'book_id',
        //   description: 'The ID of the book to edit',
        //   type: 3, // String
        //   required: true,
        // },
        {
          name: 'title',
          description: 'The new title of the book',
          type: 3, // String
          required: true,
        },
        {
            name: 'author',
            description: 'The new author of the book',
            type: 3, // String
            required: true,
        },
        {
            name: 'genre',
            description: 'The new genre of the book',
            type: 3, // String
            required: true,
        },
        {
          name: 'description',
          description: 'The new description of the book',
          type: 3, // String
          required: true,
        },
      ],
    },
    {
        name: 'updatebookstatus', 
        description: 'Update the reading status of a book in the library',
        options: [
          // {
          //   name: 'book_id',
          //   description: 'The ID of the book to edit',
          //   type: 3, // String
          //   required: true,
          // },
          {
            name: 'title',
            description: 'The title of the book of which the status should be updated',
            type: 3, // String
            required: true,
          },
          {
              name: 'author',
              description: 'The author of the book of which the status should be updated',
              type: 3, // String
              required: true,
          },
          {
              name: 'genre',
              description: 'The genre of the book of which the status should be updated',
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
        // {
        //     name: 'book_id',
        //     description: 'The ID of the book to delete',
        //     type: 3, // String
        //     required: true,
        // },
        {
            name: 'title',
            description: 'The title of the book to delete',
            type: 3, // String
            required: true,
        },
        {
            name: 'author',
            description: 'The author of the book to delete',
            type: 3, // String
            required: true,
        },
        {
            name: 'genre',
            description: 'The genre of the book to delete',
            type: 3, // String
            required: true,
        },
      ],
    },
    {
      name: 'addreview',
      description: 'Add a review for a book',
      options: [
        // {
        //   name: 'book_id',
        //   description: 'The ID of the book to review',
        //   type: 3, // String
        //   required: true,
        // },
        {
            name: 'title',
            description: 'The title of the book to review',
            type: 3, // String
            required: true,
        },
        {
            name: 'author',
            description: 'The author of the book to review',
            type: 3, // String
            required: true,
        },
        {
            name: 'genre',
            description: 'The genre of the book to review',
            type: 3, // String
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
        // {
        //   name: 'book_id',
        //   description: 'The ID of the book to fetch reviews for',
        //   type: 3, // String,
        //   required: true,
        // },
        {
            name: 'title',
            description: 'The title of the book of which the review should be listed',
            type: 3, // String
            required: true,
        },
        {
            name: 'author',
            description: 'The author of the book of which the review should be listed',
            type: 3, // String
            required: true,
        },
        {
            name: 'genre',
            description: 'The genre of the book of which the review should be listed',
            type: 3, // String
            required: false,
        },
      ],
    },
    {
      name: 'deletereview',
      description: 'Delete a review',
      options: [
        // {
        //   name: 'review_id',
        //   description: 'The ID of the review to delete',
        //   type: 3, // String,
        //   required: true,
        // },
        {
            name: 'title',
            description: 'The title of the book of which the review should be deleted',
            type: 3, // String
            required: true,
        },
        {
            name: 'author',
            description: 'The author of the book of which the review should be deleted',
            type: 3, // String
            required: true,
        },
        {
            name: 'genre',
            description: 'The genre of the book of which the review should be deleted',
            type: 3, // String
            required: true,
        },
      ],
    },
    {
      name: 'searchbooks',
      description: 'Search for books by title, author, or genre',
      options: [
        // {
        //   name: 'query',
        //   description: 'Search query (title, author, or genre)',
        //   type: 3, // String
        //   required: true,
        // },
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
const rest = new REST({ version: '10' }).setToken(token);
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

// Event: Handle slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
  
    const { commandName, options } = interaction;
    const userDiscordId = interaction.user.id;

    console.log("interaction.user.id: "+ userDiscordId); // 756432766824087654
  
    try {
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
                  `The book "${title}" of genre ${genre} authored by ${author} is not currently available in the database. Please contact an admin to add it.`
                );
                return;
            }

            // If book is in the database get the book_id to add to the user's library/reading-history
            const bookId = bookResponse.data.data[0].book_id;

            console.log("\n");
            console.log("Book ID: ", bookId);

            // Check if the book is already in the user's reading history
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
                const bookList = searchResult.map((book) => `**Title:** ${book.title}, **Author:** ${book.author}, **Genre:** ${book.genre}, **Pulished Year:** ${book.published_year}`).join('\n');
                await interaction.reply(`Search results:\n${bookList}`);
            }

        } else if (commandName === 'listreviews') {
            const title = options.getString('title');
            const author = options.getString('author');
            const genre = options.getString('genre');

            // Get book data from Book collection
            const booksResponse = await axios.get(`${apiBaseUrl}/books`, { 
                params: { title, author, genre },
                headers: { 'Authorization': `Bearer ${jwtToken}` } 
            });
            const searchResult = booksResponse.data.data;

            console.log("\n");
            console.log("===========searchResult========");
            console.log(searchResult);

            const reviewsResponse = await axios.get(`${apiBaseUrl}/reviews/book/${searchResult[0].book_id}`, { 
                headers: { 'Authorization': `Bearer ${jwtToken}` } 
            });
            const reviewList = reviewsResponse.data.data;

            console.log("\n");
            console.log("===========reviewList========");
            console.log(reviewList);
    
            if (reviewList.length > 0) {
                const reviews = reviewList.map((rev) => `**User:** ${rev.User.first_name} ${rev.User.last_name},\n**Rating:** ${rev.rating},\n**Review:** ${rev.review_text}`).join('\n\n');
                await interaction.reply(`Reviews for the book titled "**${title}**":\n\n${reviews}`);
            } else {
                await interaction.reply('No reviews found for this book.');
            }

        } else if (commandName === 'searchbooks') {
            // const query = options.getString('query');
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
                const bookList = searchResult.map((book) => `**Title:** ${book.title}, **Author:** ${book.author}, **Genre:** ${book.genre}, **Pulished Year:** ${book.published_year}`).join('\n');
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

// Log the bot in
client.login(token);