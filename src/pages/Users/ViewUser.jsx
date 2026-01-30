import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { notification } from "antd";
import { GET } from "helpers/api_helper";
import { USERS } from "helpers/url_helper";
import GenericCollapse from "components/Common/Collapse";
import Loader from "components/Common/Loader";
const Viewuser = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [user, userData] = useState({});
 
  useEffect(() => {
  const getUserList = async () => {
    try {
      setLoader(true);
      const response = await GET(`${USERS}${params.id}`);
      console.log(response, "response");
      if (response?.status === 200) {
        userData(response?.data);
      } else {
        notification.error({
          message: "Error",
          description: "The user data is not fetched",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "The user data is not fetched",
      });
    } finally {
      setLoader(false);
    }
  };

  if (params.id) {
    getUserList();
  }
}, [params.id]);

  return (
    <>
      {loader && <Loader />}
      <div className="page-content">
        <div className="cursor-pointer back-icon">
          <span onClick={() => navigate("/user/list")}>
            <ArrowLeftOutlined /> Back
          </span>
        </div>
        <div className="container-fluid mt-3">
          <h5 className="mb-3">User Info</h5>
          <div className="row">
            <div className="col-md-12">
              <GenericCollapse
                titleKey={"username"}
                // data={Array.isArray(user) ? user : [user]}
                data={[user]}
                contentKeys={[
                  "username",
                  "email",
                  "mobile_number",
                  "role",
                  "address",
                  "branch",
                  "line",
                  "area",
                ]}
                name="user"
              ></GenericCollapse>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Viewuser;
