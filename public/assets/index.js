const input = document.getElementById("file-upload"),
  form = document.getElementById("form"),
  label = document.querySelector("label.upload-label"),
  button = document.querySelector(".button"),
  statBar = document.getElementById("book-status"),
  statImg = document.getElementById("status-img"),
  statUploadingImg = document.getElementById("status-uploading-img");

const STATUS_IMG = [
  0,
  {
    link: "./assets/images/converting.svg",
    alt: "converting"
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
  console.log("\ntrying to upload file...");
  const data = new FormData();
  data.append("epubFile", file);
  statUploadingImg.classList.remove("hidden");

  fetch("/tomobi", {
    method: "POST",
    body: data
  })
    .then(response => response.json())
    .then(data => {
      const statLink = "/status/" + data.id;
      console.log("\nconvertion id: ", data.id);
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
        whereIsMyBook(statusLink, curStep);
        return;
      }
      const curStep = status.step;

      if (prevStep < curStep) {
        const curState = status.msg;
        console.log("\nnew step info:", curStep, curState);
        if (prevStep === 0) {
          statUploadingImg.classList.add("hidden");
          statImg.classList.remove("hidden");
        }
        statImg.alt = STATUS_IMG[curStep].alt;
        statImg.src = STATUS_IMG[curStep].link;
        label.textContent = curState;
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
  statImg.classList.add("hidden");
  button.disabled = true;
  input.disabled = true;
  label.textContent = "Uploading...";
  button.textContent = "please, wait";
}
