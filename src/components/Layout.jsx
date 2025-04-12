import { Outlet } from "react-router-dom";
import Header from './Header';
import Breadcrumb from './Breadcrumb'
import OffcanvasMenu from './OffcanvasMenu';


const Layout = () => {
    const breadcrumb=[];
    return (
        <>
        <Header/>
        <Breadcrumb breadcrumb={breadcrumb}/>
        <OffcanvasMenu />
        <main className='container' id='workspace'>
            <Outlet />
        </main>
        </>
    )
}

export default Layout