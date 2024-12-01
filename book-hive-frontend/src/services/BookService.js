import axios from "../axios";

// ----------- Only for Testing Purposes ------------------------
// const userAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lIjoiU3VuIERlYyAwMSAyMDI0IDA0OjQ2OjQ0IEdNVCswNTMwIChJbmRpYSBTdGFuZGFyZCBUaW1lKSIsInVzZXJfaWQiOjEsInVzZXJuYW1lIjoic2hpbnkxMjM0IiwiZW1haWwiOiJzaGlueTk5QGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJhJDEwJGFtSXoxZmJZTi5Vb2hFaGhMb1o5Zi5jZ3ZnR3dNQTJIc3FJWW0vS3FJTExtVkNVeWhwZDRDIiwidXNlcl9yb2xlIjoiYWRtaW4iLCJhY2Nlc3NUb2tlbl9leHBpcmVzX2luIjoiMjQgaG91cnMiLCJyZWZyZXNob2tlbl9leHBpcmVzX2luIjoiMjQgaG91cnMiLCJpYXQiOjE3MzMwMDg2MDQsImV4cCI6MTczMzA5NTAwNH0.hBMC2yd_LaWKTo-qlxrapWirTNoWeA47tGCH7mkJkm0"
const userAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lIjoiU3VuIERlYyAwMSAyMDI0IDA0OjQ2OjA2IEdNVCswNTMwIChJbmRpYSBTdGFuZGFyZCBUaW1lKSIsInVzZXJfaWQiOjIsInVzZXJuYW1lIjoiZGF2aWQxMTExIiwiZW1haWwiOiJkYXZpZDk5QGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJhJDEwJHJSTThNSy9FOWhUSnk1UGhpWlVnQnVncFBacXhsZ0hFWUlUYnFML0x3cjcuNVkyLlplNUZXIiwidXNlcl9yb2xlIjoicmVhZGVyIiwiYWNjZXNzVG9rZW5fZXhwaXJlc19pbiI6IjI0IGhvdXJzIiwicmVmcmVzaG9rZW5fZXhwaXJlc19pbiI6IjI0IGhvdXJzIiwiaWF0IjoxNzMzMDA4NTY2LCJleHAiOjE3MzMwOTQ5NjZ9.CIDHKgSJDKy_Q0z-0hozGw2hpbFopU57OMbYgrirvDo"

// const token = JSON.parse(localStorage.getItem("token"));
const token = userAccessToken;

class BookService {

    // Get all books
    getAll = async () => {
        const promise = new Promise((resolve, reject) => {
          axios
            .get("/books")
            .then((res) => {
                return resolve(res);
            })
            .catch((er) => {
                return resolve(er);
            });
        });
        return await promise;
    };

    // TODO: WITH image
    saveBookWithImage = async (data) => {
        const promise = new Promise((resolve, reject) => {
        axios
            .post("books", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                return resolve(res);
            })
            .catch((er) => {
                return resolve(er);
            });
        });
        return await promise;
    };

    // Update only book
    updateBook = async (data, book_id) => {
        const promise = new Promise((resolve, reject) => {
        axios
            .put("books/" + book_id, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // "Content-Type": "multipart/form-data",
                },
            })
            .then((res) => {
                return resolve(res);
            })
            .catch((er) => {
                return resolve(er);
            });
        });
        return await promise;
    };

    // TODO: Update only image in drive
    updateImage = async (book_id, data) => {
        const promise = new Promise((resolve, reject) => {
        axios
            .put("books/drive/url/db/" + book_id, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
            })
            .then((res) => {
                return resolve(res);
            })
            .catch((er) => {
                return resolve(er);
            });
        });
        return await promise;
    };

    // TODO: Delete book WITH image
    
    // Delete book WITHOUT image
    deleteBookWithoutImage = async (book_id) => {
        
        const promise = new Promise((resolve, reject) => {
        axios
            .delete("books/" + book_id, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                return resolve(res);
            })
            .catch((er) => {
                return resolve(er);
            });
        });
        return await promise;
    };
}

export default new BookService();