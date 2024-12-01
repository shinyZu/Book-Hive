import React, { useState, useEffect } from 'react';

import { styleSheet } from "./styles";
import { withStyles } from "@mui/styles";

import ReaderNavbar from '../Navbar/ReaderNavbar';

const Header = (props) => {
    return (
        <ReaderNavbar />
    )
}

export default withStyles(styleSheet)(Header);