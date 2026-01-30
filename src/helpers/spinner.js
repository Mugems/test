import { GridLoader } from "react-spinners";
import { useState} from "react";
import withRouter from "components/Common/withRouter";
import "../App.css"



function Loader()
    {
        const[loading, setLoading]= useState(true);
        const[color, setColor]=useState("#ffffff");
        const customstyle = {
            display: "block",
            margin: "0 auto",
            borderColor: "red",
           
        }
        return(
            <>
              <div className="spinner-item">
               <GridLoader
                    color={color}
                    loading={loading}
                    style={customstyle}
                    className="spinner"
                    // size={150}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                     
             />
             </div>
            </>
        )
    }
    export default withRouter(Loader);
