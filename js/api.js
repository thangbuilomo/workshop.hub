const API_URL = "https://script.google.com/macros/s/AKfycbwNI9P3KS5bKGiAUW0nhwWF63Gp4lkYqNlvWKUDvLCo5_H-HpG4Ebgsqclq4mH0nbGLzA/exec";

async function loginAPI(username, password) {
  try {
    const response = await fetch(`${API_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login Error:", error);
    return { status: "error", message: "Network error. Please try again later." };
  }
}

async function fetchWorkshopsAPI() {
  try {
    const response = await fetch(`${API_URL}?action=getData`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch Data Error:", error);
    return { status: "error", message: "Could not fetch data. Please try again." };
  }
}
