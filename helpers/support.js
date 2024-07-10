module.exports = 
{
    // verificar ao acessar a página se o usário é administrador ou não
    eAdmin: (req, res, next) =>
    {
        if(req.isAuthenticated() && req.user.admin == 1) return next();

        req.flash("error_msg", "Sem permissão para acesso");
        res.redirect("/?fail=true");
    },

    //verifica se tem algum usuário com sessão iniciada para pode acessar rotas privadas
    eUser: (req, res, next) =>
    {
        if(req.isAuthenticated()) return next();

        req.flash("error_msg", "Sem permissão para acesso. Você precisa se conecetar com alguma conta para acessar essa página");
        res.redirect("/?fail=true");
    },

    //gerar nova senha randomicamente
    /**
     * Criar paavras chave como por exemplo "password" e "token"
     * @param {*callbackSend  terá como paramêtro o atributo que receberará a key gerada pela functio/method "makekey". Exemplo: const sendToken = (KEY) => { conosole.log(KEY) } __}
     * @param {*lengthKey tamanho que a cahave terá. Exemplo: ou 8, ou 14, ou 16, ou 48... OBS: está predefinido em 8__}
     * @param {*type será um par de chave. Ou password, ou token. Exemplo: { key: "password" } __}
     * @returns 
     */
    makekey: function generate (callbackSend, lengthKey, type)
    {   
        //tamanho que o password terá
        let keyLenght = null
        if(lengthKey === null || lengthKey === undefined)
            keyLenght = 8;
        else
            keyLenght = lengthKey;
        
        //variável e condições para criar as senhas rondomicamente
        let chars = "abcdefghijklmnopqrstuvxz";
        const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVXZ";
        const numberChars = "0126456789";
        const symbolChars = "@#!?_-%";

        let regex = "";

        if (type.key == "password")
        {
            regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])(?:([0-9a-zA-Z$*&@#])){8,}$/;
        }

        if (type.key == "token")
        {
            regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?:([0-9a-zA-Z])){8,}$/;
        }
        
        chars += upperCaseChars + numberChars + symbolChars
        
        let key = "";
        for (let i = 0;  i < keyLenght; i++)
        {
            const randomDigit = Math.floor(Math.random() * chars.length);
            key +=  chars.substring(randomDigit, randomDigit+1);
        }
        if(regex.test(key)) return callbackSend(key) 
        else { generate(callbackSend, lengthKey, type) }
    },
  
}