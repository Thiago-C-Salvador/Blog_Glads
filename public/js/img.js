const div_svg = document.getElementById("id_div-img-back")

const img_svg = document.createElement("img");
img_svg.setAttribute("src", "/static/public/img/arrow_back.svg")
div_svg.appendChild(img_svg)
div_svg.setAttribute("title", "page back");

//converte a imagem SVG em código html para se poder trabalhar as propriedades da imagem livrimente
const  ftetchSvg = (image) =>
{
    fetch(image.src)
    .then((response) => response.text())
    .then( (response) =>
    {  
        const span = document.createElement("span");
        span.innerHTML = response;
        const inlineSVG = span.getElementsByTagName("svg")[0];
        image.parentNode.replaceChild(inlineSVG, image)
        inlineSVG.setAttribute("alt","seta para retorno de página")
        inlineSVG.setAttribute("href", "javascript:void(0)")
        inlineSVG.addEventListener( "click", () =>
        {
            // history.go(-1); return false;
            history.back();
        })
        return true
    })
}
ftetchSvg(img_svg)
// fim converção img SVG

// fencção para permitir ver a senha e ocultar, e também a alternância das imagens do olhos
const eyes = document.querySelector("#id_eye-password")
const input_pass = document.querySelector("#id_password")
eyes.onclick = () => 
{
    if(input_pass.type === "password" ) 
    {
        input_pass.type = "text";
        eyes.src = "/static/public/img/eye.svg";
    }

}
eyes.onmouseout = () =>
{ 
    input_pass.type = "password";
    eyes.src = "/static/public/img/eye-slash.svg";
}
// fim campo password



