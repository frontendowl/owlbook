const input = document.getElementById("file-upload"),
  form = document.getElementById("form"),
  label = document.querySelector("label.upload-label"),
  button = document.querySelector(".button"),
  statBar = document.getElementById("book-status"),
  statImgContainer = document.getElementById("status-img-container");

const STATUS_IMG = [
  {
    link: "./assets/images/uploading.svg",
    alt: "uploading",
    animated: true
  },
  {
    link: "./assets/images/converting_sprite.svg",
    alt: "converting",
    animated: true
  },
  {
    link: "./assets/images/sending.svg",
    alt: "sending"
  },
  {
    link: "./assets/images/done.svg",
    alt: "done"
  }
];

const lblDef = label.textContent;

function upload(file) {
  const data = new FormData();
  data.append("epubFile", file);

  updateStatusImg(STATUS_IMG[0]);

  fetch("/tomobi", {
    method: "POST",
    body: data
  })
    .then(response => response.json())
    .then(data => {
      const statLink = "/status/" + data.id;
      return statLink;
    })
    .then(statLink => {
      whereIsMyBook(statLink, 0);
    })
    .catch(error => console.log(error));
}

function whereIsMyBook(statusLink, prevStep) {
  fetch(statusLink)
    .then(res => res.json())
    .then(status => {
      if (status.error) {
        whereIsMyBook(statusLink, prevStep);
        return;
      }
      const curStep = status.step;

      if (prevStep < curStep) {
        updateStatusImg(STATUS_IMG[curStep]);
        label.textContent = status.msg;
      }

      if (curStep < 3) {
        setTimeout(whereIsMyBook, 2000, statusLink, curStep);
      } else {
        setWaitingForBook("Convert another book?");
      }
    })
    .catch(err => console.log("\nERROR!", err));
}

input.addEventListener("change", el => {
  const file = el.target.value;
  if (file) {
    let title = file.split("\\").pop();
    if (title.length >= 21) title = title.slice(0, 18) + "...";
    setBookAttached(title);
  } else {
    setWaitingForBook(lblDef);
  }
});

button.addEventListener("click", el => {
  el.preventDefault();
  upload(input.files[0]);

  bookIsConverting();
});

function setBookAttached(title) {
  button.disabled = false;
  label.classList.add("book-is-chosen");
  label.textContent = title;
}

function setWaitingForBook(msg) {
  input.value = "";
  input.disabled = false;
  button.disabled = true;
  button.textContent = "make it mobi!";
  label.classList.remove("book-is-chosen");
  label.textContent = msg;
}

function bookIsConverting() {
  statImgContainer.classList.remove("hidden");
  button.disabled = true;
  input.disabled = true;
  label.textContent = "Uploading...";
  button.textContent = "please, wait";
}

function updateStatusImg(statusImg) {
  statImgContainer.removeAttribute("style");
  if (statusImg.animated) {
    statImgContainer.style.animation = "play 1s steps(8) infinite";
    statImgContainer.style.background = `transparent url(${statusImg.link}) 0 0 / 2560px 320px
    no-repeat`;
  } else {
    statImgContainer.style.background = `transparent url(${statusImg.link}) 0 0 / 320px 320px no-repeat`;
  }
  statImgContainer.title = statusImg.alt;
}
