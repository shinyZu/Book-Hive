import React, { useState, useEffect } from 'react';

import { styleSheet } from "./styles";
import { withStyles } from "@mui/styles";

import Header from '../../components/Header/Header';

const Home = (props) => {
    return (
        <Header />
    )
}

export default withStyles(styleSheet)(Home);