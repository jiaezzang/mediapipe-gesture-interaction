import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import Home from '../pages/Home/Home';
import Main from '../pages/Main/Main';

/**
 * Router
 * @returns {JSX.Element} Router 컴포넌트
 */
export default function AppRouter(): JSX.Element {
    return (
        <Router>
            <Routes>
                <Route path='/welcome' element={<Home />} />
                <Route path='/main' element={<Main />} />
                <Route path='*' element={<Navigate replace to='/welcome' />} />
            </Routes>
        </Router>
    );
}
