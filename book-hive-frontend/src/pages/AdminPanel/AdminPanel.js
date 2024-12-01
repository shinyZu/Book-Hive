import React, { useState, useEffect } from 'react';

import { styleSheet } from "./styles";
import { withStyles } from "@mui/styles";

import AdminNavbar from '../../components/Navbar/AdminNavbar';

const AdminPanel = (props) => {
    return (
        <AdminNavbar />
    ) 
}

export default withStyles(styleSheet)(AdminPanel);