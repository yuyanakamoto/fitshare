import axios from "https://cdn.skypack.dev/axios";
import io from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

axios.defaults.withCredentials = true;

// interceptor to auto‑refresh on 401
axios.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401 && !error.config.__isRetry) {
      try {
        await axios.post("/api/auth/refresh");
        error.config.__isRetry = true;
        return axios(error.config);
      } catch (e) {
        window.location.href = "/login.html";
      }
    }
    return Promise.reject(error);
  }
);

// socket.io
const socket = io();

socket.on("newPost", (post) => addPostCard(post));
socket.on("likeUpdated", ({ postId, likedBy }) => updateLikeUI(postId, likedBy));
socket.on("newComment", ({ postId, comment }) => appendComment(postId, comment));
socket.on("updateComment", ({ postId, comment }) => updateCommentUI(postId, comment));
socket.on("deleteComment", ({ postId, commentId }) => removeCommentUI(postId, commentId));

// ---- UI helpers (simplified) ----
async function addPost(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    exercise: form.exercise.value,
    sets: [...document.querySelectorAll("#sets tbody tr")].map((tr) => ({
      weight: +tr.dataset.weight,
      reps: +tr.dataset.reps,
    })),
    imageUrl: uploadInput.files[0] ? await uploadImage(uploadInput.files[0]) : "",
  };
  const res = await axios.post("/api/posts", data);
  addPostCard(res.data);
  form.reset();
}

function like(postId) {
  axios.post(`/api/posts/${postId}/like`).catch(console.error);
}

function addComment(postId, text) {
  axios.post(`/api/posts/${postId}/comments`, { text });
}

// additional UI functions (updateLikeUI, appendComment, etc.) would go here
// keeping them brief to focus on core logic.

// ---- Login / Register ----
async function register(email, password, username) {
  await axios.post("/api/auth/register", { email, password, username });
  window.location.href = "/index.html";
}

async function login(email, password) {
  await axios.post("/api/auth/login", { email, password });
  window.location.href = "/index.html";
}

// ---- 1RM update ----
async function saveMaxes(b, d, s) {
  await axios.put("/api/auth/me/max", { benchMax: b, deadliftMax: d, squatMax: s });
  alert("更新しました");
}

// ---- Exercise master extend ----
const defaultExercises = ["ベンチプレス", "デッドリフト", "スクワット"];
const userExercises = JSON.parse(localStorage.getItem("fitShareExercises") || "[]");
function getExerciseList() {
  return [...new Set([...defaultExercises, ...userExercises])];
}
function addExercise(name) {
  localStorage.setItem(
    "fitShareExercises",
    JSON.stringify([...userExercises, name])
  );
  renderExerciseSelect();
}

function renderExerciseSelect() {
  const sel = document.getElementById("exercise");
  sel.innerHTML = getExerciseList().map((e) => `<option>${e}</option>`).join("");
}

document.addEventListener("DOMContentLoaded", renderExerciseSelect);
