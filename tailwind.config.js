/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1C485F",
        subPrimary:"#D1DFE9",
        secondary:"#727272",
        titleBold:'#393939',
        grayColor:"#868686",
        btnBgColor:'#F8F9F9',
        tertiaryColor:"#4C4C61",
        modalTitleColor:"#4B4B4B",
        toggleBgColor:"#F2F2F2",
        borderColor:"#DDDDDD",
        textBlueColor:"#0052FF",
        signUpErrorColor:"#5E5E5E",
        inputBgColor:"#FAFAFA",
        formTitleColor:"#4b4b4b",
        formApiErrorColor:"#FFBEBE",
        warningBtnBgColor:"#FF3434",
        closeBtnColor:"#363535"
      },
      fontSize: {
        primarySize: "22px",
        bigSize: "32px",
        secondarySize: "20px",
        tertiarySize: "18px",
        mediumSize: "16px",
        quarternarySize: "14px",
        smallSize: "12px",
        formTitleSize:'30px',
      },
      fontFamily: {
        primaryFamily:"Source Sans 3"
      },
      ringColor: {
        'primary': '#1C485F', // Replace with your custom color
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}