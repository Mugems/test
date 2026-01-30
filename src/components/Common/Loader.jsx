import '../../assets/scss/_loader.scss';

import loader from"../../assets/images/small-logo/login-logo.png";
function Loader() {
    return (

        <div className="smartui-loader d-block">
            <div className="loader-container">
                <div className="donut loader-blue-bg-white">
                </div><div className="loaderWrap">
                    <div className=" loadtemple">
                        <img src={loader} style={{width:"55px"}} alt='img'></img>
                    </div>
                    
                </div></div></div>

    )
}
export default Loader;