window.addEventListener("load", function() {
            let inputs = document.querySelectorAll(".folder-name")
            inputs.length > 0 ? document.getElementById("folders-title").style.display = "block" : "";
            let files = document.querySelectorAll(".single-file");
            files.length > 0 ? document.getElementById("files-title").style.display = "block" : "";
})