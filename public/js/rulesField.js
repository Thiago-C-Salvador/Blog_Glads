const input = document.querySelectorAll("input");  

input.forEach( (element) =>
{
    //remove o balão de mensagem customizada
    element.setCustomValidity("");

    //field nome
    if( element.id == "id_name" )
    {
        element.onkeypress= (evt) => 
        {
            element.setCustomValidity("");
            if(element.value.length >= 40)
            {
                return false
            }
            else
            {       
                return (( evt.charCode >= 97 && evt.charCode <= 122) || (evt.charCode >= 65 && evt.charCode <= 90) || evt.charCode == 32 || evt.charCode == 40 || evt.charCode == 41 || evt.charCode == 45 || evt.charCode == 231 || (evt.charCode >= 225 && evt.charCode <= 227) || (evt.charCode >= 233 && evt.charCode <= 234) || evt.charCode == 237 || (evt.charCode >= 243 && evt.charCode <= 245) || evt.charCode == 250 ||evt.charCode == 194 || evt.charCode == 212);
            }
        }  
    }
    //end field nome

    //field email
    if( element.id == "id_email")
    {
        element.onkeypress = (evt) => 
        {   
            if( element.value.length >= 40 )
            {
                return false
            }

            if( evt.charCode == 40 || evt.charCode == 41 || evt.charCode == 60 || evt.charCode == 62 || evt.charCode == 44 )
            {
                return false
            }
        }
    }

    //field password
    if( element.id == "id_password" || element.id == "id_confirmPassword")
    {
        element.onkeypress = (evt) => 
        {   
            if( element.value.length >= 50)
            {
                return false
            }
        }
    }
})


export function maxLength(input, maxlength)
{
    //quantidade máxima de inserção de caracteres  em cada input/campo
    input.onkeypress = () =>
    {
        input.setCustomValidity("");
        if( input.value.length >= maxlength )
        {
            return false
        }
    }
}

export function inputWhite(input, message)
{
    if( input.value == "" || input.value == "0" )
    {
        input.setCustomValidity(message);
        input.reportValidity();
        return true
    }
    
}
