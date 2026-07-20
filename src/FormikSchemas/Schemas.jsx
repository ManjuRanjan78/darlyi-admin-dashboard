import * as yup from "yup";

// const newPasswordRules = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[\W_]).{8,}$/;
const newPasswordRules = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const formSchema = yup.object().shape({
    currentPassword: yup.string().required("Required!"),
    newPassword: yup.string().min(8).required("Required!"),
    confirmPassword: yup.string().oneOf([yup.ref('newPassword'),null],"Password are not matching!").required("Required!"),
})

export const resetPasswordSchema = yup.object().shape({
    newPassword: yup.string().min(8).required("Required!"),
    confirmPassword: yup.string().oneOf([yup.ref('newPassword'),null],"Password is not matching!").required("Required!"),
})
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const signupSchema = yup.object().shape({
    firstName: yup.string().matches(/^[A-Za-z]+$/, 'First name can only contain letters').required('Required!'),
    lastName: yup.string().matches(/^[A-Za-z]+$/, 'Last name can only contain letters').required('Required!'),
    businessEmail: yup.string().email("Please enter a valid email address").required("Required!"),
    password: yup.string().min(8).required("Required!")
});

export const loginSchema = yup.object().shape({
    businessEmail: yup.string().email("Please enter a valid email address").required("Email Required!"),

});


// export const forgotPasswordSchema = yup.object().shape({
//     email: yup.string().email("Please enter a valid email address").required("Required!")
// })

// export const verifySingleMailSchema = yup.object().shape({
//     email: yup.string().email("**Please enter a valid email address").required("Please enter valid email")
// })
// export const verifyBulkMailSchema = yup.object().shape({
//     listName: yup.string().required("Please enter a list name"),
//     emails: yup
//     .array()
//     .of(yup.string().email("**Please enter a valid email address"))
//     .required("Please enter valid email addresses"),
// })

// export const createContactFormSchema = yup.object().shape({
//     firstName: yup.string().required('required'),
//     lastName: yup.string().required('required'),
//     email: yup.string().required('required'),
//     phoneNumber: yup.string().required('required'),
//     listName: yup.string().required('required'),
// })

