import authenticationImage from  "/src/assets/signupImage.png"
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";
import axios from "axios";
import { resetPasswordSchema } from "../FormikSchemas/Schemas";
import { useFormik } from "formik";
import { BaseUrl } from "../BaseUrl";
import { useNavigate, useParams } from 'react-router-dom';
import toast from "react-hot-toast";
export default function ForgotPasswordVerify() {
  const {id} = useParams()
  const navigate=useNavigate()
  const [spinner, setSpinner] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    status: true,
  });
  const [userDetails, setUserDetails] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = (values) => {
    setSpinner(true);
    let data = {
      Password: values.newPassword,
    };
    axios
      .put(
        `${BaseUrl.baseurl}/phlebo/update-phlebo-password/${id}`,data
      )
      .then((res) => {
        setSpinner(false);
        console.log("address", res.data);
        setApiStatus(res.data);
        if (res.data.status) {
          setUserDetails(res.data);
         
            toast.success(res.data.message);
            setTimeout(()=>{
              navigate('/login')
            },3000)
        }
        else
        {
          
            toast.error(res.data.message);
        }
      })
      .catch((err) => console.log("Error",err));
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    dirty,
    isValid,
  } = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit:handleResetPassword,
  });
  
  // eslint-disable-next-line no-useless-escape
  
  const initialSvg = 
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M7.99935 1.33366C4.33268 1.33366 1.33268 4.33366 1.33268 8.00033C1.33268 11.667 4.33268 14.667 7.99935 14.667C11.666 14.667 14.666 11.667 14.666 8.00033C14.666 4.33366 11.666 1.33366 7.99935 1.33366Z" stroke="#868686" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 10.667V7.33366" stroke="#868686" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.00391 5.33301H7.99792" stroke="#868686" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>

  const activeSvg = 
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.99935 1.33366C4.33268 1.33366 1.33268 4.33366 1.33268 8.00033C1.33268 11.667 4.33268 14.667 7.99935 14.667C11.666 14.667 14.666 11.667 14.666 8.00033C14.666 4.33366 11.666 1.33366 7.99935 1.33366Z" stroke="#4BC25F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.5 8L6.5 10.5L11.5 6" stroke="#4BC25F" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>

  const errorSvg = 
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.49996 1.33317C4.83329 1.33317 1.83329 4.33317 1.83329 7.99984C1.83329 11.6665 4.83329 14.6665 8.49996 14.6665C12.1666 14.6665 15.1666 11.6665 15.1666 7.99984C15.1666 4.33317 12.1666 1.33317 8.49996 1.33317Z" stroke="#FF3434" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 10.7321L8.4641 7.86603L11.4282 5" stroke="#FF3434" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.76795 5L8.63397 7.9641L11.5 10.9282" stroke="#FF3434" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>

  return (
    <div className="login-parent-container md:grid md:grid-cols-2 md:gap-4">
      <div className="hidden md:block">
        <img
          src={authenticationImage}
          alt=""
          style={{ width: "50vw", height: "100vh", objectFit: "cover" }}
        />
      </div>
      <div className="loginLayout">
      <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"12px",padding:"0px 12px"}}>
            <h1
              style={{
                lineHeight: "12px",
                color: "#4b4b4b",
                fontFamily: "Source Sans 3",
                fontSize: "28px",
                fontWeight: 700,
                fontStyle: "normal",
              }}
            >
              Reset password
            </h1>
            {!apiStatus.status && (
              <p className="emailpasswrong">{apiStatus.message}!</p>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                margin: "12px 0px",
              }}
            >
              <div  
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  position: "relative",
                }}
              >
                <label
                  htmlFor="newPassword"
                  style={{
                    color: "#393939",
                    fontFamily: "Source Sans 3",
                    fontSize: "14px",
                    fontWeight: 400,
                    fontStyle: "normal",
                  }}
                >
                  New password
                </label>
                <div
                  style={{
                    border: `1px solid ${
                      errors.newPassword && touched.newPassword
                        ? "red"
                        : "#1C485F"
                    }`,
                    display: "flex",
                    gap: "6px",
                    backgroundColor: "#FAFAFA",
                    borderRadius: "4px",
                    padding: "0px 12px 0px 0px",
                    marginBottom: "3px",
                  }}
                >
                  <input
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your new password"
                    type={`${showNewPassword ? "text" : "password"}`}
                    id="newPassword"
                    value={values.newPassword}
                    style={{
                      padding: "12px 4px 12px 12px",
                      backgroundColor: "#FAFAFA",
                      borderRadius: "4px",
                      outline: "none",
                      flexGrow: 1,
                    }}
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    type="button"
                    style={{ outline: "none" }}
                  >
                    {!showNewPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="vuesax/linear/eye">
                          <g id="eye">
                            <path
                              id="Vector"
                              d="M12.9833 9.99993C12.9833 11.6499 11.6499 12.9833 9.99993 12.9833C8.34993 12.9833 7.0166 11.6499 7.0166 9.99993C7.0166 8.34993 8.34993 7.0166 9.99993 7.0166C11.6499 7.0166 12.9833 8.34993 12.9833 9.99993Z"
                              stroke="#868686"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              id="Vector_2"
                              d="M9.99987 16.8918C12.9415 16.8918 15.6832 15.1584 17.5915 12.1584C18.3415 10.9834 18.3415 9.00843 17.5915 7.83343C15.6832 4.83343 12.9415 3.1001 9.99987 3.1001C7.0582 3.1001 4.31654 4.83343 2.4082 7.83343C1.6582 9.00843 1.6582 10.9834 2.4082 12.1584C4.31654 15.1584 7.0582 16.8918 9.99987 16.8918Z"
                              stroke="#868686"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                        </g>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M12.1092 7.8916L7.89258 12.1083C7.35091 11.5666 7.01758 10.8249 7.01758 9.99993C7.01758 8.34993 8.35091 7.0166 10.0009 7.0166C10.8259 7.0166 11.5676 7.34994 12.1092 7.8916Z"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14.8499 4.8084C13.3915 3.7084 11.7249 3.1084 9.99987 3.1084C7.0582 3.1084 4.31654 4.84173 2.4082 7.84173C1.6582 9.01673 1.6582 10.9917 2.4082 12.1667C3.06654 13.2001 3.8332 14.0917 4.66654 14.8084"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.01758 16.2751C7.96758 16.6751 8.97591 16.8917 10.0009 16.8917C12.9426 16.8917 15.6842 15.1584 17.5926 12.1584C18.3426 10.9834 18.3426 9.0084 17.5926 7.8334C17.3176 7.40006 17.0176 6.99173 16.7092 6.6084"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12.9242 10.583C12.7076 11.758 11.7492 12.7163 10.5742 12.933"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.89102 12.1084L1.66602 18.3334"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18.3324 1.66699L12.1074 7.89199"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  position: "relative",
                }}
              >
                <label
                  style={{
                    color: "#393939",
                    fontFamily: "Source Sans 3",
                    fontSize: "14px",
                    fontWeight: 400,
                    fontStyle: "normal",
                  }}
                  htmlFor="confirmPassword"
                >
                  Confirm new password
                </label>
                <div
                  style={{
                    border: `1px solid ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "red"
                        : "#1C485F"
                    }`,
                    display: "flex",
                    gap: "6px",
                    backgroundColor: "#FAFAFA",
                    borderRadius: "4px",
                    padding: "0px 12px 0px 0px",
                  }}
                >
                  <input
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your confirm password"
                    type={`${showConfirmPassword ? "text" : "password"}`}
                    id="confirmPassword"
                    value={values.confirmPassword}
                    style={{
                      padding: "12px 4px 12px 12px",
                      backgroundColor: "#FAFAFA",
                      borderRadius: "4px",
                      outline: "none",
                      flexGrow: 1,
                    }}
                  />
                 <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                    style={{ outline: "none" }}
                  >
                    {!showConfirmPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="vuesax/linear/eye">
                          <g id="eye">
                            <path
                              id="Vector"
                              d="M12.9833 9.99993C12.9833 11.6499 11.6499 12.9833 9.99993 12.9833C8.34993 12.9833 7.0166 11.6499 7.0166 9.99993C7.0166 8.34993 8.34993 7.0166 9.99993 7.0166C11.6499 7.0166 12.9833 8.34993 12.9833 9.99993Z"
                              stroke="#868686"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              id="Vector_2"
                              d="M9.99987 16.8918C12.9415 16.8918 15.6832 15.1584 17.5915 12.1584C18.3415 10.9834 18.3415 9.00843 17.5915 7.83343C15.6832 4.83343 12.9415 3.1001 9.99987 3.1001C7.0582 3.1001 4.31654 4.83343 2.4082 7.83343C1.6582 9.00843 1.6582 10.9834 2.4082 12.1584C4.31654 15.1584 7.0582 16.8918 9.99987 16.8918Z"
                              stroke="#868686"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                        </g>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M12.1092 7.8916L7.89258 12.1083C7.35091 11.5666 7.01758 10.8249 7.01758 9.99993C7.01758 8.34993 8.35091 7.0166 10.0009 7.0166C10.8259 7.0166 11.5676 7.34994 12.1092 7.8916Z"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14.8499 4.8084C13.3915 3.7084 11.7249 3.1084 9.99987 3.1084C7.0582 3.1084 4.31654 4.84173 2.4082 7.84173C1.6582 9.01673 1.6582 10.9917 2.4082 12.1667C3.06654 13.2001 3.8332 14.0917 4.66654 14.8084"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.01758 16.2751C7.96758 16.6751 8.97591 16.8917 10.0009 16.8917C12.9426 16.8917 15.6842 15.1584 17.5926 12.1584C18.3426 10.9834 18.3426 9.0084 17.5926 7.8334C17.3176 7.40006 17.0176 6.99173 16.7092 6.6084"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12.9242 10.583C12.7076 11.758 11.7492 12.7163 10.5742 12.933"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.89102 12.1084L1.66602 18.3334"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18.3324 1.66699L12.1074 7.89199"
                          stroke="#868686"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p style={{ color: "red" }}>{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            <button
            type="submit"
            style={{
              textTransform: "none",
              background: dirty && isValid ? "#1C485F" : "#D1DFE9",
              outline: "none",
              color: dirty && isValid ? "#fff" : "#1C485F",
              padding: "10px 22px",
              fontSize: "16px",
              fontWeight: 400,
              display:"flex",
              alignItems: "center",
              justifyContent:'center',
              gap:'4px',
              opacity: dirty && isValid ? 1 : 0.6,
              borderRadius:'5px',
            }}
          >
            {
              spinner &&
              <CircularProgress
                style={{
                  color: "#FFF",
                  height: "15px",
                  width: "15px",
                }}
              />
            }
            Submit
            </button>
      </form>
      </div>
    </div>
  );
}
