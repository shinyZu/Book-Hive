import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, NavLink } from "react-router-dom";

import { styleSheet } from "./styles";
import { withStyles } from "@mui/styles";

import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";

import HomeIcon from "@mui/icons-material/Home";
import AdbIcon from "@mui/icons-material/Adb";
import StoreIcon from "@mui/icons-material/Store";
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

import profile_pic from "../../assets/images/male_profile.jpg"
import logo from "../../assets/images/book_hive_logo.png"

const header_bg_texture =
  "https://www.transparenttextures.com/patterns/nistri.png";

const pages = ["Home", "Manage Books" ];

const AdminNavbar = (props) => {
    const { classes } = props;
    const navigate = useNavigate();

    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [value, setValue] = useState("0");

    const [isLogged, setIsLogged] = useState(() => {
        // const token = localStorage.getItem("token");
        // return token ? true : false;
        return true;
    });

    const navLinkStyle = ({ isActive }) => {
        return {
            color: isActive ? "#D25380" : "normal",
        };
    };

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const changePage = (e, v) => {
        console.log(v);
        setValue(v);
      };

    return (
        <AppBar
            position="static"
                style={{
                backgroundImage: `url(${header_bg_texture})`,
                width: "68%",
                margin: "auto",
                color:"red",
                backgroundColor:"white"
            }}
        >
            <Container maxWidth="x3">
                <Toolbar disableGutters>
                    <Avatar
                        alt="Remy Sharp"
                        src={logo}
                        large
                        style={{ marginRight: "10px" }}
                    />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/home"
                        sx={{
                            mr: 2,
                            display: { xs: "none", md: "flex" },
                            fontFamily: "Acme",
                            fontWeight: 800,
                            letterSpacing: ".3rem",
                            // color: "inherit",
                            color: "#AC7088",
                            textDecoration: "none",
                        }}
                    >
                        BookHive
                    </Typography>

                    <Box 
                        sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
                    >
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            // color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: "block", md: "none" },
                            }}
                        >
                            {pages.map((page) => (
                            <MenuItem key={page} onClick={handleCloseNavMenu}>
                                <Typography textAlign="left">{page}</Typography>
                            </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    
                    <Box 
                        sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent:"flex-end"}} 
                    >
                        <Tabs
                            value={value}
                            onChange={changePage}
                            className={classes.nav__tabs}
                        >
                            {isLogged ? (
                                <>
                                    <NavLink
                                        smooth
                                        to="/home"
                                        className={classes.nav__text}
                                        style={navLinkStyle}
                                    >
                                        <Tab
                                            value="1"
                                            icon={<HomeIcon />}
                                            className={classes.nav__text}
                                            label="Home"
                                        />
                                    </NavLink>

                                    <NavLink
                                        smooth
                                        to="/manage-books"
                                        className={classes.nav__text}
                                        style={navLinkStyle}
                                    >
                                    <Tab
                                        value="2"
                                        icon={<AutoStoriesIcon />}
                                        className={classes.nav__text}
                                        label="Manage Books"
                                    />
                                </NavLink>
                                </>
                            ) : null}
                        </Tabs>
                    </Box>
                    {isLogged ? (
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="View Profile">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt="Remy Sharp" src={profile_pic} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ) : (
                        <Button
                            className={classes.nav_btn_login}
                            onClick={() => {
                                console.log("clicked login btn in navbar");
                                navigate("/login");
                            }}
                            sx={{ my: 2, color: "white", display: "block" }}
                        >
                            Login
                        </Button>
                    )}
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default withStyles(styleSheet)(AdminNavbar);