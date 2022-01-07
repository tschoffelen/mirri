import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@reach/router';

import './index.scss';
import Box from './routes/box/Box';
import Md from './routes/md/Md';

ReactDOM.render(<Router>
	<Box path="/"/>
	<Md path="/md"/>
</Router>, document.getElementById('root'));
