import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@reach/router';

import './index.scss';
import Box from './routes/box/Box';
import Md from './routes/md/Md';
import Docs from './routes/docs/Docs';
import Draw from "./routes/draw/Draw";

// Redirect www subdomain -> naked domain
if (window.location.hostname.startsWith('www.')) {
    window.location.href = window.location.href.replace('/www.', '/');
}
if (window.location.hostname.includes('schof.link')) {
    window.location.href = window.location.href.replace('/schof.link', '/mirri.link');
}
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && window.location.protocol === 'http:') {
    window.location.href = window.location.href.replace('http://', 'https://');
}

// Render application
ReactDOM.render((
    <Router>
        <Md path="/md"/>
        <Md path="/md/:id"/>
        <Draw path="/draw"/>
        <Draw path="/draw/:id"/>
        <Docs path="/docs"/>
        <Docs path="/api"/>
        <Box default path="/"/>
    </Router>
), document.getElementById('root'));