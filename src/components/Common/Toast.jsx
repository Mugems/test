import { toast } from 'react-toastify';
import 'App.css';
function CustomToast(message, type, position)  {
    const toastOptions = {
      position: position || "bottom-right",
      hideProgressBar: true,
      autoClose:false,
      // closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      }
     
    // var options = customOption ? customOption : toastOptions;
  if(type==="success"){
    toast.success(message, {...toastOptions,className: 'toast-theme-success'})
  }
  if(type==="error"){
    toast.error(message, {...toastOptions,className: 'toast-theme-error'});
  }
  if(type==="info"){
    toast.info(message, toastOptions)
  }
  
};

export default CustomToast;
