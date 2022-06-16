const uploadContainer= document.querySelector(".upload-container");
const dropZone= document.querySelector(".drop-zone");
const fileInput= document.querySelector("#file");
const browseBtn= document.querySelector(".browse");
const bgProgress= document.querySelector(".bg-progress");
const percentDiv= document.querySelector("#percent");
const progressContainer= document.querySelector(".progress-container");
const progressBar= document.querySelector(".progress-bar");
const fileURLInput= document.querySelector("#fileURL");
const sharingContainer= document.querySelector(".sharing-container");
const copyBtn= document.querySelector("#copyBtn");
const emailForm= document.querySelector("#emailform");
const toast= document.querySelector(".copy-alert");
const maxAllowedSize= 2000*1024*1024;

const host= "http://localhost:4000/";
const uploadURL= `${host}api/files`;
const emailURL= `${host}api/files/send`;


dropZone.addEventListener("dragover", (e)=>{
   e.preventDefault();

    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged")
    }
});

dropZone.addEventListener("dragleave", ()=>{
    dropZone.classList.remove("dragged")
})
dropZone.addEventListener("drop", (e)=>{
    e.preventDefault()
    dropZone.classList.remove("dragged")
    const files= e.dataTransfer.files
    console.log(files)
    if(files.length){
        fileInput.files= files
        uploadFile();
    }
})
browseBtn.addEventListener("click", ()=>{
    fileInput.click();
})
fileInput.addEventListener("change", ()=>{
    uploadFile();
})
copyBtn.addEventListener("click",()=>{

    if(fileURLInput.value)
      console.log("file url: ", fileURLInput.value);
    else
      console.log("nothing to copy");  
    
      try{
        navigator.clipboard.writeText(fileURLInput.value);
        showToast("Link copied to clipboard");
      }
      catch(err)
      {
          console.log("failed to copy: ", err);
      }
    
})
const uploadFile= ()=>{
    //e.preventDefault();
    if(fileInput.files>1){
        fileInput.value= "";
        showToast("Upload only 1 file!");
        return;
    }
    const file= fileInput.files[0];
    console.log("FILE:", file);

    if(file.size> maxAllowedSize){
        fileInput.value= "";
        showToast("Upload less than 2GB!");
        return;
    }

    allfiles= fileInput.files[0];

    const formData= new FormData();
    formData.append("myfile", allfiles);

    const xhr= new XMLHttpRequest();

    xhr.upload.onerror= ()=>{
        fileInput.value= "";
        showToast(`Failed to upload ${xhr.statusText}`);
    };

    xhr.onreadystatechange= (e)=>{
        console.log("readystate:",xhr.readyState)
        console.log("response:",xhr.response)
        if (xhr.readyState == XMLHttpRequest.DONE) {
            onUploadSuccess(e,xhr.responseText);
          }
    }
    
    xhr.open("POST", uploadURL);
    xhr.send(formData);
}

const onUploadSuccess= (e,res)=>{
    //e.preventDefault();
    const { file: url } = JSON.parse(res);
    console.log(url);

    console.log("ALL FINE");
    fileURLInput.value= url;

    fileInput.value= "";
    showToast("File uploaded successfully");
    emailForm.elements[2].removeAttribute("disabled");
}

emailForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const url= fileURLInput.value;
    
    const formData= {
        uuid: url.split("/").splice(-1,1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    }
    emailForm.elements[2].setAttribute("disabled", "true");

    fetch(emailURL, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(formData)
    }).then(res=> res.json())
      .then(({success}) => {               //data
         if(success)
         {
            showToast("Email sent");  
         }        
    });
});

let toastTimer;
const showToast= (msg)=>{

  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
};

