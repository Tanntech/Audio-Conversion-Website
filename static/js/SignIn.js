const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const sign_in_btn2 = document.querySelector("#sign-in-btn2");
const sign_up_btn2 = document.querySelector("#sign-up-btn2");

sign_up_btn.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
});

sign_up_btn2.addEventListener("click", () => {
    container.classList.add("sign-up-mode2");
});

sign_in_btn2.addEventListener("click", () => {
    container.classList.remove("sign-up-mode2");
});

// validations

// JavaScript for form validations
const signInForm = document.querySelector(".sign-in-form");
const signUpForm = document.querySelector(".sign-up-form");

// Function to validate the sign-in form
function validateSignInForm() {
  const username = signInForm.querySelector('input[type="text"]').value.trim();
  const password = signInForm.querySelector('input[type="password"]').value.trim();

  if (username === "" && password === "") {
    alert("Please fill in all fields.");
    return false;
  }

  if(username === ""){
    alert("Please fill username");
    return false;
  }

  if(password === ""){
    alert("Please fill password");
    return false;
  }
  
  return true;
}



// Add event listeners for form submissions
signInForm.addEventListener("submit", function (e) {
    if (!validateSignInForm()) {
      e.preventDefault(); // Prevent form submission if validation fails
    }
  });

// Function to validate the sign-up form
function validateSignUpForm() {
  const username1 = signUpForm.querySelector('input[type="text"]').value.trim();
  const email1 = signUpForm.querySelector('input[type="email"]').value.trim();
  const password1= signUpForm.querySelector('input[type="password"]').value.trim();

  if (username1 === "" || email1 === "" || password1 === "") {
    alert("Please fill in all fields.");
    return false;
  }

  if(username1 === ""){
    alert("Please fill username");
    return false;
  }

  if(email1 === ""){
    alert("Please fill email");
    return false;
  }

  if(password1 === ""){
    alert("Please fill password");
    return false;
  }

  return true;
}

signUpForm.addEventListener("submit", function (e) {
    if (!validateSignUpForm()) {
      e.preventDefault(); // Prevent form submission if validation fails
    }
  });

  // Function to check if the email is valid
// function isValidEmail(email) {
//     const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//     return emailPattern.test(email);
//   }

  // Simple email validation
//   if (!isValidEmail(email)) {
//     alert("Please enter a valid email address.");
//     return false;
//   }





