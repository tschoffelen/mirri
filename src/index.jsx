import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@reach/router';

import './index.scss';
import Box from './routes/box/Box';
import Md from './routes/md/Md';
import Docs from './routes/docs/Docs';
import Draw from "./routes/draw/Draw";

ReactDOM.render((
	<Router>
		<Md path="/md"/>
		<Md path="/md/:id"/>
		<Draw path="/draw"/>
		<Draw path="/draw/:id"/>
		<Docs path="/docs"/>
		<Box default path="/"/>
	</Router>
), document.getElementById('root'));
