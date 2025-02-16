/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        backgroundImage: {
          'custom-pattern': "./bg-image.jpg",
        },
        // myShadow1: "4.1px -5px 0 0 rgb(17,24,39)",
        // myShadow2: "-4.1px -5px 0 0 rgb(17,24,39)",
        myShadow1: "4.1px -5px 0 0 rgb(243, 244, 246)",  // Transparent shadow
        myShadow2: "-4.1px -5px 0 0 rgb(243, 244, 246)",
      },
    },
  },
  plugins: [],
}