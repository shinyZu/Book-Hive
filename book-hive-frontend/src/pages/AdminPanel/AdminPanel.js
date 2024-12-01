import React, { useState, useEffect } from 'react';

import { styleSheet } from "./styles";
import { withStyles } from "@mui/styles";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import AdminNavbar from '../../components/Navbar/AdminNavbar';
import ReaderNavbar from '../../components/Navbar/ReaderNavbar';
import MyTextField from "../../components/common/MyTextField/MyTextField";
import MyButton from "../../components/common/MyButton/MyButton";
import FileChooser from '../../components/common/FileChooser/FileChooser';

import BookService from '../../services/BookService';

import upload_bg from "../../assets/images/choose_image.jpg";

const AdminPanel = (props) => {
    const {classes} = props;
    
    const [bookId, setBookId] = useState(0);
    const [newBookFormData, setNewBookFormData] = useState({
        book_id: "",
        title: "",
        description: "",
        // image_name: "",
        // image_url: "",
        author: "",
        genre: "",
        published_year: "",
        book_image: null,
    });

    const [bookData, setBookData] = useState([]);

    const [btnProps, setBtnProps] = useState({
        btnLabel: "Add Book",
        // btnColor: "#1abc9c",
    });

    // ------------- Media Handling -----------
    const [fileToUpload, setFileToUpload] = useState([]);
    const [media, setMedia] = useState(upload_bg);

    // --------- Alert & Confirmation handling ----------------
    const [openAlert, setOpenAlert] = useState({
        open: "",
        alert: "",
        severity: "",
        variant: "",
    });

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: "",
        subTitle: "",
        confirmBtnStyle: {},
        action: "",
    });

    // ---------- Table columns --------------
    const tbl_book_columns = [
        {
          field: "id",
          headerName: "Actions",
          renderCell: (cellValues) => {
            // console.log(cellValues);
            return (
              <>
                <Tooltip title="Edit">
                  <IconButton>
                    <EditIcon
                      // fontSize="large"
                      onClick={() => {
                        console.log("clicked row : " + cellValues.id);
                        console.log(bookData[cellValues.id]);
                        loadBookDataToFields(
                          cellValues.id,
                          bookData[cellValues.id]
                        );
                      }}
                    />
                  </IconButton>
                </Tooltip>
    
                <Tooltip title="Delete">
                  <IconButton>
                    <DeleteIcon
                      // fontSize="large"
                      onClick={() => {
                        console.log("clicked row : " + cellValues.id);
                        deleteBook(bookData[cellValues.id]);
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </>
            );
          },
          width: 180,
          headerClassName: "header_color",
          headerAlign: "center",
          align: "Center",
        },
        {
          field: "book_id",
          headerName: "Book Id",
          width: 150,
          headerClassName: "header_color",
          headerAlign: "center",
          align: "Center",
        },
    
        {
          field: "title",
          headerName: "Title",
          width: 220,
          headerClassName: "header_color",
          headerAlign: "center",
          align: "Center",
        },
    
        {
          field: "author",
          headerName: "Author",
          width: 250,
          headerClassName: "header_color",
          headerAlign: "center",
          align: "Center",
        },
    
        {
          field: "genre",
          headerName: "Genre",
          width: 150,
          headerClassName: "header_color",
          headerAlign: "center",
          align: "Center",
        },
    
        {
          field: "published_year",
          headerName: "Published Year",
          width: 180,
          headerClassName: "header_color",
          headerAlign: "center",
          align: "Center",
        },
    
        {
          field: "description",
          headerName: "Description",
          width: 160,
          headerClassName: "header_color",
          headerAlign: "center",
          align: "Center",
        },  
    ];

    useEffect(() => {
        console.log("------- AdminPanel: useEffect [] -------------");
        getAllBooks();
        getNextBookId();
    }, []);

    // TODO: Call GET /book-hive/api/books
    const getAllBooks = async () => {
        console.log("----------- Get all books ----------");
        
        let res = await BookService.getAll();
        console.log(res);

        if (res.status === 200) {
            if (res.data.data != []) {
                console.log(res.data.data);
                
                setBookData(() => {
                    return [...res.data.data];
                });
            }
        } else {
            setConfirmDialog({ isOpen: false });
            setOpenAlert({
                open: true,
                alert: res.response.data.message,
                severity: "error",
                variant: "standard",
            });
            console.log("--- error while fetching all books---")
        }
    };
    
    // TODO: Call GET /book-hive/api/books/next/id
    const getNextBookId = async () => {
        console.log("----------- Get next book_id ----------");
    };

    const loadBookDataToFields = async (rowId, book) => {
        console.log(book);
        setBtnProps({ btnLabel: "Edit Book" });
    
        setNewBookFormData({
            book_id: book.book_id,
            title: book.title,
            author: book.author,
            genre: book.genre,
            description: book.description,
            published_year: book.published_year,
            // book_image: book.image_url,
        });
    
        setBookId(book.book_id);
    
        // if (book.image_url != "") {
        //     setMedia(book.image_url);
        // } else {
        //     setMedia(upload_bg);
        // }
    };

    const clearBookForm = () => {
        console.log("--------1------------");
        getNextBookId();
    
        setNewBookFormData({
            book_id: "",
            title: "",
            author: "",
            genre: "",
            description: "",
            //   image_name: "",
            //   image_url: "",
            published_year: "",
        });
        setMedia(upload_bg);
        setFileToUpload([]);
        setBtnProps({ btnLabel: "Add Book" });
    };

    const handleMediaUpload = (e) => {
        // handleImageUpload(e);
        const { files } = e.target;
        setFileToUpload(files[0]);
    
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          const { result } = e.target;
          // console.log(result);
          if (result) {
            setMedia(result);
          }
        };
        fileReader.readAsDataURL(files[0]);
    };

    // -------- Save Book ------------
    const saveBook = () => {
        console.log(newBookFormData);
        if (newBookFormData.book_image != null) {
            console.log("files are choosen");

            setConfirmDialog({
                isOpen: true,
                title: "Are you sure you want to save this Book ?",
                subTitle: "You can't revert this operation",
                action: "Save",
                confirmBtnStyle: {
                    backgroundColor: "rgb(26, 188, 156)",
                    color: "white",
                },
                onConfirm: () => saveBookWithImage(),
            });

        } else {
            setOpenAlert({
                open: true,
                alert: "Please choose an image for " + newBookFormData.title,
                severity: "warning",
                variant: "standard",
            });
        }
    };

    // Call POST /book-hive/api/books
    const saveBookWithImage = async () => {
        console.log("---------invoking saveBookWithImage() -------------");
        console.log(newBookFormData);
    
        // To save book without image
        if ( newBookFormData.book_image == null || newBookFormData.book_image == "" ) {
            setOpenAlert({
                open: true,
                alert: "Please choose an image for " + newBookFormData.title,
                severity: "warning",
                variant: "standard",
            });

        } else {
            // To save book with image
            console.log("--------- Save book WITH image ---------");
        
            let data = new FormData();
            data.append("book_id", newBookFormData.book_id);
            data.append("title", newBookFormData.title);
            data.append("author", newBookFormData.author);
            data.append("genre", newBookFormData.genre);
            data.append("description", newBookFormData.description);
            data.append("published_year", newBookFormData.published_year);
            data.append("book_image", newBookFormData.book_image);
        
            // Call endpoint POST /book-hive/api/books
            let res = await BookService.saveBookWithImage(newBookFormData);
            console.log(res);
        
            if (res.status == 201) {
                console.log("------- Book is saved ---------");
        
                setOpenAlert({
                    open: true,
                    alert: res.data.message,
                    severity: "success",
                    variant: "standard",
                });
        
                getAllBooks();
                clearBookForm();
        
                setConfirmDialog({ isOpen: false });

            } else {
                setConfirmDialog({ isOpen: false });
                setOpenAlert({
                    open: true,
                    alert: res.response.data.message,
                    severity: "error",
                    variant: "standard",
                });
            }
        }
    };

    // -------- Update Book -----------
    const updateBook = () => {
        if (fileToUpload.length === 0) {
            setConfirmDialog({
                isOpen: true,
                // severity: "warning",
                title: "No image selected, want to continue?",
                subTitle: "or click No to select an image and proceed",
                confirmBtnStyle: { backgroundColor: "#2980b9", color: "white" },
                onConfirm: () => updateBookWithImage(),
            });
          return;
        }
    
        if (newBookFormData.book_image != "") {
            console.log("files are choosen");
        
            setConfirmDialog({
                isOpen: true,
                title: "Are you sure you want to update this Book ?",
                subTitle: "You can't revert this operation",
                confirmBtnStyle: { backgroundColor: "#2980b9", color: "white" },
                onConfirm: () => updateBookWithImage(),
            });
        }
    };

    // Call PUT /book-hive/api/books
    const updateBookWithImage = async () => {
        console.log("---------invoking updateBookWithImage() -------------");
        console.log(newBookFormData);

        if (fileToUpload.length === 0) {
          
            // To update WITHOUT images
            let res = await BookService.updateBook(
                newBookFormData,
                newBookFormData.book_id
            );

            console.log(res);
            
            if (res.status === 200) {
                setOpenAlert({
                    open: true,
                    alert: res.data.message,
                    severity: "success",
                    variant: "standard",
                });

                getAllBooks();
                clearBookForm();
                setConfirmDialog({ isOpen: false });
                setBtnProps({ btnLabel: "Add Book" });

            } else {
                setConfirmDialog({ isOpen: false });
                setOpenAlert({
                    open: true,
                    alert: res.response.data.message,
                    severity: "error",
                    variant: "standard",
                });
            }

        } else { // TODO
          // To update book WITH image
          console.log("----- Update book WITH image -----------");
    
          /* // Update book only (/:book_id)
          let res1 = await BookService.updateBook(
                newBookFormData,
                newBookFormData.book_id
          );

          console.log(res1);
    
            if (res1.status === 200) {
                console.log("----- Book is saved...now save the image -------");
        
                // Update image only (/drive/url/db/:book_id)
                let data = new FormData();

                data.append("book_image", newBookFormData.book_image);
        
                // TODO:
                let res2 = await BookService.updateImage(
                    newBookFormData.book_id,
                    data
                );
        
                if (res2.status === 200) {
                    console.log("Image too updated successfully...........");
            
                    setOpenAlert({
                        open: true,
                        alert: res1.data.message,
                        severity: "success",
                        variant: "standard",
                    });
            
                    getAllBooks();
                    clearBookForm();
                    setConfirmDialog({ isOpen: false });

                } else {
                    setConfirmDialog({ isOpen: false });
                    setOpenAlert({
                        open: true,
                        alert: res2.response.data.message,
                        severity: "error",
                        variant: "standard",
                    });
                }
            } else {
                setConfirmDialog({ isOpen: false });
                setOpenAlert({
                    open: true,
                    alert: res1.response.data.message,
                    severity: "error",
                    variant: "standard",
                });
            } */
        }
    };

    // --------Delete Book -------------
    const deleteBook = (book) => {
        console.log(` ---------- deleting book titled: ${book.title}`);
        setConfirmDialog({
            isOpen: true,
            title: "Are you sure you want to delete this Book?",
            subTitle: "You can't revert this operation",
            confirmBtnStyle: { backgroundColor: "red", color: "white" },
            action: "Delete",
            onConfirm: () => deleteBookWithoutImage(book.book_id),
        });
    };

    // Call endpoint DELETE /book-hive/api/books/:book_id
    // const deleteBookWithImage = async (book_id) => {
    const deleteBookWithoutImage = async (book_id) => {
        console.log(`------ deleting book_id: ${book_id} ---------------`);

        let res = await BookService.deleteBookWithoutImage(book_id);
        if (res.status === 200) {
            setOpenAlert({
                open: true,
                alert: res.data.message,
                severity: "success",
                variant: "standard",
            });

            getAllBooks();
            clearBookForm();
            
            setConfirmDialog({ isOpen: false });
        } else {
            setOpenAlert({
                open: true,
                alert: res.response.data.message,
                severity: "error",
                variant: "standard",
            });
        }
    };

    return (
        <>
            <ReaderNavbar />

            <Grid container spacing={4} sx={{ /* border: "2px solid black", */ maxWidth: "68vw", margin: "auto"}}>
                
                {/* main_container */}
                <Grid size={{ xs: 12}} sx={{ /* border: "2px solid green"  */}} >

                    {/* book_main_container */}
                    <Grid container columnSpacing={3} size={{ xs: 12}} sx={{ /* border: "2px solid red", */ marginTop: "10vh" }} >
                        
                        {/* book_main_container_left */}
                        <Grid container alignContent="space-between" size={{ xs: 12, md: 6, lg: 6}} sx={{ /* border: "2px solid deeppink"  */}} >

                            {/* book_title_container */}
                            <Grid size={{ xs: 12}} sx={{ /* border: "2px solid blue"  */}} >
                                <Typography variant="h5" className={classes.book_title}>
                                    Add New Book
                                </Typography>
                            </Grid>

                            {/* book_fields_container */}
                            <Grid container spacing={3} size={{ xs: 12}} sx={{ /* border: "2px solid blue"  */}} >

                                {/* book_fields_row - 1 */}
                                <Grid size={{ xs: 12}} sx={{ /* border: "2px solid red"  */}} >
                                    <MyTextField
                                        variant="outlined"
                                        type="text"
                                        id="title"
                                        placeholder="Book Title"
                                        value={newBookFormData.title}
                                        onChange={(e) => {
                                            setNewBookFormData({
                                                ...newBookFormData,
                                                book_id: bookId,
                                                title: e.target.value,
                                            });
                                        }}
                                        style={{ width: "100%", paddingTop: "5px" }}
                                    />
                                </Grid>

                                {/* book_fields_row - 2 */}
                                <Grid size={{ xs: 12}} sx={{ /* border: "2px solid red"  */}} >
                                    <MyTextField
                                        variant="outlined"
                                        type="text"
                                        id="author"
                                        placeholder="Author"
                                        value={newBookFormData.author}
                                        onChange={(e) => {
                                            setNewBookFormData({
                                                ...newBookFormData,
                                                book_id: bookId,
                                                author: e.target.value,
                                            });
                                        }}
                                        style={{ width: "100%", paddingTop: "5px" }}
                                    />
                                </Grid>
                            
                                {/* book_fields_row - 3 */}
                                <Grid size={{ xs: 12}} spacing={{ xs: 2, md: 3 }} display= "flex" justifyContent="space-between" sx={{ /* border: "2px solid red" */}} >

                                    {/* book_fields_row_left */}
                                    <Grid size={{ xs: 12, md: 6, lg: 6}} sx={{ /* border: "2px solid green"  */}} >
                                        <MyTextField
                                            variant="outlined"
                                            type="text"
                                            id="genre"
                                            placeholder="Genre"
                                            value={newBookFormData.genre}
                                            onChange={(e) => {
                                                setNewBookFormData({
                                                    ...newBookFormData,
                                                    book_id: bookId,
                                                    genre: e.target.value,
                                                });
                                            }}
                                            style={{ width: "100%", paddingTop: "5px" }}
                                        />
                                    </Grid>
                                    
                                    {/* book_fields_row_right */}
                                    <Grid size={{ xs: 12, md: 6, lg: 6}} sx={{ /* border: "2px solid green"  */}} >
                                        <MyTextField
                                            variant="outlined"
                                            type="text"
                                            id="published_year"
                                            placeholder="Published Year"
                                            value={newBookFormData.published_year}
                                            onChange={(e) => {
                                                setNewBookFormData({
                                                    ...newBookFormData,
                                                    published_year: e.target.value,
                                                });
                                            }}
                                            style={{ width: "100%", paddingTop: "5px" }}
                                        />
                                    </Grid>
                                </Grid>
                            
                                {/* book_fields_row - 4 */}
                                <Grid size={{ xs: 12}} sx={{ /* border: "2px solid red"  */}} >
                                    <MyTextField
                                        variant="outlined"
                                        type="text"
                                        id="description"
                                        placeholder="Description"
                                        value={newBookFormData.description}
                                        onChange={(e) => {
                                            setNewBookFormData({
                                                ...newBookFormData,
                                                description: e.target.value,
                                            });
                                        }}
                                        style={{ width: "100%", paddingTop: "5px" }}
                                    />
                                </Grid>
                               
                                {/* btn_save_book_container */}
                                <Grid container size={{ xs: 12}} justifyContent="center" sx={{ /* border: "2px solid cyan"  */}} >
                                    <MyButton
                                        label={btnProps.btnLabel}
                                        size="small"
                                        variant="outlined"
                                        type="button"
                                        className={
                                            btnProps.btnLabel == "Add Book"
                                            ? classes.btn_save
                                            : classes.btn_update
                                        }
                                        style={{ width: "48%", height: "90%" }}
                                        onClick={
                                            btnProps.btnLabel == "Add Book"
                                            ? saveBook
                                            : updateBook
                                        }
                                    />
                                </Grid>
                            
                            </Grid>
                        </Grid>
                        
                        {/* book_main_container_right */}
                        <Grid container alignContent="space-between" size={{ xs: 12, md: 6, lg: 6}} sx={{ /* border: "2px solid deeppink"  */}} >

                            {/* image_upload_container */}
                            <Grid size={{ xs: 12}} sx={{ /* border: "2px solid blue"  */}} >
                                <img
                                    src={media}
                                    loading="lazy"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                    }}
                                />
                            </Grid>

                            {/* btn_save_image_container */}
                            <Grid container justifyContent="center" size={{ xs: 12}} sx={{ /* border: "2px solid cyan"  */}} >
                                <FileChooser
                                    text="Upload Image"
                                    multiple={false}
                                    onUpload={(e) => {
                                        // handleImageUpload(e);
                                        handleMediaUpload(e);
                                        setNewBookFormData({
                                            ...newBookFormData,
                                            book_image: e.target.files[0],
                                        });
                                        setMedia(e.target.files[0]);
                                    }}
                                    // displayFileName={true}
                                />
                            </Grid>

                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    ) 
}

export default withStyles(styleSheet)(AdminPanel);